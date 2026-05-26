import React, { useState } from 'react';
import { Ingredient, ImportItem } from '../../types/inventory';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { formatCurrency } from '../../lib/utils';

interface ImportFormProps {
  ingredients: Ingredient[];
  onSubmit: (data: { items: ImportItem[]; note: string }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

interface FormRow {
  key: string; // unique key for list rendering
  ingredientId: string;
  quantity: string;
  unitCost: string;
  note: string;
}

export function ImportForm({ ingredients, onSubmit, onCancel, isLoading }: ImportFormProps) {
  const [rows, setRows] = useState<FormRow[]>([
    { key: 'row-0', ingredientId: '', quantity: '', unitCost: '', note: '' }
  ]);
  const [overallNote, setOverallNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const ingredientOptions = ingredients.map((ing) => ({
    value: ing.id,
    label: `${ing.name} (${ing.unit})`
  }));

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        key: `row-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        ingredientId: '',
        quantity: '',
        unitCost: '',
        note: ''
      }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length === 1) return;
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  const handleRowChange = (index: number, field: keyof FormRow, value: string) => {
    const newRows = [...rows];
    newRows[index] = {
      ...newRows[index],
      [field]: value
    };

    // If ingredient selected, prefill its unit cost from the ingredient model
    if (field === 'ingredientId' && value) {
      const selectedIng = ingredients.find(ing => ing.id === Number(value));
      if (selectedIng) {
        newRows[index].unitCost = selectedIng.unitCost.toString();
      }
    }

    setRows(newRows);
  };

  // Grand total calculation
  const grandTotal = rows.reduce((total, row) => {
    const qty = parseFloat(row.quantity) || 0;
    const cost = parseFloat(row.unitCost) || 0;
    return total + (qty * cost);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate rows
    const validatedItems: ImportItem[] = [];
    rows.forEach((row, index) => {
      if (!row.ingredientId) {
        newErrors[`${index}-ingredient`] = 'Vui lòng chọn nguyên liệu';
      }
      const qty = parseFloat(row.quantity);
      if (isNaN(qty) || qty <= 0) {
        newErrors[`${index}-quantity`] = 'Phải > 0';
      }
      const cost = parseFloat(row.unitCost);
      if (isNaN(cost) || cost < 0) {
        newErrors[`${index}-unitCost`] = 'Phải ≥ 0';
      }

      if (row.ingredientId && qty > 0 && cost >= 0) {
        validatedItems.push({
          ingredientId: Number(row.ingredientId),
          quantity: qty,
          unitCost: cost,
          note: row.note || undefined
        });
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    await onSubmit({
      items: validatedItems,
      note: overallNote
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl shadow-sm p-6 overflow-hidden">
        <h2 className="text-lg font-bold text-gray-850 dark:text-white mb-4">Chi tiết nguyên liệu nhập kho</h2>
        
        <div className="space-y-4">
          {rows.map((row, index) => {
            const rowTotal = (parseFloat(row.quantity) || 0) * (parseFloat(row.unitCost) || 0);
            return (
              <div 
                key={row.key} 
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/30 dark:bg-gray-950/20 relative group transition-all"
              >
                {/* Ingredient Select */}
                <div className="md:col-span-4">
                  <Select
                    label={index === 0 ? "Nguyên liệu" : undefined}
                    placeholder="Chọn nguyên liệu..."
                    options={ingredientOptions}
                    value={row.ingredientId}
                    onChange={(e) => handleRowChange(index, 'ingredientId', e.target.value)}
                    error={errors[`${index}-ingredient`]}
                    disabled={isLoading}
                  />
                </div>

                {/* Quantity */}
                <div className="md:col-span-2">
                  <Input
                    label={index === 0 ? "Số lượng" : undefined}
                    type="number"
                    step="any"
                    min="0.01"
                    placeholder="0"
                    value={row.quantity}
                    onChange={(e) => handleRowChange(index, 'quantity', e.target.value)}
                    error={errors[`${index}-quantity`]}
                    disabled={isLoading}
                  />
                </div>

                {/* Unit Cost */}
                <div className="md:col-span-2">
                  <Input
                    label={index === 0 ? "Đơn giá (đ)" : undefined}
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0"
                    value={row.unitCost}
                    onChange={(e) => handleRowChange(index, 'unitCost', e.target.value)}
                    error={errors[`${index}-unitCost`]}
                    disabled={isLoading}
                  />
                </div>

                {/* Total Cost Display */}
                <div className="md:col-span-2 pb-2">
                  {index === 0 && (
                    <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Thành tiền
                    </span>
                  )}
                  <span className="font-semibold text-gray-800 dark:text-gray-200 block truncate">
                    {formatCurrency(rowTotal)}
                  </span>
                </div>

                {/* Row Note */}
                <div className="md:col-span-1.5">
                  <Input
                    label={index === 0 ? "Ghi chú" : undefined}
                    placeholder="Ghi chú dòng"
                    value={row.note}
                    onChange={(e) => handleRowChange(index, 'note', e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {/* Remove button */}
                <div className="md:col-span-0.5 flex justify-end pb-1">
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(index)}
                    disabled={rows.length === 1 || isLoading}
                    className="h-8 w-8 rounded-lg flex items-center justify-center border border-rose-250 text-rose-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Xóa dòng này"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddRow}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-amber-700 hover:bg-amber-50"
          >
            ➕ Thêm dòng nguyên liệu
          </Button>

          <div className="text-right">
            <span className="text-sm text-gray-500 dark:text-gray-400">Tổng chi phí nhập:</span>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-400">
              {formatCurrency(grandTotal)}
            </div>
          </div>
        </div>
      </div>

      {/* Overall note & actions */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl shadow-sm p-6 space-y-4">
        <TextArea
          label="Ghi chú phiếu nhập kho"
          placeholder="Lý do nhập kho, số hóa đơn nhà cung cấp, thông tin bổ sung..."
          value={overallNote}
          onChange={(e) => setOverallNote(e.target.value)}
          disabled={isLoading}
          rows={3}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-amber-850 hover:bg-amber-900 text-white flex items-center gap-1.5"
          >
            {isLoading ? 'Đang lưu...' : '📥 Hoàn tất Nhập kho'}
          </Button>
        </div>
      </div>
    </form>
  );
}
