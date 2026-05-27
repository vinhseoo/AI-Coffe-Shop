'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { register } from '../../lib/auth';
import { toast } from '../../hooks/useToast';
import type { ApiError } from '../../types/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const next: Partial<typeof form> = {};
    if (!form.username.trim()) next.username = 'Vui lòng nhập tên đăng nhập';
    else if (form.username.length < 3) next.username = 'Tên đăng nhập tối thiểu 3 ký tự';
    if (!form.email.trim()) next.email = 'Vui lòng nhập email';
    if (!form.password) next.password = 'Vui lòng nhập mật khẩu';
    else if (form.password.length < 6) next.password = 'Mật khẩu tối thiểu 6 ký tự';
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim() || undefined,
        phone: form.phone.trim() || undefined,
      });
      toast.success('Đăng ký thành công! Chào mừng bạn đến với CaféAI');
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      toast.error(apiErr?.message ?? 'Đăng ký thất bại, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-900 via-amber-800 to-yellow-900 px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-700/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-yellow-800/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">☕</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tạo tài khoản</h1>
            <p className="mt-1 text-sm text-gray-500">Bắt đầu quản lý quán cà phê với AI</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Họ tên"
                placeholder="Nguyễn Văn A"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                error={errors.fullName}
              />
              <Input
                label="Số điện thoại"
                placeholder="0912345678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                error={errors.phone}
              />
            </div>
            <Input
              label="Tên đăng nhập *"
              placeholder="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              error={errors.username}
              autoComplete="username"
            />
            <Input
              label="Email *"
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Mật khẩu *"
              type="password"
              placeholder="Ít nhất 6 ký tự"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              autoComplete="new-password"
            />
            <Input
              label="Xác nhận mật khẩu *"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
              Đăng ký
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Đã có tài khoản?{' '}
              <Link href="/login" className="font-semibold text-amber-700 hover:text-amber-800">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
