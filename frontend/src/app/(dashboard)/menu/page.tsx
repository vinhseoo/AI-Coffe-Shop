'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMenu } from '../../../hooks/useMenu';
import { MenuGrid } from '../../../components/menu/MenuGrid';
import { MenuItemForm } from '../../../components/menu/MenuItemForm';
import { Category, MenuItem } from '../../../types/menu';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { toast } from '../../../hooks/useToast';

function MenuPage() {
  const {
    isLoading,
    categories,
    menuItems,
    pagination,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
  } = useMenu();

  // Filters & State
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Category CRUD States
  const [isEditingCategory, setIsEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);

  // Load categories and items on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMenuItems(selectedCatId, searchQuery, currentPage, 8);
  }, [selectedCatId, currentPage]);

  // Trigger search on enter or when user stops typing (we'll support direct search button or Enter key)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMenuItems(selectedCatId, searchQuery, 1, 8);
  };

  // Product Actions
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (data: any) => {
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, data);
      } else {
        await createMenuItem(data);
      }
      setIsProductModalOpen(false);
      fetchMenuItems(selectedCatId, searchQuery, currentPage, 8);
    } catch {
      // toast handled
    }
  };

  const handleProductDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
      try {
        await deleteMenuItem(id);
        fetchMenuItems(selectedCatId, searchQuery, currentPage, 8);
      } catch {
        // toast handled
      }
    }
  };

  // Category Actions
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error('Tên danh mục không được để trống');
      return;
    }

    setIsCategorySubmitting(true);
    try {
      if (isEditingCategory) {
        await updateCategory(isEditingCategory.id, {
          name: categoryName.trim(),
          description: categoryDesc.trim() || undefined,
        });
        toast.success('Cập nhật danh mục thành công');
      } else {
        await createCategory({
          name: categoryName.trim(),
          description: categoryDesc.trim() || undefined,
        });
        toast.success('Thêm danh mục mới thành công');
      }
      setCategoryName('');
      setCategoryDesc('');
      setIsEditingCategory(null);
      fetchCategories();
    } catch {
      // handled
    } finally {
      setIsCategorySubmitting(false);
    }
  };

  const handleCategoryEdit = (cat: Category) => {
    setIsEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryDesc(cat.description || '');
  };

  const handleCategoryDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này? LƯU Ý: Không thể xóa danh mục đang có sản phẩm.')) {
      try {
        await deleteCategory(id);
        if (selectedCatId === id) setSelectedCatId(null);
      } catch {
        // handled
      }
    }
  };

  const handleCancelCategoryEdit = () => {
    setIsEditingCategory(null);
    setCategoryName('');
    setCategoryDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quản lý thực đơn</h2>
          <p className="text-sm text-gray-500 mt-1">Cấu hình danh mục sản phẩm, định giá và thiết lập công thức.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/menu/ai-suggest"
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-850 dark:text-amber-400 border border-amber-250 dark:border-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors shadow-xs"
          >
            <span>📊 AI Phân tích & Gợi ý</span>
          </Link>
          <Button onClick={handleOpenAddModal} variant="primary" className="flex items-center gap-1.5">
            <span>➕ Thêm sản phẩm</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Left categories, Right products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Category Management */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">
                {isEditingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCategorySubmit} className="space-y-3">
                <Input
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Tên danh mục (VD: Sinh tố)"
                  required
                />
                <Input
                  value={categoryDesc}
                  onChange={(e) => setCategoryDesc(e.target.value)}
                  placeholder="Mô tả danh mục (tùy chọn)"
                />
                <div className="flex gap-2">
                  <Button type="submit" variant="primary" size="sm" className="flex-1" isLoading={isCategorySubmitting}>
                    {isEditingCategory ? 'Cập nhật' : 'Thêm'}
                  </Button>
                  {isEditingCategory && (
                    <Button type="button" variant="outline" size="sm" onClick={handleCancelCategoryEdit}>
                      Hủy
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* List of categories */}
          <Card>
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-sm font-bold">Danh sách danh mục ({categories.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[300px] overflow-y-auto">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50/50 dark:hover:bg-gray-900/10">
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {cat.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCategoryEdit(cat)}
                        className="p-1 text-gray-400 hover:text-amber-800 dark:hover:text-amber-400 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Sửa danh mục"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleCategoryDelete(cat.id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Xóa danh mục"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Products Grid & Search */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Category Filter Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1.5 shrink-0 max-w-full">
              <button
                onClick={() => { setSelectedCatId(null); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCatId === null
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                }`}
              >
                Tất cả món
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCatId(cat.id); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCatId === cat.id
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-64">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm món ăn..."
                className="h-9 py-1 text-xs"
              />
              <Button type="submit" variant="outline" size="sm" className="h-9 font-semibold text-xs shrink-0">
                Tìm
              </Button>
            </form>
          </div>

          {/* Menu Grid component */}
          <MenuGrid
            items={menuItems}
            isLoading={isLoading}
            onEdit={handleOpenEditModal}
            onDelete={handleProductDelete}
            onToggle={toggleMenuItemAvailability}
          />

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4 mt-6">
              <span className="text-xs text-gray-500">
                Hiển thị trang <strong>{pagination.pageNumber}</strong> / <strong>{pagination.totalPages}</strong> ({pagination.totalElements} sản phẩm)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage === pagination.totalPages || isLoading}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      <MenuItemForm
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={handleProductSubmit}
        categories={categories}
        initialData={editingItem}
      />
    </div>
  );
}

import dynamic from 'next/dynamic';
export default dynamic(() => Promise.resolve(MenuPage), {
  ssr: false,
});
