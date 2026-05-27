'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import { useSettingsStore } from '../../store/settingsStore';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Coffee, 
  Package, 
  Users, 
  Sparkles, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  ChevronLeft
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  ownerOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    href: '/pos',
    label: 'Bán hàng',
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    href: '/menu',
    label: 'Menu',
    icon: <Coffee className="h-5 w-5" />,
  },
  {
    href: '/inventory',
    label: 'Kho nguyên liệu',
    icon: <Package className="h-5 w-5" />,
  },
  {
    href: '/customers',
    label: 'Khách hàng',
    icon: <Users className="h-5 w-5" />,
  },
  {
    href: '/marketing',
    label: 'Marketing AI',
    icon: <Sparkles className="h-5 w-5" />,
    ownerOnly: true,
  },
  {
    href: '/reports',
    label: 'Báo cáo',
    icon: <BarChart3 className="h-5 w-5" />,
    ownerOnly: true,
  },
  {
    href: '/chatbot',
    label: 'Chatbot AI',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    href: '/settings',
    label: 'Cài đặt',
    icon: <Settings className="h-5 w-5" />,
    ownerOnly: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { settings } = useSettingsStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col bg-amber-900 text-amber-50 transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo + shop name */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-amber-800">
        <span className="text-2xl shrink-0">☕</span>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-sm leading-tight truncate">
              {settings?.shopName ?? 'CaféAI'}
            </p>
            <p className="text-xs text-amber-300">Quản lý thông minh</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-amber-700 text-white'
                  : 'text-amber-200 hover:bg-amber-800 hover:text-white'
              )}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-3 border-t border-amber-800 text-amber-400 hover:text-white hover:bg-amber-800 transition-colors"
        title={collapsed ? 'Mở rộng' : 'Thu gọn'}
      >
        <ChevronLeft
          className={cn('h-5 w-5 transition-transform', collapsed ? 'rotate-180' : '')}
        />
      </button>
    </aside>
  );
}
