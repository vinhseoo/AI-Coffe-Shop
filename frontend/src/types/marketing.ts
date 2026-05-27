export type PromotionType = 'PERCENT' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y' | 'FREE_TOPPING';

export interface Promotion {
  id: number;
  name: string;
  description?: string;
  type: PromotionType;
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  applicableItems: number[]; // Menu Item/Variant IDs
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  isAiSuggested: boolean;
  createdAt: string;
}

export interface CaptionRequest {
  menuItemId?: number;
  customProduct?: string;
  tone: string;
  platform: string;
}

export interface CaptionResponse {
  shortCaption: string;
  mediumCaption: string;
  longCaption: string;
  hashtags: string[];
}

export interface PromotionSuggestion {
  name: string;
  description: string;
  type: PromotionType;
  value: number;
  minOrderValue: number;
  reasoning: string;
}
