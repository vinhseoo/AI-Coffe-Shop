import React, { useState, useEffect } from 'react';
import { Customer } from '../../types/customer';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';

interface RedeemPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (points: number, description: string) => Promise<void>;
  customer: Customer | null;
}

export function RedeemPointsModal({ isOpen, onClose, onSubmit, customer }: RedeemPointsModalProps) {
  const [points, setPoints] = useState<number | string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setPoints('');
      setDescription('');
      setErrors({});
    }
  }, [isOpen]);

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    const pts = Number(points);
    
    if (!points) {
      nextErrors.points = 'Vui lòng nhập số điểm muốn đổi';
    } else if (isNaN(pts) || pts <= 0 || !Number.isInteger(pts)) {
      nextErrors.points = 'Số điểm muốn đổi phải là số nguyên dương';
    } else if (customer && pts > customer.loyaltyPoints) {
      nextErrors.points = `Khách hàng hiện chỉ có ${customer.loyaltyPoints} điểm tích lũy`;
    }

    if (!description.trim()) {
      nextErrors.description = 'Vui lòng điền lý do/mô tả đổi quà';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !customer) return;

    setIsSubmitting(true);
    try {
      await onSubmit(Number(points), description.trim());
      onClose();
    } catch {
      // already handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Đổi điểm tích lũy thành viên"
      size="sm"
    >
      {customer && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-3.5 rounded-xl text-center space-y-0.5">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
              Khách hàng: {customer.name}
            </span>
            <p className="text-xl font-bold text-amber-900 dark:text-amber-400">
              {customer.loyaltyPoints} Điểm tích lũy
            </p>
            <p className="text-[9px] text-amber-700/80 dark:text-amber-500/80">
              (Hạng thẻ hiện tại: {customer.tier})
            </p>
          </div>

          <Input
            label="Số điểm muốn khấu trừ *"
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            error={errors.points}
            placeholder={`Tối đa: ${customer.loyaltyPoints}`}
            required
            autoFocus
          />

          <TextArea
            label="Lý do đổi quà / mô tả *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            placeholder="Ví dụ: Đổi 1 cốc Matcha Latte đá, hoặc trừ 50k vào hóa đơn..."
            rows={3}
            required
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" variant="danger" isLoading={isSubmitting}>
              Đổi điểm ngay
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
export default RedeemPointsModal;
