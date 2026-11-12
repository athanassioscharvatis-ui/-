import React, { useEffect } from 'react';
import { Sparkles, Trophy, Home, RotateCcw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Recipe } from '../types/recipe';
import { playSuccessSound, playClickSound } from '../utils/sound';
import { speakGreek } from '../utils/speech';

interface CompletedScreenProps {
  recipe: Recipe;
  onRestart: () => void;
  onHome: () => void;
  voiceEnabled: boolean;
  extraLargeText: boolean;
}

export const CompletedScreen: React.FC<CompletedScreenProps> = ({
  recipe,
  onRestart,
  onHome,
  voiceEnabled,
  extraLargeText,
}) => {
  useEffect(() => {
    playSuccessSound();
    if (voiceEnabled) {
      speakGreek('Συγχαρητήρια! Το φαγητό σου είναι έτοιμο και μοσχοβολάει. Καλή σου όρεξη!');
    }
  }, [voiceEnabled]);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12 text-center space-y-8 animate-fadeIn">
      {/* Trophy / Star badge */}
      <div className="relative inline-block">
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-emerald-400 p-2 shadow-2xl mx-auto flex items-center justify-center animate-bounce">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-inner border-4 border-yellow-300">
            <Trophy className="w-20 h-20 sm:w-24 sm:h-24 text-amber-500" />
          </div>
        </div>
        <div className="absolute top-0 right-2 bg-emerald-500 text-white p-3 rounded-full shadow-lg">
          <Sparkles className="w-7 h-7" />
        </div>
      </div>

      {/* Main Congratulations Header */}
      <div className="space-y-3">
        <span className="inline-block bg-emerald-100 text-emerald-800 font-black text-lg px-5 py-1.5 rounded-full uppercase tracking-wider">
          Τα κατάφερες!
        </span>
        <h2
          className={`font-black text-slate-900 tracking-tight ${
            extraLargeText ? 'text-4xl sm:text-6xl' : 'text-3xl sm:text-5xl'
          }`}
        >
          Μπράβο σου Σεφ!
        </h2>
        <p className="text-xl sm:text-2xl font-bold text-slate-700 max-w-lg mx-auto">
          Το φαγητό σου είναι έτοιμο και πεντανόστιμο!
        </p>
      </div>

      {/* Safety Wrap-Up Reminder */}
      <div className="bg-emerald-50 border-3 border-emerald-300 rounded-3xl p-5 text-left flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-lg font-black text-emerald-900">
            Έλεγχος ασφαλείας στην κουζίνα:
          </h3>
          <p className="text-base font-bold text-slate-700">
            Ελέγχουμε ότι το μάτι της κουζίνας είναι εντελώς σβηστό και τα σκεύη βρίσκονται σε ασφαλές σημείο.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4 pt-4">
        <button
          onClick={() => {
            playClickSound();
            onHome();
          }}
          className="w-full min-h-[80px] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-2xl sm:text-3xl rounded-3xl shadow-xl flex items-center justify-center gap-4 transition-transform active:scale-95 border-4 border-emerald-400 cursor-pointer"
        >
          <Home className="w-8 h-8" />
          <span>ΑΡΧΙΚΗ ΣΕΛΙΔΑ</span>
        </button>

        <button
          onClick={() => {
            playClickSound();
            onRestart();
          }}
          className="w-full min-h-[64px] bg-white hover:bg-slate-100 text-slate-800 border-3 border-slate-300 font-extrabold text-xl rounded-2xl flex items-center justify-center gap-3 transition-transform active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-6 h-6 text-slate-600" />
          <span>Μαγείρεψε ξανά αυτή τη συνταγή</span>
        </button>
      </div>
    </main>
  );
};
