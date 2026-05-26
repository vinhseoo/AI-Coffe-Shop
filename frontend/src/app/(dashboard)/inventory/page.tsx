'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useInventory } from '../../../hooks/useInventory';
import { StockTable } from '../../../components/inventory/StockTable';
import { IngredientModal } from '../../../components/inventory/IngredientModal';
import { SupplierModal } from '../../../components/inventory/SupplierModal';
import { AdjustStockModal } from '../../../components/inventory/AdjustStockModal';
import { DetailModal } from '../../../components/inventory/DetailModal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { Pagination } from '../../../components/ui/Pagination';
import { Alert } from '../../../components/ui/Alert';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../../components/ui/Table';
import { Spinner } from '../../../components/ui/Spinner';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { Ingredient, Supplier, InventoryAction } from '../../../types/inventory';

type TabType = 'ingredients' | 'suppliers' | 'logs';

export default function InventoryPage() {
  const {
    isLoading,
    ingredients,
    activeIngredients,
    lowStockIngredients,
    suppliers,
    logs,
    pagination,
    logPagination,
    fetchIngredients,
    fetchActiveIngredients,
    fetchLowStockIngredients,
    fetchSuppliers,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    adjustStock,
    fetchLogs,
  } = useInventory();

  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<TabType>('ingredients');

  // Ingredient search/modal state
  const [searchIngredient, setSearchIngredient] = useState('');
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  // Supplier modal state
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Stock adjustment modal state
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingIngredient, setAdjustingIngredient] = useState<Ingredient | null>(null);

  // Detail modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailType, setDetailType] = useState<'ingredient' | 'supplier' | 'log'>('ingredient');
  const [detailData, setDetailData] = useState<any>(null);

  // Log filter state
  const [logFilterIngredient, setLogFilterIngredient] = useState<string>('');
  const [logFilterAction, setLogFilterAction] = useState<string>('');

  // Initial Load
  useEffect(() => {
    fetchActiveIngredients();
    fetchLowStockIngredients();
    fetchSuppliers();
    loadIngredientsData();
  }, []);

  // Reload logs when filters change
  useEffect(() => {
    if (activeTab === 'logs') {
      loadLogsData();
    }
  }, [activeTab, logFilterIngredient, logFilterAction]);

  const loadIngredientsData = (search = searchIngredient, page = 1) => {
    fetchIngredients(search, page, 10);
  };

  const loadLogsData = (page = 1) => {
    const ingId = logFilterIngredient ? Number(logFilterIngredient) : undefined;
    const action = logFilterAction ? (logFilterAction as InventoryAction) : undefined;
    fetchLogs(ingId, action, page, 10);
  };

  const handleSearchIngredientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchIngredient(val);
    loadIngredientsData(val, 1);
  };

  // Ingredient CRUD handlers
  const handleIngredientSubmit = async (data: any) => {
    try {
      if (selectedIngredient) {
        await updateIngredient(selectedIngredient.id, data);
      } else {
        await createIngredient(data);
      }
      setIsIngredientModalOpen(false);
      setSelectedIngredient(null);
      loadIngredientsData();
      fetchActiveIngredients();
      fetchLowStockIngredients();
    } catch (err) {
      // toast is already handled inside hook
    }
  };

  const handleIngredientDelete = async (id: number) => {
    try {
      await deleteIngredient(id);
      loadIngredientsData();
      fetchActiveIngredients();
      fetchLowStockIngredients();
    } catch (err) {}
  };

  // Adjust stock handler
  const handleAdjustSubmit = async (data: any) => {
    try {
      await adjustStock(data);
      setIsAdjustModalOpen(false);
      setAdjustingIngredient(null);
      loadIngredientsData();
      fetchActiveIngredients();
      fetchLowStockIngredients();
    } catch (err) {}
  };

  // Supplier CRUD handlers
  const handleSupplierSubmit = async (data: any) => {
    try {
      if (selectedSupplier) {
        await updateSupplier(selectedSupplier.id, data);
      } else {
        await createSupplier(data);
      }
      setIsSupplierModalOpen(false);
      setSelectedSupplier(null);
      fetchSuppliers();
    } catch (err) {}
  };

  const handleSupplierDelete = async (id: number) => {
    try {
      await deleteSupplier(id);
      fetchSuppliers();
    } catch (err) {}
  };

  // Log action translation & coloring
  const getActionBadge = (action: InventoryAction) => {
    switch (action) {
      case 'IMPORT':
        return <Badge variant="success">Nhập kho</Badge>;
      case 'EXPORT':
        return <Badge variant="danger">Xuất kho</Badge>;
      case 'ADJUST':
        return <Badge variant="warning">Điều chỉnh</Badge>;
      case 'AUTO_DEDUCT':
        return <Badge variant="info">Trừ tự động</Badge>;
      default:
        return <Badge variant="default">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            📦 Quản lý Kho nguyên liệu
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Theo dõi tồn kho, quản lý nhà cung cấp, kiểm tra lịch sử biến động và nhận dự báo mua hàng từ AI.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/inventory/import">
            <Button className="bg-amber-850 hover:bg-amber-900 text-white flex items-center gap-1.5 shadow-sm">
              📥 Nhập kho hàng loạt
            </Button>
          </Link>
          <Link href="/inventory/ai-forecast">
            <Button variant="outline" className="border-amber-700 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              🤖 Dự báo bằng AI
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-1.5 rounded-xl gap-1">
        <button
          onClick={() => setActiveTab('ingredients')}
          className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'ingredients'
              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-bold'
              : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900'
          }`}
        >
          🥬 Danh mục Nguyên liệu ({pagination.totalElements})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'suppliers'
              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-bold'
              : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900'
          }`}
        >
          🏢 Nhà cung cấp ({suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'logs'
              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-bold'
              : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900'
          }`}
        >
          📜 Lịch sử biến động
        </button>
      </div>

      {/* ========================================================== */}
      {/* TAB 1: INGREDIENTS */}
      {/* ========================================================== */}
      {activeTab === 'ingredients' && (
        <div className="space-y-6">
          {/* Low Stock Warning Alert */}
          {lowStockIngredients.length > 0 && (
            <Alert variant="warning" className="border-red-200 bg-red-50/50 dark:bg-red-950/10">
              <div className="flex items-start gap-2.5">
                <span className="text-xl">⚠️</span>
                <div className="space-y-1">
                  <h4 className="font-bold text-red-800 dark:text-red-400 text-sm">
                    Cảnh báo tồn kho thấp!
                  </h4>
                  <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                    Có <strong>{lowStockIngredients.length}</strong> nguyên liệu đã chạm hoặc dưới mức tối thiểu. 
                    Nhấn vào nút "Dự báo bằng AI" hoặc "Nhập kho hàng loạt" ở góc phải để chuẩn bị bổ sung hàng.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {lowStockIngredients.map((item) => (
                      <span key={item.id} className="inline-block bg-red-100 dark:bg-red-950 text-red-850 dark:text-red-300 px-2 py-0.5 rounded text-xs font-semibold">
                        {item.name} ({item.currentStock}/{item.minStock} {item.unit})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Alert>
          )}

          {/* Filtering toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-900 p-4 border border-gray-150 dark:border-gray-800 rounded-xl shadow-sm">
            <div className="w-full sm:max-w-md relative">
              <Input
                placeholder="Tìm kiếm nguyên liệu..."
                value={searchIngredient}
                onChange={handleSearchIngredientChange}
                className="w-full pl-9"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>

            <Button
              onClick={() => {
                setSelectedIngredient(null);
                setIsIngredientModalOpen(true);
              }}
              className="w-full sm:w-auto bg-amber-850 hover:bg-amber-900 text-white"
            >
              ➕ Thêm nguyên liệu
            </Button>
          </div>

          {/* Table */}
          {isLoading && ingredients.length === 0 ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-4">
              <StockTable
                items={ingredients}
                onView={(item) => {
                  setDetailData(item);
                  setDetailType('ingredient');
                  setIsDetailModalOpen(true);
                }}
                onEdit={(item) => {
                  setSelectedIngredient(item);
                  setIsIngredientModalOpen(true);
                }}
                onAdjust={(item) => {
                  setAdjustingIngredient(item);
                  setIsAdjustModalOpen(true);
                }}
                onDelete={handleIngredientDelete}
              />

              <Pagination
                currentPage={pagination.pageNumber - 1}
                totalPages={pagination.totalPages}
                totalElements={pagination.totalElements}
                pageSize={pagination.pageSize}
                onPageChange={(page) => loadIngredientsData(searchIngredient, page + 1)}
              />
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 2: SUPPLIERS */}
      {/* ========================================================== */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-4 border border-gray-150 dark:border-gray-800 rounded-xl shadow-sm">
            <h3 className="font-bold text-gray-800 dark:text-white text-base">Danh sách đối tác cung cấp</h3>
            <Button
              onClick={() => {
                setSelectedSupplier(null);
                setIsSupplierModalOpen(true);
              }}
              className="bg-amber-850 hover:bg-amber-900 text-white"
            >
              ➕ Thêm nhà cung cấp
            </Button>
          </div>

          {isLoading && suppliers.length === 0 ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
                    <TableHead>Tên nhà cung cấp</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Địa chỉ</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.length === 0 ? (
                    <TableEmpty message="Chưa cấu hình nhà cung cấp nào." />
                  ) : (
                    suppliers.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.phone ?? '—'}</TableCell>
                        <TableCell>{item.email ?? '—'}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{item.address ?? '—'}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-gray-400">{item.note ?? '—'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDetailData(item);
                                setDetailType('supplier');
                                setIsDetailModalOpen(true);
                              }}
                              className="py-1 px-2.5 h-8 text-xs border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-blue-950/20"
                            >
                              🔍 Xem
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSupplier(item);
                                setIsSupplierModalOpen(true);
                              }}
                              className="py-1 px-2 h-8 text-xs"
                            >
                              ✏️ Sửa
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm(`Xóa nhà cung cấp "${item.name}"?`)) {
                                  handleSupplierDelete(item.id);
                                }
                              }}
                              className="py-1 px-2 h-8 text-xs border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-rose-950/20"
                            >
                              🗑️ Xóa
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 3: LOGS */}
      {/* ========================================================== */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-gray-900 p-4 border border-gray-150 dark:border-gray-800 rounded-xl shadow-sm">
            <Select
              label="Nguyên liệu"
              placeholder="Tất cả nguyên liệu"
              options={activeIngredients.map((ing) => ({ value: ing.id, label: ing.name }))}
              value={logFilterIngredient}
              onChange={(e) => setLogFilterIngredient(e.target.value)}
            />

            <Select
              label="Hành động"
              placeholder="Tất cả hành động"
              options={[
                { value: 'IMPORT', label: 'Nhập kho' },
                { value: 'EXPORT', label: 'Xuất kho' },
                { value: 'ADJUST', label: 'Điều chỉnh' },
                { value: 'AUTO_DEDUCT', label: 'Trừ tự động' },
              ]}
              value={logFilterAction}
              onChange={(e) => setLogFilterAction(e.target.value)}
            />

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setLogFilterIngredient('');
                  setLogFilterAction('');
                }}
                className="w-full justify-center h-10"
              >
                🔄 Reset Bộ lọc
              </Button>
            </div>
          </div>

          {/* Table */}
          {isLoading && logs.length === 0 ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
                      <TableHead>Ngày thực hiện</TableHead>
                      <TableHead>Nguyên liệu</TableHead>
                      <TableHead>Hành động</TableHead>
                      <TableHead>Số lượng thay đổi</TableHead>
                      <TableHead>Giá vốn đơn vị</TableHead>
                      <TableHead>Tổng chi phí</TableHead>
                      <TableHead>Người thực hiện</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableEmpty message="Không có lịch sử biến động nào khớp bộ lọc." />
                    ) : (
                      logs.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-gray-500 dark:text-gray-400">
                            {formatDate(item.createdAt)}
                          </TableCell>
                          <TableCell className="font-semibold text-gray-850 dark:text-gray-200">
                            {item.ingredientName}
                          </TableCell>
                          <TableCell>{getActionBadge(item.action)}</TableCell>
                          <TableCell className="font-medium text-gray-800 dark:text-gray-200">
                            {item.action === 'IMPORT' ? '+' : item.action === 'EXPORT' || item.action === 'AUTO_DEDUCT' ? '-' : ''}
                            {item.quantity} {item.unit}
                          </TableCell>
                          <TableCell>{item.unitCost ? formatCurrency(item.unitCost) : '—'}</TableCell>
                          <TableCell>
                            {item.totalCost && item.totalCost > 0 ? formatCurrency(item.totalCost) : '—'}
                          </TableCell>
                          <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                            {item.createdBy ?? 'Hệ thống'}
                          </TableCell>
                          <TableCell className="max-w-[180px] truncate text-xs text-gray-400" title={item.note}>
                            {item.note ?? '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDetailData(item);
                                setDetailType('log');
                                setIsDetailModalOpen(true);
                              }}
                              className="py-1 px-2.5 h-8 text-xs border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-blue-950/20"
                            >
                              🔍 Xem
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <Pagination
                currentPage={logPagination.pageNumber - 1}
                totalPages={logPagination.totalPages}
                totalElements={logPagination.totalElements}
                pageSize={logPagination.pageSize}
                onPageChange={(page) => loadLogsData(page + 1)}
              />
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* MODALS */}
      {/* ========================================================== */}
      <IngredientModal
        isOpen={isIngredientModalOpen}
        onClose={() => {
          setIsIngredientModalOpen(false);
          setSelectedIngredient(null);
        }}
        onSubmit={handleIngredientSubmit}
        initialData={selectedIngredient}
        suppliers={suppliers}
        isLoading={isLoading}
      />

      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => {
          setIsSupplierModalOpen(false);
          setSelectedSupplier(null);
        }}
        onSubmit={handleSupplierSubmit}
        initialData={selectedSupplier}
        isLoading={isLoading}
      />

      <AdjustStockModal
        isOpen={isAdjustModalOpen}
        onClose={() => {
          setIsAdjustModalOpen(false);
          setAdjustingIngredient(null);
        }}
        onSubmit={handleAdjustSubmit}
        ingredient={adjustingIngredient}
        isLoading={isLoading}
      />

      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailData(null);
        }}
        type={detailType}
        data={detailData}
      />
    </div>
  );
}
