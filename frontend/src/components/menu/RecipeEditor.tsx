import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { ApiResponse } from '../../types/api';
import { Ingredient } from '../../types/inventory';
import { RecipeIngredient, PriceSuggestion } from '../../types/menu';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { useMenu } from '../../hooks/useMenu';
import { formatCurrency } from '../../lib/utils';
import { toast } from '../../hooks/useToast';

interface RecipeEditorProps {
  variantId: number;
  initialRecipe: RecipeIngredient[];
  currentPrice: number;
  onSave: (items: Array<{ ingredientId: number; quantity: number }>) => Promise<void>;
  onPriceUpdate: (newPrice: number) => Promise<void>;
}

interface RecipeRow {
  ingredientId: number;
  quantity: number;
}

export function RecipeEditor({ variantId, initialRecipe, currentPrice, onSave, onPriceUpdate }: RecipeEditorProps) {
  const { suggestPrice, isLoading: isAiLoading } = useMenu();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [rows, setRows] = useState<RecipeRow[]>([]);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // AI Modal States
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [targetMargin, setTargetMargin] = useState<number>(70); // Mặc định biên lợi nhuận 70%
  const [aiSuggestion, setAiSuggestion] = useState<PriceSuggestion | null>(null);

  // Fetch ingredients
  useEffect(() => {
    const fetchIngredientsList = async () => {
      setIsLoadingIngredients(true);
      try {
        const res = await api.get<any, ApiResponse<Ingredient[]>>('/ingredients');
        setIngredients(res.data);
      } catch (err: any) {
        toast.error('Không thể tải danh sách nguyên liệu: ' + err.message);
      } finally {
        setIsLoadingIngredients(false);
      }
    };
    fetchIngredientsList();
  }, []);

  // Map initialRecipe to rows
  useEffect(() => {
    if (initialRecipe && initialRecipe.length > 0) {
      setRows(
        initialRecipe.map((item) => ({
          ingredientId: item.ingredientId,
          quantity: item.quantity,
        }))
      );
    } else {
      setRows([]);
    }
  }, [initialRecipe]);

  const handleAddRow = () => {
    if (ingredients.length === 0) return;
    setRows([...rows, { ingredientId: ingredients[0].id, quantity: 10 }]);
  };

  const handleRemoveRow = (index: number) => {
    setRows(rows.filter((_, idx) => idx !== index));
  };

  const handleRowChange = (index: number, field: keyof RecipeRow, value: number) => {
    setRows(
      rows.map((row, idx) => {
        if (idx === index) {
          return { ...row, [field]: value };
        }
        return row;
      })
    );
  };

  // Tính giá vốn dự kiến của công thức hiện tại
  const calculateEstimatedCost = () => {
    return rows.reduce((total, row) => {
      const ingredient = ingredients.find((ing) => ing.id === row.ingredientId);
      if (!ingredient) return total;
      return total + row.quantity * ingredient.unitCost;
    }, 0);
  };

  const estimatedCost = calculateEstimatedCost();

  const handleSaveRecipe = async () => {
    setIsSaving(true);
    try {
      // Validate
      const invalidRows = rows.filter((row) => !row.ingredientId || row.quantity <= 0);
      if (invalidRows.length > 0) {
        toast.error('Vui lòng nhập đầy đủ nguyên liệu và số lượng lớn hơn 0');
        return;
      }
      await onSave(rows);
    } catch {
      // toast handles it
    } finally {
      setIsSaving(false);
    }
  };

  // Gọi AI gợi ý giá bán
  const handleGetAiPriceSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rows.length === 0) {
      toast.error('Vui lòng thêm nguyên liệu vào công thức trước khi định giá');
      return;
    }
    try {
      const res = await suggestPrice(variantId, targetMargin);
      setAiSuggestion(res);
      setIsAiModalOpen(true);
    } catch {
      // Handled by hook
    }
  };

  const handleApplyAiPrice = async () => {
    if (!aiSuggestion) return;
    try {
      await onPriceUpdate(aiSuggestion.suggestedPrice);
      setIsAiModalOpen(false);
    } catch {
      // Handled by parent
    }
  };

  const ingredientOptions = ingredients.map((ing) => ({
    value: ing.id,
    label: `${ing.name} (${ing.unit}) - ${formatCurrency(ing.unitCost)}/${ing.unit}`,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-150 dark:border-gray-800 p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Công thức pha chế / Chế biến
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Thiết lập các nguyên liệu hao phí cho mỗi ly nước để tự động trừ kho khi bán và tính giá vốn.
            </p>
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddRow}
            disabled={isLoadingIngredients || ingredients.length === 0}
            className="flex items-center gap-1.5"
          >
            <span>➕ Thêm nguyên liệu</span>
          </Button>
        </div>

        {/* Recipe Rows Table */}
        {rows.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Món ăn này chưa được cấu hình công thức nguyên vật liệu.
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row, index) => {
              const selectedIng = ingredients.find((ing) => ing.id === row.ingredientId);
              const rowCost = selectedIng ? row.quantity * selectedIng.unitCost : 0;
              return (
                <div key={index} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-850">
                  <div className="flex-1">
                    <Select
                      options={ingredientOptions}
                      value={row.ingredientId}
                      onChange={(e) => handleRowChange(index, 'ingredientId', Number(e.target.value))}
                      placeholder="Chọn nguyên liệu"
                      className="h-9"
                    />
                  </div>
                  
                  <div className="w-32 flex items-center gap-1.5 shrink-0">
                    <Input
                      type="number"
                      value={row.quantity}
                      onChange={(e) => handleRowChange(index, 'quantity', Number(e.target.value))}
                      placeholder="Lượng dùng"
                      className="h-9 py-1"
                      required
                    />
                    <span className="text-xs text-gray-500 font-semibold w-8 truncate">
                      {selectedIng?.unit || 'đv'}
                    </span>
                  </div>

                  <div className="w-28 text-right font-medium text-xs text-amber-900 dark:text-amber-500 shrink-0">
                    {formatCurrency(rowCost)}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveRow(index)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors shrink-0"
                    title="Xóa nguyên liệu"
                  >
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}

            {/* Total Cost & Actions */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Giá vốn nguyên liệu ước tính: <span className="text-lg font-bold text-amber-800 dark:text-amber-400 ml-1">{formatCurrency(estimatedCost)}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSaveRecipe}
                  isLoading={isSaving}
                  disabled={rows.length === 0}
                >
                  Lưu công thức
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Pricing Form */}
      {rows.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30 p-5 shadow-xs">
          <h4 className="text-sm font-extrabold text-amber-850 dark:text-amber-400 flex items-center gap-1.5">
            💡 Tự động định giá bán bằng AI
          </h4>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            Nhập tỷ suất lợi nhuận kỳ vọng của bạn, AI sẽ phân tích chi tiết công thức nguyên vật liệu và đề xuất giá bán tối ưu nhất.
          </p>

          <form onSubmit={handleGetAiPriceSuggestion} className="mt-4 flex items-end gap-4 max-w-md">
            <div className="flex-1">
              <Input
                label="Biên lợi nhuận mong muốn (%)"
                type="number"
                value={targetMargin}
                onChange={(e) => setTargetMargin(Number(e.target.value))}
                min={1}
                max={99}
                required
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              isLoading={isAiLoading}
              className="border-amber-305 text-amber-850 hover:bg-amber-100/50"
            >
              Hỏi AI định giá
            </Button>
          </form>
        </div>
      )}

      {/* AI Price Suggestion Modal */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title="Gợi ý định giá từ AI"
        size="md"
      >
        {aiSuggestion && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Giá bán đề xuất</p>
              <h3 className="text-3xl font-extrabold text-amber-850 dark:text-amber-450 mt-1">
                {formatCurrency(aiSuggestion.suggestedPrice)}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Giá bán hiện tại: <span className="font-semibold text-gray-600 dark:text-gray-300">{formatCurrency(currentPrice)}</span> | Biên lợi nhuận: <span className="font-semibold text-emerald-600">{aiSuggestion.targetMargin}%</span>
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Phân rã chi phí dự toán:</h4>
              <div className="mt-2 space-y-1.5">
                {Object.entries(aiSuggestion.costBreakdown).map(([name, cost]) => (
                  <div key={name} className="flex justify-between items-center text-xs p-2 bg-gray-50 dark:bg-gray-900 rounded">
                    <span className="text-gray-500 dark:text-gray-400 font-semibold">{name}</span>
                    <span className="font-bold text-gray-800 dark:text-gray-150">{formatCurrency(cost)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Phân tích & Lập luận của AI:</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-850">
                {aiSuggestion.reasoning}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <Button variant="outline" onClick={() => setIsAiModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button variant="primary" onClick={handleApplyAiPrice}>
                Áp dụng giá này
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
export default RecipeEditor;
