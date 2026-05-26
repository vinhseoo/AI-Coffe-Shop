'use client';

import React, { useEffect, useState } from 'react';
import { useDashboard } from '../../../hooks/useDashboard';
import { StatCard } from '../../../components/dashboard/StatCard';
import { AIInsightCard } from '../../../components/dashboard/AIInsightCard';
import { LowStockAlertList } from '../../../components/dashboard/LowStockAlertList';
import { RevenueLineChart } from '../../../components/charts/RevenueLineChart';
import { TopSellingBarChart } from '../../../components/charts/TopSellingBarChart';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';

export default function DashboardPage() {
  const {
    isLoading,
    isAiLoading,
    overview,
    revenueSummary,
    topSelling,
    lowStockAlerts,
    aiSummary,
    fetchAISummary,
    fetchAllData,
  } = useDashboard();

  // Date filter states
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [groupBy, setGroupBy] = useState('day');

  useEffect(() => {
    fetchAllData(fromDate, toDate, groupBy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate, groupBy]);

  // Load AI summary once on mount
  useEffect(() => {
    fetchAISummary().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined) return '0đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tổng quan</h2>
          <p className="text-sm text-gray-500 mt-1">Chào mừng bạn trở lại với CaféAI quản trị</p>
        </div>

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 font-medium">Từ ngày:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 font-medium">Đến ngày:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div className="flex items-center gap-1.5 border-l border-gray-100 dark:border-gray-800 pl-3">
            <span className="text-gray-500 font-medium">Nhóm theo:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
            >
              <option value="day">Ngày</option>
              <option value="week">Tuần</option>
              <option value="month">Tháng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Doanh thu hôm nay"
          value={formatCurrency(overview?.todayRevenue)}
          change={overview?.revenueChangePercent}
          icon="💰"
          description="So với ngày hôm qua"
        />
        <StatCard
          title="Đơn hàng hôm nay"
          value={overview?.todayOrderCount ?? 0}
          change={overview?.orderCountChangePercent}
          icon="🧾"
          description="Đơn hoàn thành hoặc đang làm"
        />
        <StatCard
          title="Giá trị đơn trung bình"
          value={formatCurrency(overview?.avgOrderValue)}
          icon="☕"
          description="Mức chi tiêu trung bình hôm nay"
        />
        <StatCard
          title="Nguyên liệu cần nhập"
          value={lowStockAlerts.length}
          icon="⚠️"
          description={lowStockAlerts.length > 0 ? "Có mặt hàng sắp cạn kiệt" : "Tồn kho ở mức an toàn"}
        />
      </div>

      {/* Charts and AI Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Thống kê doanh thu & lượng đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-72 bg-gray-50 dark:bg-gray-800 animate-pulse rounded-xl" />
              ) : (
                <RevenueLineChart data={revenueSummary} />
              )}
            </CardContent>
          </Card>

          {/* Top Selling Products */}
          <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Top sản phẩm bán chạy nhất
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-72 bg-gray-50 dark:bg-gray-800 animate-pulse rounded-xl" />
              ) : (
                <TopSellingBarChart data={topSelling} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Insight and Alerts Column */}
        <div className="space-y-6">
          {/* AI Insight widget */}
          <AIInsightCard
            aiSummary={aiSummary}
            isLoading={isAiLoading}
            onGenerate={fetchAISummary}
          />

          {/* Low Stock Alerts */}
          <LowStockAlertList alerts={lowStockAlerts} />
        </div>
      </div>
    </div>
  );
}
