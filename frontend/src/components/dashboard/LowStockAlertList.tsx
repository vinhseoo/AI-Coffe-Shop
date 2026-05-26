import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { LowStockAlert } from '../../types/dashboard';

interface LowStockAlertListProps {
  alerts: LowStockAlert[];
}

export function LowStockAlertList({ alerts }: LowStockAlertListProps) {
  return (
    <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
      <CardHeader className="pb-3 border-b border-gray-50 dark:border-gray-800">
        <CardTitle className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <span>⚠️</span> Cảnh báo tồn kho thấp
          {alerts.length > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              {alerts.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {alerts.length > 0 ? (
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {alerts.map((item) => {
              const ratio = item.minStock > 0 ? (item.currentStock / item.minStock) * 100 : 0;
              const isUrgent = ratio < 30;
              
              return (
                <div key={item.ingredientId} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{item.name}</span>
                    <span className={`font-medium ${isUrgent ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {item.currentStock} / {item.minStock} {item.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isUrgent 
                          ? 'bg-rose-500' 
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, ratio))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            <span className="text-3xl text-emerald-500">✅</span>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Kho hàng an toàn! Mọi nguyên liệu đều trên mức tối thiểu.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
