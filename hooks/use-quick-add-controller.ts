import { useCallback, useMemo } from 'react';
import dayjs from 'dayjs';

import { TransactionType } from '@/app/generated/prisma';
import { useCreateTransaction } from '@/hooks/use-transactions';
import { useQuickAddStore } from '@/store/use-quick-add-store';
import { parseQuickInput } from '@/lib/parsers/quick-input';
import { formatCurrency, formatDate, parseDate } from '@/lib/utils/format';
import type { CreateTransactionDTO } from '@/types';

const DEFAULT_DESCRIPTION: Record<'ko' | 'en', string> = {
  ko: '빠른 입력',
  en: 'Quick add entry',
};

const LOCALE_MAP: Record<'ko' | 'en', string> = {
  ko: 'ko-KR',
  en: 'en-US',
};

export interface QuickAddControllerOptions {
  locale: 'ko' | 'en';
  currency: string;
}

export interface QuickAddPreview {
  type: TransactionType;
  fixed: boolean;
  amountLabel: string | null;
  dateLabel: string;
  description: string;
  category: string;
  subcategory: string | null;
  paymentMethod: string | null;
  tags: string[];
}

export interface QuickAddController {
  rawInput: string;
  fallbackType: TransactionType;
  fallbackFixed: boolean;
  preview: QuickAddPreview;
  payload: CreateTransactionDTO | null;
  canSubmit: boolean;
  validationMessage: string | null;
  isSubmitting: boolean;
  setRawInput: (value: string) => void;
  setFallbackType: (type: TransactionType) => void;
  setFallbackFixed: (fixed: boolean) => void;
  submit: () => Promise<void>;
}

export function useQuickAddController({
  locale,
  currency,
}: QuickAddControllerOptions): QuickAddController {
  const intlLocale = LOCALE_MAP[locale] ?? LOCALE_MAP.ko;

  const {
    rawInput,
    fallbackType,
    fallbackFixed,
    setRawInput,
    setFallbackType,
    setFallbackFixed,
    reset,
  } = useQuickAddStore();

  const createTransaction = useCreateTransaction();

  const parsed = useMemo(() => {
    if (!rawInput.trim()) {
      return null;
    }
    return parseQuickInput(rawInput, locale, fallbackType, fallbackFixed);
  }, [rawInput, locale, fallbackType, fallbackFixed]);

  const effectiveType = parsed?.type ?? fallbackType;
  const effectiveFixed = parsed?.fixed ?? fallbackFixed;
  const effectiveAmount = parsed?.amount ?? null;
  const effectiveDate = parsed?.date ?? parseDate(dayjs().format('YYYY-MM-DD'));
  const baseDescription = parsed?.description?.trim();
  const effectiveDescription = baseDescription?.length
    ? baseDescription
    : DEFAULT_DESCRIPTION[locale] ?? DEFAULT_DESCRIPTION.ko;
  const effectiveCategory = parsed?.category ?? (locale === 'ko' ? '미분류' : 'Uncategorized');
  const effectiveSubcategory = parsed?.subcategory ?? null;
  const effectivePaymentMethod = parsed?.paymentMethod ?? null;
  const effectiveTags = Array.from(new Set(parsed?.tags ?? []));

  const payload: CreateTransactionDTO | null = useMemo(() => {
    if (effectiveAmount === null || effectiveAmount <= 0) {
      return null;
    }

    return {
      date: effectiveDate,
      amount: effectiveAmount,
      type: effectiveType,
      fixed: effectiveFixed,
      category: effectiveCategory,
      subcategory: effectiveSubcategory,
      description: effectiveDescription,
      paymentMethod: effectivePaymentMethod,
      tags: effectiveTags,
    };
  }, [
    effectiveAmount,
    effectiveDate,
    effectiveType,
    effectiveFixed,
    effectiveCategory,
    effectiveSubcategory,
    effectiveDescription,
    effectivePaymentMethod,
    effectiveTags,
  ]);

  const preview = useMemo<QuickAddPreview>(() => ({
    type: effectiveType,
    fixed: effectiveFixed,
    amountLabel:
      effectiveAmount !== null
        ? formatCurrency(effectiveAmount, currency, intlLocale)
        : null,
    dateLabel: formatDate(effectiveDate, 'YYYY-MM-DD', intlLocale),
    description: effectiveDescription,
    category: effectiveCategory,
    subcategory: effectiveSubcategory,
    paymentMethod: effectivePaymentMethod,
    tags: effectiveTags,
  }), [
    effectiveType,
    effectiveFixed,
    effectiveAmount,
    currency,
    intlLocale,
    effectiveDate,
    effectiveDescription,
    effectiveCategory,
    effectiveSubcategory,
    effectivePaymentMethod,
    effectiveTags,
  ]);

  const validationMessage = useMemo(() => {
    if (!rawInput.trim()) {
      return null;
    }

    if (effectiveAmount === null || effectiveAmount <= 0) {
      return locale === 'ko'
        ? '금액을 인식하지 못했어요. "10000원" 형태로 입력해주세요.'
        : 'Could not detect an amount. Try something like "Lunch 12,000".';
    }

    return null;
  }, [rawInput, effectiveAmount, locale]);

  const canSubmit = Boolean(payload);

  const submit = useCallback(async () => {
    if (!payload) {
      return;
    }

    await createTransaction.mutateAsync(payload);
    reset();
  }, [payload, createTransaction, reset]);

  return {
    rawInput,
    fallbackType,
    fallbackFixed,
    preview,
    payload,
    canSubmit,
    validationMessage,
    isSubmitting: createTransaction.isPending,
    setRawInput,
    setFallbackType,
    setFallbackFixed,
    submit,
  };
}
