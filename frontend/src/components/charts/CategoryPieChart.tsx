'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { CategoryRevenue } from '../../types/report';

interface CategoryPieChartProps {
  data: CategoryRevenue[];
}

const COLORS = ['#d97706', '#0d9488', '#4f46e5', '#e11d48', '#2563eb', '#16a34a', '#7c3aed'];

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-64 bg-gray-50 dark:bg-gray-800 animate-pulse rounded-xl" />;
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="w-full h-72">
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              dataKey="revenue"
              nameKey="categoryName"
              label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
              fontSize={10}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [formatCurrency(Number(value)), 'Doanh thu']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-xs text-gray-400">
          Chưa có dữ liệu phân bổ theo danh mục
        </div>
      )}
    </div>
  );
}
export default CategoryPieChart;
