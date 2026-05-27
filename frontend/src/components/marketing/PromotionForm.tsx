import React, { useEffect, useState } from 'react';
import { Promotion, PromotionType } from '../../types/marketing';
import { useMenu } from '../../hooks/useMenu';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface PromotionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Promotion | null;
}

export function PromotionForm({ isOpen, onClose, onSubmit, initialData }: PromotionFormProps) {
  const { menuItems, fetchMenuItems } = useMenu();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<PromotionType>('PERCENT');
  const [value, setValue] = useState<number | string>('');
  const [minOrderValue, setMinOrderValue] = useState<number | string>('');
  const [maxDiscount, setMaxDiscount] = useState<number | string>('');
  const [applicableItems, setApplicableItems] = useState<number[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [usageLimit, setUsageLimit] = useState<number | string>('');
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load menu items when form opens
  useEffect(() => {
    if (isOpen) {
      fetchMenuItems(null, '', 1, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description || '');
        setType(initialData.type);
        setValue(initialData.value);
        setMinOrderValue(initialData.minOrderValue);
        setMaxDiscount(initialData.maxDiscount || '');
        setApplicableItems(initialData.applicableItems || []);
        
        // Format dates for input (LocalDateTime "yyyy-MM-ddThh:mm")
        setStartDate(initialData.startDate ? initialData.startDate.substring(0, 16) : '');
        setEndDate(initialData.endDate ? initialData.endDate.substring(0, 16) : '');
        setUsageLimit(initialData.usageLimit || '');
        setIsActive(initialData.isActive);
      } else {
        setName('');
        setDescription('');
        setType('PERCENT');
        setValue('');
        setMinOrderValue('');
        setMaxDiscount('');
        setApplicableItems([]);
        setStartDate('');
        setEndDate('');
        setUsageLimit('');
        setIsActive(true);
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Tên chương trình không được để trống';
    
    const val = Number(value);
    if (!value && value !== 0) {
      nextErrors.value = 'Giá trị khuyến mãi không được để trống';
    } else if (isNaN(val) || val < 0) {
      nextErrors.value = 'Giá trị khuyến mãi phải là số dương';
    } else if (type === 'PERCENT' && val > 100) {
      nextErrors.value = 'Tỷ lệ chiết khấu phần trăm không được vượt quá 100%';
    }

    if (minOrderValue !== '') {
      const minVal = Number(minOrderValue);
      if (isNaN(minVal) || minVal < 0) nextErrors.minOrderValue = 'Giá trị đơn hàng tối thiểu phải >= 0';
    }

    if (maxDiscount !== '') {
      const maxVal = Number(maxDiscount);
      if (isNaN(maxVal) || maxVal < 0) nextErrors.maxDiscount = 'Giảm tối đa phải >= 0';
    }

    if (usageLimit !== '') {
      const limitVal = Number(usageLimit);
      if (isNaN(limitVal) || limitVal <= 0 || !Number.isInteger(limitVal)) {
        nextErrors.usageLimit = 'Lượt giới hạn phải là số nguyên dương';
      }
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      nextErrors.endDate = 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleToggleItem = (itemId: number) => {
    setApplicableItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        value: Number(value),
        minOrderValue: minOrderValue !== '' ? Number(minOrderValue) : 0,
        maxDiscount: maxDiscount !== '' ? Number(maxDiscount) : undefined,
        applicableItems: applicableItems.length > 0 ? applicableItems : undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        usageLimit: usageLimit !== '' ? Number(usageLimit) : undefined,
        isActive,
      });
      onClose();
    } catch {
      // errors handled by hook toasts
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData?.id ? 'Chỉnh sửa chương trình khuyến mãi' : 'Tạo khuyến mãi mới'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Tên chương trình khuyến mãi *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="Ví dụ: Giảm giá Khai xuân, Happy Hours..."
            required
            autoFocus
          />

          <Select
            label="Loại khuyến mãi *"
            value={type}
            onChange={(e) => {
              const newType = e.target.value as PromotionType;
              setType(newType);
              if (newType !== 'PERCENT') setMaxDiscount('');
            }}
            options={[
              { value: 'PERCENT', label: 'Chiết khấu (%)' },
              { value: 'FIXED_AMOUNT', label: 'Giảm tiền cố định (VND)' },
              { value: 'BUY_X_GET_Y', label: 'Mua X tặng Y' },
              { value: 'FREE_TOPPING', label: 'Miễn phí Topping' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Giá trị khuyến mãi *"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            error={errors.value}
            placeholder={type === 'PERCENT' ? 'Ví dụ: 15 (%)' : 'Ví dụ: 20000 (đ)'}
            required
          />

          <Input
            label="Đơn hàng tối thiểu (đ)"
            type="number"
            value={minOrderValue}
            onChange={(e) => setMinOrderValue(e.target.value)}
            error={errors.minOrderValue}
            placeholder="Ví dụ: 50000"
          />

          <Input
            label="Giảm tối đa (đ)"
            type="number"
            value={maxDiscount}
            onChange={(e) => setMaxDiscount(e.target.value)}
            error={errors.maxDiscount}
            placeholder="Ví dụ: 30000"
            disabled={type !== 'PERCENT'}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Ngày bắt đầu"
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Input
            label="Ngày kết thúc"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            error={errors.endDate}
          />

          <Input
            label="Giới hạn số lượt dùng"
            type="number"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            error={errors.usageLimit}
            placeholder="Để trống nếu không giới hạn"
          />
        </div>

        {/* Món uống áp dụng */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">Món nước áp dụng</span>
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 max-h-36 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50/50 dark:bg-gray-950/20">
            {menuItems.length === 0 ? (
              <span className="text-xs text-gray-400 italic col-span-2">Không tìm thấy món ăn uống nào</span>
            ) : (
              menuItems.map((item) => {
                const isChecked = applicableItems.includes(item.id);
                return (
                  <label key={item.id} className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-gray-750 dark:text-gray-350">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleItem(item.id)}
                      className="rounded border-gray-300 dark:border-gray-700 text-amber-850 focus:ring-amber-500"
                    />
                    {item.name}
                  </label>
                );
              })
            )}
          </div>
          <span className="text-[10px] text-gray-400 block mt-1">(Để trống nếu áp dụng cho toàn menu hóa đơn)</span>
        </div>

        <TextArea
          label="Mô tả chương trình"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Viết chi tiết điều khoản chương trình khuyến mãi..."
          rows={2}
        />

        {/* Trạng thái kích hoạt */}
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800 dark:text-gray-300 pt-1">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-700 text-amber-850 focus:ring-amber-500"
          />
          Kích hoạt hoạt động (Khách có thể sử dụng ngay nếu thỏa mãn thời gian)
        </label>

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData?.id ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export default PromotionForm;
