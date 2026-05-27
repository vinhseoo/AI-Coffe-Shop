'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMarketing } from '../../../hooks/useMarketing';
import { PromotionSuggestion } from '../../../types/marketing';
import { PromotionForm } from '../../../components/marketing/PromotionForm';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { Spinner } from '../../../components/ui/Spinner';
import { Badge } from '../../../components/ui/Badge';
import { 
  Sparkles, 
  RefreshCw, 
  Gift, 
  Calendar, 
  PenTool, 
  Megaphone,
  TrendingUp,
  Tag,
  Clock,
  ArrowRight,
  ChevronRight,
  Lightbulb,
  Zap
} from 'lucide-react';

export default function MarketingDashboardPage() {
  const {
    isLoading,
    isAiLoading,
    promotions,
    suggestions,
    scheduleAdvice,
    fetchPromotions,
    fetchAiSuggestions,
    fetchPostSchedule,
    createPromotion,
  } = useMarketing();

  const [activeTab, setActiveTab] = useState<'campaigns' | 'schedule'>('campaigns');
  
  // Promotion form modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [prefilledData, setPrefilledData] = useState<any>(null);

  useEffect(() => {
    fetchPromotions({ isActive: true }, 1, 5);
  }, []);

  // Fetch AI content on demand or tab load
  useEffect(() => {
    if (activeTab === 'campaigns' && suggestions.length === 0) {
      fetchAiSuggestions();
    } else if (activeTab === 'schedule' && !scheduleAdvice) {
      fetchPostSchedule();
    }
  }, [activeTab]);

  const handleApplySuggestion = (sug: PromotionSuggestion) => {
    setPrefilledData({
      name: sug.name,
      description: sug.description,
      type: sug.type,
      value: sug.value,
      minOrderValue: sug.minOrderValue,
      applicableItems: [],
      isActive: true,
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    await createPromotion({
      ...data,
      isAiSuggested: true,
    });
    fetchPromotions({ isActive: true }, 1, 5);
    // Reload AI suggestions since we might have applied one
    fetchAiSuggestions();
  };

  // Compute stats
  const activePromoCount = promotions.filter(p => p.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-amber-850" /> Chiến dịch & Marketing AI
          </h1>
          <p className="text-sm text-gray-550 dark:text-gray-400 mt-1">
            Gợi ý chương trình khuyến mãi thông minh, tạo nội dung quảng cáo tự động và tối ưu hóa thời gian đăng bài với AI.
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/marketing/content-generator">
            <Button className="bg-gradient-to-r from-violet-650 to-indigo-650 hover:from-violet-700 hover:to-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-md border-0">
              <PenTool className="h-4 w-4" /> Viết bài viết AI
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm overflow-hidden group hover:border-amber-300 dark:hover:border-amber-900/50 transition-colors">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-850 dark:text-amber-400 rounded-xl group-hover:scale-105 transition-transform duration-300">
              <Tag className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mã KM Hoạt động</p>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">{activePromoCount} chương trình</h3>
            </div>
            <Link href="/marketing/promotions" className="text-gray-400 hover:text-amber-850 p-1">
              <ChevronRight className="h-5 w-5" />
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm overflow-hidden group hover:border-violet-300 dark:hover:border-violet-900/50 transition-colors">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-violet-50 dark:bg-violet-950/20 text-violet-650 dark:text-violet-400 rounded-xl group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Đề xuất AI sẵn có</p>
              <h3 className="text-xl font-extrabold text-violet-650 dark:text-violet-400 mt-0.5">{suggestions.length} chiến dịch</h3>
            </div>
            <button onClick={() => setActiveTab('campaigns')} className="text-gray-400 hover:text-violet-650 p-1">
              <ChevronRight className="h-5 w-5" />
            </button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-900/50 transition-colors">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-105 transition-transform duration-300">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Doanh số Đăng bài</p>
              <h3 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">Tối ưu giờ vàng</h3>
            </div>
            <button onClick={() => setActiveTab('schedule')} className="text-gray-400 hover:text-emerald-600 p-1">
              <ChevronRight className="h-5 w-5" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-1.5 rounded-xl gap-1 shadow-sm">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'campaigns'
              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
              : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900'
          }`}
        >
          <Lightbulb className="h-4 w-4 text-amber-700" /> Cố vấn AI đề xuất chiến dịch
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'schedule'
              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
              : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900'
          }`}
        >
          <Clock className="h-4 w-4 text-emerald-600" /> Khung giờ vàng đăng bài AI
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Suggestions / Post Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'campaigns' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm text-gray-850 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-violet-500" /> Đề xuất khuyến mãi tối ưu từ Cố vấn AI
                </h3>
                <Button 
                  variant="outline" 
                  onClick={fetchAiSuggestions} 
                  disabled={isAiLoading}
                  className="h-8 py-1 px-3 text-xs gap-1 border-violet-200 text-violet-650"
                >
                  <RefreshCw className={`h-3 w-3 ${isAiLoading ? 'animate-spin' : ''}`} /> Tải lại đề xuất
                </Button>
              </div>

              {isAiLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm space-y-3">
                  <Spinner size="lg" />
                  <p className="text-xs text-gray-500 animate-pulse">Cố vấn AI đang quét kho nguyên liệu và phân tích doanh số để tìm chiến dịch tối ưu...</p>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm space-y-3">
                  <Megaphone className="h-10 w-10 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-400">Không có đề xuất khuyến mãi nào tại thời điểm này.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map((sug, idx) => (
                    <Card key={idx} className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm hover:border-violet-250 transition-colors relative overflow-hidden group">
                      <div className="absolute right-0 top-0 w-24 h-24 bg-violet-500/5 rounded-full blur-xl group-hover:scale-110 transition-transform pointer-events-none" />
                      
                      <CardContent className="p-5 space-y-3.5">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="inline-flex text-[9px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {sug.type === 'PERCENT' && 'Chiết khấu %'}
                              {sug.type === 'FIXED_AMOUNT' && 'Giảm tiền mặt'}
                              {sug.type === 'BUY_X_GET_Y' && 'Mua X tặng Y'}
                              {sug.type === 'FREE_TOPPING' && 'Free Topping'}
                            </span>
                            <h4 className="font-extrabold text-sm text-gray-850 dark:text-white mt-1.5">{sug.name}</h4>
                          </div>

                          <Button 
                            onClick={() => handleApplySuggestion(sug)}
                            className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-1.5 px-3 h-8 shrink-0 flex items-center gap-1 shadow-sm"
                          >
                            Áp dụng ngay <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>

                        <p className="text-xs text-gray-550 dark:text-gray-400 leading-relaxed font-semibold">
                          {sug.description}
                        </p>

                        <div className="bg-gray-50 dark:bg-gray-950 p-3 rounded-xl border border-gray-150 dark:border-gray-850 flex gap-2.5 items-start">
                          <Zap className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-extrabold text-gray-450 uppercase tracking-wide">Nhận định phân tích của AI</span>
                            <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed font-medium">
                              {sug.reasoning}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm text-gray-850 dark:text-white flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5 text-emerald-650" /> Đề xuất Lịch đăng bài & Khung giờ vàng từ AI
                </h3>
                <Button 
                  variant="outline" 
                  onClick={fetchPostSchedule} 
                  disabled={isAiLoading}
                  className="h-8 py-1 px-3 text-xs gap-1 border-emerald-250 text-emerald-700"
                >
                  <RefreshCw className={`h-3 w-3 ${isAiLoading ? 'animate-spin' : ''}`} /> Phân tích lại
                </Button>
              </div>

              {isAiLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm space-y-3">
                  <Spinner size="lg" />
                  <p className="text-xs text-gray-500 animate-pulse">Cố vấn AI đang phân tích biểu đồ doanh số hóa đơn theo khung giờ để tìm thời gian tương tác tốt nhất...</p>
                </div>
              ) : (
                <Card className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm">
                  <CardContent className="p-6 prose dark:prose-invert max-w-none">
                    <div className="text-xs leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line font-medium">
                      {scheduleAdvice || 'Chưa có phân tích lịch đăng. Nhấp "Phân tích lại" để cập nhật.'}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Column: Quick Actions & Active codes preview */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 py-4">
              <CardTitle className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Thao tác nhanh
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              <Link href="/marketing/promotions" className="block">
                <button className="w-full flex justify-between items-center p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-amber-300 hover:bg-amber-50/10 dark:hover:bg-amber-950/10 text-left transition-all duration-200 group">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-50 dark:bg-amber-950/20 text-amber-850 dark:text-amber-400 rounded-lg">
                      <Gift className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-850 dark:text-white">Quản lý Khuyến mãi</p>
                      <p className="text-[10px] text-gray-450 mt-0.5">Tạo mới, bật/tắt coupon giảm giá</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4.5 w-4.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>

              <Link href="/marketing/content-generator" className="block">
                <button className="w-full flex justify-between items-center p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-violet-300 hover:bg-violet-50/10 dark:hover:bg-violet-950/10 text-left transition-all duration-200 group">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-violet-50 dark:bg-violet-950/20 text-violet-650 dark:text-violet-400 rounded-lg">
                      <PenTool className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-850 dark:text-white">Viết bài Caption AI</p>
                      <p className="text-[10px] text-gray-450 mt-0.5">Soạn nội dung FB, TikTok, IG tự động</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4.5 w-4.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
            </CardContent>
          </Card>

          {/* Active Campaigns Card */}
          <Card className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Chương trình đang chạy
              </CardTitle>
              <Link href="/marketing/promotions" className="text-[10px] font-bold text-amber-850 hover:underline">
                Xem tất cả
              </Link>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <Spinner size="sm" />
                </div>
              ) : promotions.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4 italic">Chưa cấu hình mã khuyến mãi nào</p>
              ) : (
                <div className="space-y-3">
                  {promotions.map((p) => (
                    <div 
                      key={p.id}
                      className="p-3 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-150 dark:border-gray-800 rounded-xl space-y-1 hover:border-amber-200 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-gray-800 dark:text-gray-200">{p.name}</span>
                        {p.isActive ? (
                          <Badge variant="success" size="sm">Đang chạy</Badge>
                        ) : (
                          <Badge variant="default" size="sm">Nháp</Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-550 dark:text-gray-400 line-clamp-1">{p.description}</p>
                      
                      <div className="flex justify-between items-center text-[9px] text-gray-400 pt-1.5 border-t border-dashed border-gray-100 dark:border-gray-800">
                        <span>Giá trị: <span className="font-bold text-gray-700 dark:text-gray-300">{p.value}{p.type === 'PERCENT' ? '%' : 'đ'}</span></span>
                        <span>Đã dùng: <span className="font-bold text-gray-700 dark:text-gray-300">{p.usedCount} lượt</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Promotion Form Modal (Pre-filled from AI Suggestion) */}
      <PromotionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setPrefilledData(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={prefilledData}
      />
    </div>
  );
}
