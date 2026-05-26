'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useInventory } from '../../../../hooks/useInventory';
import { AIForecastCard } from '../../../../components/inventory/AIForecastCard';
import { Button } from '../../../../components/ui/Button';
import { InventoryForecastResponse, InventoryAnomalyResponse } from '../../../../types/inventory';
import { toast } from '../../../../hooks/useToast';

export default function InventoryAIForecastPage() {
  const { forecastDemand, detectAnomalies } = useInventory();
  const [forecast, setForecast] = useState<InventoryForecastResponse | null>(null);
  const [anomalies, setAnomalies] = useState<InventoryAnomalyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunAI = async () => {
    setIsLoading(true);
    try {
      toast.info('Đang phân tích dữ liệu tồn kho bằng Gemini AI...');
      // Run both calls in parallel
      const [forecastData, anomalyData] = await Promise.all([
        forecastDemand(),
        detectAnomalies()
      ]);

      setForecast(forecastData);
      setAnomalies(anomalyData);
      toast.success('Dự báo kho thành công!');
    } catch (err: any) {
      toast.error(err?.message ?? 'Gặp lỗi trong quá trình chạy phân tích AI');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/inventory" className="text-gray-400 hover:text-gray-600 transition-colors">
              ⬅️ Quay lại
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              🤖 AI Dự báo & Phân tích Tồn kho
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 pl-7">
            Sử dụng Google Gemini AI để tự động phát hiện hành vi tiêu thụ bất thường và dự báo khối lượng mua sắm tối ưu trong 7 ngày tới.
          </p>
        </div>

        <Button
          onClick={handleRunAI}
          disabled={isLoading}
          className="bg-amber-850 hover:bg-amber-900 text-white flex items-center gap-1.5 shadow-sm shrink-0"
        >
          {isLoading ? (
            <>
              <span className="animate-spin mr-1">⌛</span> Đang tính toán...
            </>
          ) : (
            <>🤖 Bắt đầu phân tích AI</>
          )}
        </Button>
      </div>

      {/* Main Content Area */}
      <AIForecastCard
        forecast={forecast}
        anomalies={anomalies}
        isLoading={isLoading}
      />
    </div>
  );
}
