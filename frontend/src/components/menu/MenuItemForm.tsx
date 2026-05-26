import React, { useEffect, useState } from 'react';
import { Category, MenuItem, MenuItemRequest, ItemSize } from '../../types/menu';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';

interface VariantInput {
  size: ItemSize;
  price: number | string;
  enabled: boolean;
}

interface MenuItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MenuItemRequest) => Promise<void>;
  categories: Category[];
  initialData?: MenuItem | null;
}

export function MenuItemForm({ isOpen, onClose, onSubmit, categories, initialData }: MenuItemFormProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string | number>('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number | string>('0');
  const [isBestseller, setIsBestseller] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [variants, setVariants] = useState<VariantInput[]>([
    { size: 'S', price: '', enabled: false },
    { size: 'M', price: '', enabled: true },
    { size: 'L', price: '', enabled: false },
  ]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setCategoryId(initialData.categoryId || (categories.length > 0 ? categories[0].id : ''));
        setDescription(initialData.description || '');
        setDisplayOrder(initialData.displayOrder || '0');
        setIsBestseller(initialData.isBestseller || false);

        if (!initialData.id) {
          // Prefilled creation (e.g. from AI Suggestion)
          const defaultSize = (initialData as any).size || 'M';
          const defaultPrice = (initialData as any).price || '';
          setVariants([
            { size: 'S', price: defaultSize === 'S' ? defaultPrice : '', enabled: defaultSize === 'S' },
            { size: 'M', price: defaultSize === 'M' ? defaultPrice : '', enabled: defaultSize === 'M' },
            { size: 'L', price: defaultSize === 'L' ? defaultPrice : '', enabled: defaultSize === 'L' },
          ]);
        }
      } else {
        setName('');
        setCategoryId(categories.length > 0 ? categories[0].id : '');
        setDescription('');
        setDisplayOrder('0');
        setIsBestseller(false);
        setVariants([
          { size: 'S', price: '', enabled: false },
          { size: 'M', price: '', enabled: true },
          { size: 'L', price: '', enabled: false },
        ]);
      }
      setErrors({});
    }
  }, [isOpen, initialData, categories]);

  const handleVariantChange = (index: number, field: keyof VariantInput, value: any) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i === index) {
          const updated = { ...v, [field]: value };
          if (field === 'enabled' && !value) {
            updated.price = '';
          }
          return updated;
        }
        return v;
      })
    );
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Tên món không được để trống';
    if (!categoryId) nextErrors.categoryId = 'Vui lòng chọn danh mục';

    if (!initialData?.id) {
      const enabledVariants = variants.filter((v) => v.enabled);
      if (enabledVariants.length === 0) {
        nextErrors.variants = 'Món ăn phải có ít nhất 1 kích thước kích hoạt';
      } else {
        enabledVariants.forEach((v) => {
          const p = Number(v.price);
          if (v.price === '' || isNaN(p)) {
            nextErrors[`variant_${v.size}`] = 'Giá bán phải là một số';
          } else if (p < 0) {
            nextErrors[`variant_${v.size}`] = 'Giá bán không được âm';
          }
        });
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: MenuItemRequest = {
        name: name.trim(),
        categoryId: Number(categoryId),
        description: description.trim() || undefined,
        displayOrder: Number(displayOrder) || 0,
        isBestseller,
      };

      if (!initialData?.id) {
        payload.variants = variants
          .filter((v) => v.enabled)
          .map((v) => ({
            size: v.size,
            price: Number(v.price),
          }));
      }

      await onSubmit(payload);
      onClose();
    } catch {
      // toast.error handles it
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData?.id ? 'Chỉnh sửa món ăn' : 'Thêm sản phẩm mới'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tên món ăn / đồ uống"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          placeholder="Ví dụ: Cà phê cốt dừa"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Danh mục"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={categoryOptions}
            error={errors.categoryId}
            placeholder="Chọn danh mục"
            required
          />

          <Input
            label="Thứ tự hiển thị"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            placeholder="Ví dụ: 1, 2, 3"
          />
        </div>

        {/* Variants configuration (Only on creation) */}
        {!initialData?.id ? (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Kích thước & Giá bán (VNĐ) <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2 border border-gray-150 dark:border-gray-800 rounded-xl p-3 bg-gray-50/50 dark:bg-gray-900/50">
              {variants.map((v, index) => (
                <div key={v.size} className="flex items-center gap-4">
                  <label className="flex items-center gap-2 w-24 select-none cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={v.enabled}
                      onChange={(e) => handleVariantChange(index, 'enabled', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-amber-700 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-gray-850 dark:text-gray-250">
                      Size {v.size}
                    </span>
                  </label>
                  <div className="flex-1">
                    <Input
                      type="number"
                      value={v.price}
                      onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                      placeholder={v.enabled ? "Ví dụ: 35000" : "Chưa kích hoạt"}
                      disabled={!v.enabled}
                      className="h-9 py-1 text-xs"
                      error={errors[`variant_${v.size}`]}
                    />
                  </div>
                </div>
              ))}
            </div>
            {errors.variants && (
              <p className="text-xs text-red-500 mt-1">{errors.variants}</p>
            )}
          </div>
        ) : (
          <div className="rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 p-3 text-xs text-amber-800 dark:text-amber-400">
            ℹ️ Biến thể và giá bán của sản phẩm sẽ được quản lý chi tiết trong trang cấu hình công thức sản phẩm.
          </div>
        )}

        <TextArea
          label="Mô tả sản phẩm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả hương vị, topping kèm theo của món..."
          rows={3}
        />

        <div className="flex items-center gap-2 py-1">
          <input
            type="checkbox"
            id="isBestseller"
            checked={isBestseller}
            onChange={(e) => setIsBestseller(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-amber-700 focus:ring-amber-500 cursor-pointer"
          />
          <label htmlFor="isBestseller" className="text-sm font-semibold text-gray-700 dark:text-gray-355 select-none cursor-pointer">
            Món bán chạy (Bestseller)
          </label>
        </div>
        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData?.id ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export default MenuItemForm;
