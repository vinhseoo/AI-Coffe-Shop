import { useState } from 'react';
import { api } from '../lib/api';
import { ApiResponse, PagedResponse } from '../types/api';
import { Customer, LoyaltyTransaction, CustomerSegmentResponse } from '../types/customer';
import { toast } from './useToast';

export function useCustomers() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [segmentation, setSegmentation] = useState<CustomerSegmentResponse | null>(null);
  
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 1,
    last: true,
  });

  const fetchCustomers = async (
    filters: { search?: string; tier?: string } = {},
    page = 1,
    size = 10
  ) => {
    setIsLoading(true);
    try {
      let url = `/customers?page=${page}&size=${size}`;
      if (filters.search && filters.search.trim() !== '') {
        url += `&search=${encodeURIComponent(filters.search)}`;
      }
      if (filters.tier) {
        url += `&tier=${filters.tier}`;
      }

      const res = await api.get<any, ApiResponse<PagedResponse<Customer>>>(url);
      setCustomers(res.data.content);
      setPagination({
        pageNumber: res.data.pageNumber,
        pageSize: res.data.pageSize,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
        last: res.data.last,
      });
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải danh sách khách hàng');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerDetail = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await api.get<any, ApiResponse<Customer>>(`/customers/${id}`);
      setSelectedCustomer(res.data);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải chi tiết khách hàng');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createCustomer = async (data: { name: string; phone: string; email?: string; birthday?: string; note?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.post<any, ApiResponse<Customer>>('/customers', data);
      toast.success(res.message ?? 'Đăng ký thành viên thành công');
      // Refresh list
      await fetchCustomers({}, 1, pagination.pageSize);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Đăng ký thành viên thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCustomer = async (id: number, data: { name: string; phone: string; email?: string; birthday?: string; note?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.put<any, ApiResponse<Customer>>(`/customers/${id}`, data);
      toast.success(res.message ?? 'Cập nhật thành viên thành công');
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(res.data);
      }
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Cập nhật thành viên thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCustomer = async (id: number) => {
    setIsLoading(true);
    try {
      await api.delete<any, ApiResponse<void>>(`/customers/${id}`);
      toast.success('Xóa khách hàng thành công');
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      toast.error(err?.message ?? 'Xóa khách hàng thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerTransactions = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await api.get<any, ApiResponse<LoyaltyTransaction[]>>(`/customers/${id}/transactions`);
      setTransactions(res.data);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải lịch sử giao dịch điểm');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const redeemPoints = async (id: number, points: number, description: string) => {
    setIsLoading(true);
    try {
      await api.post<any, ApiResponse<void>>(`/customers/${id}/redeem`, { points, description });
      toast.success('Đổi điểm tích lũy thành công');
      // Reload detail and transactions
      await fetchCustomerDetail(id);
      await fetchCustomerTransactions(id);
    } catch (err: any) {
      toast.error(err?.message ?? 'Đổi điểm tích lũy thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAISegmentation = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.get<any, ApiResponse<CustomerSegmentResponse>>('/customers/ai/segmentation');
      setSegmentation(res.data);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải phân tích khách hàng AI');
      throw err;
    } finally {
      setIsAiLoading(false);
    }
  };

  return {
    isLoading,
    isAiLoading,
    customers,
    selectedCustomer,
    transactions,
    segmentation,
    pagination,
    fetchCustomers,
    fetchCustomerDetail,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    fetchCustomerTransactions,
    redeemPoints,
    fetchAISegmentation,
  };
}
