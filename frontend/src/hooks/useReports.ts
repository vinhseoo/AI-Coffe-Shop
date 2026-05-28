import { useState } from 'react';
import { api } from '../lib/api';
import { ApiResponse } from '../types/api';
import {
  RevenueReport,
  DateRevenuePair,
  CategoryRevenue,
  TopItemReport,
  CustomerStatsReport,
  PaymentMethodRatio,
  AIWeeklyAnalysisData,
  AIRevenueForecastData,
} from '../types/report';
import { AIReport, AIReportType } from '../types/ai';
import { toast } from './useToast';

export function useReports() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState<AIReport[]>([]);

  const fetchRevenueReport = async (from?: string, to?: string, groupBy = 'day') => {
    setIsLoading(true);
    try {
      let url = `/reports/revenue?groupBy=${groupBy}`;
      if (from) url += `&from=${from}`;
      if (to) url += `&to=${to}`;
      const res = await api.get<any, ApiResponse<RevenueReport>>(url);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải báo cáo doanh thu');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHourlyRevenue = async (date?: string) => {
    setIsLoading(true);
    try {
      let url = '/reports/hourly';
      if (date) url += `?date=${date}`;
      const res = await api.get<any, ApiResponse<DateRevenuePair[]>>(url);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải báo cáo doanh thu theo giờ');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategoryRevenue = async (from?: string, to?: string) => {
    setIsLoading(true);
    try {
      let url = '/reports/category';
      const params: string[] = [];
      if (from) params.push(`from=${from}`);
      if (to) params.push(`to=${to}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await api.get<any, ApiResponse<CategoryRevenue[]>>(url);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải báo cáo theo danh mục');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopItems = async (from?: string, to?: string, limit = 10) => {
    setIsLoading(true);
    try {
      let url = `/reports/top-items?limit=${limit}`;
      if (from) url += `&from=${from}`;
      if (to) url += `&to=${to}`;
      const res = await api.get<any, ApiResponse<TopItemReport[]>>(url);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải báo cáo sản phẩm bán chạy');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerStats = async (from?: string, to?: string) => {
    setIsLoading(true);
    try {
      let url = '/reports/customers';
      const params: string[] = [];
      if (from) params.push(`from=${from}`);
      if (to) params.push(`to=${to}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await api.get<any, ApiResponse<CustomerStatsReport>>(url);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải thống kê thành viên');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentMethods = async (from?: string, to?: string) => {
    setIsLoading(true);
    try {
      let url = '/reports/payment-methods';
      const params: string[] = [];
      if (from) params.push(`from=${from}`);
      if (to) params.push(`to=${to}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await api.get<any, ApiResponse<{ methods: PaymentMethodRatio[]; totalRevenue: number; totalOrders: number }>>(url);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải báo cáo phương thức thanh toán');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ---- AI Reports actions ----

  const generateWeeklyAnalysis = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.post<any, ApiResponse<AIWeeklyAnalysisData>>('/reports/ai/weekly');
      toast.success('Phân tích báo cáo tuần từ AI thành công');
      // Refresh history
      fetchAIHistory();
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Tạo phân tích tuần thất bại');
      throw err;
    } finally {
      setIsAiLoading(false);
    }
  };

  const generateForecast = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.post<any, ApiResponse<AIRevenueForecastData>>('/reports/ai/forecast');
      toast.success('Dự báo doanh thu AI thành công');
      fetchAIHistory();
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Tạo dự báo doanh thu thất bại');
      throw err;
    } finally {
      setIsAiLoading(false);
    }
  };

  const generateSuggestions = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.post<any, ApiResponse<AIReport>>('/reports/ai/suggestions');
      toast.success('Tạo ý kiến đề xuất AI thành công');
      fetchAIHistory();
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Tạo ý kiến đề xuất thất bại');
      throw err;
    } finally {
      setIsAiLoading(false);
    }
  };

  const fetchAIHistory = async (type?: AIReportType) => {
    setIsLoading(true);
    try {
      let url = '/reports/ai/history';
      if (type) url += `?type=${type}`;
      const res = await api.get<any, ApiResponse<AIReport[]>>(url);
      setAiHistory(res.data);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải lịch sử báo cáo AI');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookmark = async (id: number) => {
    try {
      const res = await api.put<any, ApiResponse<AIReport>>(`/reports/ai/${id}/bookmark`);
      toast.success('Đã cập nhật trạng thái lưu trữ');
      setAiHistory((prev) =>
        prev.map((rep) => (rep.id === id ? { ...rep, isBookmarked: res.data.isBookmarked } : rep))
      );
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Cập nhật trạng thái lưu trữ thất bại');
      throw err;
    }
  };

  const deleteReport = async (id: number) => {
    try {
      await api.delete<any, ApiResponse<void>>(`/reports/ai/${id}`);
      toast.success('Xóa báo cáo AI thành công');
      setAiHistory((prev) => prev.filter((rep) => rep.id !== id));
    } catch (err: any) {
      toast.error(err?.message ?? 'Xóa báo cáo AI thất bại');
      throw err;
    }
  };

  return {
    isLoading,
    isAiLoading,
    aiHistory,
    fetchRevenueReport,
    fetchHourlyRevenue,
    fetchCategoryRevenue,
    fetchTopItems,
    fetchCustomerStats,
    fetchPaymentMethods,
    generateWeeklyAnalysis,
    generateForecast,
    generateSuggestions,
    fetchAIHistory,
    toggleBookmark,
    deleteReport,
  };
}
