'use client';

import React, { useEffect, useState } from 'react';
import { useMenu } from '../../../hooks/useMenu';
import { useOrders } from '../../../hooks/useOrders';
import { useCartStore } from '../../../store/cartStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';
import { Modal } from '../../../components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../../components/ui/Table';
import { Pagination } from '../../../components/ui/Pagination';
import { OrderDetailModal } from '../../../components/order/OrderDetailModal';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Order, OrderType, PaymentMethod, CartItem, OrderStatus, PaymentStatus } from '../../../types/order';
import { Topping } from '../../../types/menu';
import { 
  Search, 
  ShoppingCart, 
  History, 
  Trash2, 
  Sparkles, 
  RefreshCw, 
  Coffee,
  Coins,
  Utensils
} from 'lucide-react';

export default function POSPage() {
  const { categories, menuItems, toppings, fetchCategories, fetchMenuItems, fetchToppings, isLoading: isMenuLoading } = useMenu();
  const { 
    createOrder, 
    confirmPayment, 
    isLoading: isOrderLoading,
    orders,
    pagination,
    fetchOrders,
    updateOrderStatus
  } = useOrders();
  const { settings } = useSettingsStore();

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<'sales' | 'history'>('sales');

  // Cart Zustand store values
  const {
    items: cartItems,
    tableNumber,
    note: cartNote,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setTableNumber,
    setNote: setCartNote,
    subtotal: getCartSubtotal
  } = useCartStore();

  // POS Component States
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

  // Toppings Modal State (for specific item in cart)
  const [isToppingsModalOpen, setIsToppingsModalOpen] = useState(false);
  const [activeCartItemIndex, setActiveCartItemIndex] = useState<number | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<Array<{ toppingId: number; quantity: number }>>([]);

  // Order History Filter & Modal States
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyOrderType, setHistoryOrderType] = useState<string>('');
  const [historyOrderStatus, setHistoryOrderStatus] = useState<string>('');
  const [historyPaymentStatus, setHistoryPaymentStatus] = useState<string>('');
  
  // History detail & pay modals
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeDetailOrder, setActiveDetailOrder] = useState<Order | null>(null);
  const [isPayConfirmOpen, setIsPayConfirmOpen] = useState(false);
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CASH');

  // Load Menu and Categories
  useEffect(() => {
    fetchCategories(true);
    fetchToppings(true);
    loadProducts();
  }, []);

  // Reload products when search or category filter changes
  useEffect(() => {
    loadProducts();
  }, [selectedCategoryId, searchQuery]);

  // Load history orders when activeTab is history or when filters change
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistoryOrders(1);
    }
  }, [activeTab, historySearchQuery, historyOrderType, historyOrderStatus, historyPaymentStatus]);

  const loadProducts = () => {
    fetchMenuItems(selectedCategoryId, searchQuery, 1, 100);
  };

  const loadHistoryOrders = (page = 1) => {
    fetchOrders(
      {
        search: historySearchQuery || undefined,
        type: historyOrderType || undefined,
        status: historyOrderStatus || undefined,
        paymentStatus: historyPaymentStatus || undefined,
      },
      page,
      10
    );
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
      loadHistoryOrders(pagination.pageNumber);
    } catch (err) {}
  };

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      loadHistoryOrders(pagination.pageNumber);
    } catch (err) {}
  };

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

  // Add Item to cart with specific size variant
  const handleAddItemToCart = (product: any, variant: any) => {
    const cartItem: CartItem = {
      menuItemId: variant.id, // we map menuItemId to variantId in frontend CartItem
      name: `${product.name} (${variant.size})`,
      price: variant.price,
      quantity: 1,
      toppings: [],
    };
    addItem(cartItem);
  };

  // Topping Selection Handler
  const handleOpenToppings = (index: number) => {
    setActiveCartItemIndex(index);
    const item = cartItems[index];
    setSelectedToppings(
      item.toppings.map((t) => ({
        toppingId: t.toppingId,
        quantity: t.quantity,
      }))
    );
    setIsToppingsModalOpen(true);
  };

  const handleToggleTopping = (topping: Topping) => {
    setSelectedToppings((prev) => {
      const existing = prev.find((t) => t.toppingId === topping.id);
      if (existing) {
        // remove if toggle off
        return prev.filter((t) => t.toppingId !== topping.id);
      } else {
        // add with qty 1
        return [...prev, { toppingId: topping.id, quantity: 1 }];
      }
    });
  };

  const handleSaveToppings = () => {
    if (activeCartItemIndex === null) return;
    
    // Map selected toppings to CartItem toppings
    const updatedToppings = selectedToppings.map((st) => {
      const originalTopping = toppings.find((t) => t.id === st.toppingId)!;
      return {
        toppingId: st.toppingId,
        name: originalTopping.name,
        price: originalTopping.price,
        quantity: st.quantity,
      };
    });

    // Update inside store by removing and re-adding or direct override
    // Simple way: mutate items directly in zustand (or customize update)
    useCartStore.setState((state) => {
      const newItems = [...state.items];
      newItems[activeCartItemIndex] = {
        ...newItems[activeCartItemIndex],
        toppings: updatedToppings,
      };
      return { items: newItems };
    });

    setIsToppingsModalOpen(false);
    setActiveCartItemIndex(null);
  };

  // Checkout submission
  const handleCheckoutSubmit = async () => {
    if (cartItems.length === 0) return;

    const requestItems = cartItems.map((item) => ({
      menuItemVariantId: item.menuItemId, // item.menuItemId stores variant.id
      quantity: item.quantity,
      note: item.note,
      toppings: item.toppings.map((t) => ({
        toppingId: t.toppingId,
        quantity: t.quantity,
      })),
    }));

    const createRequest = {
      orderType,
      tableNumber: orderType === 'DINE_IN' ? tableNumber : undefined,
      note: cartNote,
      items: requestItems,
    };

    try {
      // 1. Send create order
      const newOrder = await createOrder(createRequest);
      
      // 2. Auto confirm payment (POS cashiers collect money immediately)
      await confirmPayment(newOrder.id, paymentMethod);

      // 3. Clear cart and close checkout modal
      clearCart();
      setIsCheckoutModalOpen(false);

      // 4. Switch to history tab to see new order
      setActiveTab('history');
    } catch (err) {
      // error toast is handled inside hooks
    }
  };

  // Computations
  const subtotal = getCartSubtotal();
  const taxRate = settings?.taxRate ?? 10;
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount;

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col -m-6 bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* ========================================================== */}
      {/* HEADER & TAB SELECTOR */}
      {/* ========================================================== */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-150 dark:border-gray-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded-xl text-amber-850 dark:text-amber-400">
            <Coffee className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-gray-850 dark:text-white tracking-tight">
              {settings?.shopName ?? 'CaféAI'} - Quầy bán hàng
            </h2>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">Hệ thống gọi món và ghi nhận doanh số thời gian thực</p>
          </div>
        </div>
        
        {/* Premium interactive tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-850/10 p-1 rounded-xl gap-1 border border-gray-200/10 shadow-inner">
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'sales'
                ? 'bg-amber-850 text-white shadow-md scale-[1.03] translate-y-[-0.5px]'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50'
            }`}
          >
            <ShoppingCart className="h-4 w-4 shrink-0" />
            Gọi món & Bán hàng
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
            }}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-amber-850 text-white shadow-md scale-[1.03] translate-y-[-0.5px]'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/50'
            }`}
          >
            <History className="h-4 w-4 shrink-0" />
            Lịch sử đơn hàng
          </button>
        </div>
      </div>

      {activeTab === 'sales' ? (
        <div className="flex-1 flex flex-col md:flex-row gap-6 p-6 overflow-hidden">
          {/* ========================================================== */}
          {/* LEFT COLUMN: PRODUCT GRID */}
          {/* ========================================================== */}
          <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-950 overflow-y-auto">
            {/* Search & Categories */}
            <div className="space-y-4 shrink-0">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Tìm tên đồ uống, đồ ăn..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                  />
                  <span className="absolute left-3 top-3 text-gray-450">
                    <Search className="h-4 w-4" />
                  </span>
                </div>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Xóa lọc
                  </Button>
                )}
              </div>

              {/* Categories Selector */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all shrink-0 ${
                    selectedCategoryId === null
                      ? 'bg-amber-850 border-amber-850 text-white'
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-650 dark:text-gray-300'
                  }`}
                >
                  Tất cả
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all shrink-0 ${
                      selectedCategoryId === cat.id
                        ? 'bg-amber-850 border-amber-850 text-white'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-650 dark:text-gray-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="flex-1 mt-4">
              {isMenuLoading && menuItems.length === 0 ? (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : menuItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-center">
                  <Utensils className="h-10 w-10 text-gray-350 dark:text-gray-700 animate-pulse mb-2" />
                  <p className="mt-2 text-sm">Không tìm thấy món ăn nào khớp với bộ lọc.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {menuItems.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group h-44"
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="font-bold text-sm text-gray-850 dark:text-white line-clamp-2">
                            {prod.name}
                          </h4>
                          {prod.isBestseller && (
                            <Badge variant="warning" size="sm" className="shrink-0 scale-90">HOT</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1">{prod.description}</p>
                      </div>

                      <div className="space-y-2.5">
                        {/* Size Variants Actions */}
                        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                          {prod.variants && prod.variants.length > 0 ? (
                            prod.variants.map((v) => (
                              <button
                                key={v.id}
                                disabled={!v.isAvailable || !prod.isAvailable}
                                onClick={() => handleAddItemToCart(prod, v)}
                                className="bg-amber-50 hover:bg-amber-100 disabled:bg-gray-100 disabled:text-gray-400 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold py-1.5 px-1 rounded-lg text-[10px] text-center border border-amber-100 dark:border-amber-900/20 transition-colors flex flex-col items-center justify-center gap-0.5"
                              >
                                <span className="text-xs uppercase">{v.size}</span>
                                <span className="font-medium text-[9px] text-amber-700/80 dark:text-amber-400/80">
                                  {formatCurrency(v.price).replace('đ', '')}
                                </span>
                              </button>
                            ))
                          ) : (
                            <span className="text-[10px] text-rose-500 italic col-span-3">Chưa có size</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ========================================================== */}
          {/* RIGHT COLUMN: SHOPPING CART */}
          {/* ========================================================== */}
          <div className="w-full md:w-96 bg-white dark:bg-gray-900 border-t md:border-t-0 md:border-l border-gray-150 dark:border-gray-850 flex flex-col h-full shrink-0">
            {/* Cart Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-850 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
              <h3 className="font-bold text-gray-850 dark:text-white flex items-center gap-2 text-sm">
                <ShoppingCart className="h-4 w-4 text-amber-700 dark:text-amber-500" />
                Giỏ hàng ({cartItems.length} món)
              </h3>
              {cartItems.length > 0 && (
                <button onClick={clearCart} className="text-xs text-rose-600 hover:underline">
                  Xóa tất cả
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center space-y-3 py-12">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-305 dark:text-gray-700 animate-pulse">
                    <Coffee className="h-10 w-10 text-amber-850/60 dark:text-amber-500/60" />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-550">Giỏ hàng còn trống.<br />Nhấp chọn kích thước (Size) của món để thêm.</p>
                </div>
              ) : (
                cartItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-150 dark:border-gray-800 rounded-xl space-y-2 hover:border-amber-200 transition-colors relative group"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5">
                        <h5 className="font-bold text-xs text-gray-850 dark:text-white">{item.name}</h5>
                        <span className="text-xs font-semibold text-amber-850 dark:text-amber-400">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                      <button
                        onClick={() => removeItem(item.menuItemId)}
                        className="text-gray-450 hover:text-rose-600 transition-colors p-1"
                        title="Xóa món"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Toppings list */}
                    {item.toppings && item.toppings.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.toppings.map((t) => (
                          <span
                            key={t.toppingId}
                            className="inline-block bg-amber-50 dark:bg-amber-950/40 text-[9px] font-semibold text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-100/50"
                          >
                            +{t.name} ({t.quantity}x)
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Toppings & Note actions row */}
                    <div className="flex justify-between items-center gap-4 pt-2 border-t border-dashed border-gray-200 dark:border-gray-800">
                      <button
                        onClick={() => handleOpenToppings(idx)}
                        className="text-[10px] text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 transition-colors"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                        Thêm Topping
                      </button>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                          className="h-6 w-6 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex items-center justify-center text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-gray-850 dark:text-gray-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                          className="h-6 w-6 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex items-center justify-center text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Individual item note */}
                    <input
                      type="text"
                      placeholder="Ghi chú món (ví dụ: ít ngọt...)"
                      value={item.note || ''}
                      onChange={(e) => {
                        const note = e.target.value;
                        useCartStore.setState((state) => {
                          const newItems = [...state.items];
                          newItems[idx] = { ...newItems[idx], note };
                          return { items: newItems };
                        });
                      }}
                      className="w-full text-[10px] bg-transparent border-0 border-b border-gray-200 dark:border-gray-800 focus:ring-0 focus:border-amber-500 py-1"
                    />
                  </div>
                ))
              )}
            </div>

            {/* Invoice Summary and Checkout config */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-900/30 space-y-4 shrink-0">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block mb-1 font-semibold">Loại hóa đơn</span>
                  <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setOrderType('DINE_IN')}
                      className={`flex-1 py-1.5 font-bold ${
                        orderType === 'DINE_IN'
                          ? 'bg-amber-850 text-white'
                          : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Tại chỗ
                    </button>
                    <button
                      onClick={() => setOrderType('TAKEAWAY')}
                      className={`flex-1 py-1.5 font-bold ${
                        orderType === 'TAKEAWAY'
                          ? 'bg-amber-850 text-white'
                          : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Mang đi
                    </button>
                  </div>
                </div>

                {orderType === 'DINE_IN' && (
                  <div>
                    <Input
                      label="Số bàn"
                      placeholder="Bàn số..."
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="h-8 py-1 text-xs"
                    />
                  </div>
                )}
              </div>

              <Input
                placeholder="Ghi chú toàn hóa đơn..."
                value={cartNote}
                onChange={(e) => setCartNote(e.target.value)}
                className="text-xs py-1.5 h-8 bg-transparent"
              />

              {/* Pricing breakdowns */}
              <div className="space-y-1.5 text-xs border-t border-dashed border-gray-250 dark:border-gray-800 pt-3">
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Tạm tính:</span>
                  <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Thuế ({taxRate}%):</span>
                  <span className="font-semibold">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-1">
                  <span>Thành tiền:</span>
                  <span className="text-amber-850 dark:text-amber-400">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {/* Confirm checkout btn */}
              <Button
                onClick={() => setIsCheckoutModalOpen(true)}
                disabled={cartItems.length === 0 || isOrderLoading}
                className="w-full bg-amber-850 hover:bg-amber-900 text-white py-3 font-bold flex items-center justify-center gap-2"
              >
                {isOrderLoading ? 'Đang đặt đơn...' : (
                  <>
                    <Coins className="h-4 w-4" />
                    Đặt hàng & Thanh toán
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden p-6 gap-5 bg-gray-50 dark:bg-gray-950">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-white dark:bg-gray-900 p-4 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Input
                placeholder="Tìm mã đơn (ví dụ: OD-1)..."
                value={historySearchQuery}
                onChange={(e) => {
                  setHistorySearchQuery(e.target.value);
                }}
                className="pl-9 h-10 text-xs bg-gray-50/50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800"
              />
              <span className="absolute left-3 top-3 text-gray-450">
                <Search className="h-4 w-4" />
              </span>
            </div>

            {/* Order Type Filter */}
            <Select
              placeholder="Tất cả loại đơn"
              options={[
                { value: 'DINE_IN', label: 'Tại chỗ' },
                { value: 'TAKEAWAY', label: 'Mang đi' },
              ]}
              value={historyOrderType}
              onChange={(e) => setHistoryOrderType(e.target.value)}
              className="h-10 text-xs bg-gray-50/50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800"
            />

            {/* Order Status Filter */}
            <Select
              placeholder="Tất cả trạng thái đơn"
              options={[
                { value: 'PENDING', label: 'Chờ xử lý' },
                { value: 'PREPARING', label: 'Đang pha chế' },
                { value: 'COMPLETED', label: 'Hoàn thành' },
                { value: 'CANCELLED', label: 'Đã hủy' },
              ]}
              value={historyOrderStatus}
              onChange={(e) => setHistoryOrderStatus(e.target.value)}
              className="h-10 text-xs bg-gray-50/50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800"
            />

            {/* Payment Status Filter */}
            <Select
              placeholder="Tất cả thanh toán"
              options={[
                { value: 'UNPAID', label: 'Chưa thanh toán' },
                { value: 'PAID', label: 'Đã thanh toán' },
              ]}
              value={historyPaymentStatus}
              onChange={(e) => setHistoryPaymentStatus(e.target.value)}
              className="h-10 text-xs bg-gray-50/50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800"
            />

            {/* Reset filters */}
            <Button
              variant="outline"
              onClick={() => {
                setHistorySearchQuery('');
                setHistoryOrderType('');
                setHistoryOrderStatus('');
                setHistoryPaymentStatus('');
              }}
              className="h-10 text-xs justify-center hover:bg-gray-100 dark:hover:bg-gray-800 font-bold border-gray-200 dark:border-gray-800 gap-1.5"
            >
              <RefreshCw className="h-4 w-4" />
              Reset Bộ lọc
            </Button>
          </div>

          {/* Orders Table Area */}
          {isOrderLoading && orders.length === 0 ? (
            <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between overflow-hidden gap-4">
              <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 dark:bg-gray-900/50 hover:bg-transparent">
                      <TableHead className="font-bold text-gray-700 dark:text-gray-300">Mã đơn</TableHead>
                      <TableHead className="font-bold text-gray-700 dark:text-gray-300">Ngày đặt</TableHead>
                      <TableHead className="font-bold text-gray-700 dark:text-gray-300">Loại phục vụ</TableHead>
                      <TableHead className="font-bold text-gray-700 dark:text-gray-300">Chi tiết món nước</TableHead>
                      <TableHead className="font-bold text-gray-700 dark:text-gray-300">Tổng tiền</TableHead>
                      <TableHead className="font-bold text-gray-700 dark:text-gray-300">PTTT</TableHead>
                      <TableHead className="font-bold text-gray-700 dark:text-gray-300">Thanh toán</TableHead>
                      <TableHead className="font-bold text-gray-700 dark:text-gray-300">Trạng thái đơn</TableHead>
                      <TableHead className="text-right font-bold text-gray-700 dark:text-gray-300">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableEmpty message="Không tìm thấy đơn hàng nào khớp bộ lọc." />
                    ) : (
                      orders.map((order) => {
                        const itemsPreview = order.items
                          .map((item) => `${item.menuItemName} (x${item.quantity})`)
                          .join(', ');

                        return (
                          <TableRow key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-950/20 transition-colors animate-fade-in">
                            <TableCell className="font-bold text-gray-900 dark:text-white">
                              {order.orderCode}
                            </TableCell>
                            <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(order.createdAt)}
                            </TableCell>
                            <TableCell className="font-semibold text-xs">
                              {order.orderType === 'DINE_IN' ? `Tại chỗ (Bàn ${order.tableNumber ?? '?'})` : 'Mang đi'}
                            </TableCell>
                            <TableCell className="max-w-[180px] truncate text-xs text-gray-650 dark:text-gray-400" title={itemsPreview}>
                              {itemsPreview}
                            </TableCell>
                            <TableCell className="font-bold text-amber-850 dark:text-amber-400 text-xs">
                              {formatCurrency(order.totalAmount)}
                            </TableCell>
                            <TableCell className="text-xs">
                              {order.paymentStatus === 'UNPAID' ? (
                                <select
                                  value=""
                                  onChange={async (e) => {
                                    if (e.target.value) {
                                      try {
                                        await confirmPayment(order.id, e.target.value as PaymentMethod);
                                        loadHistoryOrders(pagination.pageNumber);
                                      } catch (err) {}
                                    }
                                  }}
                                  className="text-[11px] font-bold rounded-lg px-2.5 py-1.5 border border-rose-250 bg-rose-50 text-rose-850 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-300 cursor-pointer focus:outline-none transition-colors"
                                >
                                  <option value="" disabled>🔴 Chưa trả</option>
                                  <option value="CASH" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">💵 Tiền mặt</option>
                                  <option value="TRANSFER" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">🏦 C/k khoản</option>
                                  <option value="MOMO" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">🍑 MoMo</option>
                                  <option value="ZALOPAY" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">💚 ZaloPay</option>
                                </select>
                              ) : (
                                <select
                                  value={order.paymentMethod}
                                  onChange={async (e) => {
                                    try {
                                      await confirmPayment(order.id, e.target.value as PaymentMethod);
                                      loadHistoryOrders(pagination.pageNumber);
                                    } catch (err) {}
                                  }}
                                  className="text-[11px] font-bold rounded-lg px-2.5 py-1.5 border border-emerald-250 bg-emerald-50 text-emerald-805 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-300 cursor-pointer focus:outline-none transition-colors"
                                >
                                  <option value="CASH" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">💵 Tiền mặt</option>
                                  <option value="TRANSFER" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">🏦 C/k khoản</option>
                                  <option value="MOMO" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">🍑 MoMo</option>
                                  <option value="ZALOPAY" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">💚 ZaloPay</option>
                                </select>
                              )}
                            </TableCell>
                            <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                            <TableCell>
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                className={`text-[11px] font-bold rounded-lg px-2.5 py-1.5 border cursor-pointer focus:outline-none transition-colors ${
                                  order.status === 'PENDING'
                                    ? 'bg-amber-50 border-amber-250 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-300'
                                    : order.status === 'PREPARING'
                                    ? 'bg-blue-50 border-blue-250 text-blue-850 dark:bg-blue-950/40 dark:border-blue-900/50 dark:text-blue-300'
                                    : order.status === 'COMPLETED'
                                    ? 'bg-emerald-50 border-emerald-250 text-emerald-850 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300'
                                    : 'bg-rose-50 border-rose-250 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300'
                                }`}
                              >
                                <option value="PENDING" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">⌛ Chờ xử lý</option>
                                <option value="PREPARING" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">⚙️ Pha chế</option>
                                <option value="COMPLETED" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">✅ Hoàn thành</option>
                                <option value="CANCELLED" className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">❌ Đã hủy</option>
                              </select>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenDetail(order)}
                                  className="h-7 px-2.5 text-[11px] font-bold border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900/30 dark:hover:bg-blue-950/30"
                                >
                                  🔍 Chi tiết
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {orders.length > 0 && (
                <div className="shrink-0 pb-1">
                  <Pagination
                    currentPage={pagination.pageNumber - 1}
                    totalPages={pagination.totalPages}
                    totalElements={pagination.totalElements}
                    pageSize={pagination.pageSize}
                    onPageChange={(page) => loadHistoryOrders(page + 1)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* CHECKOUT & PAYMENT MODAL */}
      {/* ========================================================== */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title="Chọn phương thức thanh toán"
        size="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Tổng chi phí thanh toán</span>
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-400 mt-1">
              {formatCurrency(totalAmount)}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Hình thức thanh toán:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'CASH', label: '💵 Tiền mặt' },
                { value: 'TRANSFER', label: '🏦 Chuyển khoản' },
                { value: 'MOMO', label: '🍑 Ví MoMo' },
                { value: 'ZALOPAY', label: '💚 ZaloPay' },
              ].map((pm) => (
                <button
                  key={pm.value}
                  type="button"
                  onClick={() => setPaymentMethod(pm.value as PaymentMethod)}
                  className={`p-3 rounded-lg border text-xs font-bold text-left transition-colors ${
                    paymentMethod === pm.value
                      ? 'bg-amber-100 border-amber-850 text-amber-900 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-300'
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCheckoutModalOpen(false)}
              disabled={isOrderLoading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCheckoutSubmit}
              disabled={isOrderLoading}
              className="bg-amber-850 hover:bg-amber-900 text-white font-bold"
            >
              {isOrderLoading ? 'Đang thực hiện...' : '📥 Hoàn tất Thanh toán'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================== */}
      {/* TOPPINGS SELECTION MODAL */}
      {/* ========================================================== */}
      <Modal
        isOpen={isToppingsModalOpen}
        onClose={() => setIsToppingsModalOpen(false)}
        title="Thêm Topping cho nước uống"
        size="sm"
      >
        <div className="space-y-4 pt-2">
          {toppings.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Chưa có topping nào được cấu hình.</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {toppings.map((tp) => {
                const isSelected = selectedToppings.some((t) => t.toppingId === tp.id);
                return (
                  <button
                    key={tp.id}
                    type="button"
                    onClick={() => handleToggleTopping(tp)}
                    className={`w-full flex justify-between items-center p-3 rounded-lg border text-xs transition-colors ${
                      isSelected
                        ? 'bg-amber-50 border-amber-850 text-amber-900 dark:bg-amber-950/20 dark:border-amber-700 dark:text-amber-300 font-semibold'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span>{tp.name}</span>
                    <span className="font-semibold text-gray-500 dark:text-gray-400">
                      +{formatCurrency(tp.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsToppingsModalOpen(false)}
            >
              Đóng
            </Button>
            <Button
              onClick={handleSaveToppings}
              className="bg-amber-850 hover:bg-amber-900 text-white"
            >
              Áp dụng Topping
            </Button>
          </div>
        </div>
      </Modal>

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
