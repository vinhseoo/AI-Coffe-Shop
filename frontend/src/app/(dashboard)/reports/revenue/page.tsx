'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Spinner } from '../../../../components/ui/Spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/Table';
import { useReports } from '../../../../hooks/useReports';
import { formatCurrency } from '../../../../lib/utils';
import { RevenueLineChart } from '../../../../components/charts/RevenueLineChart';
import { HourlyBarChart } from '../../../../components/charts/HourlyBarChart';
import { CategoryPieChart } from '../../../../components/charts/CategoryPieChart';
import { TopItemsChart } from '../../../../components/charts/TopItemsChart';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Clock,
  PieChart,
  DollarSign,
  Briefcase,
  Users,
} from 'lucide-react';
import { CategoryRevenue, DateRevenuePair, TopItemReport, RevenueReport } from '../../../../types/report';

export default function RevenueReportsPage() {
  const {
    isLoading,
    fetchRevenueReport,
    fetchHourlyRevenue,
    fetchCategoryRevenue,
    fetchTopItems,
    fetchCustomerStats,
  } = useReports();

  // Date filters
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [groupBy, setGroupBy] = useState('day');

  // Date for hourly chart
  const [hourlyDate, setHourlyDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // State data
  const [revenueData, setRevenueData] = useState<RevenueReport | null>(null);
  const [hourlyData, setHourlyData] = useState<DateRevenuePair[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryRevenue[]>([]);
  const [topItemsData, setTopItemsData] = useState<TopItemReport[]>([]);
  const [customerStats, setCustomerStats] = useState<any>(null);

  const loadData = async () => {
    try {
      const rev = await fetchRevenueReport(fromDate, toDate, groupBy);
      setRevenueData(rev);

      const cat = await fetchCategoryRevenue(fromDate, toDate);
      setCategoryData(cat);

      const top = await fetchTopItems(fromDate, toDate, 10);
      setTopItemsData(top);

      const cust = await fetchCustomerStats(fromDate, toDate);
      setCustomerStats(cust);
    } catch (e) {
      console.error(e);
    }
  };

  const loadHourlyData = async () => {
    try {
      const hourly = await fetchHourlyRevenue(hourlyDate);
      setHourlyData(hourly);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [fromDate, toDate, groupBy]);

  useEffect(() => {
    loadHourlyData();
  }, [hourlyDate]);

  const avgOrderValue =
    revenueData && revenueData.totalOrders > 0
      ? revenueData.totalRevenue / revenueData.totalOrders
      : 0;

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white dark:bg-gray-950 p-4 rounded-xl border border-gray-150 dark:border-gray-800 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-700" />
            Chi tiết Doanh số & Lợi nhuận
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Thống kê hoạt động kinh doanh tổng hợp.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 p-1 rounded-lg border border-gray-200 dark:border-gray-800">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="text-xs border-0 bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none"
            />
            <span className="text-xs text-gray-400 px-1">đến</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="text-xs border-0 bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none"
            />
          </div>

          <div className="flex gap-0.5 bg-gray-50 dark:bg-gray-900 p-1 rounded-lg border border-gray-200 dark:border-gray-800">
            {([['day', 'Ngày'], ['week', 'Tuần'], ['month', 'Tháng']] as [string, string][]).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setGroupBy(val)}
                className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
                  groupBy === val
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gray-150 dark:border-gray-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Doanh thu kỳ chọn</p>
              <p className="text-lg font-extrabold text-gray-900 dark:text-white">
                {formatCurrency(revenueData?.totalRevenue || 0)}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold">Tất cả phương thức</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-700 dark:text-amber-500">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-150 dark:border-gray-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Số đơn hoàn thành</p>
              <p className="text-lg font-extrabold text-gray-900 dark:text-white">
                {revenueData?.totalOrders || 0} đơn
              </p>
              <p className="text-[10px] text-gray-400">Đơn thành công (không hủy)</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-700 dark:text-blue-500">
              <Calendar className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-150 dark:border-gray-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Giá trị đơn hàng (AOV)</p>
              <p className="text-lg font-extrabold text-gray-900 dark:text-white">
                {formatCurrency(avgOrderValue)}
              </p>
              <p className="text-[10px] text-gray-400">Doanh thu / đơn hàng</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-700 dark:text-emerald-500">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-150 dark:border-gray-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tỷ lệ hội viên mới</p>
              <p className="text-lg font-extrabold text-gray-900 dark:text-white">
                +{customerStats?.newCustomers || 0} hội viên
              </p>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                Tích điểm: {customerStats?.pointsEarned.toLocaleString() || 0}đ
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center text-purple-700 dark:text-purple-450">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doanh thu line chart */}
        <Card className="lg:col-span-2 border-gray-150 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              Biểu đồ Doanh thu & Đơn hàng lũy kế
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-72 flex items-center justify-center">
                <Spinner size="md" />
              </div>
            ) : (
              <RevenueLineChart data={revenueData?.dataPoints || []} />
            )}
          </CardContent>
        </Card>

        {/* Phân bổ danh mục */}
        <Card className="border-gray-150 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              Doanh thu theo Danh mục
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-72 flex items-center justify-center">
                <Spinner size="md" />
              </div>
            ) : (
              <CategoryPieChart data={categoryData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row (Hourly & Product Margins) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doanh thu theo giờ */}
        <Card className="border-gray-150 dark:border-gray-800">
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              Doanh số theo Giờ (Peak Hours)
            </CardTitle>
            <input
              type="date"
              value={hourlyDate}
              onChange={(e) => setHourlyDate(e.target.value)}
              className="text-xs border border-gray-200 dark:border-gray-850 rounded px-2 py-0.5 bg-gray-50 dark:bg-gray-900 focus:outline-none"
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-72 flex items-center justify-center">
                <Spinner size="md" />
              </div>
            ) : (
              <HourlyBarChart data={hourlyData} />
            )}
          </CardContent>
        </Card>

        {/* Biểu đồ biên lợi nhuận top items */}
        <Card className="lg:col-span-2 border-gray-150 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              Biên Lợi Nhuận sản phẩm (Top bán chạy)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <Spinner size="md" />
              </div>
            ) : (
              <TopItemsChart data={topItemsData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Profitability Table */}
      <Card className="border-gray-150 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-sm font-bold">Chi tiết Lợi nhuận sản phẩm</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && topItemsData.length === 0 ? (
            <div className="py-12 flex justify-center">
              <Spinner size="md" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead className="text-right">Đã bán</TableHead>
                    <TableHead className="text-right">Doanh thu</TableHead>
                    <TableHead className="text-right">Chi phí vốn</TableHead>
                    <TableHead className="text-right">Lợi nhuận ròng</TableHead>
                    <TableHead className="text-right">Biên lợi nhuận</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topItemsData.map((item) => {
                    const marginPct = item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0;
                    return (
                      <TableRow key={item.menuItemId}>
                        <TableCell className="font-bold text-gray-800 dark:text-gray-200">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-right font-medium">{item.totalSold} cốc</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                        <TableCell className="text-right text-gray-500">{formatCurrency(item.totalCost)}</TableCell>
                        <TableCell className="text-right text-emerald-600 dark:text-emerald-400 font-bold">
                          {formatCurrency(item.profit)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                              {marginPct.toFixed(0)}%
                            </span>
                            <div className="w-12 bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full"
                                style={{ width: `${Math.min(Math.max(0, marginPct), 100)}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {topItemsData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center text-xs text-gray-400">
                        Không có dữ liệu trong khoảng thời gian này
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
