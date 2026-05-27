'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMarketing } from '../../../../hooks/useMarketing';
import { useMenu } from '../../../../hooks/useMenu';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Spinner } from '../../../../components/ui/Spinner';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/Card';
import { toast } from '../../../../hooks/useToast';
import { 
  ArrowLeft, 
  PenTool, 
  Sparkles, 
  Copy, 
  Share2, 
  Camera, 
  MessageSquare,
  Hash,
  RefreshCw,
  Zap
} from 'lucide-react';

export default function ContentGeneratorPage() {
  const { isAiLoading, activeCaption, generateCaption } = useMarketing();
  const { menuItems, fetchMenuItems } = useMenu();

  const [useCustomProduct, setUseCustomProduct] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [customProductName, setCustomProductName] = useState('');
  const [selectedTone, setSelectedTone] = useState('vui vẻ, tràn đầy năng lượng');
  const [selectedPlatform, setSelectedPlatform] = useState('Facebook');

  // Load menu items for selection
  useEffect(() => {
    fetchMenuItems(null, '', 1, 100);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!useCustomProduct && !selectedItemId) {
      toast.error('Vui lòng chọn một món uống trong menu');
      return;
    }
    if (useCustomProduct && !customProductName.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm tự chọn');
      return;
    }

    await generateCaption({
      menuItemId: useCustomProduct ? undefined : Number(selectedItemId),
      customProduct: useCustomProduct ? customProductName.trim() : undefined,
      tone: selectedTone,
      platform: selectedPlatform,
    });
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label} vào bộ nhớ tạm!`);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Facebook':
        return <Share2 className="h-4 w-4 text-blue-650 shrink-0" />;
      case 'Instagram':
        return <Camera className="h-4 w-4 text-pink-600 shrink-0" />;
      case 'TikTok':
        return <MessageSquare className="h-4 w-4 text-black dark:text-white shrink-0" />;
      default:
        return <PenTool className="h-4 w-4 text-gray-500 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/marketing">
          <button className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-amber-850 dark:hover:text-amber-400 transition-colors group mb-2">
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" /> Quay lại Dashboard
          </button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <PenTool className="h-6 w-6 text-amber-850" /> Trình tạo Nội dung quảng cáo AI
        </h1>
        <p className="text-sm text-gray-550 dark:text-gray-400 mt-1">
          Tạo nhanh bài đăng mạng xã hội thu hút với 3 phiên bản độ dài khác nhau dựa trên thông tin sản phẩm và giọng điệu mong muốn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Configuration Form */}
        <div className="lg:col-span-1">
          <Card className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm sticky top-6">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800 py-4">
              <CardTitle className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-violet-500" /> Cấu hình bài viết
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleGenerate} className="space-y-4">
                {/* Select Type */}
                <div className="flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomProduct(false);
                      setCustomProductName('');
                    }}
                    className={`flex-1 py-2 font-bold transition-colors ${
                      !useCustomProduct
                        ? 'bg-amber-850 text-white'
                        : 'bg-white dark:bg-gray-900 text-gray-600 hover:bg-gray-55 dark:hover:bg-gray-800'
                    }`}
                  >
                    Chọn món menu
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomProduct(true);
                      setSelectedItemId('');
                    }}
                    className={`flex-1 py-2 font-bold transition-colors ${
                      useCustomProduct
                        ? 'bg-amber-850 text-white'
                        : 'bg-white dark:bg-gray-900 text-gray-600 hover:bg-gray-55 dark:hover:bg-gray-800'
                    }`}
                  >
                    Món tự định nghĩa
                  </button>
                </div>

                {/* Target Product */}
                {!useCustomProduct ? (
                  <Select
                    label="Món uống trong menu *"
                    placeholder="Chọn món uống cần viết bài..."
                    value={selectedItemId}
                    onChange={(e: any) => setSelectedItemId(e.target.value)}
                    options={menuItems.map((item: any) => ({
                      value: String(item.id),
                      label: item.name,
                    }))}
                    required
                  />
                ) : (
                  <Input
                    label="Tên món / thông tin sản phẩm *"
                    placeholder="Ví dụ: Hồng trà sữa trân châu hoàng kim béo ngậy..."
                    value={customProductName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomProductName(e.target.value)}
                    required
                  />
                )}

                {/* Tone select */}
                <Select
                  label="Tone giọng bài đăng *"
                  value={selectedTone}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTone(e.target.value)}
                  options={[
                    { value: 'vui vẻ, tràn đầy năng lượng, nhiều emoji bắt mắt', label: '😊 Vui vẻ, năng động' },
                    { value: 'chuyên nghiệp, lịch thiệp, tinh tế và sang trọng', label: '💼 Chuyên nghiệp, thanh lịch' },
                    { value: 'Gen-Z hài hước, sử dụng từ lóng trẻ trung, dí dỏm', label: '⚡ Gen-Z, hài hước' },
                    { value: 'sâu sắc, lãng mạn, kể chuyện nhẹ nhàng, truyền cảm hứng', label: '✍️ Sâu lắng, thơ mộng' },
                  ]}
                />

                {/* Platform select */}
                <Select
                  label="Nền tảng mục tiêu *"
                  value={selectedPlatform}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedPlatform(e.target.value)}
                  options={[
                    { value: 'Facebook', label: '🔵 Facebook Post' },
                    { value: 'Instagram', label: '📸 Instagram Caption' },
                    { value: 'TikTok', label: '🎵 TikTok Video script/caption' },
                  ]}
                />

                <Button 
                  type="submit" 
                  disabled={isAiLoading}
                  className="w-full bg-amber-850 hover:bg-amber-900 text-white py-3 font-bold flex items-center justify-center gap-2 shadow-md"
                >
                  {isAiLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      AI đang soạn thảo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Tạo Caption với AI
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Results Workspace */}
        <div className="lg:col-span-2">
          {isAiLoading ? (
            <div className="flex flex-col items-center justify-center py-28 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
              <Spinner size="lg" />
              <p className="text-sm font-semibold text-gray-500 animate-pulse">Copywriter AI đang phác thảo 3 bài viết độc đáo...</p>
            </div>
          ) : activeCaption ? (
            <div className="space-y-6">
              {/* Copywriting Variants Carousel / Stack */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-gray-850 dark:text-white flex items-center gap-2">
                  <Zap className="h-4.5 w-4.5 text-amber-600" /> Kết quả bản nháp bài đăng
                </h3>

                {/* Short version */}
                <Card className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                  <CardHeader className="py-3.5 border-b border-gray-100 dark:border-gray-850 flex flex-row justify-between items-center bg-gray-50/50 dark:bg-gray-950/20">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(selectedPlatform)}
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-250">Phiên bản Ngắn (Giật tít / Story)</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyToClipboard(activeCaption.shortCaption, 'caption ngắn')}
                      className="h-7 py-0.5 px-2 text-[10px] gap-1 font-bold border-gray-200"
                    >
                      <Copy className="h-3 w-3" /> Sao chép
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 pt-4 text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {activeCaption.shortCaption}
                  </CardContent>
                </Card>

                {/* Medium version */}
                <Card className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                  <CardHeader className="py-3.5 border-b border-gray-100 dark:border-gray-850 flex flex-row justify-between items-center bg-gray-50/50 dark:bg-gray-950/20">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(selectedPlatform)}
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-250">Phiên bản Vừa (Giới thiệu hương vị)</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyToClipboard(activeCaption.mediumCaption, 'caption vừa')}
                      className="h-7 py-0.5 px-2 text-[10px] gap-1 font-bold border-gray-200"
                    >
                      <Copy className="h-3 w-3" /> Sao chép
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 pt-4 text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {activeCaption.mediumCaption}
                  </CardContent>
                </Card>

                {/* Long version */}
                <Card className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                  <CardHeader className="py-3.5 border-b border-gray-100 dark:border-gray-850 flex flex-row justify-between items-center bg-gray-50/50 dark:bg-gray-950/20">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(selectedPlatform)}
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-250">Phiên bản Dài (Trọn vẹn câu chuyện + Emoji)</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyToClipboard(activeCaption.longCaption, 'caption dài')}
                      className="h-7 py-0.5 px-2 text-[10px] gap-1 font-bold border-gray-200"
                    >
                      <Copy className="h-3 w-3" /> Sao chép
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 pt-4 text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {activeCaption.longCaption}
                  </CardContent>
                </Card>

                {/* Hashtags list */}
                {activeCaption.hashtags && activeCaption.hashtags.length > 0 && (
                  <Card className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm">
                    <CardHeader className="py-3.5 border-b border-gray-100 dark:border-gray-850 flex flex-row justify-between items-center bg-gray-50/50 dark:bg-gray-950/20">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                        <Hash className="h-4.5 w-4.5 text-amber-700" />
                        Hashtags gợi ý
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyToClipboard(activeCaption.hashtags.join(' '), 'danh sách hashtag')}
                        className="h-7 py-0.5 px-2 text-[10px] gap-1 font-bold border-gray-200"
                      >
                        <Copy className="h-3 w-3" /> Sao chép hết
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-wrap gap-2">
                      {activeCaption.hashtags.map((h: string, i: number) => (
                        <span 
                          key={i} 
                          className="bg-amber-50 dark:bg-amber-950/40 border border-amber-100 text-xs font-semibold text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-full cursor-pointer hover:bg-amber-100 transition-colors"
                          onClick={() => handleCopyToClipboard(h, `hashtag ${h}`)}
                        >
                          {h.startsWith('#') ? h : `#${h}`}
                        </span>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm space-y-3 text-center px-4">
              <PenTool className="h-12 w-12 text-gray-300 animate-pulse" />
              <h3 className="font-extrabold text-sm text-gray-800 dark:text-white mt-2">Bàn làm việc nội dung đang chờ bạn</h3>
              <p className="text-xs text-gray-400 max-w-[280px] leading-relaxed mx-auto">
                Chọn sản phẩm bên cột trái, chọn tone giọng và nhấn "Tạo Caption với AI" để bắt đầu viết bài quảng cáo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
