import { create } from 'zustand';
import { CartItem } from '../types/order';

interface CartStore {
  items: CartItem[];
  customerId: number | null;
  promotionId: number | null;
  tableNumber: string;
  note: string;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  clearCart: () => void;
  setCustomer: (customerId: number | null) => void;
  setPromotion: (promotionId: number | null) => void;
  setTableNumber: (tableNumber: string) => void;
  setNote: (note: string) => void;

  // Computed
  subtotal: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()((set, get) => ({
  items: [],
  customerId: null,
  promotionId: null,
  tableNumber: '',
  note: '',

  addItem: (newItem) =>
    set((state) => {
      const existing = state.items.find((i) => i.menuItemId === newItem.menuItemId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.menuItemId === newItem.menuItemId
              ? { ...i, quantity: i.quantity + newItem.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, newItem] };
    }),

  removeItem: (menuItemId) =>
    set((state) => ({
      items: state.items.filter((i) => i.menuItemId !== menuItemId),
    })),

  updateQuantity: (menuItemId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((i) => i.menuItemId !== menuItemId) };
      }
      return {
        items: state.items.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity } : i
        ),
      };
    }),

  clearCart: () =>
    set({
      items: [],
      customerId: null,
      promotionId: null,
      tableNumber: '',
      note: '',
    }),

  setCustomer: (customerId) => set({ customerId }),
  setPromotion: (promotionId) => set({ promotionId }),
  setTableNumber: (tableNumber) => set({ tableNumber }),
  setNote: (note) => set({ note }),

  subtotal: () =>
    get().items.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const toppingTotal = item.toppings.reduce(
        (ts, t) => ts + t.price * t.quantity * item.quantity,
        0
      );
      return sum + itemTotal + toppingTotal;
    }, 0),

  itemCount: () =>
    get().items.reduce((count, item) => count + item.quantity, 0),
}));
