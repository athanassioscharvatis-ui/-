import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getNextStepIndex,
  getPreviousStepIndex,
  isLastStep,
  isFirstStep,
  calculateProgressPercentage,
  formatTimerSeconds,
  hasSafetyTip,
  getSafetyBadgeText,
  areAllIngredientsPrepared,
} from './recipeLogic';
import { Recipe, RecipeStep } from '../types/recipe';

test('getNextStepIndex advances index safely and respects upper bound', () => {
  assert.equal(getNextStepIndex(0, 5), 1);
  assert.equal(getNextStepIndex(3, 5), 4);
  assert.equal(getNextStepIndex(4, 5), 4); // does not exceed totalSteps - 1
});

test('getPreviousStepIndex moves backwards safely and clamps at 0', () => {
  assert.equal(getPreviousStepIndex(3), 2);
  assert.equal(getPreviousStepIndex(1), 0);
  assert.equal(getPreviousStepIndex(0), 0); // does not drop below 0
});

test('isFirstStep and isLastStep identify start and end states', () => {
  assert.equal(isFirstStep(0), true);
  assert.equal(isFirstStep(1), false);

  assert.equal(isLastStep(4, 5), true);
  assert.equal(isLastStep(3, 5), false);
});

test('calculateProgressPercentage returns accurate rounded integers', () => {
  assert.equal(calculateProgressPercentage(0, 4), 25);
  assert.equal(calculateProgressPercentage(1, 4), 50);
  assert.equal(calculateProgressPercentage(3, 4), 100);
});

test('formatTimerSeconds formats mm:ss format correctly', () => {
  assert.equal(formatTimerSeconds(540), '09:00'); // 9 minutes
  assert.equal(formatTimerSeconds(65), '01:05');
  assert.equal(formatTimerSeconds(9), '00:09');
  assert.equal(formatTimerSeconds(0), '00:00');
  assert.equal(formatTimerSeconds(-5), '00:00');
});

test('safety tip detection correctly identifies step tips', () => {
  const safeStep: RecipeStep = {
    id: 1,
    title: 'Υλικά',
    instruction: 'Βάλε τα μακαρόνια στον πάγκο.',
    spokenText: 'Βάλε τα μακαρόνια στον πάγκο.',
    imageType: 'prep',
  };

  const tipStep: RecipeStep = {
    id: 3,
    title: 'Άναμμα ματιού',
    instruction: 'Ανάβουμε το μάτι της κουζίνας.',
    spokenText: 'Ανάβουμε το μάτι.',
    safetyTip: 'Προσοχή: Το μάτι ανάβει και ζεσταίνεται.',
    imageType: 'stove-on',
  };

  assert.equal(hasSafetyTip(safeStep), false);
  assert.equal(hasSafetyTip(tipStep), true);
  assert.equal(getSafetyBadgeText(tipStep), 'Προσοχή: Το μάτι ανάβει και ζεσταίνεται.');
});

test('areAllIngredientsPrepared checks all required ingredients', () => {
  const mockRecipe: Recipe = {
    id: 'test',
    title: 'Μακαρόνια',
    subtitle: 'Δοκιμή',
    durationMinutes: 15,
    portion: '1 μερίδα',
    difficulty: 'Πολύ Εύκολο',
    requiresStove: true,
    bannerColor: 'bg-orange-500',
    iconColor: 'text-orange-500',
    ingredients: [
      { id: 'ing1', name: 'Μακαρόνια', quantity: '250γρ', iconName: 'pasta', color: 'amber' },
      { id: 'ing2', name: 'Σάλτσα', quantity: '1 βαζάκι', iconName: 'sauce', color: 'red' },
    ],
    steps: [],
  };

  assert.equal(areAllIngredientsPrepared(mockRecipe, { ing1: true }), false);
  assert.equal(areAllIngredientsPrepared(mockRecipe, { ing1: true, ing2: true }), true);
});
