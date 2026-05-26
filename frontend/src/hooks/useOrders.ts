import { useState } from 'react';
import { api } from '../lib/api';
import { ApiResponse, PagedResponse } from '../types/api';
import { Order, CreateOrderRequest, OrderStatus, PaymentMethod } from '../types/order';
import { toast } from './useToast';

export function useOrders() {
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 1,
    last: true,
  });

  const fetchOrders = async (
    filters: { search?: string; status?: string; type?: string; paymentStatus?: string } = {},
    page = 1,
    size = 10
  ) => {
    setIsLoading(true);
    try {
      let url = `/orders?page=${page}&size=${size}`;
      if (filters.search && filters.search.trim() !== '') {
        url += `&search=${encodeURIComponent(filters.search)}`;
      }
      if (filters.status) {
        url += `&status=${filters.status}`;
      }
      if (filters.type) {
        url += `&type=${filters.type}`;
      }
      if (filters.paymentStatus) {
        url += `&paymentStatus=${filters.paymentStatus}`;
      }

      const res = await api.get<any, ApiResponse<PagedResponse<Order>>>(url);
      setOrders(res.data.content);
      setPagination({
        pageNumber: res.data.pageNumber,
        pageSize: res.data.pageSize,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
        last: res.data.last,
      });
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải danh sách đơn hàng');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderDetail = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await api.get<any, ApiResponse<Order>>(`/orders/${id}`);
      setSelectedOrder(res.data);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải chi tiết đơn hàng');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (data: CreateOrderRequest) => {
    setIsLoading(true);
    try {
      const res = await api.post<any, ApiResponse<Order>>('/orders', data);
      toast.success('Đặt đơn hàng thành công');
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Đặt đơn hàng thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (id: number, status: OrderStatus) => {
    setIsLoading(true);
    try {
      const res = await api.put<any, ApiResponse<Order>>(`/orders/${id}/status`, { status });
      toast.success(`Cập nhật trạng thái đơn hàng thành công`);
      // Update in local list if present
      setOrders((prev) =>
        prev.map((ord) => (ord.id === id ? { ...ord, status: res.data.status, completedAt: res.data.completedAt } : ord))
      );
      if (selectedOrder?.id === id) {
        setSelectedOrder(res.data);
      }
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Cập nhật trạng thái đơn hàng thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmPayment = async (id: number, paymentMethod: PaymentMethod) => {
    setIsLoading(true);
    try {
      const res = await api.put<any, ApiResponse<Order>>(`/orders/${id}/payment`, { paymentMethod });
      toast.success('Xác nhận thanh toán thành công');
      // Update in local list if present
      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === id
            ? { ...ord, paymentStatus: res.data.paymentStatus, paymentMethod: res.data.paymentMethod }
            : ord
        )
      );
      if (selectedOrder?.id === id) {
        setSelectedOrder(res.data);
      }
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Xác nhận thanh toán thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    orders,
    selectedOrder,
    pagination,
    fetchOrders,
    fetchOrderDetail,
    createOrder,
    updateOrderStatus,
    confirmPayment,
  };
}
