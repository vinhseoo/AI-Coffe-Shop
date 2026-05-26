import { useState } from 'react';
import { api } from '../lib/api';
import { ApiResponse } from '../types/api';
import {
  DashboardOverview,
  RevenueSummaryData,
  TopSellingItem,
  LowStockAlert,
  AIDashboardSummary,
} from '../types/dashboard';
import { toast } from './useToast';

export function useDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummaryData[]>([]);
  const [topSelling, setTopSelling] = useState<TopSellingItem[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);
  const [aiSummary, setAiSummary] = useState<AIDashboardSummary | null>(null);

  const fetchOverview = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any, ApiResponse<DashboardOverview>>('/dashboard/overview');
      setOverview(res.data);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải số liệu tổng quan');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRevenueSummary = async (from?: string, to?: string, groupBy = 'day') => {
    setIsLoading(true);
    try {
      let url = `/dashboard/revenue-summary?groupBy=${groupBy}`;
      if (from) url += `&from=${encodeURIComponent(from)}`;
      if (to) url += `&to=${encodeURIComponent(to)}`;
      const res = await api.get<any, ApiResponse<RevenueSummaryData[]>>(url);
      setRevenueSummary(res.data);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải tổng hợp doanh thu');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopSelling = async (from?: string, to?: string, limit = 5) => {
    setIsLoading(true);
    try {
      let url = `/dashboard/top-selling?limit=${limit}`;
      if (from) url += `&from=${encodeURIComponent(from)}`;
      if (to) url += `&to=${encodeURIComponent(to)}`;
      const res = await api.get<any, ApiResponse<TopSellingItem[]>>(url);
      setTopSelling(res.data);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải sản phẩm bán chạy');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLowStockAlerts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any, ApiResponse<LowStockAlert[]>>('/dashboard/low-stock-alerts');
      setLowStockAlerts(res.data);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải cảnh báo tồn kho');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAISummary = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.get<any, ApiResponse<AIDashboardSummary>>('/dashboard/ai-summary');
      setAiSummary(res.data);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải báo cáo phân tích AI');
      throw err;
    } finally {
      setIsAiLoading(false);
    }
  };

  const fetchAllData = async (from?: string, to?: string, groupBy = 'day') => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchOverview(),
        fetchRevenueSummary(from, to, groupBy),
        fetchTopSelling(from, to, 5),
        fetchLowStockAlerts(),
      ]);
    } catch (err) {
      logError('Lỗi khi tải dữ liệu dashboard tổng hợp', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isAiLoading,
    overview,
    revenueSummary,
    topSelling,
    lowStockAlerts,
    aiSummary,
    fetchOverview,
    fetchRevenueSummary,
    fetchTopSelling,
    fetchLowStockAlerts,
    fetchAISummary,
    fetchAllData,
  };
}

function logError(message: string, error: any) {
  console.error(message, error);
}
