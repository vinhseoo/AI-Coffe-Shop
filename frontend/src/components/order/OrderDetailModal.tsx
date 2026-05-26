import React from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Order, OrderStatus, OrderType, PaymentMethod, PaymentStatus } from '../../types/order';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
  if (!order) return null;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning" dot>Chờ xử lý</Badge>;
      case 'PREPARING':
        return <Badge variant="info" dot>Đang pha chế</Badge>;
      case 'COMPLETED':
        return <Badge variant="success" dot>Hoàn thành</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger" dot>Đã hủy</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    return status === 'PAID' ? (
      <Badge variant="success">Đã thanh toán</Badge>
    ) : (
      <Badge variant="danger">Chưa thanh toán</Badge>
    );
  };

  const getOrderTypeLabel = (type: OrderType) => {
    switch (type) {
      case 'DINE_IN':
        return 'Tại chỗ';
      case 'TAKEAWAY':
        return 'Mang đi';
      case 'ONLINE':
        return 'Giao hàng';
      default:
        return type;
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'CASH':
        return '💵 Tiền mặt';
      case 'TRANSFER':
        return '🏦 Chuyển khoản';
      case 'MOMO':
        return '🍑 MoMo';
      case 'ZALOPAY':
        return '💚 ZaloPay';
      default:
        return method;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi tiết đơn hàng: ${order.orderCode}`}
      size="md"
    >
      <div className="space-y-5 text-sm pt-2">
        {/* Core Metadata */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-950 p-3 rounded-lg border border-gray-150 dark:border-gray-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Trạng thái đơn:</span>
              <span className="font-semibold">{getStatusBadge(order.status)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Loại phục vụ:</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {getOrderTypeLabel(order.orderType)}
                {order.tableNumber ? ` (Bàn ${order.tableNumber})` : ''}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-950 p-3 rounded-lg border border-gray-150 dark:border-gray-800 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Thanh toán:</span>
              <span className="font-semibold">{getPaymentStatusBadge(order.paymentStatus)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Phương thức:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {getPaymentMethodLabel(order.paymentMethod)}
              </span>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="border border-gray-150 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
          <div className="bg-gray-50/50 dark:bg-gray-900/50 p-3 border-b border-gray-150 dark:border-gray-800">
            <h4 className="font-bold text-xs text-gray-850 dark:text-white">Danh sách món ăn & nước uống</h4>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[220px] overflow-y-auto">
            {order.items.map((item) => (
              <div key={item.id} className="p-3 space-y-1 bg-white dark:bg-gray-900">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h5 className="font-bold text-xs text-gray-800 dark:text-gray-200">
                      {item.menuItemName}
                    </h5>
                    <span className="text-xs text-gray-450 dark:text-gray-500">
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </span>
                    {item.note && (
                      <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80 italic mt-0.5">
                        * Ghi chú: {item.note}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>

                {/* Toppings list */}
                {item.toppings && item.toppings.length > 0 && (
                  <div className="flex flex-col gap-0.5 pl-3 border-l border-amber-200 dark:border-amber-900/40 mt-1">
                    {item.toppings.map((t) => (
                      <div key={t.toppingId} className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400">
                        <span>+ Topping: {t.toppingName} ({t.quantity}x)</span>
                        <span>{formatCurrency(t.price * t.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pricing calculations */}
        <div className="space-y-1.5 border-t border-gray-100 dark:border-gray-800 pt-3 text-xs">
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Tạm tính món:</span>
            <span className="font-semibold">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Thuế VAT:</span>
            <span className="font-semibold">{formatCurrency(order.taxAmount)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Khuyến mãi giảm giá:</span>
              <span className="font-semibold">-{formatCurrency(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white pt-1.5 border-t border-dashed border-gray-200 dark:border-gray-800">
            <span>Tổng thanh toán:</span>
            <span className="text-amber-850 dark:text-amber-400">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2 text-xs">
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Thời gian đặt:</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Thu ngân thực hiện:</span>
            <span>{order.createdBy ?? 'Hệ thống'}</span>
          </div>
          {order.completedAt && (
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Thời gian hoàn thành:</span>
              <span>{formatDate(order.completedAt)}</span>
            </div>
          )}
          {order.note && (
            <div className="border-t border-gray-50 dark:border-gray-850 pt-2 text-xs">
              <span className="text-gray-400 font-semibold block mb-0.5">Ghi chú đơn hàng:</span>
              <p className="text-gray-600 dark:text-gray-450 whitespace-pre-line bg-gray-50/50 dark:bg-gray-950/20 p-2 rounded border border-gray-100 dark:border-gray-850 leading-relaxed">
                {order.note}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-850 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold rounded-lg text-xs transition-colors"
          >
            Đóng hóa đơn
          </button>
        </div>
      </div>
    </Modal>
  );
}
