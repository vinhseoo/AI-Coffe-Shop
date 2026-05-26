import React from 'react';
import Link from 'next/link';
import { MenuItem } from '../../types/menu';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../lib/utils';

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
}

export function MenuItemCard({ item, onEdit, onDelete, onToggle }: MenuItemCardProps) {
  // Trình bày ảnh hoặc dùng placeholder màu cà phê sữa rất sang trọng
  const renderImage = () => {
    if (item.imageUrl) {
      return (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-40 w-full object-cover rounded-t-xl"
        />
      );
    }
    return (
      <div className="h-40 w-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-950/40 dark:to-amber-900/40 flex items-center justify-center rounded-t-xl">
        <span className="text-4xl">☕</span>
      </div>
    );
  };

  const prices = item.variants?.map(v => v.price) || [];
  const costPrices = item.variants?.map(v => v.costPrice) || [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const minCost = costPrices.length > 0 ? Math.min(...costPrices) : 0;
  const maxCost = costPrices.length > 0 ? Math.max(...costPrices) : 0;

  const priceDisplay = minPrice === maxPrice 
    ? formatCurrency(minPrice) 
    : `Từ ${formatCurrency(minPrice)}`;

  const costDisplay = minCost === maxCost 
    ? formatCurrency(minCost) 
    : `${formatCurrency(minCost)} - ${formatCurrency(maxCost)}`;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-150 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group hover:-translate-y-1">
      {/* Product Image / Visual */}
      <div className="relative overflow-hidden">
        {renderImage()}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 items-start">
          <div className="flex gap-1 flex-wrap">
            {item.variants && item.variants.map((v) => (
              <Badge
                key={v.id}
                variant={v.isAvailable ? "outline" : "default"}
                className={`${
                  v.isAvailable 
                    ? "bg-white/95 dark:bg-gray-900/90 text-gray-800 dark:text-gray-200" 
                    : "bg-gray-200/80 dark:bg-gray-800/80 text-gray-400 line-through"
                } shadow-sm backdrop-blur text-[10px] px-1.5 py-0.5`}
              >
                {v.size}
              </Badge>
            ))}
          </div>
          {item.isBestseller && (
            <Badge variant="warning" className="shadow-sm">
              🔥 Bán chạy
            </Badge>
          )}
        </div>

        {/* Edit Button overlay */}
        <button
          onClick={() => onEdit(item)}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 dark:bg-gray-900/90 text-gray-600 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm backdrop-blur"
          title="Chỉnh sửa nhanh"
        >
          <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
              {item.name}
            </h3>
            {/* Availability Toggle */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={item.isAvailable}
                onChange={() => onToggle(item.id)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-amber-700"></div>
            </label>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 h-8">
            {item.description || 'Không có mô tả sản phẩm'}
          </p>
        </div>

        {/* Pricing & Navigation */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-amber-800 dark:text-amber-400">
              {priceDisplay}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
              Vốn: {costDisplay}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Link
              href={`/menu/${item.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-850 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
            >
              <span>Công thức</span>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <button
              onClick={() => onDelete(item.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Xóa sản phẩm"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
