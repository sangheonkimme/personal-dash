'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProgressCardProps {
  title: string;
  amount: number;
  currency: string;
  changePercent?: number;
  icon?: React.ReactNode;
  variant?: 'income' | 'expense' | 'saving' | 'balance';
  isLoading?: boolean;
}

export function ProgressCard({
  title,
  amount,
  currency,
  changePercent,
  icon,
  variant = 'balance',
  isLoading,
}: ProgressCardProps) {
  const formatCurrency = (value: number) => {
    if (currency === 'KRW') {
      return `₩${value.toLocaleString('ko-KR')}`;
    } else if (currency === 'USD') {
      return `$${value.toLocaleString('en-US')}`;
    } else if (currency === 'EUR') {
      return `€${value.toLocaleString('en-US')}`;
    } else if (currency === 'JPY') {
      return `¥${value.toLocaleString('ja-JP')}`;
    }
    return `${currency} ${value.toLocaleString()}`;
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'income':
        return 'border-green-200 dark:border-green-800';
      case 'expense':
        return 'border-red-200 dark:border-red-800';
      case 'saving':
        return 'border-blue-200 dark:border-blue-800';
      case 'balance':
        return 'border-purple-200 dark:border-purple-800';
      default:
        return '';
    }
  };

  const getChangeIcon = () => {
    if (changePercent === undefined || changePercent === null) return null;
    if (changePercent > 0) {
      return <ArrowUp className="h-3 w-3" />;
    } else if (changePercent < 0) {
      return <ArrowDown className="h-3 w-3" />;
    }
    return <Minus className="h-3 w-3" />;
  };

  const getChangeColor = () => {
    if (changePercent === undefined || changePercent === null) return 'text-muted-foreground';

    // Income & Saving: 증가=긍정(초록), 감소=부정(빨강)
    // Expense: 증가=부정(빨강), 감소=긍정(초록)
    // Balance: 증가=긍정(초록), 감소=부정(빨강)
    const isPositiveChange = changePercent > 0;
    const isGoodChange =
      variant === 'expense' ? !isPositiveChange : isPositiveChange;

    return isGoodChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', getVariantStyles())}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="h-6 sm:h-8 w-24 sm:w-32 bg-muted rounded mb-1"></div>
          <div className="h-3 w-16 sm:w-24 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={getVariantStyles()}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="text-lg sm:text-2xl font-bold truncate">{formatCurrency(amount)}</div>
        {changePercent !== undefined && changePercent !== null && (
          <div className={cn('flex items-center gap-1 text-xs font-medium mt-1', getChangeColor())}>
            {getChangeIcon()}
            <span>{Math.abs(changePercent).toFixed(1)}%</span>
            <span className="hidden sm:inline text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProgressCardGrid({
  income,
  expense,
  saving,
  balance,
  currency,
  isLoading,
}: {
  income: number;
  expense: number;
  saving: number;
  balance: number;
  currency: string;
  isLoading?: boolean;
}) {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 sm:gap-4">
      <ProgressCard
        title="💰 Income"
        amount={income}
        currency={currency}
        variant="income"
        isLoading={isLoading}
      />
      <ProgressCard
        title="💸 Expense"
        amount={expense}
        currency={currency}
        variant="expense"
        isLoading={isLoading}
      />
      <ProgressCard
        title="💎 Saving"
        amount={saving}
        currency={currency}
        variant="saving"
        isLoading={isLoading}
      />
      <ProgressCard
        title="🏦 Balance"
        amount={balance}
        currency={currency}
        variant="balance"
        isLoading={isLoading}
      />
    </div>
  );
}
