import React, { useEffect } from 'react';
import { ChefHat, ArrowRight, Heart, Sparkles, Volume2 } from 'lucide-react';
import { playClickSound } from '../utils/sound';
import { speakGreek } from '../utils/speech';

interface StartScreenProps {
  onStart: () => void;
  voiceEnabled: boolean;
  extraLargeText: boolean;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  voiceEnabled,
  extraLargeText,
}) => {
  useEffect(() => {
    if (voiceEnabled) {
      speakGreek('Καλωσήρθες στον Βοηθό σου στην Κουζίνα! Πάτησε το μεγάλο πράσινο κουμπί Ξεκινάμε για να μαγειρέψουμε μαζί.');
    }
  }, [voiceEnabled]);

  const handleStartClick = () => {
    playClickSound();
    onStart();
  };

  return (
    <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 sm:p-8 max-w-3xl mx-auto text-center space-y-8 animate-fadeIn">
      {/* Friendly Chef Icon Illustration */}
      <div className="relative group">
        <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-linear-to-b from-amber-200 via-amber-300 to-orange-400 p-2 shadow-xl flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center shadow-inner overflow-hidden border-4 border-amber-300">
            {/* Friendly Mascot SVG */}
            <svg className="w-28 h-28 sm:w-36 sm:h-36" viewBox="0 0 120 120" fill="none">
              {/* Chef Hat */}
              <path
                d="M38 42 C30 38 25 24 35 15 C45 6 55 12 60 18 C65 12 75 6 85 15 C95 24 90 38 82 42 Z"
                fill="#FFFFFF"
                stroke="#F59E0B"
                strokeWidth="3"
              />
              <rect x="36" y="40" width="48" height="12" rx="4" fill="#F59E0B" />
              <rect x="38" y="42" width="44" height="4" rx="2" fill="#FDE68A" />
              {/* Face */}
              <circle cx="60" cy="72" r="26" fill="#FED7AA" stroke="#F97316" strokeWidth="2.5" />
              {/* Rosy Cheeks */}
              <ellipse cx="44" cy="76" rx="5" ry="3" fill="#FDA4AF" />
              <ellipse cx="76" cy="76" rx="5" ry="3" fill="#FDA4AF" />
              {/* Friendly Eyes */}
              <ellipse cx="49" cy="68" rx="3.5" ry="5" fill="#1E293B" />
              <ellipse cx="71" cy="68" rx="3.5" ry="5" fill="#1E293B" />
              <circle cx="50" cy="66" r="1.5" fill="#FFFFFF" />
              <circle cx="72" cy="66" r="1.5" fill="#FFFFFF" />
              {/* Big Happy Smile */}
              <path d="M49 79 Q60 90 71 79" stroke="#9A3412" strokeWidth="3" strokeLinecap="round" fill="none" />
              {/* Apron collar */}
              <path d="M42 98 L60 92 L78 98" stroke="#F59E0B" strokeWidth="3" fill="#FFFFFF" />
            </svg>
          </div>
        </div>
        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-3 rounded-full shadow-lg">
          <Sparkles className="w-7 h-7" />
        </div>
      </div>

      {/* Main Title and Welcoming Text */}
      <div className="space-y-3">
        <h1
          className={`font-black text-slate-900 tracking-tight leading-tight ${
            extraLargeText ? 'text-4xl sm:text-6xl' : 'text-3xl sm:text-5xl'
          }`}
        >
          Ο Βοηθός μου στην Κουζίνα
        </h1>
        <p
          className={`font-bold text-slate-700 max-w-xl mx-auto leading-relaxed ${
            extraLargeText ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
          }`}
        >
          Μαγειρεύουμε νόστιμα φαγητά, βήμα-βήμα, με ασφάλεια και χαμόγελο!
        </p>
      </div>

      {/* Reassuring Cards (visual cues) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
        <div className="bg-white/80 border-2 border-amber-200 rounded-2xl p-4 flex items-center justify-center gap-2.5 shadow-xs">
          <span className="text-2xl">🍳</span>
          <span className="font-extrabold text-slate-800 text-base sm:text-lg">Ένα βήμα τη φορά</span>
        </div>
        <div className="bg-white/80 border-2 border-emerald-200 rounded-2xl p-4 flex items-center justify-center gap-2.5 shadow-xs">
          <span className="text-2xl">🔊</span>
          <span className="font-extrabold text-slate-800 text-base sm:text-lg">Μας μιλάει στα Ελληνικά</span>
        </div>
        <div className="bg-white/80 border-2 border-rose-200 rounded-2xl p-4 flex items-center justify-center gap-2.5 shadow-xs">
          <span className="text-2xl">🛡️</span>
          <span className="font-extrabold text-slate-800 text-base sm:text-lg">Απλά & κατανοητά</span>
        </div>
      </div>

      {/* Primary Action Button: «Ξεκινάμε» (Feature 1) */}
      <div className="w-full max-w-md pt-4">
        <button
          onClick={handleStartClick}
          className="w-full min-h-[88px] sm:min-h-[96px] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-3xl sm:text-4xl rounded-3xl shadow-xl flex items-center justify-center gap-4 transition-transform border-4 border-emerald-400 ring-4 ring-emerald-200 cursor-pointer"
          aria-label="Ξεκινάμε τη μαγειρική"
        >
          <span>Ξεκινάμε</span>
          <ArrowRight className="w-10 h-10 sm:w-12 sm:h-12 stroke-[3]" />
        </button>
      </div>

      {/* Audio re-listen button */}
      <button
        onClick={() => {
          playClickSound();
          speakGreek('Καλωσήρθες! Πάτησε το μεγάλο πράσινο κουμπί Ξεκινάμε για να δούμε τις συνταγές μας.');
        }}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-extrabold text-base sm:text-lg bg-amber-100/70 hover:bg-amber-100 px-4 py-2 rounded-2xl transition-colors cursor-pointer"
      >
        <Volume2 className="w-5 h-5 text-amber-700" />
        <span>Άκουσε ξανά το μήνυμα</span>
      </button>
    </main>
  );
};
