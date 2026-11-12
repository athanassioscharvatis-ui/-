import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Bell, CheckCircle2 } from 'lucide-react';
import { formatTimerSeconds } from '../utils/recipeLogic';
import { playClickSound, playTimerFinishSound } from '../utils/sound';
import { speakGreek } from '../utils/speech';

interface CookingTimerProps {
  initialSeconds: number;
  label?: string;
}

export const CookingTimer: React.FC<CookingTimerProps> = ({
  initialSeconds,
  label = 'Χρόνος βρασίματος',
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setIsRunning(false);
    setIsFinished(false);
  }, [initialSeconds]);

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            setIsFinished(true);
            playTimerFinishSound();
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try {
                navigator.vibrate([300, 150, 300, 150, 500]);
              } catch {}
            }
            speakGreek('Ο χρόνος τελείωσε! Το φαγητό είναι έτοιμο για το επόμενο βήμα.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, secondsLeft]);

  const toggleRunning = () => {
    playClickSound();
    if (secondsLeft === 0) {
      setSecondsLeft(initialSeconds);
      setIsFinished(false);
      setIsRunning(true);
      speakGreek('Το χρονόμετρο ξεκίνησε.');
    } else {
      const nextRunning = !isRunning;
      setIsRunning(nextRunning);
      if (nextRunning) {
        speakGreek('Το χρονόμετρο ξεκίνησε.');
      } else {
        speakGreek('Το χρονόμετρο σταμάτησε.');
      }
    }
  };

  const addMinute = () => {
    playClickSound();
    setSecondsLeft((prev) => prev + 60);
    setIsFinished(false);
    speakGreek('Προστέθηκε ένα λεπτό.');
  };

  const resetTimer = () => {
    playClickSound();
    setIsRunning(false);
    setIsFinished(false);
    setSecondsLeft(initialSeconds);
    speakGreek('Το χρονόμετρο μηδενίστηκε.');
  };

  const progress = Math.max(0, Math.min(1, 1 - secondsLeft / initialSeconds));

  return (
    <div
      className={`rounded-3xl p-5 border-4 transition-all duration-300 shadow-md ${
        isFinished
          ? 'bg-emerald-100 border-emerald-500 ring-4 ring-emerald-300 animate-pulse'
          : isRunning
          ? 'bg-amber-100/90 border-amber-500 shadow-amber-200/50'
          : 'bg-white border-amber-300'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className={`w-7 h-7 ${isFinished ? 'text-emerald-700 animate-bounce' : 'text-amber-700'}`} />
          <span className="text-xl sm:text-2xl font-black text-slate-800">{label}</span>
        </div>
        {isRunning && (
          <span className="bg-amber-500 text-white font-extrabold text-sm sm:text-base px-3 py-1 rounded-full animate-pulse">
            ΜΕΤΡΑΕΙ...
          </span>
        )}
      </div>

      {/* Big Display Clock */}
      <div className="flex flex-col items-center justify-center py-2">
        <div
          className={`font-mono text-5xl sm:text-6xl md:text-7xl font-black tracking-wider ${
            isFinished
              ? 'text-emerald-700'
              : secondsLeft <= 60 && isRunning
              ? 'text-rose-600 animate-pulse'
              : 'text-slate-900'
          }`}
          aria-live="polite"
          aria-label={`Χρόνος που απομένει: ${formatTimerSeconds(secondsLeft)}`}
        >
          {formatTimerSeconds(secondsLeft)}
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-200 h-4 rounded-full mt-3 overflow-hidden shadow-inner">
          <div
            className={`h-full transition-all duration-1000 ${
              isFinished ? 'bg-emerald-600' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>

        {isFinished && (
          <div className="flex items-center gap-2 mt-3 text-emerald-800 font-black text-lg bg-emerald-200/90 px-4 py-2 rounded-2xl">
            <CheckCircle2 className="w-6 h-6 text-emerald-700" />
            <span>Μπράβο! Ο χρόνος τελείωσε!</span>
          </div>
        )}
      </div>

      {/* Large Accessible Timer Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        {/* Play/Pause Button */}
        <button
          onClick={toggleRunning}
          className={`sm:col-span-1 min-h-[64px] rounded-2xl font-extrabold text-lg sm:text-xl flex items-center justify-center gap-3 shadow-md transition-transform active:scale-95 cursor-pointer text-white ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-700 ring-2 ring-amber-400'
              : 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400'
          }`}
          aria-label={isRunning ? 'Παύση χρονομέτρου' : 'Έναρξη χρονομέτρου'}
        >
          {isRunning ? (
            <>
              <Pause className="w-8 h-8 fill-current" />
              <span>ΠΑΥΣΗ</span>
            </>
          ) : (
            <>
              <Play className="w-8 h-8 fill-current" />
              <span>ΕΝΑΡΞΗ</span>
            </>
          )}
        </button>

        {/* Add 1 minute button */}
        <button
          onClick={addMinute}
          className="min-h-[64px] bg-sky-100 hover:bg-sky-200 text-sky-900 border-2 border-sky-400 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
          aria-label="Πρόσθεσε ένα λεπτό στο χρονόμετρο"
        >
          <Plus className="w-6 h-6 text-sky-700" />
          <span>+ 1 Λεπτό</span>
        </button>

        {/* Reset button */}
        <button
          onClick={resetTimer}
          className="min-h-[64px] bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-300 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
          aria-label="Επαναφορά χρονομέτρου στην αρχική διάρκεια"
        >
          <RotateCcw className="w-6 h-6 text-slate-600" />
          <span>ΑΡΧΗ</span>
        </button>
      </div>
    </div>
  );
};
