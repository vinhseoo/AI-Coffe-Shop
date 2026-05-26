export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiError {
  success: boolean;
  message: string;
  errorCode: string;
  timestamp: string;
  data?: Record<string, string>; // Validation errors field mapping
}

export type UserRole = 'OWNER' | 'STAFF';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  isActive: boolean;
}

export interface ShopSettings {
  id: number;
  shopName: string;
  address?: string;
  phone?: string;
  openingTime?: string;
  closingTime?: string;
  logoUrl?: string;
  description?: string;
  wifiPassword?: string;
  currency: string;
  taxRate: number;
}
