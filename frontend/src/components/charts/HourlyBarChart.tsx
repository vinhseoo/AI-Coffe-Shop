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
} from 'recharts';
import { DateRevenuePair } from '../../types/report';

interface HourlyBarChartProps {
  data: DateRevenuePair[];
}

export function HourlyBarChart({ data }: HourlyBarChartProps) {
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
      {data && data.some(dp => dp.revenue > 0) ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-gray-850" />
            <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
            <Tooltip
              formatter={(value: any, name: any) => {
                if (name === 'revenue') return [formatCurrency(Number(value)), 'Doanh thu'];
                if (name === 'orderCount') return [value, 'Số đơn'];
                return [value, name];
              }}
              labelStyle={{ fontSize: 11, fontWeight: 'bold' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar name="revenue" dataKey="revenue" fill="var(--color-amber-600)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-xs text-gray-400">
          Không có dữ liệu doanh thu theo giờ cho ngày được chọn
        </div>
      )}
    </div>
  );
}
export default HourlyBarChart;
