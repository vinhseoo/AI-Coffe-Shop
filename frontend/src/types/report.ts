export interface DateRevenuePair {
  label: string;
  revenue: number;
  orderCount: number;
}

export interface RevenueReport {
  dataPoints: DateRevenuePair[];
  totalRevenue: number;
  totalOrders: number;
}

export interface CategoryRevenue {
  categoryName: string;
  revenue: number;
  quantity: number;
  percentage: number;
}

export interface TopItemReport {
  menuItemId: number;
  name: string;
  totalSold: number;
  revenue: number;
  totalCost: number;
  profit: number;
  imageUrl?: string;
}

export interface CustomerStatsReport {
  newCustomers: number;
  activeCustomers: number;
  returningCustomers: number;
  pointsEarned: number;
  pointsRedeemed: number;
}

export interface PaymentMethodRatio {
  paymentMethod: string;
  revenue: number;
  orderCount: number;
  percentage: number;
}

export interface AIWeeklyAnalysisData {
  summary: string;
  trends: string[];
  highlights: string[];
  suggestions: string[];
  markdownReport: string;
}

export interface AIRevenueForecastData {
  predictions: DateRevenuePair[];
  confidence: number;
  assumptions: string[];
  markdownReport: string;
}
