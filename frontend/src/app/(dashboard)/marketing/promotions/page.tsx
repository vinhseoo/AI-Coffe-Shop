'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMarketing } from '../../../../hooks/useMarketing';
import { Promotion, PromotionType } from '../../../../types/marketing';
import { PromotionForm } from '../../../../components/marketing/PromotionForm';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Badge } from '../../../../components/ui/Badge';
import { Spinner } from '../../../../components/ui/Spinner';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../../../components/ui/Table';
import { Pagination } from '../../../../components/ui/Pagination';
import { formatCurrency, formatDate } from '../../../../lib/utils';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  ArrowLeft,
  Gift,
  Tag
} from 'lucide-react';

export default function PromotionsCRUDPage() {
  const {
    isLoading,
    promotions,
    pagination,
    fetchPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
  } = useMarketing();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  useEffect(() => {
    loadPromotionsData(1);
  }, [searchQuery, selectedStatus]);

  const loadPromotionsData = (page: number = 1) => {
    fetchPromotions(
      {
        search: searchQuery || undefined,
        isActive: selectedStatus === 'active' ? true : selectedStatus === 'inactive' ? false : undefined,
      },
      page,
      10
    );
  };

  const handleOpenCreate = () => {
    setEditingPromotion(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingPromotion) {
      await updatePromotion(editingPromotion.id, data);
      loadPromotionsData(pagination.pageNumber);
    } else {
      await createPromotion(data);
    }
  };

  const handleDelete = async (promotion: Promotion) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa mã khuyến mãi "${promotion.name}"? Đơn hàng cũ đã dùng mã này vẫn giữ nguyên, nhưng khách sẽ không thể nhập mã này nữa.`)) {
      await deletePromotion(promotion.id);
      loadPromotionsData(pagination.pageNumber);
    }
  };

  const getPromotionTypeBadge = (type: PromotionType) => {
    switch (type) {
      case 'PERCENT':
        return <Badge variant="info">Chiết khấu (%)</Badge>;
      case 'FIXED_AMOUNT':
        return <Badge variant="success">Giảm tiền mặt (đ)</Badge>;
      case 'BUY_X_GET_Y':
        return <Badge variant="warning">Mua X tặng Y</Badge>;
      case 'FREE_TOPPING':
        return <Badge variant="default" className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">Free Topping</Badge>;
      default:
        return <Badge variant="default">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/marketing">
            <button className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-amber-850 dark:hover:text-amber-400 transition-colors group mb-2">
              <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" /> Quay lại Dashboard
            </button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Gift className="h-6 w-6 text-amber-850" /> Quản lý Chương trình Khuyến mãi
          </h1>
          <p className="text-sm text-gray-550 dark:text-gray-400 mt-1">
            Thiết lập mã giảm giá, chiết khấu theo hóa đơn hoặc áp dụng cụ thể cho từng món uống trong menu.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="bg-amber-850 hover:bg-amber-900 text-white font-bold flex items-center gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" /> Tạo khuyến mãi
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-gray-900 p-4 border border-gray-150 dark:border-gray-800 rounded-xl shadow-sm">
        <div className="relative">
          <Input
            placeholder="Tìm tên hoặc mô tả khuyến mãi..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <span className="absolute left-3 top-3 text-gray-400">
            <Search className="h-4 w-4" />
          </span>
        </div>

        <Select
          label="Trạng thái"
          placeholder="Tất cả trạng thái"
          options={[
            { value: 'active', label: 'Đang hoạt động' },
            { value: 'inactive', label: 'Không hoạt động' },
          ]}
          value={selectedStatus}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value)}
        />

        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedStatus('');
            }}
            className="w-full justify-center h-10 gap-1.5"
          >
            <RefreshCw className="h-4 w-4" /> Reset Bộ lọc
          </Button>
        </div>
      </div>

      {/* Table */}
      {isLoading && promotions.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
                <TableHead>Tên chương trình</TableHead>
                <TableHead>Loại hình</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead>Đơn tối thiểu</TableHead>
                <TableHead>Thời hạn</TableHead>
                <TableHead>Lượt dùng (Đã dùng/Hạn)</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.length === 0 ? (
                <TableEmpty message="Không tìm thấy chương trình khuyến mãi nào." />
              ) : (
                promotions.map((p: Promotion) => {
                  const now = new Date();
                  const isExpired = p.endDate ? new Date(p.endDate) < now : false;
                  
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-bold text-gray-900 dark:text-white max-w-[200px] truncate">
                        {p.name}
                        {p.isAiSuggested && (
                          <span className="inline-flex items-center ml-1.5 text-[9px] bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400 font-extrabold px-1 rounded">AI</span>
                        )}
                        <span className="block text-[10px] text-gray-400 mt-0.5 max-w-[190px] truncate font-normal">
                          {p.description || 'Không có mô tả'}
                        </span>
                      </TableCell>
                      <TableCell>{getPromotionTypeBadge(p.type)}</TableCell>
                      <TableCell className="font-bold text-gray-900 dark:text-white">
                        {p.type === 'PERCENT' ? `${p.value}%` : formatCurrency(p.value)}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                        {p.minOrderValue > 0 ? formatCurrency(p.minOrderValue) : '0đ (Không yc)'}
                      </TableCell>
                      <TableCell className="text-xs text-gray-650 dark:text-gray-400">
                        {p.startDate || p.endDate ? (
                          <>
                            {p.startDate ? formatDate(p.startDate).split(' ')[0] : 'Sớm'} ➔ {p.endDate ? formatDate(p.endDate).split(' ')[0] : 'Vô hạn'}
                            {isExpired && <span className="block text-[9px] font-bold text-rose-500">Hết hạn</span>}
                          </>
                        ) : (
                          'Vô thời hạn'
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">
                        {p.usedCount} / {p.usageLimit ? p.usageLimit : '∞'}
                      </TableCell>
                      <TableCell>
                        {p.isActive && !isExpired ? (
                          <Badge variant="success" size="sm">Đang chạy</Badge>
                        ) : isExpired ? (
                          <Badge variant="danger" size="sm">Hết hạn</Badge>
                        ) : (
                          <Badge variant="default" size="sm">Nháp/Bảo trì</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="outline" size="sm" onClick={() => handleOpenEdit(p)} className="h-8 px-2 border-amber-200 text-amber-850 hover:bg-amber-50 dark:border-amber-900/30 gap-1">
                            <Edit className="h-3.5 w-3.5" /> Sửa
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(p)} className="h-8 px-2 border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/30 gap-1">
                            <Trash2 className="h-3.5 w-3.5" /> Xóa
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
      )}

      {/* Pagination */}
      {promotions.length > 0 && (
        <Pagination
          currentPage={pagination.pageNumber - 1}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          pageSize={pagination.pageSize}
          onPageChange={(page: number) => loadPromotionsData(page + 1)}
        />
      )}

      {/* Form Modal */}
      <PromotionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingPromotion}
      />
    </div>
  );
}
