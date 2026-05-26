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

type Tab = 'shop' | 'password';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('shop');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl w-fit">
        {([['shop', 'Thông tin quán'], ['password', 'Đổi mật khẩu']] as [Tab, string][]).map(([key, label]) => (
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
