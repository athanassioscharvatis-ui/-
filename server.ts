import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  GEMINI_PRIMARY_MODEL,
  GEMINI_FALLBACK_MODELS,
  sanitizeChatHistory,
  buildCookingSystemInstruction,
  buildModelConfig,
  parseGeminiApiError,
  shouldTryNextGeminiModel,
} from './server/geminiUtils.ts';
import type {
  RawChatMessage,
  CookingContextInput,
  GeminiContentTurn,
  SafeErrorPayload,
} from './server/geminiUtils.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const GEMINI_MODEL = GEMINI_PRIMARY_MODEL;

// Short-lived in-memory cache to avoid burning Free Tier quota on repeated identical quick questions
interface CachedReply {
  answer: string;
  model: string;
  expiresAt: number;
}
const replyCache = new Map<string, CachedReply>();
const CACHE_TTL_MS = 10 * 60 * 1000;

function getCachedReply(cacheKey: string): CachedReply | null {
  const entry = replyCache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    replyCache.delete(cacheKey);
    return null;
  }
  return entry;
}

function setCachedReply(cacheKey: string, answer: string, model: string) {
  if (replyCache.size > 150) {
    const oldestKey = replyCache.keys().next().value;
    if (oldestKey) replyCache.delete(oldestKey);
  }
  replyCache.set(cacheKey, {
    answer,
    model,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

app.use(express.json({ limit: '1mb' }));

// CORS & Credentials headers for iframe preview & Cloud Run compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Dynamic client initialization to catch API keys injected at runtime
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
      timeout: 20000,
      retryOptions: {
        attempts: 1,
      },
    },
  });
}

async function generateWithGeminiFallback(
  ai: GoogleGenAI,
  contents: GeminiContentTurn[],
  systemInstruction: string,
  cacheKey: string
): Promise<{ answer: string; model: string }> {
  const cached = getCachedReply(cacheKey);
  if (cached) {
    return { answer: cached.answer, model: cached.model };
  }

  const candidateModels = [GEMINI_PRIMARY_MODEL, ...GEMINI_FALLBACK_MODELS];
  let lastParsedError: SafeErrorPayload | null = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const modelName = candidateModels[i];
    const startMs = Date.now();
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: buildModelConfig(modelName, systemInstruction),
      });

      const answer = (response.text || '').trim();
      if (!answer) {
        lastParsedError = {
          httpStatus: 502,
          errorCode: 'GEMINI_EMPTY_RESPONSE',
          userMessage: 'Ο βοηθός Gemini δεν έστειλε απάντηση. Δοκίμασε να ρωτήσεις ξανά.',
          diagnosticMessage: `Empty response text from ${modelName}`,
        };
        continue;
      }

      console.log(`[Gemini] ${modelName} responded in ${Date.now() - startMs}ms`);
      setCachedReply(cacheKey, answer, modelName);
      return { answer, model: modelName };
    } catch (error) {
      const parsed = parseGeminiApiError(error);
      lastParsedError = parsed;
      const hasNext = i < candidateModels.length - 1;
      console.warn(`[Gemini] ${modelName} failed after ${Date.now() - startMs}ms:`, {
        httpStatus: parsed.httpStatus,
        errorCode: parsed.errorCode,
        willFallback: hasNext && shouldTryNextGeminiModel(parsed),
      });

      if (!hasNext || !shouldTryNextGeminiModel(parsed)) {
        throw parsed;
      }
    }
  }

  throw lastParsedError ?? {
    httpStatus: 502,
    errorCode: 'GEMINI_UPSTREAM_ERROR',
    userMessage: 'Ο βοηθός Gemini δεν μπόρεσε να απαντήσει αυτή τη στιγμή. Δοκίμασε ξανά σε λίγο.',
    diagnosticMessage: 'All Gemini candidate models failed.',
  };
}

// Health check endpoint (never exposes secrets)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    model: GEMINI_MODEL,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
  });
});

// Multi-turn chat endpoint connected to Google Gemini
app.post('/api/assistant/chat', async (req: Request, res: Response) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      console.error('[Gemini Chat] Missing GEMINI_API_KEY in server environment.');
      return res.status(503).json({
        error: 'MISSING_API_KEY',
        message: 'Ο βοηθός Google Gemini δεν είναι συνδεδεμένος στον διακομιστή (λείπει το GEMINI_API_KEY).',
        connected: false,
        model: GEMINI_MODEL,
      });
    }

    const body = (req.body || {}) as {
      messages?: RawChatMessage[];
      context?: CookingContextInput;
    };
    const messageHistory = Array.isArray(body.messages) ? body.messages : [];
    const contents = sanitizeChatHistory(messageHistory);

    if (contents.length === 0) {
      return res.status(400).json({
        error: 'EMPTY_QUESTION',
        message: 'Παρακαλώ γράψε ή πες μου την ερώτησή σου.',
        connected: true,
        model: GEMINI_MODEL,
      });
    }

    const systemInstruction = buildCookingSystemInstruction(body.context);
    const cacheKey = JSON.stringify({
      recipe: body.context?.recipeTitle || '',
      step: body.context?.stepNumber || 1,
      contents,
    });

    const result = await generateWithGeminiFallback(ai, contents, systemInstruction, cacheKey);

    return res.json({
      answer: result.answer,
      connected: true,
      model: result.model,
    });
  } catch (err) {
    const parsed =
      err && typeof err === 'object' && 'httpStatus' in err && 'errorCode' in err
        ? (err as SafeErrorPayload)
        : parseGeminiApiError(err);

    console.warn('[Gemini Chat] Returning error to client:', {
      httpStatus: parsed.httpStatus,
      errorCode: parsed.errorCode,
      diagnostic: parsed.diagnosticMessage,
    });

    return res.status(parsed.httpStatus).json({
      error: parsed.errorCode,
      message: parsed.userMessage,
      connected: false,
      model: GEMINI_MODEL,
    });
  }
});

// Single-turn question endpoint connected to Google Gemini
app.post('/api/assistant/ask', async (req: Request, res: Response) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      console.error('[Gemini Ask] Missing GEMINI_API_KEY in server environment.');
      return res.status(503).json({
        error: 'MISSING_API_KEY',
        message: 'Ο βοηθός Google Gemini δεν είναι συνδεδεμένος στον διακομιστή (λείπει το GEMINI_API_KEY).',
        connected: false,
        model: GEMINI_MODEL,
      });
    }

    const body = (req.body || {}) as {
      currentStepText?: string;
      stepTitle?: string;
      recipeName?: string;
      userQuestion?: string;
      stepNumber?: number;
      totalSteps?: number;
    };

    const questionText = typeof body.userQuestion === 'string' ? body.userQuestion.trim() : '';
    if (!questionText) {
      return res.status(400).json({
        error: 'EMPTY_QUESTION',
        message: 'Παρακαλώ γράψε ή πες μου την ερώτησή σου.',
        connected: true,
        model: GEMINI_MODEL,
      });
    }

    const systemInstruction = buildCookingSystemInstruction({
      recipeTitle: body.recipeName,
      stepNumber: body.stepNumber,
      totalSteps: body.totalSteps,
      stepTitle: body.stepTitle,
      stepInstruction: body.currentStepText,
    });

    const contents: GeminiContentTurn[] = [{ role: 'user', parts: [{ text: questionText }] }];
    const cacheKey = JSON.stringify({
      recipe: body.recipeName || '',
      step: body.stepNumber || 1,
      contents,
    });

    const result = await generateWithGeminiFallback(ai, contents, systemInstruction, cacheKey);

    return res.json({
      answer: result.answer,
      connected: true,
      model: result.model,
    });
  } catch (err) {
    const parsed =
      err && typeof err === 'object' && 'httpStatus' in err && 'errorCode' in err
        ? (err as SafeErrorPayload)
        : parseGeminiApiError(err);

    console.warn('[Gemini Ask] Returning error to client:', {
      httpStatus: parsed.httpStatus,
      errorCode: parsed.errorCode,
      diagnostic: parsed.diagnosticMessage,
    });

    return res.status(parsed.httpStatus).json({
      error: parsed.errorCode,
      message: parsed.userMessage,
      connected: false,
      model: GEMINI_MODEL,
    });
  }
});

// Ensure unknown /api/* routes return JSON instead of SPA HTML
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Η διαδρομή ${req.path} δεν βρέθηκε.`,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} (Gemini configured: ${Boolean(process.env.GEMINI_API_KEY?.trim())})`);
  });
}

startServer();
