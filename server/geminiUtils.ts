import { ThinkingLevel } from '@google/genai';

export const GEMINI_PRIMARY_MODEL = 'gemini-3.8-flash';
export const GEMINI_FALLBACK_MODELS = ['gemini-3.1-flash-lite', 'gemini-4-hydrogen'] as const;

export interface RawChatMessage {
  role?: string;
  text?: string;
  isError?: boolean;
}

export interface GeminiContentPart {
  text: string;
}

export interface GeminiContentTurn {
  role: 'user' | 'model';
  parts: GeminiContentPart[];
}

export interface CookingContextInput {
  recipeTitle?: string;
  stepNumber?: number;
  totalSteps?: number;
  stepTitle?: string;
  stepInstruction?: string;
}

export interface SafeErrorPayload {
  httpStatus: number;
  errorCode: string;
  userMessage: string;
  diagnosticMessage: string;
}

/**
 * Sanitizes multi-turn chat history for Gemini API:
 * - Filters out invalid, empty, or UI error messages
 * - Skips leading non-user turns (e.g., local welcome greeting)
 * - Merges consecutive same-role turns so the latest user message is never dropped
 */
export function sanitizeChatHistory(
  messages: RawChatMessage[],
  fallbackUserText?: string
): GeminiContentTurn[] {
  const sanitized: GeminiContentTurn[] = [];

  for (const msg of messages) {
    if (!msg || msg.isError) continue;
    const text = typeof msg.text === 'string' ? msg.text.trim() : '';
    if (!text) continue;

    const role: 'user' | 'model' = msg.role === 'model' ? 'model' : 'user';

    // Gemini conversation history must begin with a user turn
    if (sanitized.length === 0 && role !== 'user') {
      continue;
    }

    // Merge consecutive turns of the same role rather than dropping newer messages
    const lastTurn = sanitized[sanitized.length - 1];
    if (lastTurn && lastTurn.role === role) {
      lastTurn.parts.push({ text });
    } else {
      sanitized.push({
        role,
        parts: [{ text }],
      });
    }
  }

  if (sanitized.length === 0) {
    const cleanFallback = (fallbackUserText || '').trim();
    if (cleanFallback) {
      sanitized.push({
        role: 'user',
        parts: [{ text: cleanFallback }],
      });
    }
  }

  return sanitized;
}

/**
 * Builds the Greek cognitive-accessibility system instruction for Gemini.
 */
export function buildCookingSystemInstruction(context: CookingContextInput = {}): string {
  const recipeTitle = context.recipeTitle || 'Μαγειρική';
  const stepNumber = context.stepNumber || 1;
  const totalSteps = context.totalSteps || 9;
  const stepTitle = context.stepTitle || '';
  const stepInstruction = context.stepInstruction || '';

  return `Είσαι ο «Βοηθός Κουζίνας», ένας πολύ υπομονετικός, γλυκός, καθησυχαστικός και βοηθητικός σεφ τεχνητής νοημοσύνης (Google Gemini) για ενήλικες με αυτισμό ή νοητική αναπηρία.
Βρίσκεστε στη συνταγή: "${recipeTitle}"
Τρέχον βήμα: Βήμα ${stepNumber} από ${totalSteps}${stepTitle ? ` - "${stepTitle}"` : ''}
${stepInstruction ? `Οδηγία αυτού του βήματος: "${stepInstruction}"` : ''}

ΚΑΝΟΝΕΣ ΑΠΑΝΤΗΣΗΣ:
1. Απάντησε πάντα σε ΠΟΛΥ ΑΠΛΑ, ΖΕΣΤΑ και ΚΑΘΑΡΑ ΕΛΛΗΝΙΚΑ.
2. Οι απαντήσεις σου να είναι 1 έως 2 ΠΟΛΥ ΣΥΝΤΟΜΕΣ προτάσεις.
3. Το κείμενό σου θα εκφωνηθεί ζωντανά από τη φωνή της εφαρμογής (Text-To-Speech). Μην βάζεις ποτέ αστερίσκους, bullet points, σύμβολα Markdown ή emojis.
4. Ενθάρρυνε τον χρήστη με θετικότητα, ηρεμία και αυτοπεποίθηση.
5. Δώσε προτεραιότητα στην ασφάλεια στην κουζίνα. Αν ο χρήστης αναφέρει κίνδυνο (ότι κάηκε, κόπηκε ή υπάρχει φωτιά/καπνός), πες του να σβήσει αμέσως το μάτι της κουζίνας και να απομακρυνθεί με ασφάλεια.
6. Μην αναφέρεις ενήλικες βοηθούς, καθοδήγησε τον ίδιο τον χρήστη με απλά και ασφαλή λόγια.`;
}

/**
 * Builds model-specific generation config compatible with each Gemini model.
 */
export function buildModelConfig(modelName: string, systemInstruction: string) {
  if (modelName === 'gemini-3.8-flash' || modelName === 'gemini-4-hydrogen') {
    return {
      systemInstruction,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.LOW,
      },
    };
  }
  if (modelName === 'gemini-3.1-flash-lite') {
    return {
      systemInstruction,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.MINIMAL,
      },
    };
  }
  return {
    systemInstruction,
  };
}

/**
 * Maps Gemini SDK / network errors to safe HTTP status codes and understandable Greek messages
 * without exposing secrets or raw stack traces to the client.
 */
export function parseGeminiApiError(error: unknown): SafeErrorPayload {
  const errObj = error as {
    status?: number;
    code?: number | string;
    message?: string;
    name?: string;
    cause?: { message?: string; code?: string };
  } | null;

  const baseMessage = typeof errObj?.message === 'string' ? errObj.message : String(error || 'Unknown error');
  const causePart = errObj?.cause?.message ? ` (cause: ${errObj.cause.code || ''} ${errObj.cause.message})` : '';
  const namePart = errObj?.name ? `[${errObj.name}] ` : '';
  const rawMessage = `${namePart}${baseMessage}${causePart}`;

  const status = typeof errObj?.status === 'number'
    ? errObj.status
    : typeof errObj?.code === 'number'
      ? errObj.code
      : 500;

  // Redact any accidental API key-like tokens just in case
  const safeDiagnostic = rawMessage.replace(/AIza[0-9A-Za-z\-_]{20,}/g, '[REDACTED_KEY]');

  if (status === 429 || safeDiagnostic.includes('RESOURCE_EXHAUSTED') || safeDiagnostic.includes('429')) {
    return {
      httpStatus: 429,
      errorCode: 'GEMINI_QUOTA_EXCEEDED',
      userMessage: 'Ο βοηθός Gemini έφτασε το ημερήσιο όριο ερωτήσεων. Δοκίμασε ξανά αργότερα ή πρόσθεσε ένα κλειδί API με χρέωση στις ρυθμίσεις Secrets.',
      diagnosticMessage: safeDiagnostic,
    };
  }

  if (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    safeDiagnostic.includes('API_KEY_INVALID') ||
    safeDiagnostic.includes('PERMISSION_DENIED')
  ) {
    const isKeyIssue = safeDiagnostic.includes('API_KEY') || status === 401 || status === 403;
    return {
      httpStatus: isKeyIssue ? 502 : 400,
      errorCode: isKeyIssue ? 'GEMINI_AUTH_ERROR' : 'GEMINI_BAD_REQUEST',
      userMessage: isKeyIssue
        ? 'Υπάρχει πρόβλημα σύνδεσης με το κλειδί του Google Gemini. Έλεγξε τις ρυθμίσεις Secrets.'
        : 'Δεν μπόρεσα να καταλάβω το αίτημα. Δοκίμασε να ρωτήσεις ξανά με απλά λόγια.',
      diagnosticMessage: safeDiagnostic,
    };
  }

  if (status === 404 || safeDiagnostic.includes('NOT_FOUND')) {
    return {
      httpStatus: 502,
      errorCode: 'GEMINI_MODEL_NOT_FOUND',
      userMessage: 'Το μοντέλο του βοηθού Gemini δεν βρέθηκε. Παρακαλώ έλεγξε τη ρύθμιση του διακομιστή.',
      diagnosticMessage: safeDiagnostic,
    };
  }

  if (
    status === 504 ||
    safeDiagnostic.includes('DEADLINE_EXCEEDED') ||
    safeDiagnostic.toLowerCase().includes('timeout') ||
    safeDiagnostic.toLowerCase().includes('abort') ||
    errObj?.name === 'AbortError' ||
    errObj?.name === 'TimeoutError'
  ) {
    return {
      httpStatus: 504,
      errorCode: 'GEMINI_TIMEOUT',
      userMessage: 'Ο βοηθός Gemini καθυστέρησε να απαντήσει. Πάτησε ξανά για να δοκιμάσεις.',
      diagnosticMessage: safeDiagnostic,
    };
  }

  return {
    httpStatus: 502,
    errorCode: 'GEMINI_UPSTREAM_ERROR',
    userMessage: 'Ο βοηθός Gemini δεν μπόρεσε να απαντήσει αυτή τη στιγμή. Δοκίμασε ξανά σε λίγο.',
    diagnosticMessage: safeDiagnostic,
  };
}

/**
 * Returns true if the error warrants trying the next available Gemini model
 * (e.g., per-model free-tier 429 quota exhaustion or transient 504 deadline).
 */
export function shouldTryNextGeminiModel(parsed: SafeErrorPayload): boolean {
  return (
    parsed.errorCode === 'GEMINI_QUOTA_EXCEEDED' ||
    parsed.errorCode === 'GEMINI_TIMEOUT' ||
    parsed.errorCode === 'GEMINI_MODEL_NOT_FOUND' ||
    parsed.errorCode === 'GEMINI_UPSTREAM_ERROR'
  );
}
