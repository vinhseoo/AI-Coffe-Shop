export interface DashboardOverview {
  todayRevenue: number;
  yesterdayRevenue: number;
  revenueChangePercent: number;
  todayOrderCount: number;
  yesterdayOrderCount: number;
  orderCountChangePercent: number;
  avgOrderValue: number;
}

export interface RevenueSummaryData {
  label: string;
  revenue: number;
  orderCount: number;
}

export interface TopSellingItem {
  menuItemId: number;
  name: string;
  totalSold: number;
  revenue: number;
  imageUrl?: string;
}

export interface LowStockAlert {
  ingredientId: number;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
}

export interface AIDashboardSummary {
  summary: string;
  suggestions: string[];
}
