import React, { useEffect, useState } from 'react';
import { Ingredient } from '../../types/inventory';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { ingredientId: number; quantity: number; note?: string }) => Promise<void>;
  ingredient: Ingredient | null;
  isLoading: boolean;
}

export function AdjustStockModal({
  isOpen,
  onClose,
  onSubmit,
  ingredient,
  isLoading,
}: AdjustStockModalProps) {
  const [actualStock, setActualStock] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (ingredient) {
      setActualStock(ingredient.currentStock.toString());
      setNote('');
    } else {
      setActualStock('');
      setNote('');
    }
    setError('');
  }, [ingredient, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredient) return;

    const qty = parseFloat(actualStock);
    if (isNaN(qty) || qty < 0) {
      setError('Số lượng thực tế phải ≥ 0');
      return;
    }

    setError('');
    await onSubmit({
      ingredientId: ingredient.id,
      quantity: qty,
      note: note.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Cân đối tồn kho: ${ingredient?.name ?? ''}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="bg-amber-50/50 dark:bg-amber-950/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/20 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Tồn kho trên hệ thống:</span>
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {ingredient?.currentStock} {ingredient?.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Đơn vị:</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">{ingredient?.unit}</span>
          </div>
        </div>

        <Input
          label="Tồn kho thực tế *"
          type="number"
          step="any"
          min="0"
          value={actualStock}
          onChange={(e) => setActualStock(e.target.value)}
          error={error}
          disabled={isLoading}
          required
        />

        <Input
          label="Lý do điều chỉnh"
          placeholder="Ví dụ: Kiểm kho định kỳ, hàng hỏng, hao hụt..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isLoading}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-amber-850 hover:bg-amber-900 text-white">
            {isLoading ? 'Đang cập nhật...' : 'Xác nhận điều chỉnh'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
