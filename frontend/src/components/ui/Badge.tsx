import React from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  danger: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  outline: 'border border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-gray-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-blue-500',
  purple: 'bg-purple-500',
  outline: 'bg-gray-400',
};

export function Badge({ variant = 'default', size = 'md', dot, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColors[variant])} />
      )}
      {children}
    </span>
  );
}

// Semantic shortcuts for common use cases

export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    PENDING: { variant: 'warning', label: 'Chờ xử lý' },
    PREPARING: { variant: 'info', label: 'Đang pha chế' },
    COMPLETED: { variant: 'success', label: 'Hoàn thành' },
    CANCELLED: { variant: 'danger', label: 'Đã huỷ' },
  };
  const cfg = map[status] ?? { variant: 'default' as BadgeVariant, label: status };
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
}

export function CustomerTierBadge({ tier }: { tier: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    NORMAL: { variant: 'default', label: 'Thường' },
    SILVER: { variant: 'outline', label: 'Bạc' },
    GOLD: { variant: 'warning', label: 'Vàng' },
    PLATINUM: { variant: 'purple', label: 'Bạch kim' },
  };
  const cfg = map[tier] ?? { variant: 'default' as BadgeVariant, label: tier };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function PaymentMethodBadge({ method }: { method: string }) {
  const map: Record<string, string> = {
    CASH: 'Tiền mặt',
    TRANSFER: 'Chuyển khoản',
    MOMO: 'MoMo',
    ZALOPAY: 'ZaloPay',
  };
  return <Badge variant="outline">{map[method] ?? method}</Badge>;
}

export default Badge;
