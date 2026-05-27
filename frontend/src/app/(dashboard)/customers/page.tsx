'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCustomers } from '../../../hooks/useCustomers';
import { Customer, CustomerTier } from '../../../types/customer';
import { CustomerForm } from '../../../components/customers/CustomerForm';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../../components/ui/Table';
import { Pagination } from '../../../components/ui/Pagination';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Sparkles, 
  RefreshCw, 
  Users, 
  UserX, 
  Crown, 
  Lightbulb, 
  Award,
  Zap
} from 'lucide-react';

export default function CustomersPage() {
  const {
    isLoading,
    isAiLoading,
    customers,
    segmentation,
    pagination,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    fetchAISegmentation,
  } = useCustomers();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'list' | 'ai'>('list');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('');

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Load initial customers
  useEffect(() => {
    if (activeTab === 'list') {
      loadCustomersData(1);
    }
  }, [activeTab, searchQuery, selectedTier]);

  // Load AI segmentation on tab change if not loaded
  useEffect(() => {
    if (activeTab === 'ai' && !segmentation) {
      fetchAISegmentation();
    }
  }, [activeTab]);

  const loadCustomersData = (page = 1) => {
    fetchCustomers(
      {
        search: searchQuery || undefined,
        tier: selectedTier || undefined,
      },
      page,
      10
    );
  };

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: { name: string; phone: string; email?: string; birthday?: string; note?: string }) => {
    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, data);
      loadCustomersData(pagination.pageNumber);
    } else {
      await createCustomer(data);
    }
  };

  const handleDelete = async (customer: Customer) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thành viên "${customer.name}"? Mọi lịch sử tích điểm của khách cũng sẽ bị xóa vĩnh viễn.`)) {
      await deleteCustomer(customer.id);
      loadCustomersData(pagination.pageNumber);
    }
  };

  const getTierBadge = (tier: CustomerTier) => {
    switch (tier) {
      case 'NORMAL':
        return <Badge variant="default" size="sm">Đồng (Normal)</Badge>;
      case 'SILVER':
        return <Badge variant="info" size="sm">Bạc (Silver)</Badge>;
      case 'GOLD':
        return <Badge variant="warning" size="sm">Vàng (Gold)</Badge>;
      case 'PLATINUM':
        return <Badge variant="success" size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0">Bạch Kim (VIP)</Badge>;
      default:
        return <Badge variant="default" size="sm">{tier}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-amber-850" /> Quản lý Khách hàng & Thành viên
          </h1>
          <p className="text-sm text-gray-550 dark:text-gray-400 mt-1">
            Đăng ký hội viên tích điểm, phân hạng chi tiêu, chăm sóc khách hàng và nhận phân tích thông minh từ AI.
          </p>
        </div>

        <div className="flex gap-2">
          {activeTab === 'list' && (
            <Button onClick={handleOpenCreate} className="bg-amber-850 hover:bg-amber-900 text-white font-bold flex items-center gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" /> Đăng ký hội viên
            </Button>
          )}
          {activeTab === 'ai' && (
            <Button 
              variant="outline" 
              onClick={fetchAISegmentation} 
              disabled={isAiLoading}
              className="border-amber-850 text-amber-950 dark:text-amber-400 font-bold flex items-center gap-1.5"
            >
              <RefreshCw className={`h-4 w-4 ${isAiLoading ? 'animate-spin' : ''}`} /> Phân tích lại
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-1.5 rounded-xl gap-1">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'list'
              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
              : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900'
          }`}
        >
          <Users className="h-4 w-4" /> Danh sách hội viên
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'ai'
              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
              : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900'
          }`}
        >
          <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" /> Cố vấn AI Phân nhóm & Chăm sóc
        </button>
      </div>

      {activeTab === 'list' ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-gray-900 p-4 border border-gray-150 dark:border-gray-800 rounded-xl shadow-sm">
            <div className="relative">
              <Input
                placeholder="Tìm tên, số điện thoại khách..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <span className="absolute left-3 top-3 text-gray-400">
                <Search className="h-4 w-4" />
              </span>
            </div>

            <Select
              label="Hạng hội viên"
              placeholder="Tất cả các hạng"
              options={[
                { value: 'NORMAL', label: 'Đồng (Normal)' },
                { value: 'SILVER', label: 'Bạc (Silver)' },
                { value: 'GOLD', label: 'Vàng (Gold)' },
                { value: 'PLATINUM', label: 'Bạch Kim (VIP)' },
              ]}
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
            />

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTier('');
                }}
                className="w-full justify-center h-10 gap-1.5"
              >
                <RefreshCw className="h-4 w-4" /> Reset Bộ lọc
              </Button>
            </div>
          </div>

          {/* Table */}
          {isLoading && customers.length === 0 ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Hạng thẻ</TableHead>
                    <TableHead>Điểm tích lũy</TableHead>
                    <TableHead>Số đơn mua</TableHead>
                    <TableHead>Tổng chi tiêu</TableHead>
                    <TableHead>Ghé quán cuối</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length === 0 ? (
                    <TableEmpty message="Không tìm thấy khách hàng thành viên nào." />
                  ) : (
                    customers.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-bold text-gray-900 dark:text-white">
                          {c.name}
                        </TableCell>
                        <TableCell className="text-xs font-semibold">{c.phone}</TableCell>
                        <TableCell>{getTierBadge(c.tier)}</TableCell>
                        <TableCell className="font-bold text-amber-850 dark:text-amber-400">
                          {c.loyaltyPoints} điểm
                        </TableCell>
                        <TableCell className="text-xs font-medium">{c.totalOrders} đơn</TableCell>
                        <TableCell className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                          {formatCurrency(c.totalSpent)}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                          {c.lastVisitAt ? formatDate(c.lastVisitAt) : 'Chưa ghé POS'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Link href={`/customers/${c.id}`}>
                              <Button variant="outline" size="sm" className="h-8 px-2 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900/30 gap-1">
                                <Eye className="h-3.5 w-3.5" /> Xem
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm" onClick={() => handleOpenEdit(c)} className="h-8 px-2 border-amber-200 text-amber-850 hover:bg-amber-50 dark:border-amber-900/30 gap-1">
                              <Edit className="h-3.5 w-3.5" /> Sửa
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(c)} className="h-8 px-2 border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/30 gap-1">
                              <Trash2 className="h-3.5 w-3.5" /> Xóa
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

          {/* Pagination */}
          {customers.length > 0 && (
            <Pagination
              currentPage={pagination.pageNumber - 1}
              totalPages={pagination.totalPages}
              totalElements={pagination.totalElements}
              pageSize={pagination.pageSize}
              onPageChange={(page) => loadCustomersData(page + 1)}
            />
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* AI Segmentation Tab */}
          {isAiLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm">
              <Spinner size="lg" />
              <p className="text-sm font-semibold text-gray-500 animate-pulse">Cố vấn AI đang phân tích dữ liệu mua sắm và phân nhóm khách hàng...</p>
            </div>
          ) : segmentation ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI Analysis and Suggestions Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Analysis Box */}
                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                  <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                  <h3 className="text-lg font-extrabold flex items-center gap-2 border-b border-white/10 pb-3">
                    <Sparkles className="h-5 w-5 text-yellow-300" /> Nhận định của Cố vấn AI
                  </h3>
                  <p className="text-sm leading-relaxed text-indigo-50 mt-4 font-medium">
                    {segmentation.aiAnalysis}
                  </p>
                </div>

                {/* Segments Display */}
                <div className="space-y-4">
                  {/* VIP Customers list */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                    <h4 className="font-bold text-sm text-gray-850 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-850 pb-2">
                      <Crown className="h-4 w-4 text-yellow-500" /> Nhóm Khách Hàng VIP (Top chi tiêu)
                    </h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-xs">Tên</TableHead>
                            <TableHead className="text-xs">Số điện thoại</TableHead>
                            <TableHead className="text-xs">Hạng</TableHead>
                            <TableHead className="text-xs">Chi tiêu</TableHead>
                            <TableHead className="text-xs text-right">Chi tiết</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {segmentation.vipCustomers.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center text-xs text-gray-400">Không có dữ liệu</TableCell></TableRow>
                          ) : (
                            segmentation.vipCustomers.map(c => (
                              <TableRow key={c.id} className="hover:bg-gray-50/50">
                                <TableCell className="font-bold text-xs">{c.name}</TableCell>
                                <TableCell className="text-xs">{c.phone}</TableCell>
                                <TableCell>{getTierBadge(c.tier)}</TableCell>
                                <TableCell className="font-semibold text-xs text-emerald-600">{formatCurrency(c.totalSpent)}</TableCell>
                                <TableCell className="text-right">
                                  <Link href={`/customers/${c.id}`}>
                                    <Button variant="outline" size="sm" className="h-7 py-0.5 px-2 text-[10px] gap-1">
                                      <Eye className="h-3 w-3" /> Xem
                                    </Button>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Churn Risk (At Risk) list */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
                    <h4 className="font-bold text-sm text-gray-850 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-850 pb-2">
                      <UserX className="h-4 w-4 text-rose-500" /> Nhóm Khách Hàng Có Nguy Cơ Rời Bỏ (&gt;30 ngày chưa ghé)
                    </h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-xs">Tên</TableHead>
                            <TableHead className="text-xs">Số điện thoại</TableHead>
                            <TableHead className="text-xs">Ghé cuối</TableHead>
                            <TableHead className="text-xs">Tồn điểm</TableHead>
                            <TableHead className="text-xs text-right">Hành động</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {segmentation.atRiskCustomers.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center text-xs text-gray-400">Không có khách hàng nào ngưng ghé quá 30 ngày.</TableCell></TableRow>
                          ) : (
                            segmentation.atRiskCustomers.map(c => (
                              <TableRow key={c.id} className="hover:bg-gray-50/50">
                                <TableCell className="font-bold text-xs">{c.name}</TableCell>
                                <TableCell className="text-xs">{c.phone}</TableCell>
                                <TableCell className="text-xs text-gray-400">{c.lastVisitAt ? formatDate(c.lastVisitAt) : 'Chưa mua'}</TableCell>
                                <TableCell className="font-semibold text-xs text-amber-850">{c.loyaltyPoints} điểm</TableCell>
                                <TableCell className="text-right">
                                  <Link href={`/customers/${c.id}`}>
                                    <Button variant="outline" size="sm" className="h-7 py-0.5 px-2 text-[10px] gap-1 border-rose-200 text-rose-600 hover:bg-rose-50">
                                      <Eye className="h-3 w-3" /> Xem
                                    </Button>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Marketing suggestions column */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-gray-850 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-850 pb-3">
                    <Lightbulb className="h-5 w-5 text-yellow-500" /> Khuyến nghị Marketing từ AI
                  </h3>
                  <div className="space-y-3">
                    {segmentation.marketingSuggestions.map((suggestion, idx) => (
                      <div key={idx} className="flex gap-2.5 bg-gray-50 dark:bg-gray-950 p-3 rounded-xl border border-gray-150 dark:border-gray-850">
                        <Zap className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-semibold">
                          {suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Quick Info card */}
                <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-5 text-xs text-amber-850 dark:text-amber-400 space-y-2">
                  <span className="font-bold flex items-center gap-1.5"><Award className="h-4 w-4 text-amber-600" /> Hệ thống phân hạng tự động</span>
                  <p className="leading-relaxed">Hội viên tích lũy điểm tự động từ quầy POS với tỷ lệ 10.000đ = 1 điểm. Phân hạng hội viên được tính toán:</p>
                  <ul className="list-disc pl-4 space-y-1 mt-2">
                    <li><span className="font-semibold">Đồng (Normal):</span> Dưới 100 điểm</li>
                    <li><span className="font-semibold">Bạc (Silver):</span> Từ 100 điểm trở lên</li>
                    <li><span className="font-semibold">Vàng (Gold):</span> Từ 500 điểm trở lên</li>
                    <li><span className="font-semibold">Bạch Kim (VIP):</span> Từ 1000 điểm trở lên</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm">
              <Sparkles className="h-10 w-10 text-violet-500 animate-bounce" />
              <p className="text-sm font-semibold text-gray-500">Chưa có dữ liệu phân tích thành viên.</p>
              <Button onClick={fetchAISegmentation} className="mt-2 bg-violet-600 hover:bg-violet-700 text-white font-bold">
                Yêu cầu AI phân tích ngay
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      <CustomerForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingCustomer}
      />
    </div>
  );
}
