'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { login } from '../../lib/auth';
import { toast } from '../../hooks/useToast';
import type { ApiError } from '../../types/api';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/dashboard';

  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (!form.username.trim()) next.username = 'Vui lòng nhập tên đăng nhập';
    if (!form.password) next.password = 'Vui lòng nhập mật khẩu';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login({ username: form.username.trim(), password: form.password });
      toast.success('Đăng nhập thành công!');
      router.push(redirectTo);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      toast.error(apiErr?.message ?? 'Đăng nhập thất bại, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-900 via-amber-800 to-yellow-900 px-4">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-700/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-yellow-800/30 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">☕</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">CaféAI</h1>
            <p className="mt-1 text-sm text-gray-500">Đăng nhập để quản lý quán của bạn</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              label="Tên đăng nhập"
              placeholder="Nhập tên đăng nhập"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              error={errors.username}
              autoComplete="username"
              autoFocus
            />
            <Input
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              size="lg"
            >
              Đăng nhập
            </Button>
          </form>

          {/* Divider + register link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="font-semibold text-amber-700 hover:text-amber-800">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-amber-200/60">
          © 2026 CaféAI — Hệ thống quản lý quán cà phê thông minh
        </p>
      </div>
    </div>
  );
}
