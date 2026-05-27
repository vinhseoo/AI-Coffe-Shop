export type CustomerTier = 'NORMAL' | 'SILVER' | 'GOLD' | 'PLATINUM';

export type LoyaltyAction = 'EARN' | 'REDEEM' | 'BONUS' | 'EXPIRE';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  birthday?: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  tier: CustomerTier;
  note?: string;
  lastVisitAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyTransaction {
  id: number;
  customerId: number;
  orderId?: number;
  points: number;
  action: LoyaltyAction;
  description?: string;
  createdAt: string;
}

export interface CustomerSegmentResponse {
  vipCustomers: Customer[];
  loyalCustomers: Customer[];
  normalCustomers: Customer[];
  atRiskCustomers: Customer[];
  aiAnalysis: string;
  marketingSuggestions: string[];
}
