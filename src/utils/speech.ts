/**
 * Web Speech API wrapper for Greek text-to-speech and speech-to-text.
 * Designed specifically for accessibility and clear pronunciation.
 */

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}

export function speakGreek(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
) {
  if (!isSpeechSynthesisSupported()) {
    options?.onEnd?.();
    return;
  }

  stopSpeaking();

  if (!text || !text.trim()) {
    options?.onEnd?.();
    return;
  }

  // Clean text: strip markdown, extra punctuation or symbols
  const cleanText = text
    .replace(/[#*_~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'el-GR';
  // Gentle, calm speed suited for cognitive accessibility
  utterance.rate = options?.rate ?? 0.88;
  utterance.pitch = options?.pitch ?? 1.0;

  // Attempt to select an explicit Greek voice if available
  const voices = window.speechSynthesis.getVoices();
  const greekVoice = voices.find(
    (v) => v.lang.startsWith('el') || v.lang.includes('GR') || v.name.toLowerCase().includes('greek')
  );
  if (greekVoice) {
    utterance.voice = greekVoice;
  }

  utterance.onstart = () => {
    options?.onStart?.();
  };

  utterance.onend = () => {
    activeUtterance = null;
    options?.onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    activeUtterance = null;
    options?.onError?.();
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

// Ensure voices are loaded when available
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    // voices updated
  };
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );
}

export interface SpeechRecognitionResultHook {
  startListening: (onResult: (transcript: string) => void, onError: (err: string) => void) => void;
  stopListening: () => void;
}

export function createSpeechRecognizer() {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognitionClass =
    (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

  if (!SpeechRecognitionClass) return null;

  const recognition = new SpeechRecognitionClass();
  recognition.lang = 'el-GR';
  recognition.continuous = false;
  recognition.interimResults = false;

  return recognition;
}
