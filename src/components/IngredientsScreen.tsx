import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, ArrowLeft, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Recipe, Ingredient } from '../types/recipe';
import { playClickSound, playSuccessSound } from '../utils/sound';
import { speakGreek } from '../utils/speech';

interface IngredientsScreenProps {
  recipe: Recipe;
  onContinue: () => void;
  onBack: () => void;
  voiceEnabled: boolean;
  extraLargeText: boolean;
}

export const IngredientsScreen: React.FC<IngredientsScreenProps> = ({
  recipe,
  onContinue,
  onBack,
  voiceEnabled,
  extraLargeText,
}) => {
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (voiceEnabled) {
      speakGreek(
        `Ας μαζέψουμε τα υλικά για ${recipe.title}. Βάλε τα στον πάγκο και πάτα το πράσινο κουμπί για να ξεκινήσουμε!`
      );
    }
  }, [recipe, voiceEnabled]);

  const toggleIngredient = (id: string) => {
    playClickSound();
    setCheckedMap((prev) => {
      const nextState = !prev[id];
      const updated = { ...prev, [id]: nextState };
      if (nextState) {
        const ing = recipe.ingredients.find((i) => i.id === id);
        if (ing) {
          speakGreek(`${ing.name}. Έτοιμο!`);
        }
      }
      return updated;
    });
  };

  const checkAll = () => {
    playSuccessSound();
    const all: Record<string, boolean> = {};
    recipe.ingredients.forEach((ing) => {
      all[ing.id] = true;
    });
    setCheckedMap(all);
    speakGreek('Όλα τα υλικά είναι έτοιμα στον πάγκο! Πάμε στο βήμα ένα.');
  };

  const checkedCount = Object.values(checkedMap).filter(Boolean).length;
  const totalCount = recipe.ingredients.length;
  const isAllChecked = checkedCount === totalCount;

  const handleStartCooking = () => {
    playSuccessSound();
    onContinue();
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-200 pb-4">
        <div>
          <button
            onClick={() => {
              playClickSound();
              onBack();
            }}
            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 font-extrabold text-base mb-2 cursor-pointer"
            aria-label="Επιστροφή στην επιλογή συνταγής"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Πίσω στις Συνταγές</span>
          </button>
          <h2
            className={`font-black text-slate-900 tracking-tight ${
              extraLargeText ? 'text-3xl sm:text-5xl' : 'text-2xl sm:text-4xl'
            }`}
          >
            Υλικά για τη Συνταγή
          </h2>
          <p className="text-lg font-bold text-amber-700 mt-1">
            {recipe.title}
          </p>
        </div>

        {/* Listen Voice button */}
        <button
          onClick={() => {
            playClickSound();
            speakGreek(
              `Χρειαζόμαστε: ${recipe.ingredients.map((i) => `${i.name}, ${i.quantity}`).join('. ')}.`
            );
          }}
          className="self-start sm:self-auto min-h-[52px] px-4 bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-base rounded-2xl flex items-center gap-2 border-2 border-amber-300 transition-transform active:scale-95 cursor-pointer"
        >
          <Volume2 className="w-6 h-6 text-amber-700" />
          <span>Άκουσε τα υλικά</span>
        </button>
      </div>

      {/* Helpful instruction box */}
      <div className="bg-amber-100/70 border-3 border-amber-300 rounded-3xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-2xl shrink-0">
            ✓
          </div>
          <div>
            <p className="text-lg sm:text-xl font-black text-slate-900">
              Βάλε τα υλικά στον πάγκο της κουζίνας
            </p>
            <p className="text-base font-bold text-slate-700">
              Πάτα πάνω σε κάθε υλικό μόλις το φέρεις: ({checkedCount} από {totalCount})
            </p>
          </div>
        </div>

        {!isAllChecked && (
          <button
            onClick={checkAll}
            className="hidden md:flex min-h-[46px] px-4 bg-white hover:bg-amber-50 text-slate-800 border-2 border-amber-300 font-extrabold text-sm rounded-xl items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Τσεκάρισέ τα όλα</span>
          </button>
        )}
      </div>

      {/* Ingredients Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipe.ingredients.map((ing) => {
          const isChecked = Boolean(checkedMap[ing.id]);

          return (
            <div
              key={ing.id}
              onClick={() => toggleIngredient(ing.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') toggleIngredient(ing.id);
              }}
              className={`p-5 rounded-3xl border-4 transition-all duration-200 text-left flex flex-col justify-between cursor-pointer select-none ${
                isChecked
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200 shadow-sm'
                  : 'bg-white border-amber-200 hover:border-amber-400 shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                {/* Visual Icon Illustration */}
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${
                    isChecked ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {ing.iconName === 'pasta' && '🍝'}
                  {ing.iconName === 'sauce' && '🥫'}
                  {ing.iconName === 'water' && '🚰'}
                  {ing.iconName === 'salt' && '🧂'}
                  {ing.iconName === 'oil' && '🫒'}
                  {ing.iconName === 'cheese' && '🧀'}
                  {ing.iconName === 'bread' && '🍞'}
                  {ing.iconName === 'meat' && '🥪'}
                  {ing.iconName === 'butter' && '🧈'}
                  {ing.iconName === 'banana' && '🍌'}
                  {ing.iconName === 'apple' && '🍎'}
                  {ing.iconName === 'honey' && '🍯'}
                  {ing.iconName === 'spice' && '✨'}
                </div>

                {/* Big Accessible Checkbox */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl transition-all ${
                    isChecked
                      ? 'bg-emerald-600 text-white scale-105 shadow-md'
                      : 'border-3 border-slate-300 bg-slate-50 text-transparent'
                  }`}
                  aria-label={isChecked ? `${ing.name} είναι έτοιμο` : `Τσεκάρισμα για ${ing.name}`}
                >
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
              </div>

              {/* Text Info */}
              <div className="space-y-1">
                <h3
                  className={`font-black text-slate-900 leading-tight ${
                    extraLargeText ? 'text-2xl' : 'text-xl'
                  }`}
                >
                  {ing.name}
                </h3>
                <p className="text-lg font-black text-amber-800">
                  {ing.quantity}
                </p>
                {ing.note && (
                  <p className="text-sm font-bold text-slate-500">
                    {ing.note}
                  </p>
                )}
              </div>

              {/* Status indicator */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span
                  className={`inline-block font-extrabold text-sm px-3 py-1 rounded-xl ${
                    isChecked
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isChecked ? '✓ Έτοιμο στον πάγκο' : 'Πάτησε όταν το βάλεις'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Action Button: Proceed to Step 1 */}
      <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <button
          onClick={() => {
            playClickSound();
            onBack();
          }}
          className="w-full sm:w-auto min-h-[64px] px-6 bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-800 font-extrabold text-xl rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>ΠΙΣΩ</span>
        </button>

        <button
          onClick={handleStartCooking}
          className="w-full sm:flex-1 min-h-[80px] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-2xl sm:text-3xl rounded-3xl shadow-xl flex items-center justify-center gap-4 transition-transform active:scale-95 border-4 border-emerald-400 ring-4 ring-emerald-200 cursor-pointer"
          aria-label="Ξεκινάμε το πρώτο βήμα μαγειρικής"
        >
          <span>ΠΑΜΕ ΣΤΟ ΒΗΜΑ 1</span>
          <ArrowRight className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
        </button>
      </div>
    </main>
  );
};
