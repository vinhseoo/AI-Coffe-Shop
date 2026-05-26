'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMenu } from '@/hooks/useMenu';
import { MenuItemDetail, RecipeIngredient } from '@/types/menu';
import { RecipeEditor } from '@/components/menu/RecipeEditor';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/hooks/useToast';

function MenuItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const {
    isLoading,
    categories,
    fetchCategories,
    fetchMenuItemDetail,
    updateMenuItem,
    deleteMenuItem,
    saveRecipe,
    addVariant,
    updateVariant,
    deleteVariant,
    toggleVariantAvailability,
    fetchRecipe,
  } = useMenu();

  const [itemDetail, setItemDetail] = useState<MenuItemDetail | null>(null);
  
  // Basic info states
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number | string>('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number | string>('0');
  const [isBestseller, setIsBestseller] = useState(false);
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);

  // Variant States
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedVariantRecipe, setSelectedVariantRecipe] = useState<RecipeIngredient[]>([]);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);

  // Add Variant States
  const [newVariantSize, setNewVariantSize] = useState<'S' | 'M' | 'L'>('S');
  const [newVariantPrice, setNewVariantPrice] = useState<number | string>('');
  const [isAddingVariant, setIsAddingVariant] = useState(false);

  // Load details
  const loadItemDetail = async (selectVariantId?: number) => {
    try {
      const res = await fetchMenuItemDetail(id);
      setItemDetail(res);
      
      // Populate states
      setName(res.name);
      setCategoryId(res.categoryId);
      setDescription(res.description || '');
      setDisplayOrder(res.displayOrder);
      setIsBestseller(res.isBestseller);

      // Select active variant
      if (res.variants && res.variants.length > 0) {
        let targetId = selectVariantId;
        // If not specified or no longer exists, default to the first one
        if (!targetId || !res.variants.some((v: any) => v.id === targetId)) {
          targetId = res.variants[0].id;
        }
        setSelectedVariantId(targetId ?? null);
      } else {
        setSelectedVariantId(null);
      }
    } catch {
      router.push('/menu');
    }
  };

  const loadRecipe = async (variantId: number) => {
    setIsLoadingRecipe(true);
    try {
      const recipe = await fetchRecipe(variantId);
      setSelectedVariantRecipe(recipe);
    } catch {
      setSelectedVariantRecipe([]);
    } finally {
      setIsLoadingRecipe(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    loadItemDetail();
  }, [id]);

  useEffect(() => {
    if (selectedVariantId) {
      loadRecipe(selectedVariantId);
    } else {
      setSelectedVariantRecipe([]);
    }
  }, [selectedVariantId]);

  // Automatically select the next available size in add form
  useEffect(() => {
    if (itemDetail && itemDetail.variants) {
      const currentSizes = itemDetail.variants.map((v: any) => v.size) || [];
      const available = (['S', 'M', 'L'] as const).filter(
        (size) => !currentSizes.includes(size)
      );
      if (available.length > 0) {
        setNewVariantSize(available[0]);
      }
    }
  }, [itemDetail?.variants]);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Tên món không được để trống');
      return;
    }

    setIsUpdatingInfo(true);
    try {
      const updated = await updateMenuItem(id, {
        name: name.trim(),
        categoryId: Number(categoryId),
        description: description.trim() || undefined,
        displayOrder: Number(displayOrder) || 0,
        isBestseller,
      });
      // Refresh local detail state fields
      setItemDetail((prev: any) => prev ? { ...prev, ...updated } : null);
      toast.success('Cập nhật thông tin món ăn thành công');
    } catch {
      // toast handles it
    } finally {
      setIsUpdatingInfo(false);
    }
  };

  // Recipe Level operations
  const handleRecipeSave = async (rows: Array<{ ingredientId: number; quantity: number }>) => {
    if (!selectedVariantId) return;
    try {
      await saveRecipe(selectedVariantId, { items: rows });
      toast.success('Lưu công thức và cập nhật giá vốn thành công');
      // Reload details to get new costPrice
      const res = await fetchMenuItemDetail(id);
      setItemDetail(res);
      // Reload recipe
      await loadRecipe(selectedVariantId);
    } catch {
      // toast handles it
    }
  };

  const handlePriceUpdate = async (newPrice: number) => {
    if (!selectedVariantId || !itemDetail) return;
    const variant = itemDetail.variants.find((v: any) => v.id === selectedVariantId);
    if (!variant) return;

    try {
      await updateVariant(selectedVariantId, {
        size: variant.size,
        price: newPrice,
      });
      // reload details
      const res = await fetchMenuItemDetail(id);
      setItemDetail(res);
      toast.success('Áp dụng giá bán mới thành công');
    } catch {
      // toast handles
    }
  };

  // Variant operations
  const handleUpdateVariantPrice = async (variantId: number, price: number, size: 'S' | 'M' | 'L') => {
    if (isNaN(price) || price < 0) {
      toast.error('Giá bán không hợp lệ');
      return;
    }
    try {
      await updateVariant(variantId, { size, price });
      // refresh details
      const res = await fetchMenuItemDetail(id);
      setItemDetail(res);
      toast.success('Cập nhật giá bán thành công');
    } catch {
      // handled by hook
    }
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVariantPrice || isNaN(Number(newVariantPrice)) || Number(newVariantPrice) < 0) {
      toast.error('Vui lòng nhập giá bán hợp lệ');
      return;
    }
    setIsAddingVariant(true);
    try {
      const newVar = await addVariant(id, { size: newVariantSize, price: Number(newVariantPrice) });
      setNewVariantPrice('');
      toast.success(`Thêm size ${newVariantSize} thành công`);
      await loadItemDetail(newVar.id);
    } catch {
      // handled
    } finally {
      setIsAddingVariant(false);
    }
  };

  const handleDeleteVariant = async (variantId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa size này không?')) {
      try {
        await deleteVariant(variantId);
        await loadItemDetail();
      } catch {
        // handled
      }
    }
  };

  const handleToggleVariantAvailability = async (variantId: number) => {
    try {
      await toggleVariantAvailability(variantId);
      const res = await fetchMenuItemDetail(id);
      setItemDetail(res);
    } catch {
      // handled
    }
  };

  const handleDeleteItem = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn món ăn này khỏi thực đơn không?')) {
      try {
        await deleteMenuItem(id);
        router.push('/menu');
      } catch {
        // toast handles
      }
    }
  };

  if (isLoading && !itemDetail) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!itemDetail) return null;

  const categoryOptions = categories.map((cat: any) => ({
    value: cat.id,
    label: cat.name,
  }));

  // Find size variants not yet created
  const currentSizes = itemDetail.variants?.map((v: any) => v.size) || [];
  const availableSizesToAdd = (['S', 'M', 'L'] as const).filter(
    (size) => !currentSizes.includes(size)
  );

  const activeVariant = itemDetail.variants?.find((v: any) => v.id === selectedVariantId);



  return (
    <div className="space-y-6">
      {/* Back navigation & Header */}
      <div className="flex items-center gap-2">
        <Link
          href="/menu"
          className="p-2 rounded-lg text-gray-400 hover:text-amber-850 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{itemDetail.name}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Mã định danh món ăn: #{itemDetail.id} | Nhóm danh mục: {itemDetail.categoryName}
          </p>
        </div>
      </div>

      {/* Main Grid: Left Edit Info & Variants, Right Recipe Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Columns (Basic Info + Variant Dashboard) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info Form */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
              Thông tin món ăn
            </h3>

            <form onSubmit={handleUpdateInfo} className="space-y-4">
              <Input
                label="Tên món"
                value={name}
                onChange={(e: any) => setName(e.target.value)}
                placeholder="Nhập tên món"
                required
              />

              <Select
                label="Danh mục"
                value={categoryId}
                onChange={(e: any) => setCategoryId(Number(e.target.value))}
                options={categoryOptions}
                required
              />

              <Input
                label="Thứ tự hiển thị"
                type="number"
                value={displayOrder}
                onChange={(e: any) => setDisplayOrder(e.target.value)}
              />

              <TextArea
                label="Mô tả"
                value={description}
                onChange={(e: any) => setDescription(e.target.value)}
                rows={3}
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="detailIsBestseller"
                  checked={isBestseller}
                  onChange={(e: any) => setIsBestseller(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-amber-700 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="detailIsBestseller" className="text-xs font-semibold text-gray-700 dark:text-gray-355 select-none cursor-pointer">
                  Đánh dấu món bán chạy (Bestseller)
                </label>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button type="submit" variant="primary" className="w-full" isLoading={isUpdatingInfo}>
                  Cập nhật thông tin
                </Button>
                
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={handleDeleteItem}
                  className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/25"
                >
                  Xóa món ăn này
                </Button>
              </div>
            </form>
          </div>

          {/* Variants Management Panel */}
          <Card>
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-sm font-bold">Kích thước & Giá bán (Size)</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-3">
                {itemDetail.variants?.map((v: any) => {
                  const isSelected = v.id === selectedVariantId;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`flex flex-col gap-2 p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/15 dark:bg-amber-950/20 shadow-xs'
                          : 'border-gray-150 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-900/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={v.isAvailable ? 'info' : 'default'}>
                            Size {v.size}
                          </Badge>
                          {isSelected && (
                            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold bg-amber-100 dark:bg-amber-950/50 px-1.5 py-0.5 rounded">
                              Đang cấu hình công thức
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5" onClick={(e: any) => e.stopPropagation()}>
                          {/* Availability toggle switch */}
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={v.isAvailable}
                              onChange={() => handleToggleVariantAvailability(v.id)}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4.5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-700"></div>
                          </label>

                          {/* Delete variant */}
                          {itemDetail.variants.length > 1 && (
                            <button
                              onClick={() => handleDeleteVariant(v.id)}
                              className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              title="Xóa kích thước này"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 mt-1.5" onClick={(e: any) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-450 dark:text-gray-400 select-none">Giá bán:</span>
                          <input
                            type="number"
                            defaultValue={v.price}
                            onBlur={(e: any) => handleUpdateVariantPrice(v.id, Number(e.target.value), v.size)}
                            onKeyDown={(e: any) => {
                              if (e.key === 'Enter') {
                                handleUpdateVariantPrice(v.id, Number((e.target as HTMLInputElement).value), v.size);
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            className="w-24 text-xs font-bold text-gray-850 dark:text-gray-150 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded px-2 py-0.5 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                          <span className="text-[10px] text-gray-450">đ</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-gray-400 block uppercase tracking-wider font-semibold">Giá vốn</span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(v.costPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Variant Form */}
              {availableSizesToAdd.length > 0 && (
                <form onSubmit={handleAddVariant} className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-2">Thêm size mới</span>
                  <div className="flex gap-2 items-end">
                    <div className="w-24">
                      <Select
                        options={availableSizesToAdd.map((s: any) => ({ value: s, label: `Size ${s}` }))}
                        value={newVariantSize}
                        onChange={(e: any) => setNewVariantSize(e.target.value as 'S' | 'M' | 'L')}
                        className="h-9 py-1 text-xs"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={newVariantPrice}
                        onChange={(e: any) => setNewVariantPrice(e.target.value)}
                        placeholder="Giá bán (VNĐ)"
                        className="h-9 py-1 text-xs"
                      />
                    </div>
                    <Button type="submit" variant="outline" size="sm" className="h-9 font-semibold text-xs shrink-0" isLoading={isAddingVariant}>
                      Thêm
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Recipe Editor */}
        <div className="lg:col-span-2 space-y-6">
          {selectedVariantId && activeVariant ? (
            isLoadingRecipe ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl p-8 flex items-center justify-center min-h-[300px] shadow-xs">
                <Spinner size="md" />
              </div>
            ) : (
              <RecipeEditor
                variantId={selectedVariantId}
                initialRecipe={selectedVariantRecipe}
                currentPrice={activeVariant.price}
                onSave={handleRecipeSave}
                onPriceUpdate={handlePriceUpdate}
              />
            )
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl p-8 text-center text-gray-400 text-sm shadow-xs">
              Vui lòng chọn hoặc thêm một kích thước (Size) ở cột bên trái để thiết lập công thức và định giá.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import dynamic from 'next/dynamic';
export default dynamic(() => Promise.resolve(MenuItemDetailPage), {
  ssr: false,
});
