'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../lib/auth';
import { Bell, ChevronDown, Settings, LogOut } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/pos': 'Bán hàng (POS)',
  '/menu': 'Quản lý Menu',
  '/inventory': 'Kho nguyên liệu',
  '/customers': 'Khách hàng',
  '/marketing': 'Marketing AI',
  '/reports': 'Báo cáo & Phân tích',
  '/chatbot': 'Chatbot AI',
  '/settings': 'Cài đặt',
  '/orders': 'Lịch sử đơn hàng',
};

function getPageTitle(pathname: string): string {
  for (const [prefix, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) return title;
  }
  return 'CaféAI';
}

export function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.fullName
    ? user.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : user?.username?.slice(0, 2).toUpperCase() ?? 'U';

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-6 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      {/* Page title */}
      <h1 className="text-base font-semibold text-gray-800 dark:text-gray-100">
        {getPageTitle(pathname)}
      </h1>

      <div className="flex items-center gap-3">
        {/* Bell — cảnh báo kho thấp */}
        <Link
          href="/inventory"
          className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          title="Cảnh báo kho"
        >
          <Bell className="h-5 w-5" />
        </Link>

        {/* User avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName ?? user.username}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-amber-700 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-tight">
                {user?.fullName ?? user?.username}
              </p>
              <p className="text-xs text-gray-400 leading-tight">
                {user?.role === 'OWNER' ? 'Chủ quán' : 'Nhân viên'}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg z-50 py-1">
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Settings className="h-4 w-4" />
                Cài đặt quán
              </Link>
              <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
              <button
                onClick={() => { setMenuOpen(false); logout(); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
