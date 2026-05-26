import React, { useEffect, useState } from 'react';
import { Ingredient, Supplier, IngredientRequest } from '../../types/inventory';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IngredientRequest) => Promise<void>;
  initialData?: Ingredient | null;
  suppliers: Supplier[];
  isLoading: boolean;
}

export function IngredientModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  suppliers,
  isLoading,
}: IngredientModalProps) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [minStock, setMinStock] = useState('0');
  const [unitCost, setUnitCost] = useState('0');
  const [supplierId, setSupplierId] = useState<string>('');
  const [expiryDays, setExpiryDays] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setUnit(initialData.unit);
      setMinStock(initialData.minStock.toString());
      setUnitCost(initialData.unitCost.toString());
      setSupplierId(initialData.supplierId?.toString() || '');
      setExpiryDays(initialData.expiryDays?.toString() || '');
    } else {
      setName('');
      setUnit('');
      setMinStock('0');
      setUnitCost('0');
      setSupplierId('');
      setExpiryDays('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Tên nguyên liệu không được trống';
    if (!unit.trim()) newErrors.unit = 'Đơn vị không được trống';
    
    const min = parseFloat(minStock);
    if (isNaN(min) || min < 0) newErrors.minStock = 'Tồn tối thiểu phải ≥ 0';

    const cost = parseFloat(unitCost);
    if (isNaN(cost) || cost < 0) newErrors.unitCost = 'Giá vốn phải ≥ 0';

    const exp = expiryDays ? parseInt(expiryDays) : null;
    if (exp !== null && (isNaN(exp) || exp <= 0)) {
      newErrors.expiryDays = 'Hạn sử dụng phải > 0 ngày';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit({
      name: name.trim(),
      unit: unit.trim(),
      minStock: min,
      unitCost: cost,
      supplierId: supplierId ? Number(supplierId) : undefined,
      expiryDays: expiryDays ? Number(expiryDays) : undefined,
    });
  };

  const supplierOptions = suppliers.map((sup) => ({
    value: sup.id,
    label: sup.name,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Chỉnh sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Tên nguyên liệu *"
          placeholder="Ví dụ: Hạt cà phê Robusta, Sữa đặc..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          disabled={isLoading}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Đơn vị tính *"
            placeholder="Ví dụ: kg, lít, hộp..."
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            error={errors.unit}
            disabled={isLoading}
            required
          />

          <Select
            label="Nhà cung cấp"
            placeholder="Chọn nhà cung cấp..."
            options={supplierOptions}
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tồn kho tối thiểu *"
            type="number"
            min="0"
            step="any"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
            error={errors.minStock}
            disabled={isLoading}
            required
          />

          <Input
            label="Giá vốn đơn vị (đ) *"
            type="number"
            min="0"
            step="any"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
            error={errors.unitCost}
            disabled={isLoading}
            required
          />
        </div>

        <Input
          label="Hạn sử dụng (ngày)"
          type="number"
          min="1"
          placeholder="Bỏ trống nếu không giới hạn"
          value={expiryDays}
          onChange={(e) => setExpiryDays(e.target.value)}
          error={errors.expiryDays}
          disabled={isLoading}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-amber-850 hover:bg-amber-900 text-white">
            {isLoading ? 'Đang lưu...' : 'Lưu lại'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
