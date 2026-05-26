export type AIReportType =
  | 'DAILY_SUMMARY'
  | 'WEEKLY_ANALYSIS'
  | 'INVENTORY_FORECAST'
  | 'MENU_SUGGESTION'
  | 'MARKETING_CONTENT'
  | 'BUSINESS_INSIGHT';

export interface AIReport {
  id: number;
  reportType: AIReportType;
  title: string;
  content: string;
  isBookmarked: boolean;
  createdAt: string;
}

// Dashboard AI
export interface AIDashboardSummary {
  summary: string;
  suggestions: string[];
}

// Chatbot
export type ChatRole = 'USER' | 'ASSISTANT';

export interface ChatMessage {
  id?: number;
  role: ChatRole;
  message: string;
  createdAt?: string;
  isLoading?: boolean;
}

export interface ChatRequest {
  message: string;
  sessionId: string;
}

export interface ChatResponse {
  message: string;
  sessionId: string;
  timestamp: string;
}

// Marketing
export interface CaptionRequest {
  menuItemId: number;
  tone: 'FUN' | 'PROFESSIONAL' | 'FRIENDLY' | 'GEN_Z';
  platform: 'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK';
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
  type: string;
  suggestedValue: number;
  reasoning: string;
}

// Customer AI
export interface CustomerSegmentResult {
  newCustomers: number[];
  regularCustomers: number[];
  vipCustomers: number[];
  atRiskCustomers: number[];
  summary: string;
  actionSuggestions: string[];
}

// Reports AI
export interface WeeklyAnalysis {
  summary: string;
  trends: string[];
  highlights: string[];
  suggestions: string[];
  comparedToLastWeek: {
    revenueChange: number;
    ordersChange: number;
    avgOrderValueChange: number;
  };
}

export interface RevenueForecast {
  predictions: Array<{ date: string; predictedRevenue: number }>;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  assumptions: string[];
  totalForecast: number;
}
