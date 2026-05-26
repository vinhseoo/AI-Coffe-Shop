'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMenu } from '@/hooks/useMenu';
import { MenuAnalysisResponse, NewMenuSuggestion } from '@/types/menu';
import { AIMenuAnalysis } from '@/components/menu/AIMenuAnalysis';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { MenuItemForm } from '@/components/menu/MenuItemForm';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/hooks/useToast';

function MenuAISuggestPage() {
  const {
    isLoading,
    categories,
    fetchCategories,
    analyzeMenu,
    suggestNewMenu,
    createMenuItem,
  } = useMenu();

  const [analysisData, setAnalysisData] = useState<MenuAnalysisResponse | null>(null);
  const [suggestionData, setSuggestionData] = useState<NewMenuSuggestion | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [prefilledData, setPrefilledData] = useState<any>(null);

  // Load categories for adding suggestions
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleRunAnalysis = async () => {
    try {
      const data = await analyzeMenu();
      setAnalysisData(data);
      toast.success('Phân tích thực đơn thành công');
    } catch {
      // toast handles it
    }
  };

  const handleGetSuggestion = async () => {
    try {
      const data = await suggestNewMenu();
      setSuggestionData(data);
      toast.success('Gợi ý món mới thành công');
    } catch {
      // toast handles it
    }
  };

  const handleAddSuggestedToMenu = () => {
    if (!suggestionData) return;
    
    // Prefill form for MenuItem creation
    setPrefilledData({
      name: suggestionData.name,
      description: suggestionData.description,
      price: suggestionData.suggestedPrice,
      size: 'M',
      displayOrder: 0,
      isBestseller: false,
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (data: any) => {
    try {
      await createMenuItem(data);
      toast.success(`Đã thêm món "${data.name}" vào thực đơn`);
      setIsProductModalOpen(false);
    } catch {
      // handled
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link
          href="/menu"
          className="p-2 rounded-lg text-gray-400 hover:text-amber-850 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI Trợ lý Thực đơn</h2>
          <p className="text-xs text-gray-500 mt-0.5">Phân tích hiệu năng bán hàng, cải tổ công thức và sáng tạo món mới cùng AI.</p>
        </div>
      </div>

      {/* Action triggers */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={handleRunAnalysis}
          isLoading={isLoading && !suggestionData}
          variant="primary"
          className="flex items-center gap-1.5 shadow-sm"
        >
          <span>📊 Phân tích ma trận Menu (Engineering)</span>
        </Button>
        <Button
          onClick={handleGetSuggestion}
          isLoading={isLoading && !!suggestionData}
          variant="outline"
          className="border-amber-300 text-amber-850 hover:bg-amber-100/50 flex items-center gap-1.5 shadow-xs"
        >
          <span>💡 Đề xuất sáng tạo món uống mới</span>
        </Button>
      </div>

      {/* Two Columns Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left Column: Menu engineering (takes 2 cols if xl) */}
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
              <CardTitle>Kết quả phân tích hiệu năng thực đơn</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <AIMenuAnalysis data={analysisData} isLoading={isLoading && !suggestionData} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Suggest New Drink (takes 1 col if xl) */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="border-amber-150 dark:border-amber-900/30 overflow-hidden bg-gradient-to-b from-white to-amber-50/10 dark:from-gray-950 dark:to-amber-950/5">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800 bg-amber-50/20 dark:bg-amber-950/10">
              <CardTitle className="text-amber-850 dark:text-amber-400 flex items-center gap-1.5">
                🍹 Sáng tạo uống mới từ AI
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {isLoading && !!suggestionData ? (
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 rounded-full animate-ping mx-auto" />
                  <p className="text-xs text-gray-500 text-center">AI đang tổng hợp xu hướng thị trường và nguyên liệu hiện có...</p>
                </div>
              ) : suggestionData ? (
                <div className="space-y-4 animate-scale-up">
                  <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
                    <h3 className="text-lg font-extrabold text-amber-850 dark:text-amber-400">
                      {suggestionData.name}
                    </h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                      Giá đề xuất: {formatCurrency(suggestionData.suggestedPrice)}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">Hương vị cốt lõi:</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                      {suggestionData.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">Công thức nguyên liệu ước tính:</h4>
                    <ul className="mt-1.5 space-y-1">
                      {suggestionData.requiredIngredients.map((ing: any, idx: number) => (
                        <li key={idx} className="text-xs text-gray-500 dark:text-gray-400 flex justify-between bg-gray-50 dark:bg-gray-900 p-1.5 rounded">
                          <span>• {ing.name}</span>
                          <span className="font-semibold">{ing.quantity} {ing.unit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">Lý giải xu hướng:</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed bg-amber-500/5 p-2 rounded border border-amber-500/10 italic">
                      {suggestionData.reasoning}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                    <Button
                      onClick={handleAddSuggestedToMenu}
                      variant="primary"
                      className="w-full"
                    >
                      Thêm vào thực đơn của quán
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 text-xs">
                  Chưa có gợi ý. Bấm nút "Đề xuất sáng tạo món uống mới" phía trên để khám phá.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Prefilled Product Form Modal */}
      {prefilledData && (
        <MenuItemForm
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onSubmit={handleProductSubmit}
          categories={categories}
          initialData={prefilledData}
        />
      )}
    </div>
  );
}

import dynamic from 'next/dynamic';
export default dynamic(() => Promise.resolve(MenuAISuggestPage), {
  ssr: false,
});
