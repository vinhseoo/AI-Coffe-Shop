export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
}

export type ItemSize = 'S' | 'M' | 'L';

export interface MenuItemVariant {
  id: number;
  menuItemId: number;
  size: ItemSize;
  price: number;
  costPrice: number;
  isAvailable: boolean;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isAvailable: boolean;
  isBestseller: boolean;
  totalSold: number;
  displayOrder: number;
  variants: MenuItemVariant[];
  minPrice: number;
}

export interface Topping {
  id: number;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface ToppingRequest {
  name: string;
  price: number;
  isAvailable?: boolean;
}

export interface RecipeIngredient {
  id: number;
  ingredientId: number;
  ingredientName: string;
  unit: string;
  quantity: number;
}

export interface MenuItemDetail extends MenuItem {
  toppings?: Topping[];
}

// ---- DTOs (Request/Response) ----

export interface CategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
}

export interface VariantRequest {
  size: ItemSize;
  price: number;
}

export interface MenuItemRequest {
  categoryId: number;
  name: string;
  description?: string;
  price?: number; // fallback
  size?: ItemSize; // fallback
  displayOrder?: number;
  isBestseller?: boolean;
  variants?: VariantRequest[];
}

export interface RecipeRequest {
  items: Array<{ ingredientId: number; quantity: number }>;
}

// ---- AI ----

export type MenuEngineringQuadrant = 'STAR' | 'PUZZLE' | 'PLOW_HORSE' | 'DOG';

export interface MenuAnalysisItem {
  menuItemId: number; // Trong thiết kế mới, trường này sẽ ánh xạ tới Variant ID để hiển thị chính xác size
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

export interface PriceSuggestion {
  suggestedPrice: number;
  costBreakdown: Record<string, number>;
  targetMargin: number;
  reasoning: string;
}
