'use client';

import { type KeyboardEvent } from 'react';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';

import { TransactionType } from '@/app/generated/prisma';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  useQuickAddController,
  type QuickAddController as QuickAddControllerState,
} from '@/hooks/use-quick-add-controller';

interface QuickAddBarProps {
  currency?: string;
}

const PLACEHOLDER: Record<'ko' | 'en', string> = {
  ko: '예: 10/05 점심 9,000원 #식비 #변동 카드',
  en: 'Example: 10/05 Lunch 12,000 #food #variable card',
};

const TIP: Record<'ko' | 'en', string> = {
  ko: '#해시태그, 날짜, 금액을 한 줄로 입력하고 ⌘⏎ 또는 Ctrl+Enter로 저장하세요.',
  en: 'Add hashtags, date, and amount on one line. Press ⌘⏎ or Ctrl+Enter to save.',
};

const SUBMIT_LABEL: Record<'ko' | 'en', string> = {
  ko: '거래 추가',
  en: 'Add Transaction',
};

const SUBMIT_LOADING: Record<'ko' | 'en', string> = {
  ko: '추가 중...',
  en: 'Adding...',
};

const ERROR_EMPTY_AMOUNT: Record<'ko' | 'en', string> = {
  ko: '입력값을 확인해주세요.',
  en: 'Please check the quick entry.',
};

const ERROR_SUBMIT: Record<'ko' | 'en', string> = {
  ko: '거래 추가에 실패했어요.',
  en: 'Failed to add transaction.',
};

const SUCCESS_SUBMIT: Record<'ko' | 'en', string> = {
  ko: '빠른 입력으로 거래를 추가했어요.',
  en: 'Transaction added successfully.',
};

const TYPE_LABEL: Record<'ko' | 'en', Record<TransactionType, string>> = {
  ko: {
    [TransactionType.expense]: '지출',
    [TransactionType.income]: '수입',
  },
  en: {
    [TransactionType.expense]: 'Expense',
    [TransactionType.income]: 'Income',
  },
};

const FIXED_LABEL: Record<'ko' | 'en', { fixed: string; variable: string }> = {
  ko: { fixed: '고정', variable: '변동' },
  en: { fixed: 'Fixed', variable: 'Variable' },
};

export function QuickAddBar({ currency = 'KRW' }: QuickAddBarProps) {
  const locale = (useLocale() as 'ko' | 'en') ?? 'ko';
  const controller = useQuickAddController({ locale, currency });

  const handleSubmit = async () => {
    if (!controller.canSubmit) {
      toast.error(ERROR_EMPTY_AMOUNT[locale]);
      return;
    }

    try {
      await controller.submit();
      toast.success(SUCCESS_SUBMIT[locale]);
    } catch (error) {
      console.error('QuickAddBar submission failed', error);
      toast.error(ERROR_SUBMIT[locale]);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey || !event.shiftKey)) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="space-y-4 p-5 shadow-sm sm:p-6">
      <QuickAddHeader locale={locale} />

      <div className="space-y-3">
        <textarea
          value={controller.rawInput}
          onChange={(event) => controller.setRawInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDER[locale]}
          className="min-h-[72px] w-full resize-y rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          disabled={controller.isSubmitting}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FallbackControls controller={controller} locale={locale} />

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!controller.canSubmit || controller.isSubmitting}
            className="sm:w-auto"
          >
            {controller.isSubmitting ? SUBMIT_LOADING[locale] : SUBMIT_LABEL[locale]}
          </Button>
        </div>
      </div>

      {controller.rawInput.trim().length > 0 && (
        <QuickAddPreview locale={locale} controller={controller} />
      )}

      {controller.validationMessage && (
        <p className="text-sm text-destructive">{controller.validationMessage}</p>
      )}
    </Card>
  );
}

interface QuickAddHeaderProps {
  locale: 'ko' | 'en';
}

function QuickAddHeader({ locale }: QuickAddHeaderProps) {
  return (
    <div className="space-y-1">
      <h3 className="text-base font-semibold text-gray-800">
        {locale === 'ko' ? '빠른 입력' : 'Quick Add'}
      </h3>
      <p className="text-sm text-gray-500">{TIP[locale]}</p>
    </div>
  );
}

interface FallbackControlsProps {
  controller: QuickAddControllerState;
  locale: 'ko' | 'en';
}

function FallbackControls({ controller, locale }: FallbackControlsProps) {
  const labels = TYPE_LABEL[locale];
  const fixedLabels = FIXED_LABEL[locale];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {locale === 'ko' ? '기본 타입' : 'Fallback Type'}
      </span>
      <div className="flex gap-1">
        {Object.values(TransactionType).map((type) => (
          <Button
            key={type}
            type="button"
            variant={controller.fallbackType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => controller.setFallbackType(type)}
            disabled={controller.isSubmitting}
          >
            {labels[type]}
          </Button>
        ))}
      </div>

      <span className="ml-3 text-xs font-medium uppercase tracking-wide text-gray-500">
        {locale === 'ko' ? '고정 여부' : 'Fixed?'}
      </span>
      <div className="flex gap-1">
        <Button
          type="button"
          variant={controller.fallbackFixed ? 'default' : 'outline'}
          size="sm"
          onClick={() => controller.setFallbackFixed(true)}
          disabled={controller.isSubmitting}
        >
          {fixedLabels.fixed}
        </Button>
        <Button
          type="button"
          variant={!controller.fallbackFixed ? 'default' : 'outline'}
          size="sm"
          onClick={() => controller.setFallbackFixed(false)}
          disabled={controller.isSubmitting}
        >
          {fixedLabels.variable}
        </Button>
      </div>
    </div>
  );
}

interface QuickAddPreviewProps {
  controller: QuickAddControllerState;
  locale: 'ko' | 'en';
}

function QuickAddPreview({ controller, locale }: QuickAddPreviewProps) {
  const { preview } = controller;
  const typeLabels = TYPE_LABEL[locale];
  const fixedLabels = FIXED_LABEL[locale];

  return (
    <div className="space-y-3 rounded-md border border-dashed border-gray-200 bg-gray-50/60 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          className={cn(
            'border-transparent capitalize text-white',
            preview.type === TransactionType.income ? 'bg-emerald-500' : 'bg-rose-500'
          )}
        >
          {typeLabels[preview.type]}
        </Badge>

        <Badge
          className={cn(
            'border-transparent',
            preview.fixed ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
          )}
        >
          {preview.fixed ? fixedLabels.fixed : fixedLabels.variable}
        </Badge>

        {preview.amountLabel && (
          <Badge variant="outline" className="bg-white text-gray-800">
            {preview.amountLabel}
          </Badge>
        )}

        <Badge variant="outline" className="bg-white text-gray-800">
          {preview.dateLabel}
        </Badge>
      </div>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase text-gray-500">
            {locale === 'ko' ? '설명' : 'Description'}
          </dt>
          <dd className="font-medium text-gray-900">{preview.description}</dd>
        </div>

        <div>
          <dt className="text-xs uppercase text-gray-500">
            {locale === 'ko' ? '카테고리' : 'Category'}
          </dt>
          <dd className="font-medium text-gray-900">
            {preview.subcategory
              ? `${preview.category} • ${preview.subcategory}`
              : preview.category}
          </dd>
        </div>

        {preview.paymentMethod && (
          <div>
            <dt className="text-xs uppercase text-gray-500">
              {locale === 'ko' ? '결제수단' : 'Payment Method'}
            </dt>
            <dd className="font-medium text-gray-900">{preview.paymentMethod}</dd>
          </div>
        )}

        {preview.tags.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase text-gray-500">
              {locale === 'ko' ? '태그' : 'Tags'}
            </dt>
            <dd className="mt-1 flex flex-wrap gap-1">
              {preview.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="capitalize">
                  #{tag}
                </Badge>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
