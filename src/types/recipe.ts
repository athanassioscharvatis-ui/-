export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  iconName: string; // lucide icon identifier or visual category
  color: string;
  note?: string;
}

export interface RecipeStep {
  id: number;
  title: string;
  instruction: string;
  spokenText: string;
  safetyTip?: string;
  hasTimer?: boolean;
  timerSeconds?: number;
  imageType: 'prep' | 'pot-water' | 'stove-on' | 'water-boiling' | 'pasta-in' | 'pasta-stir' | 'pasta-drain' | 'sauce-mix' | 'plate-serve' | 'generic';
  tips?: string[];
}

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  portion: string;
  difficulty: 'Πολύ Εύκολο' | 'Μεσαίο';
  requiresStove: boolean;
  bannerColor: string;
  iconColor: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
}
