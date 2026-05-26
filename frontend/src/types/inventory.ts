export type InventoryAction = 'IMPORT' | 'EXPORT' | 'ADJUST' | 'AUTO_DEDUCT';

export interface Supplier {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  note?: string;
}

export interface Ingredient {
  id: number;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  unitCost: number;
  supplierId?: number;
  supplierName?: string;
  supplierPhone?: string;
  expiryDays?: number;
  isActive: boolean;
  isLowStock: boolean;
}

export interface InventoryLog {
  id: number;
  ingredientId: number;
  ingredientName: string;
  unit: string;
  action: InventoryAction;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  note?: string;
  referenceId?: number;
  createdBy: string;
  createdAt: string;
}

// ---- DTOs ----

export interface SupplierRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  note?: string;
}

export interface IngredientRequest {
  name: string;
  unit: string;
  minStock: number;
  unitCost: number;
  supplierId?: number;
  expiryDays?: number;
}

export interface ImportItem {
  ingredientId: number;
  quantity: number;
  unitCost: number;
  note?: string;
  supplierId?: number;
}

export interface ImportRequest {
  items: ImportItem[];
}

// ---- AI ----

export interface IngredientForecast {
  ingredientId: number;
  ingredientName: string;
  unit: string;
  currentStock: number;
  predictedConsumption7Days: number;
  daysUntilRunOut: number;
  suggestedImportQuantity: number;
  estimatedCost: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface InventoryForecastResponse {
  predictions: IngredientForecast[];
  urgentItems: IngredientForecast[];
  totalEstimatedCost: number;
  summary: string;
}

export interface InventoryAnomaly {
  ingredientId: number;
  ingredientName: string;
  anomalyType: 'RAPID_DEPLETION' | 'NEAR_EXPIRY' | 'UNUSUALLY_LOW';
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface InventoryAnomalyResponse {
  anomalies: InventoryAnomaly[];
  summary: string;
}

