import React from 'react';
import { InventoryForecastResponse, InventoryAnomalyResponse } from '../../types/inventory';
import { Badge } from '../ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../ui/Table';
import { formatCurrency } from '../../lib/utils';

interface AIForecastCardProps {
  forecast: InventoryForecastResponse | null;
  anomalies: InventoryAnomalyResponse | null;
  isLoading: boolean;
}

export function AIForecastCard({ forecast, anomalies, isLoading }: AIForecastCardProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeleton */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl p-6 shadow-sm space-y-4 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10 text-center">
        <span className="text-5xl">🤖</span>
        <h3 className="mt-4 text-base font-bold text-gray-850 dark:text-gray-100">
          Chưa có phân tích AI
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Nhấn nút "Dự báo bằng AI" ở trên để gửi dữ liệu tồn kho 30 ngày qua và nhận dự báo mua hàng tự động.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Block */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-100 dark:border-amber-900/40 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 dark:bg-amber-900/50 h-10 w-10 rounded-xl flex items-center justify-center text-xl shrink-0">
            🤖
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="font-bold text-amber-900 dark:text-amber-300">Nhận định từ AI Assistant</h3>
            <p className="text-sm text-amber-850 dark:text-amber-200/90 leading-relaxed whitespace-pre-line">
              {forecast.summary}
            </p>
            {forecast.totalEstimatedCost > 0 && (
              <div className="pt-2 border-t border-amber-200/40 dark:border-amber-900/20 flex flex-wrap items-center gap-4">
                <div>
                  <span className="text-xs text-amber-700 dark:text-amber-400">Tổng chi phí dự kiến:</span>
                  <p className="text-lg font-bold text-amber-900 dark:text-amber-300">
                    {formatCurrency(forecast.totalEstimatedCost)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Anomalies Alert */}
      {anomalies && anomalies.anomalies && anomalies.anomalies.length > 0 && (
        <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-rose-500">⚠️</span>
            <h4 className="font-bold text-rose-800 dark:text-rose-400 text-sm">Phát hiện bất thường tồn kho:</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {anomalies.anomalies.map((ano, idx) => {
              let sevColor = 'danger';
              if (ano.severity === 'MEDIUM') sevColor = 'warning';
              if (ano.severity === 'LOW') sevColor = 'info';

              return (
                <div key={idx} className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-rose-100/40 dark:border-rose-950/20 flex gap-2">
                  <div className="pt-0.5">
                    <Badge variant={sevColor as any} size="sm">{ano.severity}</Badge>
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-gray-850 dark:text-gray-200">{ano.ingredientName}</h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{ano.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {anomalies.summary && (
            <p className="text-xs text-rose-700/80 dark:text-rose-350/80 italic whitespace-pre-line pt-1">
              * {anomalies.summary}
            </p>
          )}
        </div>
      )}

      {/* Urgent Table */}
      {forecast.urgentItems && forecast.urgentItems.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-red-150 dark:border-red-900/50 rounded-xl p-4 shadow-sm space-y-3">
          <h4 className="font-bold text-rose-700 dark:text-rose-400 text-sm flex items-center gap-2">
            🚨 Nguyên liệu sắp cạn kiệt (Dưới 3 ngày)
          </h4>
          <Table>
            <TableHeader>
              <TableRow className="bg-rose-50/20 dark:bg-rose-950/10">
                <TableHead>Nguyên liệu</TableHead>
                <TableHead>Tồn hiện tại</TableHead>
                <TableHead>Tiêu thụ dự kiến (7 ngày)</TableHead>
                <TableHead>Hết sau (ngày)</TableHead>
                <TableHead>Đề xuất nhập</TableHead>
                <TableHead>Chi phí ước tính</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forecast.urgentItems.map((item) => (
                <TableRow key={item.ingredientId} className="border-red-100 dark:border-red-950/40">
                  <TableCell className="font-semibold text-rose-700 dark:text-rose-400">{item.ingredientName}</TableCell>
                  <TableCell>{item.currentStock} {item.unit}</TableCell>
                  <TableCell>{item.predictedConsumption7Days} {item.unit}</TableCell>
                  <TableCell>
                    <Badge variant="danger" size="sm">
                      {item.daysUntilRunOut === 0 ? 'Hết sạch' : `${item.daysUntilRunOut} ngày`}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-amber-800 dark:text-amber-400">
                    {item.suggestedImportQuantity} {item.unit}
                  </TableCell>
                  <TableCell>{formatCurrency(item.estimatedCost)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Forecast list */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <h4 className="font-bold text-gray-850 dark:text-white text-sm">Dự báo chi tiết (Tất cả nguyên liệu)</h4>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nguyên liệu</TableHead>
              <TableHead>Tồn hiện tại</TableHead>
              <TableHead>Tiêu thụ dự kiến (7 ngày)</TableHead>
              <TableHead>Thời gian còn lại</TableHead>
              <TableHead>Đề xuất nhập</TableHead>
              <TableHead>Chi phí ước tính</TableHead>
              <TableHead>Độ ưu tiên</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forecast.predictions.length === 0 ? (
              <TableEmpty message="Không có dữ liệu dự báo." />
            ) : (
              forecast.predictions.map((item) => {
                let priorityVar = 'default';
                if (item.priority === 'HIGH') priorityVar = 'danger';
                if (item.priority === 'MEDIUM') priorityVar = 'warning';
                if (item.priority === 'LOW') priorityVar = 'success';

                return (
                  <TableRow key={item.ingredientId}>
                    <TableCell className="font-semibold text-gray-800 dark:text-gray-200">
                      {item.ingredientName}
                    </TableCell>
                    <TableCell>{item.currentStock} {item.unit}</TableCell>
                    <TableCell>{item.predictedConsumption7Days} {item.unit}</TableCell>
                    <TableCell>
                      {item.daysUntilRunOut > 30 ? '> 30 ngày' : `${item.daysUntilRunOut} ngày`}
                    </TableCell>
                    <TableCell className="font-semibold text-amber-800 dark:text-amber-400">
                      {item.suggestedImportQuantity > 0 ? `${item.suggestedImportQuantity} ${item.unit}` : '—'}
                    </TableCell>
                    <TableCell>
                      {item.suggestedImportQuantity > 0 ? formatCurrency(item.estimatedCost) : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={priorityVar as any} size="sm">{item.priority}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
