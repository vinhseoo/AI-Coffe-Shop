import { create } from 'zustand';
import { OrderStatus, OrderSummary } from '../types/order';

interface OrderFilters {
  status: OrderStatus | '';
  search: string;
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: number;
}

interface OrderStore {
  filters: OrderFilters;
  todayOrderCount: number;
  todayRevenue: number;

  setFilter: <K extends keyof OrderFilters>(key: K, value: OrderFilters[K]) => void;
  resetFilters: () => void;
  setTodayStats: (count: number, revenue: number) => void;
}

const defaultFilters: OrderFilters = {
  status: '',
  search: '',
  dateFrom: '',
  dateTo: '',
  page: 0,
  pageSize: 20,
};

export const useOrderStore = create<OrderStore>()((set) => ({
  filters: defaultFilters,
  todayOrderCount: 0,
  todayRevenue: 0,

  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
        // Reset page when any filter changes (except page itself)
        page: key !== 'page' ? 0 : state.filters.page,
      },
    })),

  resetFilters: () => set({ filters: defaultFilters }),

  setTodayStats: (count, revenue) =>
    set({ todayOrderCount: count, todayRevenue: revenue }),
}));
