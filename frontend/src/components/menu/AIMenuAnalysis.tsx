import React from 'react';
import { MenuAnalysisResponse, MenuAnalysisItem } from '../../types/menu';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../lib/utils';
import { Skeleton } from '../ui/Skeleton';

interface AIMenuAnalysisProps {
  data: MenuAnalysisResponse | null;
  isLoading: boolean;
}

export function AIMenuAnalysis({ data, isLoading }: AIMenuAnalysisProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Summary Skeleton */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl p-5 shadow-xs space-y-3">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Quadrants Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="space-y-2 mt-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10 text-center">
        <span className="text-5xl">📊</span>
        <h3 className="mt-4 text-base font-bold text-gray-800 dark:text-gray-100">
          Chưa có dữ liệu phân tích
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Bấm vào nút "Phân tích thực đơn" bên trên để AI tiến hành phân loại các món ăn của bạn.
        </p>
      </div>
    );
  }

  const renderItemList = (items: MenuAnalysisItem[]) => {
    if (items.length === 0) {
      return (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic py-2 text-center">
          Trống — Chưa có món nào thuộc nhóm này
        </p>
      );
    }

    return (
      <div className="space-y-3 mt-3">
        {items.map((item) => (
          <div
            key={item.menuItemId}
            className="p-3 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 hover:border-amber-200 dark:hover:border-amber-900 transition-colors flex flex-col gap-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-gray-800 dark:text-gray-150">
                {item.name}
              </span>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <span>Đã bán: <strong className="text-gray-600 dark:text-gray-300">{item.totalSold}</strong></span>
                <span>•</span>
                <span>Lãi/Ly: <strong className="text-gray-600 dark:text-gray-300">{formatCurrency(item.margin)}</strong></span>
              </div>
            </div>
            {item.suggestion && (
              <p className="text-xs text-amber-900 dark:text-amber-400/90 leading-relaxed bg-amber-500/5 p-2 rounded border border-amber-500/10">
                💡 {item.suggestion}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* AI Summary Card */}
      {data.summary && (
        <div className="bg-gradient-to-r from-amber-50/60 to-orange-50/60 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-5 shadow-xs">
          <h3 className="text-base font-extrabold text-amber-850 dark:text-amber-450 flex items-center gap-2">
            🤖 Nhận định chiến lược từ AI
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-305 mt-2 leading-relaxed whitespace-pre-line">
            {data.summary}
          </p>
        </div>
      )}

      {/* Quadrants Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* STAR */}
        <div className="bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-950/50 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h4 className="text-sm font-extrabold text-emerald-800 dark:text-emerald-450 flex items-center gap-1.5">
                🌟 Nhóm STAR (Món chủ lực)
              </h4>
              <Badge variant="success">Doanh số cao + Lãi cao</Badge>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Các sản phẩm được khách hàng cực kỳ yêu thích và đem lại lợi nhuận biên lớn. Cần giữ nguyên chất lượng và đẩy mạnh thương hiệu.
            </p>
            {renderItemList(data.stars)}
          </div>
        </div>

        {/* PUZZLE */}
        <div className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-950/50 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h4 className="text-sm font-extrabold text-blue-850 dark:text-blue-450 flex items-center gap-1.5">
                🧩 Nhóm PUZZLE (Món ẩn số)
              </h4>
              <Badge variant="info">Doanh số thấp + Lãi cao</Badge>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Lợi nhuận rất tốt nhưng lượng bán ra chưa cao. Cần đưa vào vị trí nổi bật trên menu hoặc chạy ưu đãi đi kèm để tăng sức mua.
            </p>
            {renderItemList(data.puzzles)}
          </div>
        </div>

        {/* PLOW HORSE */}
        <div className="bg-white dark:bg-gray-900 border border-amber-100 dark:border-amber-950/40 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-amber-300 dark:hover:border-amber-800 transition-colors">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h4 className="text-sm font-extrabold text-amber-850 dark:text-amber-450 flex items-center gap-1.5">
                🐴 Nhóm PLOW HORSE (Ngựa kéo)
              </h4>
              <Badge variant="warning">Doanh số cao + Lãi thấp</Badge>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Khách mua rất nhiều nhưng lợi nhuận biên mỏng. Cần xem xét tăng giá nhẹ, điều chỉnh giảm bớt định lượng hạt/sữa hoặc combo để tối ưu.
            </p>
            {renderItemList(data.plowHorses)}
          </div>
        </div>

        {/* DOG */}
        <div className="bg-white dark:bg-gray-900 border border-rose-100 dark:border-rose-950/50 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-rose-300 dark:hover:border-rose-800 transition-colors">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h4 className="text-sm font-extrabold text-rose-800 dark:text-rose-455 flex items-center gap-1.5">
                🐕 Nhóm DOG (Món kém hiệu quả)
              </h4>
              <Badge variant="danger">Doanh số thấp + Lãi thấp</Badge>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Không bán được và cũng không đem lại lời nhiều. Nên xem xét gạch tên khỏi menu hoặc thay thế công thức hoàn toàn mới.
            </p>
            {renderItemList(data.dogs)}
          </div>
        </div>
      </div>
    </div>
  );
}
export default AIMenuAnalysis;
