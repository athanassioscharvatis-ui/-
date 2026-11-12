import { Recipe, RecipeStep } from '../types/recipe';

/**
 * Clamps step index safely within bounds.
 */
export function getNextStepIndex(currentIndex: number, totalSteps: number): number {
  if (totalSteps <= 0) return 0;
  return Math.min(currentIndex + 1, totalSteps - 1);
}

export function getPreviousStepIndex(currentIndex: number): number {
  return Math.max(currentIndex - 1, 0);
}

export function isLastStep(currentIndex: number, totalSteps: number): boolean {
  if (totalSteps <= 0) return true;
  return currentIndex >= totalSteps - 1;
}

export function isFirstStep(currentIndex: number): boolean {
  return currentIndex <= 0;
}

export function calculateProgressPercentage(currentIndex: number, totalSteps: number): number {
  if (totalSteps <= 0) return 0;
  return Math.round(((currentIndex + 1) / totalSteps) * 100);
}

export function formatTimerSeconds(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSec / 60);
  const remSec = safeSec % 60;
  return `${mins.toString().padStart(2, '0')}:${remSec.toString().padStart(2, '0')}`;
}

export function hasSafetyTip(step?: RecipeStep): boolean {
  return Boolean(step?.safetyTip);
}

export function getSafetyBadgeText(step?: RecipeStep): string {
  return step?.safetyTip || '';
}

export function getIngredientsPreparedCount(checkedMap: Record<string, boolean>): number {
  return Object.values(checkedMap).filter(Boolean).length;
}

export function areAllIngredientsPrepared(recipe: Recipe, checkedMap: Record<string, boolean>): boolean {
  if (!recipe.ingredients || recipe.ingredients.length === 0) return true;
  return recipe.ingredients.every((ing) => Boolean(checkedMap[ing.id]));
}
