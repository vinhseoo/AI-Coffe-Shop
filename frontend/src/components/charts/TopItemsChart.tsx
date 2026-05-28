'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TopItemReport } from '../../types/report';

interface TopItemsChartProps {
  data: TopItemReport[];
}

export function TopItemsChart({ data }: TopItemsChartProps) {
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
    <div className="w-full h-80">
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-gray-850" />
            <XAxis type="number" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `${val / 1000}k`} tickLine={false} axisLine={false} />
            <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={90} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(value: any, name: any) => {
                if (name === 'revenue') return [formatCurrency(Number(value)), 'Doanh thu'];
                if (name === 'profit') return [formatCurrency(Number(value)), 'Lợi nhuận ròng'];
                return [value, name];
              }}
              labelStyle={{ fontSize: 11, fontWeight: 'bold' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Bar name="revenue" dataKey="revenue" fill="var(--color-amber-600)" radius={[0, 4, 4, 0]} barSize={12} />
            <Bar name="profit" dataKey="profit" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-xs text-gray-400">
          Chưa có dữ liệu sản phẩm
        </div>
      )}
    </div>
  );
}
export default TopItemsChart;
