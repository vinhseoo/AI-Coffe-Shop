import React from 'react';
import { MenuItem } from '../../types/menu';
import { MenuItemCard } from './MenuItemCard';
import { Skeleton } from '../ui/Skeleton';

interface MenuGridProps {
  items: MenuItem[];
  isLoading: boolean;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
}

export function MenuGrid({ items, isLoading, onEdit, onDelete, onToggle }: MenuGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-150 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-[280px]">
            <Skeleton className="h-40 w-full" />
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
              <div className="flex items-center justify-between mt-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-8 w-1/4 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10 text-center">
        <span className="text-5xl">🍽️</span>
        <h3 className="mt-4 text-base font-bold text-gray-850 dark:text-gray-100">
          Chưa có món ăn nào
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Không tìm thấy món ăn nào khớp với bộ lọc của bạn. Hãy thử tạo sản phẩm mới hoặc thay đổi từ khóa tìm kiếm.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
