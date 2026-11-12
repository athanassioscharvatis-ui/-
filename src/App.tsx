import React, { useState, useEffect } from 'react';
import { RECIPES } from './data/recipes';
import { Recipe } from './types/recipe';
import { Navbar } from './components/Navbar';
import { StartScreen } from './components/StartScreen';
import { RecipeSelectScreen } from './components/RecipeSelectScreen';
import { IngredientsScreen } from './components/IngredientsScreen';
import { StepGuideScreen } from './components/StepGuideScreen';
import { CompletedScreen } from './components/CompletedScreen';
import { QuestionModal } from './components/QuestionModal';
import { stopSpeaking } from './utils/speech';

export type AppView = 'start' | 'select' | 'ingredients' | 'guide' | 'completed';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('start');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(RECIPES[0]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [extraLargeText, setExtraLargeText] = useState<boolean>(false);
  const [isGlobalChatOpen, setIsGlobalChatOpen] = useState<boolean>(false);

  // Check URL params for ?autostart=1 (supports testing & direct access)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        setSelectedRecipe(RECIPES[0]);
        setCurrentStepIndex(0);
        setCurrentView('guide');
      } else if (params.get('screen') === 'select') {
        setCurrentView('select');
      } else if (params.get('screen') === 'ingredients') {
        setSelectedRecipe(RECIPES[0]);
        setCurrentView('ingredients');
      }
    }
  }, []);

  const handleStart = () => {
    stopSpeaking();
    setCurrentView('select');
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    stopSpeaking();
    setSelectedRecipe(recipe);
    setCurrentStepIndex(0);
    setCurrentView('ingredients');
  };

  const handleIngredientsContinue = () => {
    stopSpeaking();
    setCurrentStepIndex(0);
    setCurrentView('guide');
  };

  const handleStepChange = (index: number) => {
    stopSpeaking();
    setCurrentStepIndex(index);
  };

  const handleRecipeComplete = () => {
    stopSpeaking();
    setCurrentView('completed');
  };

  const handleGoHome = () => {
    stopSpeaking();
    setCurrentStepIndex(0);
    setCurrentView('start');
  };

  const handleRestartCurrentRecipe = () => {
    stopSpeaking();
    setCurrentStepIndex(0);
    setCurrentView('ingredients');
  };

  return (
    <div
      className={`min-h-screen bg-linear-to-b from-amber-50/70 via-orange-50/40 to-amber-50/80 font-sans flex flex-col ${
        extraLargeText ? 'text-xl' : 'text-base'
      }`}
    >
      {/* Sticky Accessible Navbar */}
      <Navbar
        onGoHome={handleGoHome}
        onOpenChat={() => {
          stopSpeaking();
          setIsGlobalChatOpen(true);
        }}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => {
          if (voiceEnabled) stopSpeaking();
          setVoiceEnabled(!voiceEnabled);
        }}
        extraLargeText={extraLargeText}
        onToggleTextSize={() => setExtraLargeText(!extraLargeText)}
      />

      {/* Main Content Area depending on currentView */}
      <div className="flex-1 flex flex-col">
        {currentView === 'start' && (
          <StartScreen
            onStart={handleStart}
            voiceEnabled={voiceEnabled}
            extraLargeText={extraLargeText}
          />
        )}

        {currentView === 'select' && (
          <RecipeSelectScreen
            recipes={RECIPES}
            onSelectRecipe={handleSelectRecipe}
            voiceEnabled={voiceEnabled}
            extraLargeText={extraLargeText}
          />
        )}

        {currentView === 'ingredients' && (
          <IngredientsScreen
            recipe={selectedRecipe}
            onContinue={handleIngredientsContinue}
            onBack={() => setCurrentView('select')}
            voiceEnabled={voiceEnabled}
            extraLargeText={extraLargeText}
          />
        )}

        {currentView === 'guide' && (
          <StepGuideScreen
            recipe={selectedRecipe}
            currentStepIndex={currentStepIndex}
            onStepChange={handleStepChange}
            onComplete={handleRecipeComplete}
            onBackToIngredients={() => setCurrentView('ingredients')}
            voiceEnabled={voiceEnabled}
            extraLargeText={extraLargeText}
          />
        )}

        {currentView === 'completed' && (
          <CompletedScreen
            recipe={selectedRecipe}
            onRestart={handleRestartCurrentRecipe}
            onHome={handleGoHome}
            voiceEnabled={voiceEnabled}
            extraLargeText={extraLargeText}
          />
        )}
      </div>

      {/* Global Gemini Question Modal reachable from Navbar on any screen */}
      <QuestionModal
        isOpen={isGlobalChatOpen}
        onClose={() => setIsGlobalChatOpen(false)}
        step={selectedRecipe.steps[currentStepIndex] || selectedRecipe.steps[0]}
        recipeTitle={selectedRecipe.title}
      />
    </div>
  );
}
