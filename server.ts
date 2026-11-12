import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// CORS & Credentials headers for iframe preview compatibility
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

// Dynamic client initialization to catch API keys injected or updated at runtime
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Multi-turn chat endpoint connected to Google Gemini
app.post('/api/assistant/chat', async (req: Request, res: Response) => {
  try {
    const { messages, context } = req.body;
    const ai = getGeminiClient();

    // Prepare message history
    const messageHistory: Array<{ role: string; text: string }> = Array.isArray(messages) ? messages : [];
    const latestUserMessage = messageHistory[messageHistory.length - 1]?.text || '';

    // Safety checks for dangerous cooking conditions
    const lowerQuestion = latestUserMessage.toLowerCase();
    const isDangerous =
      lowerQuestion.includes('καίει') ||
      lowerQuestion.includes('καυτό') ||
      lowerQuestion.includes('φωτιά') ||
      lowerQuestion.includes('κάηκα') ||
      lowerQuestion.includes('κόπηκα') ||
      lowerQuestion.includes('καπνός') ||
      lowerQuestion.includes('πονάω');

    if (isDangerous) {
      return res.json({
        answer: 'Σβήσε αμέσως το μάτι της κουζίνας και κάνε ένα βήμα πίσω με ασφάλεια.',
        connected: Boolean(ai),
        model: 'gemini-3.8-flash',
      });
    }

    if (!ai) {
      // Deterministic supportive fallback when API key is not yet set
      let fallback = 'Κάνε ένα πράγμα τη φορά με ηρεμία. Όλα πάνε περίφημα!';
      if (lowerQuestion.includes('πόση') || lowerQuestion.includes('πόσο') || lowerQuestion.includes('χρόνο')) {
        fallback = 'Κοίταξε το χρονόμετρο στην οθόνη σου. Περιμένουμε με ηρεμία μέχρι να χτυπήσει το καμπανάκι!';
      } else if (lowerQuestion.includes('έτοιμο')) {
        fallback = 'Δοκίμασε προσεκτικά ένα μακαρόνι για να δεις αν είναι μαλακό.';
      } else if (lowerQuestion.includes('ανακατεύω') || lowerQuestion.includes('κουτάλα')) {
        fallback = 'Ανακάτεψε απαλά μία φορά με την ξύλινη κουτάλα.';
      }
      return res.json({
        answer: fallback,
        connected: false,
        model: 'gemini-3.8-flash',
      });
    }

    const recipeTitle = context?.recipeTitle || 'Μαγειρική';
    const stepNumber = context?.stepNumber || 1;
    const totalSteps = context?.totalSteps || 9;
    const stepTitle = context?.stepTitle || '';
    const stepInstruction = context?.stepInstruction || '';

    const systemInstruction = `Είσαι ο «Βοηθός Κουζίνας», ένας πολύ υπομονετικός, γλυκός, καθησυχαστικός και βοηθητικός σεφ τεχνητής νοημοσύνης (Google Gemini) για ενήλικες με αυτισμό ή νοητική αναπηρία.
Βρίσκεστε στη συνταγή: "${recipeTitle}"
Τρέχον βήμα: Βήμα ${stepNumber} από ${totalSteps} - "${stepTitle}"
Οδηγία αυτού του βήματος: "${stepInstruction}"

ΚΑΝΟΝΕΣ ΑΠΑΝΤΗΣΗΣ:
1. Απάντησε πάντα σε ΠΟΛΥ ΑΠΛΑ, ΖΕΣΤΑ και ΚΑΘΑΡΑ ΕΛΛΗΝΙΚΑ.
2. Οι απαντήσεις σου να είναι 1 έως 2 ΠΟΛΥ ΣΥΝΤΟΜΕΣ προτάσεις.
3. Το κείμενό σου θα εκφωνηθεί ζωντανά από τη φωνή της εφαρμογής (Text-To-Speech). Μην βάζεις ποτέ αστερίσκους, bullet points, σύμβολα Markdown ή emojis.
4. Ενθάρρυνε τον χρήστη με θετικότητα, ηρεμία και αυτοπεποίθηση.
5. Μην αναφέρεις ενήλικες βοηθούς, καθοδήγησε τον ίδιο τον χρήστη να κάνει τη μαγειρική του με ασφάλεια.`;

    // Filter and sanitize message history for Gemini:
    // 1. Must start with 'user' role
    // 2. Must alternate roles
    // 3. Skip local welcome greetings that had role 'model'
    const sanitizedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    for (const msg of messageHistory) {
      if (!msg || !msg.text || typeof msg.text !== 'string') continue;
      const role = msg.role === 'user' ? 'user' : 'model';
      // First turn in Gemini conversation must be user
      if (sanitizedContents.length === 0 && role !== 'user') {
        continue;
      }
      // Ensure alternating roles
      if (sanitizedContents.length > 0 && sanitizedContents[sanitizedContents.length - 1].role === role) {
        continue;
      }
      sanitizedContents.push({
        role,
        parts: [{ text: msg.text }],
      });
    }

    // Fallback if empty
    if (sanitizedContents.length === 0) {
      sanitizedContents.push({
        role: 'user',
        parts: [{ text: latestUserMessage || 'Τι κάνω σε αυτό το βήμα;' }],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: sanitizedContents,
      config: {
        systemInstruction,
      },
    });

    const answer = (response.text || '').trim();

    return res.json({
      answer: answer || 'Είμαι εδώ μαζί σου. Συνέχισε το βήμα σου με ηρεμία.',
      connected: true,
      model: 'gemini-3.8-flash',
    });
  } catch (error) {
    console.error('Error in Gemini chat:', error);
    return res.json({
      answer: 'Μην ανησυχείς. Κάνε το βήμα με ηρεμία και προσοχή.',
      connected: false,
      model: 'gemini-3.8-flash',
    });
  }
});

// Single question endpoint (backwards compatibility)
app.post('/api/assistant/ask', async (req: Request, res: Response) => {
  try {
    const { currentStepText, stepTitle, recipeName, userQuestion } = req.body;
    const ai = getGeminiClient();

    const questionText = (userQuestion || '').trim();
    const systemPrompt = `Είσαι ο «Βοηθός Κουζίνας» (Google Gemini), ένας υπομονετικός οδηγός για ενήλικες με αυτισμό και νοητική αναπηρία.
Συνταγή: "${recipeName || 'Μαγειρική'}"
Βήμα: "${stepTitle || ''}" - "${currentStepText || ''}".
Απάντησε σε πολύ απλά ελληνικά, σε 1-2 μικρές προτάσεις, χωρίς σύμβολα ή emojis.`;

    if (!ai) {
      return res.json({
        answer: 'Κάνε ένα πράγμα τη φορά με ηρεμία. Όλα πάνε περίφημα!',
        connected: false,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: questionText || 'Τι κάνω τώρα;',
      config: {
        systemInstruction: systemPrompt,
      },
    });

    return res.json({
      answer: (response.text || '').trim() || 'Είμαι εδώ μαζί σου. Κάνε το βήμα σου με ηρεμία.',
      connected: true,
    });
  } catch (error) {
    console.error('Error in ask endpoint:', error);
    return res.json({
      answer: 'Μην ανησυχείς. Κάνε το βήμα με ηρεμία και προσοχή.',
      connected: false,
    });
  }
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

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
