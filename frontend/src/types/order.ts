export type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED' | 'CANCELLED';
export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'ONLINE';
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'MOMO' | 'ZALOPAY';
export type PaymentStatus = 'UNPAID' | 'PAID';

export interface OrderItemTopping {
  toppingId: number;
  toppingName: string;
  quantity: number;
  price: number;
}

export interface OrderItem {
  id: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  note?: string;
  toppings: OrderItemTopping[];
  subtotal: number;
}

export interface Order {
  id: number;
  orderCode: string;
  customerId?: number;
  customerName?: string;
  orderType: OrderType;
  tableNumber?: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  note?: string;
  promotionId?: number;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
  items: OrderItem[];
}

export interface OrderSummary {
  id: number;
  orderCode: string;
  customerName?: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  itemCount: number;
  createdAt: string;
}

// ---- Cart (POS state) ----

export interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  toppings: Array<{
    toppingId: number;
    name: string;
    price: number;
    quantity: number;
  }>;
}

// ---- DTOs ----

export interface CreateOrderRequest {
  orderType: OrderType;
  tableNumber?: string;
  customerId?: number;
  note?: string;
  promotionId?: number;
  items: Array<{
    menuItemVariantId: number;
    quantity: number;
    note?: string;
    toppings?: Array<{
      toppingId: number;
      quantity: number;
    }>;
  }>;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface PaymentRequest {
  paymentMethod: PaymentMethod;
}
