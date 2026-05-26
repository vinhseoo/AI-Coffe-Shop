import React from 'react';
import { Card, CardContent } from '../ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
}

export function StatCard({ title, value, change, icon, description }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
          <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400">
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</span>
          {change !== undefined && (
            <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              isPositive 
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
            }`}>
              {isPositive ? '↑' : '↓'} {Math.abs(change)}%
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
