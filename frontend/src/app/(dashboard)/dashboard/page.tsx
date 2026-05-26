'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tổng quan</h2>
        <p className="text-sm text-gray-500 mt-1">Chào mừng bạn đến với CaféAI</p>
      </div>

      {/* Stat cards placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Doanh thu hôm nay', value: '—', icon: '💰' },
          { label: 'Đơn hàng hôm nay', value: '—', icon: '🧾' },
          { label: 'Sản phẩm bán chạy', value: '—', icon: '☕' },
          { label: 'Khách hàng mới', value: '—', icon: '👤' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stat.value}</p>
                </div>
                <span className="text-3xl">{stat.icon}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Doanh thu 7 ngày gần nhất</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-gray-400 text-sm">
          Biểu đồ sẽ được tích hợp ở Phase 2
        </CardContent>
      </Card>

      {/* AI summary placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Phân tích AI</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-400 text-sm">
          Tính năng phân tích thông minh sẽ có ở Phase 2
        </CardContent>
      </Card>
    </div>
  );
}
