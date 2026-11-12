import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Volume2,
  HelpCircle,
  CheckCircle,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import { Recipe, RecipeStep } from '../types/recipe';
import {
  getNextStepIndex,
  getPreviousStepIndex,
  isLastStep,
  isFirstStep,
  calculateProgressPercentage,
} from '../utils/recipeLogic';
import { StepGraphic } from './StepGraphic';
import { CookingTimer } from './CookingTimer';
import { QuestionModal } from './QuestionModal';
import { playClickSound, playSuccessSound } from '../utils/sound';
import { speakGreek, stopSpeaking } from '../utils/speech';

interface StepGuideScreenProps {
  recipe: Recipe;
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onComplete: () => void;
  onBackToIngredients: () => void;
  voiceEnabled: boolean;
  extraLargeText: boolean;
}

export const StepGuideScreen: React.FC<StepGuideScreenProps> = ({
  recipe,
  currentStepIndex,
  onStepChange,
  onComplete,
  onBackToIngredients,
  voiceEnabled,
  extraLargeText,
}) => {
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  const totalSteps = recipe.steps.length;
  const currentStep = recipe.steps[currentStepIndex] || recipe.steps[0];
  const progressPercent = calculateProgressPercentage(currentStepIndex, totalSteps);
  const isLast = isLastStep(currentStepIndex, totalSteps);
  const isFirst = isFirstStep(currentStepIndex);

  // Auto-speak current step when entering
  useEffect(() => {
    if (voiceEnabled && currentStep) {
      stopSpeaking();
      const textToSpeak = currentStep.spokenText || currentStep.instruction;
      speakGreek(textToSpeak);
    }
    return () => {
      stopSpeaking();
    };
  }, [currentStepIndex, recipe.id, voiceEnabled]);

  const handleNext = () => {
    playClickSound();
    stopSpeaking();
    if (isLast) {
      playSuccessSound();
      onComplete();
    } else {
      const nextIdx = getNextStepIndex(currentStepIndex, totalSteps);
      onStepChange(nextIdx);
    }
  };

  const handlePrevious = () => {
    playClickSound();
    stopSpeaking();
    if (isFirst) {
      onBackToIngredients();
    } else {
      const prevIdx = getPreviousStepIndex(currentStepIndex);
      onStepChange(prevIdx);
    }
  };

  const handleRepeatVoice = () => {
    playClickSound();
    const textToSpeak = currentStep.spokenText || currentStep.instruction;
    speakGreek(textToSpeak);
  };

  const handleOpenQuestion = () => {
    stopSpeaking();
    setIsQuestionModalOpen(true);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-5 animate-fadeIn pb-12">
      {/* Step Counter and Progress Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-3 border-amber-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-xs">
            {currentStepIndex + 1}
          </span>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800">
              Βήμα {currentStepIndex + 1} από {totalSteps}
            </h2>
            <p className="text-sm sm:text-base font-bold text-slate-500">
              {recipe.title}
            </p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full sm:w-64 space-y-1">
          <div className="flex justify-between text-xs sm:text-sm font-extrabold text-slate-600">
            <span>Πρόοδος</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Single Instruction Card */}
      <div className="bg-white rounded-3xl border-4 border-amber-300 shadow-xl p-5 sm:p-7 space-y-5">
        {/* Step Visual Graphic */}
        <StepGraphic type={currentStep.imageType} />

        {/* Step Title & Instruction Text (ONE instruction at a time) */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h3
            className={`font-black text-amber-800 uppercase tracking-wide ${
              extraLargeText ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
            }`}
          >
            {currentStep.title}
          </h3>
          <p
            className={`font-black text-slate-900 leading-relaxed ${
              extraLargeText ? 'text-2xl sm:text-4xl' : 'text-2xl sm:text-3xl'
            }`}
          >
            {currentStep.instruction}
          </p>
        </div>

        {/* Helpful Tip if available */}
        {currentStep.safetyTip && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 flex items-center justify-center gap-2.5 text-amber-900 max-w-xl mx-auto shadow-xs">
            <Lightbulb className="w-6 h-6 text-amber-600 shrink-0" />
            <p className="font-extrabold text-base sm:text-lg text-center">
              {currentStep.safetyTip}
            </p>
          </div>
        )}

        {/* Optional Timer if step needs it */}
        {currentStep.hasTimer && currentStep.timerSeconds && (
          <div className="max-w-xl mx-auto pt-1">
            <CookingTimer
              initialSeconds={currentStep.timerSeconds}
              label={currentStep.title}
            />
          </div>
        )}

        {/* Replay Voice Button & Ask Question Button Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {/* Button: «ΕΠΑΝΑΛΗΨΗ» */}
          <button
            onClick={handleRepeatVoice}
            className="w-full sm:w-auto min-h-[64px] px-6 bg-sky-600 hover:bg-sky-700 text-white font-black text-xl rounded-2xl flex items-center justify-center gap-3 shadow-md transition-transform active:scale-95 border-3 border-sky-400 cursor-pointer"
            aria-label="Επανάληψη φωνητικής οδηγίας"
          >
            <Volume2 className="w-7 h-7" />
            <span>ΕΠΑΝΑΛΗΨΗ</span>
          </button>

          {/* Button: «ΒΟΗΘΟΣ GEMINI» */}
          <button
            onClick={handleOpenQuestion}
            className="w-full sm:w-auto min-h-[64px] px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xl rounded-2xl flex items-center justify-center gap-3 shadow-md transition-transform active:scale-95 border-3 border-amber-300 cursor-pointer"
            aria-label="Ρώτησε τον βοηθό Google Gemini για αυτό το βήμα"
          >
            <Sparkles className="w-7 h-7 text-yellow-200" />
            <span>ΒΟΗΘΟΣ GEMINI</span>
          </button>
        </div>
      </div>

      {/* Primary Action Buttons: «ΠΡΟΗΓΟΥΜΕΝΟ», «ΕΠΟΜΕΝΟ» */}
      <div className="sticky bottom-3 z-30 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-3xl border-3 border-amber-300 shadow-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Button: «ΠΡΟΗΓΟΥΜΕΝΟ» */}
          <button
            onClick={handlePrevious}
            className="min-h-[68px] sm:min-h-[76px] bg-slate-100 hover:bg-slate-200 text-slate-800 border-3 border-slate-300 font-black text-xl sm:text-2xl rounded-2xl flex items-center justify-center gap-3 shadow-md transition-transform active:scale-95 cursor-pointer order-2 sm:order-1"
            aria-label={isFirst ? 'Επιστροφή στα υλικά' : 'Προηγούμενο βήμα'}
          >
            <ArrowLeft className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
            <span>ΠΡΟΗΓΟΥΜΕΝΟ</span>
          </button>

          {/* Button: «ΕΠΟΜΕΝΟ» */}
          <button
            onClick={handleNext}
            className="min-h-[68px] sm:min-h-[76px] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl sm:text-2xl rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-transform active:scale-95 border-4 border-emerald-400 ring-4 ring-emerald-200 cursor-pointer order-1 sm:order-2"
            aria-label={isLast ? 'Ολοκλήρωση συνταγής' : 'Επόμενο βήμα μαγειρικής'}
          >
            <span>{isLast ? 'ΟΛΟΚΛΗΡΩΣΗ' : 'ΕΠΟΜΕΝΟ'}</span>
            {isLast ? (
              <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
            ) : (
              <ArrowRight className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
            )}
          </button>
        </div>
      </div>

      {/* Question Modal */}
      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        step={currentStep}
        recipeTitle={recipe.title}
      />
    </main>
  );
};
