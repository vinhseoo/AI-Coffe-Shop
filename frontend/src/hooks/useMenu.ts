import { useState } from 'react';
import { api } from '../lib/api';
import { ApiResponse, PagedResponse } from '../types/api';
import {
  Category,
  CategoryRequest,
  MenuItem,
  MenuItemRequest,
  MenuItemDetail,
  Topping,
  ToppingRequest,
  RecipeIngredient,
  RecipeRequest,
  MenuAnalysisResponse,
  NewMenuSuggestion,
  PriceSuggestion,
  MenuItemVariant,
  VariantRequest,
} from '../types/menu';
import { toast } from './useToast';

export function useMenu() {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 1,
    last: true,
  });

  // ==========================================
  // CATEGORY ACTIONS
  // ==========================================

  const fetchCategories = async (onlyActive = false) => {
    setIsLoading(true);
    try {
      const res = await api.get<any, ApiResponse<Category[]>>(`/categories?onlyActive=${onlyActive}`);
      setCategories(res.data);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải danh sách danh mục');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createCategory = async (data: CategoryRequest) => {
    setIsLoading(true);
    try {
      const res = await api.post<any, ApiResponse<Category>>('/categories', data);
      toast.success('Thêm danh mục thành công');
      await fetchCategories();
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Thêm danh mục thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async (id: number, data: CategoryRequest) => {
    setIsLoading(true);
    try {
      const res = await api.put<any, ApiResponse<Category>>(`/categories/${id}`, data);
      toast.success('Cập nhật danh mục thành công');
      await fetchCategories();
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Cập nhật danh mục thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    setIsLoading(true);
    try {
      await api.delete<any, ApiResponse<void>>(`/categories/${id}`);
      toast.success('Xóa danh mục thành công');
      await fetchCategories();
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể xóa danh mục');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // MENU ITEM ACTIONS
  // ==========================================

  const fetchMenuItems = async (
    categoryId?: number | null,
    search?: string,
    page = 1,
    size = 10
  ) => {
    setIsLoading(true);
    try {
      let url = `/menu-items?page=${page}&size=${size}`;
      if (categoryId) url += `&categoryId=${categoryId}`;
      if (search && search.trim() !== '') url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get<any, ApiResponse<PagedResponse<MenuItem>>>(url);
      setMenuItems(res.data.content);
      setPagination({
        pageNumber: res.data.pageNumber,
        pageSize: res.data.pageSize,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
        last: res.data.last,
      });
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải thực đơn');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMenuItemDetail = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await api.get<any, ApiResponse<MenuItemDetail>>(`/menu-items/${id}`);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải chi tiết sản phẩm');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createMenuItem = async (data: MenuItemRequest) => {
    setIsLoading(true);
    try {
      const res = await api.post<any, ApiResponse<MenuItem>>('/menu-items', data);
      toast.success('Thêm sản phẩm mới thành công');
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Thêm sản phẩm thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateMenuItem = async (id: number, data: MenuItemRequest) => {
    setIsLoading(true);
    try {
      const res = await api.put<any, ApiResponse<MenuItem>>(`/menu-items/${id}`, data);
      toast.success('Cập nhật sản phẩm thành công');
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Cập nhật sản phẩm thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMenuItem = async (id: number) => {
    setIsLoading(true);
    try {
      await api.delete<any, ApiResponse<void>>(`/menu-items/${id}`);
      toast.success('Xóa sản phẩm thành công');
    } catch (err: any) {
      toast.error(err?.message ?? 'Xóa sản phẩm thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMenuItemAvailability = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await api.patch<any, ApiResponse<MenuItem>>(`/menu-items/${id}/toggle`);
      toast.success(res.data.isAvailable ? 'Sản phẩm đã có sẵn để bán' : 'Sản phẩm đã được tạm ngưng bán');
      
      setMenuItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isAvailable: res.data.isAvailable } : item))
      );
      
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Cập nhật trạng thái thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // VARIANT ACTIONS
  // ==========================================

  const addVariant = async (menuItemId: number, data: VariantRequest) => {
    setIsLoading(true);
    try {
      const res = await api.post<any, ApiResponse<MenuItemVariant>>(`/menu-items/${menuItemId}/variants`, data);
      toast.success('Thêm kích thước mới thành công');
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể thêm size mới');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateVariant = async (variantId: number, data: VariantRequest) => {
    setIsLoading(true);
    try {
      const res = await api.put<any, ApiResponse<MenuItemVariant>>(`/menu-items/variants/${variantId}`, data);
      toast.success('Cập nhật giá bán biến thể thành công');
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể cập nhật biến thể');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteVariant = async (variantId: number) => {
    setIsLoading(true);
    try {
      await api.delete<any, ApiResponse<void>>(`/menu-items/variants/${variantId}`);
      toast.success('Xóa biến thể thành công');
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể xóa biến thể');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVariantAvailability = async (variantId: number) => {
    setIsLoading(true);
    try {
      const res = await api.patch<any, ApiResponse<MenuItemVariant>>(`/menu-items/variants/${variantId}/toggle`);
      toast.success(res.data.isAvailable ? 'Biến thể đã sẵn sàng' : 'Biến thể tạm hết hàng');
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể cập nhật trạng thái biến thể');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // TOPPING ACTIONS
  // ==========================================

  const fetchToppings = async (onlyAvailable = false) => {
    setIsLoading(true);
    try {
      const res = await api.get<any, ApiResponse<Topping[]>>(`/toppings?onlyAvailable=${onlyAvailable}`);
      setToppings(res.data);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải danh sách topping');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createTopping = async (data: ToppingRequest) => {
    setIsLoading(true);
    try {
      const res = await api.post<any, ApiResponse<Topping>>('/toppings', data);
      toast.success('Thêm topping thành công');
      await fetchToppings();
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Thêm topping thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTopping = async (id: number, data: ToppingRequest) => {
    setIsLoading(true);
    try {
      const res = await api.put<any, ApiResponse<Topping>>(`/toppings/${id}`, data);
      toast.success('Cập nhật topping thành công');
      await fetchToppings();
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Cập nhật topping thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTopping = async (id: number) => {
    setIsLoading(true);
    try {
      await api.delete<any, ApiResponse<void>>(`/toppings/${id}`);
      toast.success('Xóa topping thành công');
      await fetchToppings();
    } catch (err: any) {
      toast.error(err?.message ?? 'Xóa topping thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleToppingAvailability = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await api.patch<any, ApiResponse<Topping>>(`/toppings/${id}/toggle`);
      toast.success(res.data.isAvailable ? 'Topping đã sẵn sàng' : 'Topping tạm hết hàng');
      await fetchToppings();
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Cập nhật trạng thái topping thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // RECIPE ACTIONS (Variant Level)
  // ==========================================

  const fetchRecipe = async (variantId: number) => {
    setIsLoading(true);
    try {
      const res = await api.get<any, ApiResponse<RecipeIngredient[]>>(`/menu-items/variants/${variantId}/recipe`);
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể tải công thức món ăn');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecipe = async (variantId: number, data: RecipeRequest) => {
    setIsLoading(true);
    try {
      const res = await api.post<any, ApiResponse<RecipeIngredient[]>>(`/menu-items/variants/${variantId}/recipe`, data);
      toast.success('Lưu công thức món ăn thành công');
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Không thể lưu công thức món ăn');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // AI MENU ACTIONS
  // ==========================================

  const analyzeMenu = async () => {
    setIsLoading(true);
    try {
      const res = await api.post<any, ApiResponse<MenuAnalysisResponse>>('/menu/ai/analyze');
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Lỗi khi gọi AI phân tích thực đơn');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const suggestNewMenu = async () => {
    setIsLoading(true);
    try {
      const res = await api.post<any, ApiResponse<NewMenuSuggestion>>('/menu/ai/suggest-new');
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Lỗi khi gọi AI đề xuất món mới');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const suggestPrice = async (variantId: number, targetMargin: number) => {
    setIsLoading(true);
    try {
      const res = await api.post<any, ApiResponse<PriceSuggestion>>(
        `/menu/ai/suggest-price?menuItemId=${variantId}&targetMargin=${targetMargin}`
      );
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Lỗi khi gọi AI gợi ý giá bán');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    categories,
    menuItems,
    toppings,
    pagination,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchMenuItems,
    fetchMenuItemDetail,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
    addVariant,
    updateVariant,
    deleteVariant,
    toggleVariantAvailability,
    fetchToppings,
    createTopping,
    updateTopping,
    deleteTopping,
    toggleToppingAvailability,
    fetchRecipe,
    saveRecipe,
    analyzeMenu,
    suggestNewMenu,
    suggestPrice,
  };
}
