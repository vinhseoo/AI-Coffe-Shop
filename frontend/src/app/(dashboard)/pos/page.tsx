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
import { formatCurrency } from '../../../lib/utils';
import { OrderType, PaymentMethod, CartItem } from '../../../types/order';
import { Topping } from '../../../types/menu';

export default function POSPage() {
  const { categories, menuItems, toppings, fetchCategories, fetchMenuItems, fetchToppings, isLoading: isMenuLoading } = useMenu();
  const { createOrder, confirmPayment, isLoading: isOrderLoading } = useOrders();
  const { settings } = useSettingsStore();

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

  const loadProducts = () => {
    fetchMenuItems(selectedCategoryId, searchQuery, 1, 100);
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
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6 -m-6 overflow-hidden">
      {/* ========================================================== */}
      {/* LEFT COLUMN: PRODUCT GRID */}
      {/* ========================================================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-950 p-6 overflow-y-auto">
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
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
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
              <span className="text-4xl">🍽️</span>
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
          <h3 className="font-bold text-gray-850 dark:text-white flex items-center gap-1.5 text-sm">
            🛒 Giỏ hàng ({cartItems.length} món)
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
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center space-y-2 py-12">
              <span className="text-4xl">☕</span>
              <p className="text-xs">Giỏ hàng còn trống.<br />Nhấp chọn kích thước (Size) của món để thêm.</p>
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
                    className="text-gray-400 hover:text-rose-500 text-sm"
                    title="Xóa món"
                  >
                    🗑️
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
                    className="text-[10px] text-amber-700 hover:underline font-semibold"
                  >
                    ✨ Thêm Topping
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
            className="w-full bg-amber-850 hover:bg-amber-900 text-white py-3 font-bold flex items-center justify-center gap-1.5"
          >
            {isOrderLoading ? 'Đang đặt đơn...' : '💸 Đặt hàng & Thanh toán'}
          </Button>
        </div>
      </div>

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
    </div>
  );
}
