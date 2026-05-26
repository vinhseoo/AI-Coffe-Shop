import React from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Ingredient, Supplier, InventoryLog, InventoryAction } from '../../types/inventory';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'ingredient' | 'supplier' | 'log';
  data: any;
}

export function DetailModal({ isOpen, onClose, type, data }: DetailModalProps) {
  if (!data) return null;

  const renderIngredient = (item: Ingredient) => {
    const isLow = item.currentStock < item.minStock;
    return (
      <div className="space-y-4 text-sm pt-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Tồn kho hiện tại</span>
            <span className={`text-lg font-bold ${isLow ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-white'}`}>
              {item.currentStock} {item.unit}
            </span>
          </div>

          <div className="bg-gray-50 dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Tồn tối thiểu (An toàn)</span>
            <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
              {item.minStock} {item.unit}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2.5">
          <div className="flex justify-between py-0.5">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Trạng thái tồn kho:</span>
            <span>
              {isLow ? (
                <Badge variant="danger" dot>Cần nhập gấp</Badge>
              ) : item.currentStock < item.minStock * 1.5 ? (
                <Badge variant="warning" dot>Sắp hết hàng</Badge>
              ) : (
                <Badge variant="success" dot>An toàn</Badge>
              )}
            </span>
          </div>

          <div className="flex justify-between py-0.5 border-t border-gray-50 dark:border-gray-900 pt-2">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Giá vốn ước tính:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(item.unitCost)} / {item.unit}
            </span>
          </div>

          <div className="flex justify-between py-0.5 border-t border-gray-50 dark:border-gray-900 pt-2">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Hạn sử dụng:</span>
            <span className="font-semibold text-gray-850 dark:text-gray-200">
              {item.expiryDays ? `${item.expiryDays} ngày` : 'Không giới hạn'}
            </span>
          </div>

          <div className="flex justify-between py-0.5 border-t border-gray-50 dark:border-gray-900 pt-2">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Nhà cung cấp chính:</span>
            <span className="font-semibold text-gray-850 dark:text-gray-200">
              {item.supplierName ?? 'Chưa chỉ định'}
            </span>
          </div>
          
          {item.supplierPhone && (
            <div className="flex justify-between py-0.5">
              <span className="text-gray-500 dark:text-gray-400 font-medium">SĐT Nhà cung cấp:</span>
              <span className="text-gray-700 dark:text-gray-300">{item.supplierPhone}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSupplier = (item: Supplier) => {
    return (
      <div className="space-y-4 text-sm pt-2">
        <div className="space-y-3">
          <div className="bg-gray-50/50 dark:bg-gray-950/20 p-3 rounded-lg border border-gray-100 dark:border-gray-800 space-y-2">
            <div>
              <span className="text-xs text-gray-400 block mb-0.5">Số điện thoại</span>
              <span className="font-semibold text-gray-850 dark:text-gray-200 text-sm">
                {item.phone ?? '—'}
              </span>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800/60 pt-2">
              <span className="text-xs text-gray-400 block mb-0.5">Email</span>
              <span className="font-semibold text-gray-850 dark:text-gray-200 text-sm">
                {item.email ?? '—'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1 font-semibold">Địa chỉ nhà xưởng/kho</span>
            <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {item.address ?? 'Chưa cập nhật địa chỉ'}
            </div>
          </div>

          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1 font-semibold">Ghi chú đối tác</span>
            <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line min-h-[80px]">
              {item.note ?? 'Không có ghi chú thêm.'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLog = (item: InventoryLog) => {
    const getActionBadge = (act: InventoryAction) => {
      switch (act) {
        case 'IMPORT':
          return <Badge variant="success">Nhập kho</Badge>;
        case 'EXPORT':
          return <Badge variant="danger">Xuất kho</Badge>;
        case 'ADJUST':
          return <Badge variant="warning">Điều chỉnh</Badge>;
        case 'AUTO_DEDUCT':
          return <Badge variant="info">Trừ tự động</Badge>;
        default:
          return <Badge variant="default">{act}</Badge>;
      }
    };

    return (
      <div className="space-y-4 text-sm pt-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Số lượng thay đổi</span>
            <span className={`text-lg font-bold ${item.action === 'IMPORT' ? 'text-emerald-600 dark:text-emerald-400' : item.action === 'EXPORT' || item.action === 'AUTO_DEDUCT' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {item.action === 'IMPORT' ? '+' : item.action === 'EXPORT' || item.action === 'AUTO_DEDUCT' ? '-' : ''}
              {item.quantity} {item.unit}
            </span>
          </div>

          <div className="bg-gray-50 dark:bg-gray-950 p-3 rounded-lg border border-gray-150 dark:border-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Tổng chi phí trị giá</span>
            <span className="text-lg font-bold text-gray-800 dark:text-gray-250">
              {item.totalCost && item.totalCost > 0 ? formatCurrency(item.totalCost) : '—'}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2.5">
          <div className="flex justify-between py-0.5">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Nguyên vật liệu:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{item.ingredientName}</span>
          </div>

          <div className="flex justify-between py-0.5">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Loại giao dịch:</span>
            <span>{getActionBadge(item.action)}</span>
          </div>

          <div className="flex justify-between py-0.5 border-t border-gray-50 dark:border-gray-900 pt-2">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Đơn giá vốn giao dịch:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {item.unitCost ? `${formatCurrency(item.unitCost)} / ${item.unit}` : '—'}
            </span>
          </div>

          <div className="flex justify-between py-0.5 border-t border-gray-50 dark:border-gray-900 pt-2">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Thời gian ghi nhận:</span>
            <span className="text-gray-700 dark:text-gray-300">{formatDate(item.createdAt)}</span>
          </div>

          <div className="flex justify-between py-0.5">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Người thực hiện:</span>
            <span className="text-gray-700 dark:text-gray-300 font-semibold">{item.createdBy ?? 'Hệ thống'}</span>
          </div>

          {item.referenceId && (
            <div className="flex justify-between py-0.5">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Mã đơn hàng liên kết:</span>
              <span className="text-gray-700 dark:text-gray-300 font-mono">#{item.referenceId}</span>
            </div>
          )}

          <div className="border-t border-gray-100 dark:border-gray-800 pt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1 font-semibold">Ghi chú giao dịch</span>
            <div className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
              {item.note ?? 'Không có ghi chú kèm theo.'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getTitle = () => {
    switch (type) {
      case 'ingredient':
        return `Chi tiết nguyên liệu: ${data.name}`;
      case 'supplier':
        return `Thông tin nhà cung cấp: ${data.name}`;
      case 'log':
        return `Chi tiết biến động kho #${data.id}`;
      default:
        return 'Chi tiết thông tin';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="md">
      {type === 'ingredient' && renderIngredient(data)}
      {type === 'supplier' && renderSupplier(data)}
      {type === 'log' && renderLog(data)}
    </Modal>
  );
}
