'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { TextArea } from '../../../components/ui/TextArea';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { useSettings } from '../../../hooks/useSettings';
import { api } from '../../../lib/api';
import { toast } from '../../../hooks/useToast';
import type { ApiResponse } from '../../../types/api';
import type { ApiError } from '../../../types/api';
import {
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  Paintbrush,
  Sliders,
} from 'lucide-react';
import { useThemeStore, PRESETS, ThemeMode, ThemePreset, ThemeColors } from '../../../store/themeStore';

type Tab = 'shop' | 'theme' | 'password';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('shop');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl w-fit">
        {([
          ['shop', 'Thông tin quán'],
          ['theme', 'Giao diện hệ thống'],
          ['password', 'Đổi mật khẩu'],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'shop' && <ShopInfoForm />}
      {activeTab === 'theme' && <ThemeSettingsForm />}
      {activeTab === 'password' && <ChangePasswordForm />}
    </div>
  );
}

/* ---- Shop Info Form ---- */
function ShopInfoForm() {
  const { settings, isLoading, updateSettings } = useSettings();
  const [form, setForm] = useState({
    shopName: '',
    address: '',
    phone: '',
    openingTime: '07:00',
    closingTime: '22:00',
    description: '',
    wifiPassword: '',
    socialFacebook: '',
    socialInstagram: '',
    taxRate: '0',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        shopName: settings.shopName ?? '',
        address: settings.address ?? '',
        phone: settings.phone ?? '',
        openingTime: settings.openingTime ?? '07:00',
        closingTime: settings.closingTime ?? '22:00',
        description: settings.description ?? '',
        wifiPassword: settings.wifiPassword ?? '',
        socialFacebook: settings.socialFacebook ?? '',
        socialInstagram: settings.socialInstagram ?? '',
        taxRate: String(settings.taxRate ?? 0),
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        ...form,
        taxRate: parseFloat(form.taxRate) || 0,
      } as any);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && !settings) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-400">Đang tải...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin quán</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Tên quán *"
            value={form.shopName}
            onChange={(e) => setForm({ ...form, shopName: e.target.value })}
            placeholder="Tên quán cà phê của bạn"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Số điện thoại"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="0912345678"
            />
            <Input
              label="Thuế suất (%)"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.taxRate}
              onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
              helperText="0 = không tính thuế"
            />
          </div>

          <Input
            label="Địa chỉ"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="123 Đường ABC, Quận 1, TP.HCM"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Giờ mở cửa"
              type="time"
              value={form.openingTime}
              onChange={(e) => setForm({ ...form, openingTime: e.target.value })}
            />
            <Input
              label="Giờ đóng cửa"
              type="time"
              value={form.closingTime}
              onChange={(e) => setForm({ ...form, closingTime: e.target.value })}
            />
          </div>

          <Input
            label="Mật khẩu WiFi"
            value={form.wifiPassword}
            onChange={(e) => setForm({ ...form, wifiPassword: e.target.value })}
            placeholder="Mật khẩu WiFi quán"
          />

          <TextArea
            label="Mô tả quán"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Vài dòng giới thiệu về quán..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Facebook"
              value={form.socialFacebook}
              onChange={(e) => setForm({ ...form, socialFacebook: e.target.value })}
              placeholder="https://facebook.com/..."
            />
            <Input
              label="Instagram"
              value={form.socialInstagram}
              onChange={(e) => setForm({ ...form, socialInstagram: e.target.value })}
              placeholder="https://instagram.com/..."
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={saving}>
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/* ---- Theme Settings Form ---- */
function ThemeSettingsForm() {
  const {
    mode,
    preset,
    colors,
    setMode,
    setPreset,
    setCustomColor,
    resetToDefault,
  } = useThemeStore();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleModeSelect = (newMode: ThemeMode) => {
    setMode(newMode);
    toast.success(`Đã đổi sang chế độ ${newMode === 'light' ? 'sáng' : newMode === 'dark' ? 'tối' : 'hệ thống'}`);
  };

  const handlePresetSelect = (newPreset: ThemePreset) => {
    setPreset(newPreset);
    toast.success(`Đã áp dụng mẫu giao diện mới`);
  };

  return (
    <Card className="animate-scale-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paintbrush className="w-5 h-5 text-amber-700" />
          Giao diện hệ thống
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chế độ sáng tối */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Chế độ màu sắc
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'Giao diện Sáng', icon: <Sun className="w-5 h-5" /> },
              { id: 'dark', label: 'Giao diện Tối', icon: <Moon className="w-5 h-5" /> },
              { id: 'system', label: 'Hệ thống', icon: <Monitor className="w-5 h-5" /> },
            ].map(({ id, label, icon }) => {
              const active = mode === id;
              return (
                <button
                  key={id}
                  onClick={() => handleModeSelect(id as ThemeMode)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                    active
                      ? 'border-amber-600 bg-amber-50/40 text-amber-800 dark:bg-amber-950/20 dark:border-amber-500 dark:text-amber-300 ring-2 ring-amber-500/20 shadow-sm'
                      : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <span className={`${active ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'}`}>
                    {icon}
                  </span>
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Các mẫu theme cài sẵn */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Mẫu giao diện (Preset themes)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(PRESETS).map(([key, config]) => {
              const isSelected = preset === key;
              return (
                <button
                  key={key}
                  onClick={() => handlePresetSelect(key as ThemePreset)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer w-full ${
                    isSelected
                      ? 'border-amber-600 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-500 shadow-xs'
                      : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-850'
                  }`}
                >
                  {/* Color Circle Preview */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center relative shadow-sm border border-black/10 shrink-0"
                    style={{ backgroundColor: config.colors.sidebarBg }}
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-black/10 shadow-inner"
                      style={{ backgroundColor: config.colors.primary }}
                    />
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 bg-amber-600 dark:bg-amber-500 text-white rounded-full p-0.5 shadow-sm">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {config.name}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Màu chính: {config.colors.primary} | Sidebar: {config.colors.sidebarBg}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tùy chỉnh nâng cao (Color pickers) */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-850 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Tùy biến nâng cao (Custom Palette)
              </span>
              {preset === 'custom' && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  Customizing
                </span>
              )}
            </div>
            {showAdvanced ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </button>

          {showAdvanced && (
            <div className="p-4 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 space-y-4 animate-slide-down">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorPickerRow
                  label="Màu chủ đạo chính (Brand Primary)"
                  value={colors.primary}
                  onChange={(val) => setCustomColor('primary', val)}
                />
                <ColorPickerRow
                  label="Nền Sidebar"
                  value={colors.sidebarBg}
                  onChange={(val) => setCustomColor('sidebarBg', val)}
                />
                <ColorPickerRow
                  label="Chữ Sidebar"
                  value={colors.sidebarFg}
                  onChange={(val) => setCustomColor('sidebarFg', val)}
                />
                <ColorPickerRow
                  label="Nền Mục Sidebar hoạt động"
                  value={colors.sidebarActiveBg}
                  onChange={(val) => setCustomColor('sidebarActiveBg', val)}
                />
                <ColorPickerRow
                  label="Chữ Mục Sidebar hoạt động"
                  value={colors.sidebarActiveFg}
                  onChange={(val) => setCustomColor('sidebarActiveFg', val)}
                />
                <ColorPickerRow
                  label="Đường viền Sidebar"
                  value={colors.sidebarBorder}
                  onChange={(val) => setCustomColor('sidebarBorder', val)}
                />
              </div>

              <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p className="font-bold text-gray-700 dark:text-gray-300">💡 Hướng dẫn phối màu:</p>
                <p>• Màu chủ đạo chính sẽ tự động tính toán ra các sắc độ tương ứng (50 - 950) để sử dụng cho toàn bộ nút bấm, khung viền, trạng thái hoạt động trong hệ thống.</p>
                <p>• Hãy chọn các sắc độ có độ tương phản cao cho Nền và Chữ Sidebar để giao diện của bạn dễ đọc và rõ ràng nhất.</p>
              </div>
            </div>
          )}
        </div>

        {/* Khôi phục mặc định */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-150 dark:border-gray-800">
          <span className="text-xs text-gray-500 dark:text-gray-400 italic">
            Giao diện được lưu tự động trên trình duyệt của bạn.
          </span>
          <button
            onClick={() => {
              resetToDefault();
              toast.success('Đã đặt lại giao diện mặc định');
            }}
            className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-amber-700 dark:text-gray-400 dark:hover:text-amber-400 font-medium transition-colors border border-gray-300 dark:border-gray-700 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-850 shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Khôi phục mặc định
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---- Color Picker Row component ---- */
function ColorPickerRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-150 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/50">
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-tight pr-2">
        {label}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={value.toUpperCase()}
          onChange={(e) => {
            const val = e.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
              onChange(val);
            }
          }}
          maxLength={7}
          className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-center focus:outline-none focus:border-amber-500"
        />
        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 shadow-xs flex items-center justify-center bg-white dark:bg-gray-800">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer opacity-0"
          />
          <div className="w-5 h-5 rounded-md shadow-xs" style={{ backgroundColor: value }} />
        </div>
      </div>
    </div>
  );
}

/* ---- Change Password Form ---- */
function ChangePasswordForm() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const next: Partial<typeof form> = {};
    if (!form.currentPassword) next.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    if (!form.newPassword) next.newPassword = 'Vui lòng nhập mật khẩu mới';
    else if (form.newPassword.length < 6) next.newPassword = 'Mật khẩu tối thiểu 6 ký tự';
    if (form.newPassword !== form.confirmPassword) next.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSuccess(false);
    try {
      await api.put<any, ApiResponse<void>>('/auth/change-password', form);
      toast.success('Đổi mật khẩu thành công');
      setSuccess(true);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      toast.error(apiErr?.message ?? 'Đổi mật khẩu thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đổi mật khẩu</CardTitle>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert variant="success" className="mb-5" onClose={() => setSuccess(false)}>
            Mật khẩu đã được cập nhật thành công.
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Mật khẩu hiện tại"
            type="password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            error={errors.currentPassword}
            autoComplete="current-password"
          />
          <Input
            label="Mật khẩu mới"
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            error={errors.newPassword}
            helperText="Ít nhất 6 ký tự"
            autoComplete="new-password"
          />
          <Input
            label="Xác nhận mật khẩu mới"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={saving}>
              Đổi mật khẩu
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
