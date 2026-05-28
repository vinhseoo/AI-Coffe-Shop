'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Spinner } from '../../../../components/ui/Spinner';
import { useReports } from '../../../../hooks/useReports';
import { AIReportViewer } from '../../../../components/ai/AIReportViewer';
import {
  Sparkles,
  TrendingUp,
  Sliders,
  Calendar,
  Star,
  Trash2,
  Clock,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';
import { AIReport, AIReportType } from '../../../../types/ai';
import Link from 'next/link';

export default function AIAnalysisPage() {
  const {
    isLoading,
    isAiLoading,
    aiHistory,
    fetchAIHistory,
    generateWeeklyAnalysis,
    generateForecast,
    generateSuggestions,
    toggleBookmark,
    deleteReport,
  } = useReports();

  const [activeReport, setActiveReport] = useState<AIReport | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      const history = await fetchAIHistory();
      if (history && history.length > 0) {
        setActiveReport(history[0]);
      }
    };
    loadHistory();
  }, []);

  const handleWeeklyGenerate = async () => {
    try {
      const res = await generateWeeklyAnalysis();
      // Load history to get the latest saved report
      const history = await fetchAIHistory();
      if (history && history.length > 0) {
        setActiveReport(history[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleForecastGenerate = async () => {
    try {
      const res = await generateForecast();
      const history = await fetchAIHistory();
      if (history && history.length > 0) {
        setActiveReport(history[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSuggestionsGenerate = async () => {
    try {
      const res = await generateSuggestions();
      const history = await fetchAIHistory();
      if (history && history.length > 0) {
        setActiveReport(history[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReportSelect = (rep: AIReport) => {
    setActiveReport(rep);
  };

  const getReportTypeLabel = (type: AIReportType) => {
    switch (type) {
      case 'WEEKLY_ANALYSIS':
        return 'Phân tích tuần';
      case 'REVENUE_FORECAST':
        return 'Dự báo doanh thu';
      case 'BUSINESS_INSIGHT':
        return 'Đề xuất kinh doanh';
      default:
        return 'Báo cáo AI';
    }
  };

  const getReportTypeColor = (type: AIReportType) => {
    switch (type) {
      case 'WEEKLY_ANALYSIS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'REVENUE_FORECAST':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'BUSINESS_INSIGHT':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation and Title */}
      <div className="flex items-center gap-4 bg-white dark:bg-gray-950 p-4 rounded-xl border border-gray-150 dark:border-gray-800 shadow-xs">
        <Link href="/reports">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full border border-gray-200 dark:border-gray-800">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Cố vấn Doanh nghiệp AI
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Tạo các báo cáo phân tích thông minh từ dữ liệu lớn của quán.</p>
        </div>
      </div>

      {/* Generator Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'Phân tích Tuần này',
            desc: 'So sánh hiệu suất bán hàng, nhóm khách và đề xuất hành động hàng tuần.',
            icon: <Calendar className="w-6 h-6" />,
            action: handleWeeklyGenerate,
            btnText: 'Khởi tạo phân tích',
            color: 'from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white',
            borderColor: 'border-blue-100 dark:border-blue-900/30',
          },
          {
            title: 'Dự báo doanh số (7 ngày)',
            desc: 'Phân tích tính chu kỳ và dự báo doanh số của tuần tới bằng hồi quy thời gian.',
            icon: <TrendingUp className="w-6 h-6" />,
            action: handleForecastGenerate,
            btnText: 'Chạy dự báo',
            color: 'from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white',
            borderColor: 'border-emerald-100 dark:border-emerald-900/30',
          },
          {
            title: 'Đề xuất tối ưu kinh doanh',
            desc: 'Phân tích biên lợi nhuận món ăn, chi phí nguyên liệu và đề xuất giảm thiểu tổn thất.',
            icon: <Sliders className="w-6 h-6" />,
            action: handleSuggestionsGenerate,
            btnText: 'Tạo đề xuất tối ưu',
            color: 'from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white',
            borderColor: 'border-purple-100 dark:border-purple-900/30',
          },
        ].map((act, idx) => (
          <Card key={idx} className={`border-2 ${act.borderColor} flex flex-col justify-between h-full bg-white dark:bg-gray-950`}>
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 mb-3 shadow-xs">
                {act.icon}
              </div>
              <CardTitle className="text-base font-extrabold text-gray-900 dark:text-white">
                {act.title}
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {act.desc}
              </p>
            </CardHeader>
            <CardContent className="pt-2">
              <Button
                onClick={act.action}
                disabled={isAiLoading}
                className={`w-full bg-gradient-to-r ${act.color} font-bold text-xs py-2`}
              >
                {isAiLoading ? <Spinner size="sm" variant="white" /> : act.btnText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Processing Screen overlay */}
      {isAiLoading && (
        <Card className="border-purple-200 dark:border-purple-900 bg-purple-500/5 shadow-xs py-8 text-center animate-pulse">
          <CardContent className="space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-purple-950 dark:text-purple-300">
                AI đang tính toán dữ liệu...
              </h3>
              <p className="text-xs text-gray-500">
                Quá trình này có thể mất 15-30 giây để xử lý dữ liệu tài chính của quán và gọi Gemini AI.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Workspace (Split layout: History and Active Report) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Saved Reports History */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            Lịch sử Báo cáo AI
          </h2>
          <Card className="border-gray-150 dark:border-gray-800">
            <CardContent className="p-0">
              {isLoading && aiHistory.length === 0 ? (
                <div className="py-12 flex justify-center">
                  <Spinner size="md" />
                </div>
              ) : aiHistory.length > 0 ? (
                <div className="divide-y divide-gray-150 dark:divide-gray-800 max-h-[500px] overflow-y-auto">
                  {aiHistory.map((rep) => {
                    const isSelected = activeReport?.id === rep.id;
                    return (
                      <div
                        key={rep.id}
                        className={`flex items-center justify-between p-3.5 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/5 border-l-4 border-amber-600'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-900 border-l-4 border-transparent'
                        }`}
                      >
                        <div
                          onClick={() => handleReportSelect(rep)}
                          className="flex-1 space-y-1 pr-2 overflow-hidden"
                        >
                          <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                            {rep.title}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${getReportTypeColor(rep.reportType)}`}>
                              {getReportTypeLabel(rep.reportType)}
                            </span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5 font-mono">
                              <Clock className="w-3 h-3" />
                              {new Date(rep.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => toggleBookmark(rep.id)}
                            className="p-1 rounded-md text-gray-400 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <Star className={`w-3.5 h-3.5 ${rep.isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                          </button>
                          <button
                            onClick={() => deleteReport(rep.id)}
                            className="p-1 rounded-md text-gray-400 hover:text-rose-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-gray-400">
                  Chưa có báo cáo AI nào được lưu
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Active Report Viewer */}
        <div className="lg:col-span-2 space-y-4">
          {activeReport ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-3 rounded-lg">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getReportTypeColor(activeReport.reportType)}`}>
                    {getReportTypeLabel(activeReport.reportType)}
                  </span>
                  <h2 className="text-base font-extrabold text-gray-900 dark:text-white mt-1">
                    {activeReport.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => toggleBookmark(activeReport.id)}
                    variant="outline"
                    size="sm"
                    className="text-xs border-gray-300 dark:border-gray-800"
                  >
                    <Star className={`w-3.5 h-3.5 mr-1 ${activeReport.isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                    {activeReport.isBookmarked ? 'Đã lưu trữ' : 'Lưu trữ'}
                  </Button>
                </div>
              </div>

              <AIReportViewer content={activeReport.content} />
            </div>
          ) : (
            <Card className="border-gray-150 dark:border-gray-800 py-24 text-center">
              <CardContent className="space-y-2">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400">
                  Chọn báo cáo để đọc
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Hãy chọn một báo cáo trong danh sách lịch sử bên trái, hoặc nhấn các nút phía trên để AI tiến hành phân tích dữ liệu mới.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
