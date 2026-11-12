import React from 'react';
import { Flame, Droplets, Utensils, Clock, CheckCircle2 } from 'lucide-react';

interface StepGraphicProps {
  type: string;
}

export const StepGraphic: React.FC<StepGraphicProps> = ({ type }) => {
  return (
    <div className="relative w-full max-w-sm mx-auto h-40 sm:h-44 rounded-3xl bg-amber-50/70 border-4 border-amber-200/80 p-2 sm:p-3 flex flex-col items-center justify-center shadow-inner overflow-hidden">
      {/* Background soft decorative pattern */}
      <div className="absolute inset-0 bg-radial from-amber-100/40 via-transparent to-transparent pointer-events-none" />

      {type === 'prep' && (
        <div className="flex flex-col items-center justify-center space-y-3">
          <svg className="w-48 h-32 text-amber-600" viewBox="0 0 200 160" fill="none">
            {/* Table surface */}
            <rect x="10" y="125" width="180" height="12" rx="6" fill="#D97706" />
            <rect x="25" y="137" width="12" height="20" rx="3" fill="#B45309" />
            <rect x="163" y="137" width="12" height="20" rx="3" fill="#B45309" />
            {/* Cooking Pot */}
            <rect x="40" y="65" width="65" height="60" rx="10" fill="#94A3B8" />
            <rect x="30" y="75" width="10" height="12" rx="4" fill="#64748B" />
            <rect x="105" y="75" width="10" height="12" rx="4" fill="#64748B" />
            <ellipse cx="72.5" cy="65" rx="32.5" ry="8" fill="#CBD5E1" />
            {/* Wooden Spoon */}
            <line x1="85" y1="40" x2="60" y2="100" stroke="#D97706" strokeWidth="6" strokeLinecap="round" />
            <ellipse cx="88" cy="36" rx="9" ry="12" fill="#D97706" />
            {/* Pasta Box */}
            <rect x="125" y="55" width="36" height="70" rx="6" fill="#F59E0B" />
            <rect x="131" y="70" width="24" height="25" rx="4" fill="#FEF3C7" />
            <circle cx="143" cy="82" r="6" fill="#F59E0B" />
            {/* Tomato Sauce Jar */}
            <rect x="168" y="80" width="24" height="45" rx="5" fill="#EF4444" />
            <rect x="171" y="74" width="18" height="6" rx="2" fill="#FDE047" />
            <rect x="172" y="93" width="16" height="18" rx="2" fill="#FEE2E2" />
          </svg>
          <span className="text-sm sm:text-base font-bold text-slate-700 bg-white/90 px-3.5 py-1 rounded-full shadow-xs">
            Όλα τα υλικά έτοιμα στον πάγκο
          </span>
        </div>
      )}

      {type === 'pot-water' && (
        <div className="flex flex-col items-center justify-center space-y-2">
          <svg className="w-48 h-32" viewBox="0 0 200 160" fill="none">
            {/* Sink tap */}
            <path d="M100 15 V45 H75 V55" stroke="#64748B" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="94" y="10" width="18" height="8" rx="2" fill="#475569" />
            <circle cx="100" cy="14" r="5" fill="#0EA5E9" />
            {/* Water stream */}
            <path d="M75 55 L75 95" stroke="#38BDF8" strokeWidth="8" strokeLinecap="round" strokeDasharray="6 4" className="animate-pulse" />
            {/* Pot */}
            <rect x="40" y="80" width="120" height="60" rx="14" fill="#94A3B8" />
            <rect x="26" y="92" width="14" height="14" rx="4" fill="#64748B" />
            <rect x="160" y="92" width="14" height="14" rx="4" fill="#64748B" />
            {/* Water level inside pot */}
            <ellipse cx="100" cy="98" rx="52" ry="12" fill="#38BDF8" />
            <ellipse cx="100" cy="96" rx="46" ry="9" fill="#BAE6FD" />
          </svg>
          <div className="flex items-center gap-1.5 text-sm sm:text-base font-bold text-sky-800 bg-sky-100/90 px-3.5 py-1 rounded-full">
            <Droplets className="w-4 h-4 text-sky-600" />
            <span>Γεμίζουμε κρύο νερό μέχρι τη μέση</span>
          </div>
        </div>
      )}

      {type === 'stove-on' && (
        <div className="flex flex-col items-center justify-center space-y-2">
          <svg className="w-48 h-32" viewBox="0 0 200 160" fill="none">
            {/* Stove surface */}
            <rect x="20" y="120" width="160" height="28" rx="8" fill="#1E293B" />
            <circle cx="50" cy="134" r="8" fill="#EF4444" />
            <circle cx="80" cy="134" r="6" fill="#64748B" />
            <circle cx="120" cy="134" r="6" fill="#64748B" />
            <circle cx="150" cy="134" r="6" fill="#64748B" />
            {/* Glowing burner */}
            <ellipse cx="100" cy="120" rx="45" ry="10" fill="#EF4444" className="animate-pulse" />
            <ellipse cx="100" cy="120" rx="30" ry="7" fill="#FBBF24" />
            {/* Pot on top */}
            <rect x="50" y="55" width="100" height="62" rx="12" fill="#64748B" />
            <rect x="36" y="66" width="14" height="12" rx="3" fill="#475569" />
            <rect x="150" y="66" width="14" height="12" rx="3" fill="#475569" />
            <ellipse cx="100" cy="55" rx="50" ry="10" fill="#94A3B8" />
          </svg>
          <div className="flex items-center gap-2 bg-amber-100 text-amber-900 font-extrabold text-sm sm:text-base px-3.5 py-1 rounded-full border border-amber-300">
            <Flame className="w-4 h-4 text-amber-600" />
            <span>Ανάβουμε το μάτι σε μεσαία φωτιά</span>
          </div>
        </div>
      )}

      {type === 'water-boiling' && (
        <div className="flex flex-col items-center justify-center space-y-2">
          <svg className="w-48 h-32" viewBox="0 0 200 160" fill="none">
            {/* Steam waves */}
            <path d="M70 30 Q75 20 70 10" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
            <path d="M100 28 Q106 16 100 6" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" className="animate-pulse" />
            <path d="M130 32 Q136 22 130 12" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
            {/* Pot */}
            <rect x="45" y="55" width="110" height="70" rx="12" fill="#64748B" />
            <rect x="30" y="68" width="15" height="14" rx="4" fill="#475569" />
            <rect x="155" y="68" width="15" height="14" rx="4" fill="#475569" />
            <ellipse cx="100" cy="55" rx="55" ry="12" fill="#0284C7" />
            {/* Bubbles */}
            <circle cx="75" cy="54" r="6" fill="#BAE6FD" />
            <circle cx="95" cy="52" r="8" fill="#FFFFFF" />
            <circle cx="115" cy="55" r="7" fill="#E0F2FE" />
          </svg>
          <span className="text-sm sm:text-base font-bold text-blue-900 bg-blue-100 px-3.5 py-1 rounded-full">
            Κάνει μπουρμπουλήθρες = Έβρασε!
          </span>
        </div>
      )}

      {type === 'pasta-in' && (
        <div className="flex flex-col items-center justify-center space-y-2">
          <svg className="w-48 h-32" viewBox="0 0 200 160" fill="none">
            {/* Spaghetti entering */}
            <path d="M120 15 L95 65" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
            <path d="M126 18 L99 68" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
            <path d="M132 20 L104 65" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
            {/* Pot */}
            <rect x="45" y="65" width="110" height="65" rx="12" fill="#64748B" />
            <rect x="30" y="76" width="15" height="14" rx="4" fill="#475569" />
            <rect x="155" y="76" width="15" height="14" rx="4" fill="#475569" />
            <ellipse cx="100" cy="65" rx="55" ry="11" fill="#38BDF8" />
          </svg>
          <span className="text-sm sm:text-base font-extrabold text-amber-900 bg-amber-100 px-3.5 py-1 rounded-full">
            Ρίχνουμε σιγά-σιγά τα μακαρόνια
          </span>
        </div>
      )}

      {type === 'pasta-stir' && (
        <div className="flex flex-col items-center justify-center space-y-2">
          <svg className="w-48 h-32" viewBox="0 0 200 160" fill="none">
            {/* Pot */}
            <rect x="45" y="60" width="110" height="70" rx="12" fill="#64748B" />
            <rect x="30" y="72" width="15" height="14" rx="4" fill="#475569" />
            <rect x="155" y="72" width="15" height="14" rx="4" fill="#475569" />
            <ellipse cx="100" cy="60" rx="55" ry="11" fill="#0284C7" />
            {/* Cooked pasta inside */}
            <path d="M70 60 Q85 55 100 60 Q115 65 130 60" stroke="#FBBF24" strokeWidth="5" strokeLinecap="round" />
            {/* Wooden spoon stirring */}
            <line x1="125" y1="20" x2="98" y2="70" stroke="#D97706" strokeWidth="8" strokeLinecap="round" />
            <ellipse cx="94" cy="74" rx="10" ry="14" fill="#D97706" />
          </svg>
          <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-amber-900 bg-amber-100 px-3.5 py-1 rounded-full">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Ανακατεύουμε απαλά με την κουτάλα</span>
          </div>
        </div>
      )}

      {type === 'pasta-drain' && (
        <div className="flex flex-col items-center justify-center space-y-2">
          <svg className="w-48 h-32" viewBox="0 0 200 160" fill="none">
            {/* Sink */}
            <rect x="25" y="115" width="150" height="35" rx="6" fill="#CBD5E1" />
            <line x1="25" y1="125" x2="175" y2="125" stroke="#94A3B8" strokeWidth="2" />
            {/* Colander / Strainer */}
            <path d="M65 80 Q100 120 135 80 Z" fill="#94A3B8" />
            <rect x="52" y="78" width="14" height="6" rx="2" fill="#64748B" />
            <rect x="134" y="78" width="14" height="6" rx="2" fill="#64748B" />
            {/* Holes */}
            <circle cx="85" cy="90" r="2" fill="#475569" />
            <circle cx="100" cy="95" r="2" fill="#475569" />
            <circle cx="115" cy="90" r="2" fill="#475569" />
          </svg>
          <span className="text-sm sm:text-base font-extrabold text-slate-800 bg-slate-100 px-3.5 py-1 rounded-full border border-slate-300">
            Σουρώνουμε προσεκτικά με πιάστρες
          </span>
        </div>
      )}

      {type === 'sauce-mix' && (
        <div className="flex flex-col items-center justify-center space-y-2">
          <svg className="w-48 h-32" viewBox="0 0 200 160" fill="none">
            {/* Pot off heat */}
            <rect x="45" y="60" width="110" height="70" rx="12" fill="#94A3B8" />
            <rect x="30" y="72" width="15" height="14" rx="4" fill="#64748B" />
            <rect x="155" y="72" width="15" height="14" rx="4" fill="#64748B" />
            <ellipse cx="100" cy="60" rx="55" ry="11" fill="#FDE047" />
            {/* Red sauce swirl */}
            <ellipse cx="100" cy="60" rx="35" ry="8" fill="#EF4444" />
            {/* Tomato sauce pouring from jar */}
            <rect x="125" y="20" width="28" height="40" rx="5" fill="#EF4444" transform="rotate(-30 125 20)" />
            <path d="M128 42 L110 56" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" />
            {/* Spoon */}
            <line x1="70" y1="20" x2="90" y2="65" stroke="#D97706" strokeWidth="7" strokeLinecap="round" />
          </svg>
          <span className="text-sm sm:text-base font-bold text-red-800 bg-red-100 px-3.5 py-1 rounded-full">
            Ρίχνουμε τη σάλτσα και ανακατεύουμε
          </span>
        </div>
      )}

      {type === 'plate-serve' && (
        <div className="flex flex-col items-center justify-center space-y-2">
          <svg className="w-48 h-32" viewBox="0 0 200 160" fill="none">
            {/* Big Plate */}
            <ellipse cx="100" cy="100" rx="75" ry="32" fill="#E2E8F0" />
            <ellipse cx="100" cy="98" rx="62" ry="24" fill="#FFFFFF" />
            {/* Spaghetti on plate */}
            <ellipse cx="100" cy="95" rx="44" ry="16" fill="#FBBF24" />
            <ellipse cx="100" cy="94" rx="36" ry="12" fill="#EF4444" />
            {/* Cheese sprinkles */}
            <circle cx="92" cy="92" r="2" fill="#FEF08A" />
            <circle cx="104" cy="90" r="2.5" fill="#FEF08A" />
            {/* Fork on right */}
            <line x1="165" y1="65" x2="165" y2="125" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
            <path d="M158 65 V80 H172 V65" stroke="#94A3B8" strokeWidth="3" fill="none" />
          </svg>
          <div className="flex items-center gap-2 text-sm sm:text-base font-black text-emerald-800 bg-emerald-100 px-4 py-1.5 rounded-full shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Έτοιμο! Καλή μας όρεξη!</span>
          </div>
        </div>
      )}

      {/* Fallback generic */}
      {(![
        'prep',
        'pot-water',
        'stove-on',
        'water-boiling',
        'pasta-in',
        'pasta-stir',
        'pasta-drain',
        'sauce-mix',
        'plate-serve',
      ].includes(type)) && (
        <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
          <Utensils className="w-16 h-16 text-amber-500 animate-pulse" />
          <span className="text-base font-bold text-slate-700">Βήμα Μαγειρικής</span>
        </div>
      )}
    </div>
  );
};
