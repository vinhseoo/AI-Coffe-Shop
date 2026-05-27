import { useState } from 'react';
import { api } from '../lib/api';
import { ApiResponse, PagedResponse } from '../types/api';
import { Promotion, CaptionRequest, CaptionResponse, PromotionSuggestion } from '../types/marketing';
import { toast } from './useToast';

export function useMarketing() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [activeCaption, setActiveCaption] = useState<CaptionResponse | null>(null);
  const [suggestions, setSuggestions] = useState<PromotionSuggestion[]>([]);
  const [scheduleAdvice, setScheduleAdvice] = useState<string>('');

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 1,
    last: true,
  });

  const fetchPromotions = async (
    filters: { search?: string; isActive?: boolean } = {},
    page = 1,
    size = 10
  ) => {
    setIsLoading(true);
    try {
      let url = `/promotions?page=${page}&size=${size}`;
      if (filters.search && filters.search.trim() !== '') {
        url += `&search=${encodeURIComponent(filters.search)}`;
      }
      if (filters.isActive !== undefined) {
        url += `&isActive=${filters.isActive}`;
      }

      const res = await api.get<any, ApiResponse<PagedResponse<Promotion>>>(url);
      setPromotions(res.data.content);
      setPagination({
        pageNumber: res.data.pageNumber,
        pageSize: res.data.pageSize,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
        last: res.data.last,
      });
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải danh sách chương trình khuyến mãi');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPromotionDetail = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await api.get<any, ApiResponse<Promotion>>(`/promotions/${id}`);
      setSelectedPromotion(res.data);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải chi tiết khuyến mãi');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createPromotion = async (data: Omit<Promotion, 'id' | 'usedCount' | 'isAiSuggested' | 'createdAt'>) => {
    setIsLoading(true);
    try {
      const res = await api.post<any, ApiResponse<Promotion>>('/promotions', data);
      toast.success(res.message ?? 'Tạo chương trình khuyến mãi mới thành công');
      await fetchPromotions({}, 1, pagination.pageSize);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Tạo chương trình khuyến mãi thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePromotion = async (id: number, data: Partial<Promotion>) => {
    setIsLoading(true);
    try {
      const res = await api.put<any, ApiResponse<Promotion>>(`/promotions/${id}`, data);
      toast.success(res.message ?? 'Cập nhật khuyến mãi thành công');
      if (selectedPromotion?.id === id) {
        setSelectedPromotion(res.data);
      }
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Cập nhật khuyến mãi thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePromotion = async (id: number) => {
    setIsLoading(true);
    try {
      await api.delete<any, ApiResponse<void>>(`/promotions/${id}`);
      toast.success('Xóa khuyến mãi thành công');
      setPromotions((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      toast.error(err?.message ?? 'Xóa khuyến mãi thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const generateCaption = async (data: CaptionRequest) => {
    setIsAiLoading(true);
    try {
      const res = await api.post<any, ApiResponse<CaptionResponse>>('/marketing/ai/caption', data);
      setActiveCaption(res.data);
      toast.success('Tạo caption quảng cáo thành công');
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tạo caption quảng cáo từ AI');
      throw err;
    } finally {
      setIsAiLoading(false);
    }
  };

  const fetchAiSuggestions = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.get<any, ApiResponse<PromotionSuggestion[]>>('/marketing/ai/promotions');
      setSuggestions(res.data);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải đề xuất khuyến mãi từ AI');
      throw err;
    } finally {
      setIsAiLoading(false);
    }
  };

  const fetchPostSchedule = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.get<any, ApiResponse<String>>('/marketing/ai/schedule');
      setScheduleAdvice(String(res.data));
      return String(res.data);
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải đề xuất lịch đăng từ AI');
      throw err;
    } finally {
      setIsAiLoading(false);
    }
  };

  return {
    isLoading,
    isAiLoading,
    promotions,
    selectedPromotion,
    activeCaption,
    suggestions,
    scheduleAdvice,
    pagination,
    fetchPromotions,
    fetchPromotionDetail,
    createPromotion,
    updatePromotion,
    deletePromotion,
    generateCaption,
    fetchAiSuggestions,
    fetchPostSchedule,
  };
}
