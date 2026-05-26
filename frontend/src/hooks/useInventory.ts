import { useState } from 'react';
import { api } from '../lib/api';
import { ApiResponse, PagedResponse } from '../types/api';
import {
  Ingredient,
  IngredientRequest,
  Supplier,
  SupplierRequest,
  InventoryLog,
  ImportRequest,
  InventoryForecastResponse,
  InventoryAnomalyResponse,
  InventoryAction,
} from '../types/inventory';
import { toast } from './useToast';

export function useInventory() {
  const [isLoading, setIsLoading] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [activeIngredients, setActiveIngredients] = useState<Ingredient[]>([]);
  const [lowStockIngredients, setLowStockIngredients] = useState<Ingredient[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 1,
    last: true,
  });
  const [logPagination, setLogPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 1,
    last: true,
  });

  // ==========================================
  // INGREDIENT ACTIONS
  // ==========================================

  const fetchIngredients = async (search?: string, page = 1, size = 10) => {
    setIsLoading(true);
    try {
      let url = `/ingredients?page=${page}&size=${size}`;
      if (search && search.trim() !== '') {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const res = await api.get<any, ApiResponse<PagedResponse<Ingredient>>>(url);
      setIngredients(res.data.content);
      setPagination({
        pageNumber: res.data.pageNumber,
        pageSize: res.data.pageSize,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
        last: res.data.last,
      });
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải danh sách nguyên liệu');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActiveIngredients = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any, ApiResponse<Ingredient[]>>('/ingredients');
      setActiveIngredients(res.data);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải danh sách nguyên liệu hoạt động');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIngredientDetail = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await api.get<any, ApiResponse<Ingredient>>(`/ingredients/${id}`);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải chi tiết nguyên liệu');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createIngredient = async (data: IngredientRequest) => {
    setIsLoading(true);
    try {
      const res = await api.post<any, ApiResponse<Ingredient>>('/ingredients', data);
      toast.success('Thêm nguyên liệu thành công');
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Thêm nguyên liệu thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateIngredient = async (id: number, data: IngredientRequest) => {
    setIsLoading(true);
    try {
      const res = await api.put<any, ApiResponse<Ingredient>>(`/ingredients/${id}`, data);
      toast.success('Cập nhật nguyên liệu thành công');
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Cập nhật nguyên liệu thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteIngredient = async (id: number) => {
    setIsLoading(true);
    try {
      await api.delete<any, ApiResponse<void>>(`/ingredients/${id}`);
      toast.success('Ngưng sử dụng nguyên liệu thành công');
    } catch (err: any) {
      toast.error(err?.message ?? 'Ngưng sử dụng nguyên liệu thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLowStockIngredients = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any, ApiResponse<Ingredient[]>>('/ingredients/low-stock');
      setLowStockIngredients(res.data);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải danh sách cảnh báo tồn kho');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // SUPPLIER ACTIONS
  // ==========================================

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any, ApiResponse<Supplier[]>>('/suppliers');
      setSuppliers(res.data);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải danh sách nhà cung cấp');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createSupplier = async (data: SupplierRequest) => {
    setIsLoading(true);
    try {
      const res = await api.post<any, ApiResponse<Supplier>>('/suppliers', data);
      toast.success('Thêm nhà cung cấp thành công');
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Thêm nhà cung cấp thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSupplier = async (id: number, data: SupplierRequest) => {
    setIsLoading(true);
    try {
      const res = await api.put<any, ApiResponse<Supplier>>(`/suppliers/${id}`, data);
      toast.success('Cập nhật nhà cung cấp thành công');
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Cập nhật nhà cung cấp thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSupplier = async (id: number) => {
    setIsLoading(true);
    try {
      await api.delete<any, ApiResponse<void>>(`/suppliers/${id}`);
      toast.success('Xóa nhà cung cấp thành công');
      return true;
    } catch (err: any) {
      toast.error(err?.message ?? 'Xóa nhà cung cấp thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // INVENTORY OPERATIONS
  // ==========================================

  const importStock = async (data: ImportRequest) => {
    setIsLoading(true);
    try {
      const res = await api.post<any, ApiResponse<InventoryLog[]>>('/inventory/import', data);
      toast.success('Nhập kho thành công');
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Nhập kho thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const exportStock = async (data: { ingredientId: number; quantity: number; note?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.post<any, ApiResponse<InventoryLog>>('/inventory/export', data);
      toast.success('Xuất kho thành công');
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Xuất kho thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const adjustStock = async (data: { ingredientId: number; quantity: number; note?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.post<any, ApiResponse<InventoryLog>>('/inventory/adjust', data);
      toast.success('Điều chỉnh tồn kho thành công');
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Điều chỉnh tồn kho thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async (ingredientId?: number, action?: InventoryAction, page = 1, size = 10) => {
    setIsLoading(true);
    try {
      let url = `/inventory/logs?page=${page}&size=${size}`;
      if (ingredientId) url += `&ingredientId=${ingredientId}`;
      if (action) url += `&action=${action}`;

      const res = await api.get<any, ApiResponse<PagedResponse<InventoryLog>>>(url);
      setLogs(res.data.content);
      setLogPagination({
        pageNumber: res.data.pageNumber,
        pageSize: res.data.pageSize,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
        last: res.data.last,
      });
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải lịch sử kho');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // AI INVENTORY ACTIONS
  // ==========================================

  const forecastDemand = async () => {
    setIsLoading(true);
    try {
      const res = await api.post<any, ApiResponse<InventoryForecastResponse>>('/inventory/ai/forecast');
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Lỗi khi gọi AI dự báo nhu cầu kho');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const detectAnomalies = async () => {
    setIsLoading(true);
    try {
      const res = await api.post<any, ApiResponse<InventoryAnomalyResponse>>('/inventory/ai/anomaly');
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Lỗi khi gọi AI phát hiện bất thường');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    ingredients,
    activeIngredients,
    lowStockIngredients,
    suppliers,
    logs,
    pagination,
    logPagination,
    fetchIngredients,
    fetchActiveIngredients,
    fetchIngredientDetail,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    fetchLowStockIngredients,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    importStock,
    exportStock,
    adjustStock,
    fetchLogs,
    forecastDemand,
    detectAnomalies,
  };
}
