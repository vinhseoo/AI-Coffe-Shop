'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { useReports } from '../../../hooks/useReports';
import { formatCurrency } from '../../../lib/utils';
import {
  TrendingUp,
  Sparkles,
  BarChart3,
  Users,
  Award,
  Calendar,
  ChevronRight,
  BookMarked,
  Clock,
} from 'lucide-react';
import { AIReport } from '../../../types/ai';

export default function ReportsOverviewPage() {
  const { isLoading, aiHistory, fetchAIHistory, fetchRevenueReport, fetchCustomerStats } = useReports();

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    newCustomers: 0,
    pointsEarned: 0,
  });

  useEffect(() => {
    // Tải thông tin tổng quan 30 ngày qua
    const loadOverviewData = async () => {
      try {
        const rev = await fetchRevenueReport();
        const cust = await fetchCustomerStats();
        setStats({
          totalRevenue: rev.totalRevenue || 0,
          totalOrders: rev.totalOrders || 0,
          newCustomers: cust.newCustomers || 0,
          pointsEarned: cust.pointsEarned || 0,
        });
      } catch (e) {
        console.error('Không thể tải thông tin báo cáo tổng quan', e);
      }
    };

    loadOverviewData();
    fetchAIHistory();
  }, []);

  const latestWeeklyReport = aiHistory.find(
    (rep) => rep.reportType === 'WEEKLY_ANALYSIS'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-700 dark:text-amber-500" />
            Trung tâm Báo cáo & Phân tích AI
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi sức khỏe tài chính và nhận phân tích chiến lược từ trí tuệ nhân tạo.
          </p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/reports/revenue" className="group">
          <Card className="hover:border-amber-500 hover:shadow-md transition-all duration-200 cursor-pointer h-full border-gray-150 dark:border-gray-800">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-700 dark:text-amber-500 group-hover:bg-amber-100 transition-colors">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                    Chi tiết Doanh số & Lợi nhuận
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Biểu đồ doanh thu theo ngày/giờ, phân bổ danh mục, biên lợi nhuận món uống.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports/ai-analysis" className="group">
          <Card className="hover:border-amber-500 hover:shadow-md transition-all duration-200 cursor-pointer h-full border-gray-150 dark:border-gray-800">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center text-purple-700 dark:text-purple-400 group-hover:bg-purple-100 transition-colors">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white group-hover:text-purple-800 dark:group-hover:text-purple-300 transition-colors">
                    Cố vấn Doanh nghiệp AI
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tạo phân tích tuần tự động, dự báo doanh số 7 ngày tiếp theo, tối ưu hóa chi phí.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* KPI Overview (Last 30 days) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Doanh thu (30 ngày)',
            value: formatCurrency(stats.totalRevenue),
            desc: 'Tổng doanh thu đã trừ hủy đơn',
            icon: <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
            bg: 'bg-amber-50/50 dark:bg-amber-950/10',
          },
          {
            title: 'Tổng đơn hàng',
            value: `${stats.totalOrders} đơn`,
            desc: 'Đơn thanh toán hoàn tất',
            icon: <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
            bg: 'bg-blue-50/50 dark:bg-blue-950/10',
          },
          {
            title: 'Hội viên mới',
            value: `+${stats.newCustomers} người`,
            desc: 'Khách đăng ký mới',
            icon: <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
            bg: 'bg-emerald-50/50 dark:bg-emerald-950/10',
          },
          {
            title: 'Điểm thưởng phát ra',
            value: `${stats.pointsEarned.toLocaleString()}đ`,
            desc: 'Tương đương giá trị tích lũy',
            icon: <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
            bg: 'bg-purple-50/50 dark:bg-purple-950/10',
          },
        ].map((kpi, idx) => (
          <Card key={idx} className="border-gray-150 dark:border-gray-800">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {kpi.title}
                </p>
                <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {kpi.value}
                </p>
                <p className="text-[10px] text-gray-400">
                  {kpi.desc}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.bg}`}>
                {kpi.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest AI Report Summary */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-200">
            Báo cáo phân tích AI gần nhất
          </h2>
          {latestWeeklyReport ? (
            <Card className="border-amber-100 dark:border-amber-900/30 bg-amber-500/5 shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      <Sparkles className="w-3 h-3" />
                      Weekly Analysis
                    </span>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                      {latestWeeklyReport.title}
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(latestWeeklyReport.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
                  {latestWeeklyReport.content.replace(/[#*`>_-]/g, '')}
                </p>
                <div className="flex justify-end">
                  <Link href="/reports/ai-analysis">
                    <Button size="sm" variant="outline" className="text-xs border-amber-300 text-amber-850 hover:bg-amber-100/50">
                      Đọc toàn bộ báo cáo
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-150 dark:border-gray-800">
              <CardContent className="py-12 text-center space-y-3">
                <div className="text-3xl text-gray-300">📊</div>
                <p className="text-sm text-gray-500">Chưa có phân tích báo cáo kinh doanh nào từ AI.</p>
                <Link href="/reports/ai-analysis">
                  <Button size="sm">
                    Khởi tạo báo cáo ngay
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Saved/Recent reports list */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-200">
            Lịch sử Báo cáo AI
          </h2>
          <Card className="border-gray-150 dark:border-gray-800">
            <CardContent className="p-0">
              {isLoading && aiHistory.length === 0 ? (
                <div className="py-12 flex justify-center">
                  <Spinner size="md" />
                </div>
              ) : aiHistory.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {aiHistory.slice(0, 5).map((rep) => (
                    <Link
                      key={rep.id}
                      href="/reports/ai-analysis"
                      className="flex items-center justify-between p-3.5 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
                    >
                      <div className="space-y-1 overflow-hidden pr-2">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                          {rep.title}
                        </p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <span>{rep.reportType === 'WEEKLY_ANALYSIS' ? 'Phân tích tuần' : rep.reportType === 'REVENUE_FORECAST' ? 'Dự báo doanh thu' : 'Đề xuất tối ưu'}</span>
                          <span>•</span>
                          <span>{new Date(rep.createdAt).toLocaleDateString('vi-VN')}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {rep.isBookmarked && <BookMarked className="w-3.5 h-3.5 text-amber-500" />}
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-gray-400">
                  Lịch sử báo cáo trống
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
