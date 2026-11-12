import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Volume2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  ChefHat,
  User,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { RecipeStep } from '../types/recipe';
import { speakGreek, stopSpeaking, isSpeechRecognitionSupported, createSpeechRecognizer } from '../utils/speech';
import { playClickSound } from '../utils/sound';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: RecipeStep;
  recipeTitle: string;
}

const COMMON_QUICK_QUESTIONS = [
  { id: 'q1', text: 'Πόση ώρα να περιμένω;' },
  { id: 'q2', text: 'Τι κάνω τώρα ακριβώς;' },
  { id: 'q3', text: 'Πώς ξέρω αν είναι έτοιμο;' },
  { id: 'q4', text: 'Πρέπει να ανακατέψω;' },
];

// Smart contextual fallback when network/cookie redirects occur
function getLocalSmartAnswer(question: string, step: RecipeStep): string {
  const q = question.toLowerCase();
  if (
    q.includes('καίει') ||
    q.includes('καυτό') ||
    q.includes('φωτιά') ||
    q.includes('κάηκα') ||
    q.includes('κόπηκα') ||
    q.includes('καπνός') ||
    q.includes('πονάω')
  ) {
    return 'Σβήσε αμέσως το μάτι της κουζίνας και κάνε ένα βήμα πίσω με ασφάλεια.';
  }
  if (q.includes('πόση') || q.includes('πόσο') || q.includes('χρόνο') || q.includes('λεπτά') || q.includes('περιμένω')) {
    if (step.hasTimer && step.timerSeconds) {
      const minutes = Math.round(step.timerSeconds / 60);
      return `Περιμένουμε περίπου ${minutes} λεπτά. Παρακολούθησε το χρονόμετρο στην οθόνη σου!`;
    }
    return 'Κάνε το βήμα με ηρεμία και χωρίς βιασύνη. Όλα πάνε τέλεια!';
  }
  if (q.includes('ανακατεύω') || q.includes('κουτάλα') || q.includes('ανακάτεμα')) {
    return 'Ανακάτεψε απαλά μία φορά με την ξύλινη κουτάλα και άφησέ το να συνεχίσει.';
  }
  if (q.includes('έτοιμο') || q.includes('τελείωσε') || q.includes('έγινε')) {
    return 'Δοκίμασε προσεκτικά ή κοίταξε αν έχει μαλακώσει, ακριβώς όπως λέει η οδηγία.';
  }
  if (q.includes('τι κάνω') || q.includes('ακριβώς') || q.includes('πώς')) {
    return `${step.instruction} Όλα πάνε περίφημα!`;
  }
  return `${step.instruction} Συνέχισε με ηρεμία και προσοχή.`;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  step,
  recipeTitle,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isGeminiConnected, setIsGeminiConnected] = useState(true);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll chat thread to bottom on new message
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Initial welcome message from Gemini assistant when opening for this step
  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        const welcomeText = `Γεια σου! Είμαι ο Βοηθός σου (Google Gemini). Βρισκόμαστε στο βήμα «${step.title}». Πες μου ή πάτησε μία ερώτηση!`;
        const initialMsg: ChatMessage = {
          id: 'welcome-msg',
          role: 'model',
          text: welcomeText,
          timestamp: new Date().toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([initialMsg]);
        speakGreek(welcomeText);
      }
    } else {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
    }
  }, [isOpen, step]);

  if (!isOpen) return null;

  const handleSendMessage = async (rawText: string) => {
    const textToSend = rawText.trim();
    if (!textToSend || isLoading) return;

    playClickSound();
    stopSpeaking();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' }),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInputText('');
    setIsLoading(true);

    try {
      // Send conversation history with context to Gemini endpoint
      // Filter out local welcome greeting so conversation strictly starts with user
      const messagesForGemini = nextHistory
        .filter((m) => m.id !== 'welcome-msg' && !m.id.startsWith('welcome-'))
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesForGemini,
          context: {
            recipeTitle,
            stepNumber: step.id,
            stepTitle: step.title,
            stepInstruction: step.instruction,
          },
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      let reply = '';

      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        reply = data.answer || getLocalSmartAnswer(textToSend, step);
        setIsGeminiConnected(data.connected ?? true);
      } else {
        // Safe contextual response without crashing on HTML redirect
        reply = getLocalSmartAnswer(textToSend, step);
        setIsGeminiConnected(false);
      }

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: reply,
        timestamp: new Date().toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);

      // Speak answer automatically via TTS
      speakGreek(reply);
    } catch {
      // Graceful fallback without throwing unhandled syntax errors
      const fallback = getLocalSmartAnswer(textToSend, step);
      const errorMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: fallback,
        timestamp: new Date().toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      speakGreek(fallback);
      setIsGeminiConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = () => {
    playClickSound();
    if (!isSpeechRecognitionSupported()) {
      alert('Η αναγνώριση φωνής δεν υποστηρίζεται σε αυτό το πρόγραμμα περιήγησης. Μπορείς να πατήσεις μία από τις έτοιμες ερωτήσεις!');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognizer = createSpeechRecognizer();
    if (!recognizer) return;
    recognitionRef.current = recognizer;

    setIsListening(true);
    speakGreek('Σε ακούω. Πες μου τι θέλεις.');

    recognizer.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript.trim()) {
        setInputText(transcript);
        handleSendMessage(transcript);
      }
      setIsListening(false);
    };

    recognizer.onerror = (e: any) => {
      console.warn('Voice error:', e);
      setIsListening(false);
    };

    recognizer.onend = () => {
      setIsListening(false);
    };

    try {
      recognizer.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleResetChat = () => {
    playClickSound();
    stopSpeaking();
    const initialMsg: ChatMessage = {
      id: `welcome-${Date.now()}`,
      role: 'model',
      text: `Νέα συζήτηση! Είμαι ο Βοηθός σου Gemini. Τι θα ήθελες να μάθεις για το βήμα «${step.title}»;`,
      timestamp: new Date().toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([initialMsg]);
    speakGreek(initialMsg.text);
  };

  const handleClose = () => {
    playClickSound();
    stopSpeaking();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full h-[92vh] max-h-[820px] border-4 border-amber-300 shadow-2xl flex flex-col overflow-hidden my-auto animate-fadeIn">
        {/* Header with Gemini connection badge */}
        <div className="bg-amber-50/90 border-b-2 border-amber-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-500 text-white flex items-center justify-center shadow-md">
              <ChefHat className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="chat-modal-title" className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                  Βοηθός Κουζίνας
                </h2>
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-black px-2.5 py-0.5 rounded-full border border-emerald-300">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Google Gemini</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-amber-800 mt-0.5">
                Συνταγή: {recipeTitle} • Βήμα {step.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetChat}
              className="p-2.5 rounded-xl bg-white hover:bg-amber-100 border border-amber-300 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Καθαρισμός συνομιλίας"
              aria-label="Καθαρισμός συνομιλίας"
            >
              <RotateCcw className="w-4 h-4 text-amber-700" />
              <span className="hidden sm:inline">Καθαρισμός</span>
            </button>

            <button
              onClick={handleClose}
              className="w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
              aria-label="Κλείσιμο συνομιλίας"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Conversation Thread */}
        <div
          ref={chatScrollRef}
          className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-linear-to-b from-amber-50/30 to-white"
          tabIndex={0}
          aria-label="Ιστορικό συνομιλίας"
        >
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 items-end ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mb-1">
                    <Sparkles className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-3xl p-4 sm:p-5 shadow-md space-y-2.5 ${
                    isUser
                      ? 'bg-sky-600 text-white rounded-br-xs'
                      : 'bg-emerald-50 border-3 border-emerald-300 text-slate-900 rounded-bl-xs'
                  }`}
                >
                  <p
                    className={`font-bold leading-relaxed whitespace-pre-wrap ${
                      isUser ? 'text-lg sm:text-xl text-white' : 'text-xl sm:text-2xl text-slate-900 font-extrabold'
                    }`}
                  >
                    {msg.text}
                  </p>

                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-black/10 text-xs">
                    <span className={isUser ? 'text-sky-100 font-bold' : 'text-slate-500 font-bold'}>
                      {msg.timestamp}
                    </span>

                    {/* Audio repeat button for Gemini responses */}
                    {!isUser && (
                      <button
                        onClick={() => {
                          playClickSound();
                          speakGreek(msg.text);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-emerald-100 text-emerald-900 font-extrabold text-xs sm:text-sm rounded-xl border border-emerald-300 transition-transform active:scale-95 cursor-pointer shadow-2xs"
                        aria-label="Άκουσε ξανά αυτή την απάντηση"
                      >
                        <Volume2 className="w-4 h-4 text-emerald-700" />
                        <span>ΑΚΟΥΣΕ ΞΑΝΑ</span>
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-10 h-10 rounded-2xl bg-sky-700 text-white flex items-center justify-center shrink-0 shadow-xs mb-1">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator when waiting for Gemini */}
          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="bg-amber-100 border-2 border-amber-300 rounded-2xl px-4 py-3 text-amber-900 font-extrabold text-base flex items-center gap-2">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-amber-700 border-t-transparent" />
                <span>Ο βοηθός Gemini σκέφτεται την απάντηση...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-amber-50/70 border-t border-amber-200 px-3 sm:px-4 py-2 shrink-0 overflow-x-auto flex items-center gap-2">
          <span className="text-xs font-black text-amber-900 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Γρήγορες ερωτήσεις:</span>
          </span>
          {COMMON_QUICK_QUESTIONS.map((q) => (
            <button
              key={q.id}
              onClick={() => handleSendMessage(q.text)}
              disabled={isLoading}
              className="shrink-0 bg-white hover:bg-amber-100 border border-amber-300 text-slate-800 font-bold text-xs sm:text-sm px-3 py-1.5 rounded-full transition-transform active:scale-95 cursor-pointer shadow-2xs disabled:opacity-50"
            >
              {q.text}
            </button>
          ))}
        </div>

        {/* Input Bar with Voice (Microphone), Text input and Send button */}
        <div className="p-3 sm:p-4 bg-white border-t-2 border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex items-center gap-2 sm:gap-3"
          >
            {/* Voice input button */}
            <button
              type="button"
              onClick={startVoiceInput}
              className={`min-h-[60px] sm:min-h-[64px] px-4 sm:px-5 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-md shrink-0 ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200'
                  : 'bg-sky-600 hover:bg-sky-700 text-white'
              }`}
              aria-label={isListening ? 'Σταμάτημα ακρόασης' : 'Πάτησε για να μιλήσεις'}
              title={isListening ? 'Σε ακούω...' : 'Μίλησε στον βοηθό'}
            >
              {isListening ? (
                <>
                  <MicOff className="w-6 h-6" />
                  <span className="hidden sm:inline">Ακούω...</span>
                </>
              ) : (
                <>
                  <Mic className="w-6 h-6" />
                  <span className="hidden sm:inline">ΜΙΛΗΣΕ</span>
                </>
              )}
            </button>

            {/* Accessible Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Γράψε εδώ την ερώτησή σου..."
              className="flex-1 min-h-[60px] sm:min-h-[64px] px-4 bg-slate-50 border-3 border-slate-300 rounded-2xl text-lg sm:text-xl font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="min-h-[60px] sm:min-h-[64px] px-5 sm:px-7 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-lg sm:text-xl rounded-2xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer shrink-0"
              aria-label="Αποστολή ερώτησης"
            >
              <Send className="w-6 h-6" />
              <span className="hidden sm:inline">ΡΩΤΑ</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
