import React, { useEffect } from 'react';
import { Clock, Users, ArrowRight, ShieldAlert, Sparkles, Volume2 } from 'lucide-react';
import { Recipe } from '../types/recipe';
import { playClickSound } from '../utils/sound';
import { speakGreek } from '../utils/speech';

interface RecipeSelectScreenProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  voiceEnabled: boolean;
  extraLargeText: boolean;
}

export const RecipeSelectScreen: React.FC<RecipeSelectScreenProps> = ({
  recipes,
  onSelectRecipe,
  voiceEnabled,
  extraLargeText,
}) => {
  useEffect(() => {
    if (voiceEnabled) {
      speakGreek('Διάλεξε τι θέλεις να μαγειρέψουμε σήμερα. Πάτησε πάνω στην κάρτα με τα Μακαρόνια με σάλτσα ντομάτας!');
    }
  }, [voiceEnabled]);

  const handleSelect = (recipe: Recipe) => {
    playClickSound();
    onSelectRecipe(recipe);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="inline-block bg-amber-100 text-amber-900 font-black text-base px-4 py-1.5 rounded-full uppercase tracking-wider">
          Βήμα 1 από 3
        </span>
        <h2
          className={`font-black text-slate-900 tracking-tight ${
            extraLargeText ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl'
          }`}
        >
          Διάλεξε Συνταγή
        </h2>
        <p className="text-lg sm:text-xl font-bold text-slate-600">
          Πάτησε πάνω στο φαγητό που θέλεις να ετοιμάσουμε:
        </p>
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recipes.map((recipe, index) => {
          const isPrimary = recipe.id === 'makaronia-saltsa';

          return (
            <div
              key={recipe.id}
              onClick={() => handleSelect(recipe)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleSelect(recipe);
              }}
              className={`relative bg-white rounded-3xl border-4 text-left p-6 sm:p-7 shadow-lg transition-all duration-200 transform hover:-translate-y-1 active:scale-98 cursor-pointer flex flex-col justify-between ${
                isPrimary
                  ? 'border-orange-500 ring-4 ring-orange-200 shadow-orange-100'
                  : 'border-amber-200 hover:border-amber-400'
              }`}
            >
              {isPrimary && (
                <div className="absolute -top-3.5 right-6 bg-orange-600 text-white font-black text-sm px-4 py-1 rounded-full shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>ΠΡΟΤΕΙΝΟΜΕΝΗ</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Big Illustration Banner */}
                <div className="w-full h-44 rounded-2xl bg-amber-50 border-2 border-amber-100 flex items-center justify-center p-4 overflow-hidden relative">
                  {recipe.id === 'makaronia-saltsa' && (
                    <svg className="w-44 h-36" viewBox="0 0 160 120" fill="none">
                      {/* Plate */}
                      <ellipse cx="80" cy="75" rx="65" ry="26" fill="#E2E8F0" />
                      <ellipse cx="80" cy="73" rx="55" ry="20" fill="#FFFFFF" />
                      {/* Spaghetti mound */}
                      <ellipse cx="80" cy="68" rx="42" ry="15" fill="#FBBF24" />
                      <ellipse cx="80" cy="66" rx="34" ry="11" fill="#EF4444" />
                      <circle cx="70" cy="63" r="2" fill="#FEF08A" />
                      <circle cx="85" cy="62" r="2.5" fill="#FEF08A" />
                      <circle cx="92" cy="66" r="2" fill="#FEF08A" />
                      {/* Fork */}
                      <line x1="135" y1="45" x2="135" y2="95" stroke="#94A3B8" strokeWidth="3.5" strokeLinecap="round" />
                      <path d="M129 45 V58 H141 V45" stroke="#94A3B8" strokeWidth="2.5" fill="none" />
                      {/* Tomato & Basil leaves */}
                      <circle cx="36" cy="75" r="10" fill="#EF4444" />
                      <ellipse cx="36" cy="64" rx="4" ry="7" fill="#10B981" />
                    </svg>
                  )}

                  {recipe.id === 'tost-tyri' && (
                    <svg className="w-44 h-36" viewBox="0 0 160 120" fill="none">
                      {/* Plate */}
                      <ellipse cx="80" cy="75" rx="60" ry="24" fill="#E2E8F0" />
                      {/* Sandwich triangles */}
                      <polygon points="50,45 110,45 80,85" fill="#FDE68A" stroke="#D97706" strokeWidth="4" />
                      <line x1="55" y1="52" x2="105" y2="52" stroke="#EF4444" strokeWidth="4" />
                      <line x1="60" y1="58" x2="100" y2="58" stroke="#F59E0B" strokeWidth="5" />
                    </svg>
                  )}

                  {recipe.id === 'froutosalata' && (
                    <svg className="w-44 h-36" viewBox="0 0 160 120" fill="none">
                      {/* Bowl */}
                      <path d="M40 55 Q80 110 120 55 Z" fill="#6EE7B7" stroke="#059669" strokeWidth="4" />
                      {/* Apple slice */}
                      <circle cx="65" cy="50" r="14" fill="#EF4444" />
                      {/* Banana slice */}
                      <ellipse cx="90" cy="48" rx="12" ry="10" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
                      {/* Honey drip */}
                      <circle cx="80" cy="60" r="4" fill="#F59E0B" />
                    </svg>
                  )}
                </div>

                {/* Recipe Info */}
                <div>
                  <h3
                    className={`font-black text-slate-900 leading-snug ${
                      extraLargeText ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
                    }`}
                  >
                    {recipe.title}
                  </h3>
                  <p className="text-base sm:text-lg font-bold text-slate-600 mt-1">
                    {recipe.subtitle}
                  </p>
                </div>

                {/* Meta details (time, portions, stove) */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-base font-extrabold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-xl">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <span>{recipe.durationMinutes} λεπτά</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-base font-extrabold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-xl">
                    <Users className="w-5 h-5 text-sky-600" />
                    <span>{recipe.portion}</span>
                  </div>
                  {recipe.requiresStove && (
                    <div className="flex items-center gap-1.5 text-sm font-black text-rose-800 bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>Με μάτι κουζίνας</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Big Select Button */}
              <div className="mt-6 pt-4 border-t-2 border-slate-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(recipe);
                  }}
                  className={`w-full min-h-[64px] font-black text-xl rounded-2xl flex items-center justify-center gap-3 shadow-md transition-transform active:scale-95 cursor-pointer text-white ${
                    isPrimary
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                  aria-label={`Επιλογή συνταγής: ${recipe.title}`}
                >
                  <span>ΕΠΙΛΟΓΗ ΣΥΝΤΑΓΗΣ</span>
                  <ArrowRight className="w-6 h-6 stroke-[3]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Voice prompt trigger */}
      <div className="text-center pt-2">
        <button
          onClick={() => {
            playClickSound();
            speakGreek('Πάτησε στο μεγάλο κουμπί Επιλογή Συνταγής για τα Μακαρόνια με σάλτσα ντομάτας.');
          }}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-extrabold text-base bg-amber-100/70 hover:bg-amber-100 px-4 py-2 rounded-2xl transition-colors cursor-pointer"
        >
          <Volume2 className="w-5 h-5 text-amber-700" />
          <span>Άκουσε τις οδηγίες</span>
        </button>
      </div>
    </main>
  );
};
