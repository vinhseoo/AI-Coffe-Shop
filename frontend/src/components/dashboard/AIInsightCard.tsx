import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { AIDashboardSummary } from '../../types/dashboard';

interface AIInsightCardProps {
  aiSummary: AIDashboardSummary | null;
  isLoading: boolean;
  onGenerate: () => void;
}

export function AIInsightCard({ aiSummary, isLoading, onGenerate }: AIInsightCardProps) {
  const [showSuggestions, setShowSuggestions] = useState(true);

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-700 text-white border-0 shadow-xl">
      {/* Decorative background glow */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-black/10 rounded-full blur-2xl" />

      <CardHeader className="relative pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <span>✨</span> Cố vấn AI Phân tích
        </CardTitle>
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Đang phân tích...
            </>
          ) : (
            <>🔄 Phân tích lại</>
          )}
        </button>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        {aiSummary ? (
          <>
            <p className="text-sm leading-relaxed text-indigo-50 font-medium">
              {aiSummary.summary}
            </p>

            <div className="border-t border-white/10 pt-4">
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="flex items-center justify-between w-full text-xs font-semibold text-indigo-100 hover:text-white transition-colors cursor-pointer"
              >
                <span>💡 ĐỀ XUẤT KHUYẾN NGHỊ</span>
                <span>{showSuggestions ? '▼' : '▲'}</span>
              </button>

              {showSuggestions && (
                <ul className="mt-3 space-y-2 text-xs">
                  {aiSummary.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex gap-2 bg-white/5 rounded-lg p-2.5 hover:bg-white/10 transition-colors">
                      <span className="text-yellow-300 shrink-0">⚡</span>
                      <span className="text-indigo-50">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <span className="text-4xl">🤖</span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-indigo-100">Chưa có dữ liệu phân tích hôm nay</p>
              <p className="text-xs text-indigo-200">Nhấp vào nút bên dưới để Cố vấn AI phân tích dữ liệu bán hàng.</p>
            </div>
            <button
              onClick={onGenerate}
              disabled={isLoading}
              className="mt-2 px-4 py-2 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              Yêu cầu AI phân tích ngay
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
