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
  Cell,
} from 'recharts';
import { TopSellingItem } from '../../types/dashboard';

interface TopSellingBarChartProps {
  data: TopSellingItem[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e'];

export function TopSellingBarChart({ data }: TopSellingBarChartProps) {
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
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-gray-800" horizontal={false} />
            <XAxis 
              type="number" 
              stroke="#94a3b8" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#94a3b8" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              width={100}
            />
            <Tooltip
              formatter={(value: any, name: any) => {
                if (name === 'totalSold') return [value + ' cốc', 'Số lượng bán'];
                if (name === 'revenue') return [formatCurrency(Number(value)), 'Doanh thu'];
                return [value, name];
              }}
              labelStyle={{ fontSize: 11, fontWeight: 'bold', color: '#1e293b' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar 
              name="totalSold"
              dataKey="totalSold" 
              radius={[0, 4, 4, 0]} 
              barSize={16}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-xs text-gray-400">
          Chưa có dữ liệu sản phẩm bán chạy hôm nay
        </div>
      )}
    </div>
  );
}
