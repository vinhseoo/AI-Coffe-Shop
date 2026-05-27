'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCustomers } from '../../../../hooks/useCustomers';
import { CustomerTier } from '../../../../types/customer';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Spinner } from '../../../../components/ui/Spinner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../../../../components/ui/Table';
import { RedeemPointsModal } from '../../../../components/customers/RedeemPointsModal';
import { CustomerForm } from '../../../../components/customers/CustomerForm';
import { formatCurrency, formatDate } from '../../../../lib/utils';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  DollarSign, 
  ShoppingBag, 
  Coins, 
  Edit, 
  Gift, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  FileText,
  User
} from 'lucide-react';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const customerId = Number(id);

  const {
    isLoading,
    selectedCustomer,
    transactions,
    fetchCustomerDetail,
    fetchCustomerTransactions,
    updateCustomer,
    redeemPoints,
  } = useCustomers();

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetail(customerId);
      fetchCustomerTransactions(customerId);
    }
  }, [customerId]);

  const handleUpdate = async (data: { name: string; phone: string; email?: string; birthday?: string; note?: string }) => {
    await updateCustomer(customerId, data);
  };

  const handleRedeem = async (points: number, description: string) => {
    await redeemPoints(customerId, points, description);
  };

  const getTierBadge = (tier: CustomerTier) => {
    switch (tier) {
      case 'NORMAL':
        return <Badge variant="default" size="md">Đồng (Normal)</Badge>;
      case 'SILVER':
        return <Badge variant="info" size="md">Bạc (Silver)</Badge>;
      case 'GOLD':
        return <Badge variant="warning" size="md">Vàng (Gold)</Badge>;
      case 'PLATINUM':
        return <Badge variant="success" size="md" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0">Bạch Kim (VIP)</Badge>;
      default:
        return <Badge variant="default" size="md">{tier}</Badge>;
    }
  };

  const getTierColorClass = (tier: CustomerTier) => {
    switch (tier) {
      case 'NORMAL':
        return 'from-amber-600 to-amber-800 shadow-amber-500/10';
      case 'SILVER':
        return 'from-slate-400 to-slate-600 shadow-slate-500/10';
      case 'GOLD':
        return 'from-yellow-500 to-amber-650 shadow-yellow-500/20';
      case 'PLATINUM':
        return 'from-violet-600 to-indigo-700 shadow-indigo-500/25';
      default:
        return 'from-gray-600 to-gray-800 shadow-gray-500/10';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'KH';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (isLoading && !selectedCustomer) {
    return (
      <div className="flex justify-center items-center py-24 min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!selectedCustomer) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
        <p className="text-sm font-semibold text-gray-500">Không tìm thấy thông tin khách hàng.</p>
        <Link href="/customers">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link href="/customers">
          <button className="flex items-center gap-2 text-xs font-bold text-gray-650 dark:text-gray-400 hover:text-amber-850 dark:hover:text-amber-400 transition-colors group">
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" /> Quay lại danh sách hội viên
          </button>
        </Link>

        <div className="flex gap-2.5 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setIsEditOpen(true)}
            className="flex-1 sm:flex-none border-gray-300 dark:border-gray-700 font-semibold gap-1.5 h-10"
          >
            <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400" /> Sửa thông tin
          </Button>
          
          <Button 
            onClick={() => setIsRedeemOpen(true)}
            className="flex-1 sm:flex-none bg-amber-850 hover:bg-amber-900 text-white font-bold gap-1.5 h-10 shadow-sm"
          >
            <Gift className="h-4 w-4" /> Đổi điểm tích lũy
          </Button>
        </div>
      </div>

      {/* Customer Header Banner Card */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white shadow-lg ${getTierColorClass(selectedCustomer.tier)}`}>
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full blur-xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-center gap-6">
          {/* Avatar Icon */}
          <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black tracking-wider text-white shadow-inner shrink-0">
            {getInitials(selectedCustomer.name)}
          </div>

          <div className="text-center md:text-left space-y-2 flex-grow">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight">{selectedCustomer.name}</h1>
              {getTierBadge(selectedCustomer.tier)}
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1.5 text-xs text-white/80 font-medium">
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-white/60" /> {selectedCustomer.phone}
              </span>
              {selectedCustomer.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-white/60" /> {selectedCustomer.email}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-white/60" /> Ghé cuối: {selectedCustomer.lastVisitAt ? formatDate(selectedCustomer.lastVisitAt) : 'Chưa ghé POS'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Loyalty Points */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm overflow-hidden group hover:border-amber-300 dark:hover:border-amber-900/50 transition-colors">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-850 dark:text-amber-400 rounded-xl group-hover:scale-105 transition-transform duration-300">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Điểm Tích Lũy</p>
              <h3 className="text-xl font-extrabold text-amber-850 dark:text-amber-400 mt-0.5">{selectedCustomer.loyaltyPoints} điểm</h3>
            </div>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-900/50 transition-colors">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-105 transition-transform duration-300">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tổng Chi Tiêu</p>
              <h3 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{formatCurrency(selectedCustomer.totalSpent)}</h3>
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm overflow-hidden group hover:border-blue-300 dark:hover:border-blue-900/50 transition-colors">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-105 transition-transform duration-300">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Số Đơn Mua</p>
              <h3 className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">{selectedCustomer.totalOrders} đơn</h3>
            </div>
          </CardContent>
        </Card>

        {/* Member Tier */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm overflow-hidden group hover:border-purple-300 dark:hover:border-purple-900/50 transition-colors">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-xl group-hover:scale-105 transition-transform duration-300">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hạng Thành Viên</p>
              <h3 className="text-base font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                {selectedCustomer.tier === 'NORMAL' && 'Hạng Đồng'}
                {selectedCustomer.tier === 'SILVER' && 'Hạng Bạc'}
                {selectedCustomer.tier === 'GOLD' && 'Hạng Vàng'}
                {selectedCustomer.tier === 'PLATINUM' && 'Bạch Kim (VIP)'}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Detailed Profile Info & Note */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 py-4">
              <CardTitle className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" /> Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-gray-450 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400">Số điện thoại</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5">{selectedCustomer.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-gray-50 dark:border-gray-850 pt-3.5">
                  <Mail className="h-4 w-4 text-gray-450 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400">Địa chỉ Email</p>
                    <p className="text-sm font-bold text-gray-850 dark:text-gray-200 mt-0.5">
                      {selectedCustomer.email || <span className="text-gray-400 font-normal italic">Chưa cập nhật</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-gray-50 dark:border-gray-850 pt-3.5">
                  <Calendar className="h-4 w-4 text-gray-450 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400">Ngày sinh nhật</p>
                    <p className="text-sm font-bold text-gray-850 dark:text-gray-200 mt-0.5">
                      {selectedCustomer.birthday ? formatDate(selectedCustomer.birthday) : <span className="text-gray-400 font-normal italic">Chưa cập nhật</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-gray-50 dark:border-gray-850 pt-3.5">
                  <Clock className="h-4 w-4 text-gray-450 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400">Ngày tham gia hệ thống</p>
                    <p className="text-sm font-bold text-gray-850 dark:text-gray-200 mt-0.5">
                      {formatDate(selectedCustomer.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ghi chú sở thích */}
          <Card className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 py-4">
              <CardTitle className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" /> Ghi chú & Sở thích
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {selectedCustomer.note ? (
                <div className="bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/55 dark:border-amber-950/30 p-3.5 rounded-xl text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                  {selectedCustomer.note}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-gray-400 italic">
                  Chưa có ghi chú đặc biệt cho hội viên này. Click "Sửa thông tin" để cập nhật.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Loyalty Transaction History Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm h-full">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 py-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" /> Lịch sử giao dịch điểm tích lũy
                </CardTitle>
                <CardDescription className="text-[11px] mt-0.5">Danh sách các lần tích/tiêu điểm của hội viên này.</CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {transactions.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <Coins className="h-10 w-10 text-gray-300 mx-auto mb-2.5 animate-pulse" />
                  <p className="text-xs font-semibold text-gray-450">Chưa có giao dịch tích lũy điểm nào.</p>
                  <p className="text-[10px] text-gray-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                    Điểm sẽ tự động cộng khi mua hàng tại POS (10.000đ = 1 điểm).
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 dark:bg-gray-900/50 hover:bg-transparent">
                        <TableHead className="pl-6">Thời gian</TableHead>
                        <TableHead>Hành động</TableHead>
                        <TableHead>Số điểm</TableHead>
                        <TableHead>Mô tả / Đơn hàng</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((t) => (
                        <TableRow key={t.id} className="hover:bg-gray-50/40">
                          <TableCell className="pl-6 text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(t.createdAt)}
                          </TableCell>
                          <TableCell>
                            {t.action === 'EARN' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
                                <TrendingUp className="h-3 w-3" /> Tích lũy
                              </span>
                            )}
                            {t.action === 'REDEEM' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-450 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full">
                                <TrendingDown className="h-3 w-3" /> Đổi quà
                              </span>
                            )}
                            {t.action === 'BONUS' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-450 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-full">
                                <Coins className="h-3 w-3" /> Thưởng thêm
                              </span>
                            )}
                            {t.action === 'EXPIRE' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 dark:text-gray-450 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                Hết hạn
                              </span>
                            )}
                          </TableCell>
                          <TableCell className={`font-bold text-sm ${
                            t.action === 'EARN' || t.action === 'BONUS'
                              ? 'text-emerald-600 dark:text-emerald-450' 
                              : 'text-rose-600 dark:text-rose-450'
                          }`}>
                            {t.action === 'EARN' || t.action === 'BONUS' ? '+' : '-'}{t.points}
                          </TableCell>
                          <TableCell className="text-xs text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                            {t.description || (t.orderId ? `Tích điểm từ Đơn hàng #${t.orderId}` : 'Giao dịch tích lũy')}
                            {t.orderId && (
                              <span className="block text-[10px] text-gray-400 mt-0.5">
                                Mã đơn: #{t.orderId}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Form Modal */}
      <CustomerForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdate}
        initialData={selectedCustomer}
      />

      {/* Redeem Points Modal */}
      <RedeemPointsModal
        isOpen={isRedeemOpen}
        onClose={() => setIsRedeemOpen(false)}
        onSubmit={handleRedeem}
        customer={selectedCustomer}
      />
    </div>
  );
}
