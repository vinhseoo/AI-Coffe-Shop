export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
}

export type ItemSize = 'S' | 'M' | 'L';

export interface MenuItem {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description?: string;
  price: number;
  costPrice: number;
  imageUrl?: string;
  size: ItemSize;
  isAvailable: boolean;
  isBestseller: boolean;
  totalSold: number;
  displayOrder: number;
}

export interface Topping {
  id: number;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface RecipeIngredient {
  id: number;
  ingredientId: number;
  ingredientName: string;
  unit: string;
  quantity: number;
}

export interface MenuItemDetail extends MenuItem {
  recipe: RecipeIngredient[];
  toppings?: Topping[];
}

// ---- DTOs (Request/Response) ----

export interface CategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
}

export interface MenuItemRequest {
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  size?: ItemSize;
  displayOrder?: number;
}

export interface RecipeRequest {
  items: Array<{ ingredientId: number; quantity: number }>;
}

// ---- AI ----

export type MenuEngineringQuadrant = 'STAR' | 'PUZZLE' | 'PLOW_HORSE' | 'DOG';

export interface MenuAnalysisItem {
  menuItemId: number;
  name: string;
  quadrant: MenuEngineringQuadrant;
  totalSold: number;
  revenue: number;
  margin: number;
  suggestion: string;
}

export interface MenuAnalysisResponse {
  stars: MenuAnalysisItem[];
  puzzles: MenuAnalysisItem[];
  plowHorses: MenuAnalysisItem[];
  dogs: MenuAnalysisItem[];
  summary: string;
}

export interface NewMenuSuggestion {
  name: string;
  description: string;
  suggestedPrice: number;
  requiredIngredients: Array<{ name: string; quantity: number; unit: string }>;
  reasoning: string;
}
