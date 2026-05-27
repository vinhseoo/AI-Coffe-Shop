'use client';

import React, { useEffect, useState } from 'react';
import { useOrders } from '../../../hooks/useOrders';
import { OrderDetailModal } from '../../../components/order/OrderDetailModal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { Pagination } from '../../../components/ui/Pagination';
import { Spinner } from '../../../components/ui/Spinner';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../../components/ui/Table';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Order, OrderStatus, PaymentMethod, PaymentStatus } from '../../../types/order';
import { ScrollText, Search, RefreshCw, Eye, CreditCard, Coffee, Check, Trash2 } from 'lucide-react';

export default function OrdersPage() {
  const {
    isLoading,
    orders,
    selectedOrder,
    pagination,
    fetchOrders,
    updateOrderStatus,
    confirmPayment,
  } = useOrders();

  // Filters state
  const [activeStatusTab, setActiveStatusTab] = useState<string>(''); // empty means all
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');

  // Modals state
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeDetailOrder, setActiveDetailOrder] = useState<Order | null>(null);

  // Payment Confirmation Modal state
  const [isPayConfirmOpen, setIsPayConfirmOpen] = useState(false);
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CASH');

  // Load orders initial & on filter change
  useEffect(() => {
    loadOrdersData();
  }, [activeStatusTab, paymentStatusFilter, searchQuery]);

  const loadOrdersData = (page = 1) => {
    fetchOrders(
      {
        search: searchQuery,
        status: activeStatusTab || undefined,
        paymentStatus: paymentStatusFilter || undefined,
      },
      page,
      10
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleOpenDetail = (order: Order) => {
    setActiveDetailOrder(order);
    setIsDetailOpen(true);
  };

  const handleOpenPayConfirm = (order: Order) => {
    setPayingOrder(order);
    setPayMethod('CASH');
    setIsPayConfirmOpen(true);
  };

  const handleConfirmPaySubmit = async () => {
    if (!payingOrder) return;
    try {
      await confirmPayment(payingOrder.id, payMethod);
      setIsPayConfirmOpen(false);
      setPayingOrder(null);
      loadOrdersData(pagination.pageNumber);
    } catch (err) {}
  };

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      loadOrdersData(pagination.pageNumber);
    } catch (err) {}
  };

  // Badge mapping helper
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Đang chờ</Badge>;
      case 'PREPARING':
        return <Badge variant="info">Pha chế</Badge>;
      case 'COMPLETED':
        return <Badge variant="success">Hoàn thành</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Đã hủy</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    return status === 'PAID' ? (
      <Badge variant="success" size="sm">Đã thanh toán</Badge>
    ) : (
      <Badge variant="danger" size="sm">Chưa trả tiền</Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <ScrollText className="h-6 w-6 text-amber-850" /> Lịch sử & Quản lý đơn hàng
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Theo dõi trạng thái pha chế tại quầy, cập nhật thanh toán và kiểm tra chi tiết hóa đơn khách hàng.
        </p>
      </div>

      {/* Tabs Menu Status */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-1.5 rounded-xl gap-1">
        {[
          { key: '', label: 'Tất cả đơn' },
          { key: 'PENDING', label: 'Chờ xử lý' },
          { key: 'PREPARING', label: 'Đang pha chế' },
          { key: 'COMPLETED', label: 'Đã hoàn thành' },
          { key: 'CANCELLED', label: 'Đã hủy' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveStatusTab(tab.key)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeStatusTab === tab.key
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-bold'
                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toolbar filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-gray-900 p-4 border border-gray-150 dark:border-gray-800 rounded-xl shadow-sm">
        <div className="relative">
          <Input
            placeholder="Tìm theo mã đơn (ví dụ: OD-154)..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9"
          />
          <span className="absolute left-3 top-3 text-gray-450">
            <Search className="h-4 w-4" />
          </span>
        </div>

        <Select
          label="Trạng thái thanh toán"
          placeholder="Tất cả trạng thái"
          options={[
            { value: 'UNPAID', label: 'Chưa thanh toán' },
            { value: 'PAID', label: 'Đã thanh toán' },
          ]}
          value={paymentStatusFilter}
          onChange={(e) => setPaymentStatusFilter(e.target.value)}
        />

        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setActiveStatusTab('');
              setPaymentStatusFilter('');
            }}
            className="w-full justify-center h-10 gap-1.5"
          >
            <RefreshCw className="h-4 w-4" /> Reset Bộ lọc
          </Button>
        </div>
      </div>

      {/* Orders List Table */}
      {isLoading && orders.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Bàn số</TableHead>
                  <TableHead>Món nước / Toppings</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Hình thức thanh toán</TableHead>
                  <TableHead>Trạng thái trả tiền</TableHead>
                  <TableHead>Trạng thái đơn</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableEmpty message="Không tìm thấy đơn hàng nào khớp bộ lọc." />
                ) : (
                  orders.map((order) => {
                    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                    const itemsPreview = order.items
                      .map((item) => `${item.menuItemName} (x${item.quantity})`)
                      .join(', ');

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-bold text-gray-900 dark:text-white">
                          {order.orderCode}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="font-semibold">{order.tableNumber ?? 'Mang đi'}</TableCell>
                        <TableCell className="max-w-[220px] truncate text-xs" title={itemsPreview}>
                          {itemsPreview}
                        </TableCell>
                        <TableCell className="font-bold text-amber-850 dark:text-amber-400">
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {order.paymentMethod === 'CASH' ? '💵 Tiền mặt' : 
                           order.paymentMethod === 'TRANSFER' ? '🏦 C/k khoản' : 
                           order.paymentMethod === 'MOMO' ? '🍑 MoMo' : 
                           order.paymentMethod === 'ZALOPAY' ? '💚 ZaloPay' : order.paymentMethod}
                        </TableCell>
                        <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDetail(order)}
                              className="py-1 px-2.5 h-8 text-xs border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-blue-950/20 animate-fade-in gap-1.5"
                            >
                              <Eye className="h-3.5 w-3.5" /> Chi tiết
                            </Button>

                            {/* Payment actions */}
                            {order.paymentStatus === 'UNPAID' && order.status !== 'CANCELLED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenPayConfirm(order)}
                                className="py-1 px-2.5 h-8 text-xs border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 dark:border-emerald-950/20 gap-1.5"
                              >
                                <CreditCard className="h-3.5 w-3.5" /> Trả tiền
                              </Button>
                            )}

                            {/* Status transitions */}
                            {order.status === 'PENDING' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(order.id, 'PREPARING')}
                                className="py-1 px-2.5 h-8 text-xs border-amber-200 hover:bg-amber-50 hover:text-amber-850 gap-1.5"
                              >
                                <Coffee className="h-3.5 w-3.5" /> Làm nước
                              </Button>
                            )}

                            {order.status === 'PREPARING' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                                className="py-1 px-2.5 h-8 text-xs border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 gap-1.5"
                              >
                                <Check className="h-3.5 w-3.5" /> Xong
                              </Button>
                            )}

                            {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (confirm(`Bạn chắc chắn muốn hủy đơn hàng "${order.orderCode}"?`)) {
                                    handleStatusChange(order.id, 'CANCELLED');
                                  }
                                }}
                                className="py-1 px-2.5 h-8 text-xs border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-rose-950/20 gap-1.5"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Hủy đơn
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <Pagination
            currentPage={pagination.pageNumber - 1}
            totalPages={pagination.totalPages}
            totalElements={pagination.totalElements}
            pageSize={pagination.pageSize}
            onPageChange={(page) => loadOrdersData(page + 1)}
          />
        </div>
      )}

      {/* ========================================================== */}
      {/* ORDER DETAIL MODAL */}
      {/* ========================================================== */}
      <OrderDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setActiveDetailOrder(null);
        }}
        order={activeDetailOrder}
      />

      {/* ========================================================== */}
      {/* CONFIRM PAYMENT MODAL */}
      {/* ========================================================== */}
      {/* Render pay confirmation options when needed */}
      {isPayConfirmOpen && payingOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-950 dark:text-white">Thanh toán hóa đơn: {payingOrder.orderCode}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Món nước: {payingOrder.items.map((i) => i.menuItemName).join(', ')}
            </p>
            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 border border-amber-100 dark:border-amber-900/30 rounded-xl text-center">
              <span className="text-xs text-gray-400">Tổng thu</span>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-400 mt-0.5">
                {formatCurrency(payingOrder.totalAmount)}
              </p>
            </div>
            
            <div className="space-y-1">
              <span className="text-xs text-gray-450 block font-semibold">Chọn hình thức nhận tiền:</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'CASH', label: '💵 Tiền mặt' },
                  { value: 'TRANSFER', label: '🏦 Chuyển khoản' },
                  { value: 'MOMO', label: '🍑 MoMo' },
                  { value: 'ZALOPAY', label: '💚 ZaloPay' },
                ].map((pm) => (
                  <button
                    key={pm.value}
                    onClick={() => setPayMethod(pm.value as PaymentMethod)}
                    className={`p-2.5 border rounded-lg text-xs font-bold text-left ${
                      payMethod === pm.value 
                        ? 'bg-amber-50 border-amber-850 text-amber-900 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-300' 
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <Button variant="outline" onClick={() => { setIsPayConfirmOpen(false); setPayingOrder(null); }}>
                Hủy bỏ
              </Button>
              <Button onClick={handleConfirmPaySubmit} className="bg-amber-850 hover:bg-amber-900 text-white font-bold">
                Xác nhận nhận tiền
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
