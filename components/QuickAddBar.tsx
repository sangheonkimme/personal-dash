'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { useLocale } from 'next-intl';
import { parseQuickInput } from '@/lib/parsers/quick-input';
import { useQuickAddStore } from '@/store/use-quick-add-store';
import { useCreateTransaction } from '@/hooks/use-transactions';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export function QuickAddBar() {
  const locale = useLocale() as 'ko' | 'en';
  const isKorean = locale === 'ko';

  const { rawInput, fallbackType, fallbackFixed, setRawInput, toggleType, toggleFixed, reset } =
    useQuickAddStore();

  const [parsedPreview, setParsedPreview] = useState<ReturnType<typeof parseQuickInput> | null>(null);
  const [validationError, setValidationError] = useState<string>('');

  const createTransaction = useCreateTransaction();

  // 실시간 파싱 미리보기
  useEffect(() => {
    if (!rawInput.trim()) {
      setParsedPreview(null);
      setValidationError('');
      return;
    }

    try {
      const parsed = parseQuickInput(rawInput, locale, fallbackType, fallbackFixed);
      setParsedPreview(parsed);
      setValidationError('');

      // 검증
      if (!parsed.amount || parsed.amount <= 0) {
        setValidationError(isKorean ? '금액을 입력해주세요' : 'Please enter an amount');
      }
    } catch (error) {
      setParsedPreview(null);
      setValidationError(isKorean ? '입력 형식이 올바르지 않습니다' : 'Invalid input format');
    }
  }, [rawInput, locale, fallbackType, fallbackFixed, isKorean]);

  const handleSubmit = async () => {
    if (!parsedPreview || validationError) {
      toast.error(validationError || (isKorean ? '입력을 확인해주세요' : 'Please check your input'));
      return;
    }

    try {
      await createTransaction.mutateAsync({
        date: parsedPreview.date,
        amount: parsedPreview.amount!,
        type: parsedPreview.type,
        fixed: parsedPreview.fixed,
        category: parsedPreview.category || (isKorean ? '미분류' : 'Uncategorized'),
        subcategory: parsedPreview.subcategory,
        description: parsedPreview.description,
        paymentMethod: parsedPreview.paymentMethod,
        tags: parsedPreview.tags,
      });

      toast.success(isKorean ? '거래가 추가되었습니다' : 'Transaction added');
      reset();
      setParsedPreview(null);
    } catch (error) {
      toast.error(isKorean ? '거래 추가 실패' : 'Failed to add transaction');
      console.error('Quick add error:', error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const placeholder = isKorean
    ? '예: 10/05 점심 9,000원 #변동 #식비 카드 회식'
    : 'e.g., 10/05 lunch $15 #variable #food card';

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* 타입 & 고정 토글 */}
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1">
            <Button
              variant={fallbackType === 'expense' ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleType('expense')}
            >
              {isKorean ? '지출' : 'Expense'}
            </Button>
            <Button
              variant={fallbackType === 'income' ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleType('income')}
            >
              {isKorean ? '수입' : 'Income'}
            </Button>
          </div>
          <div className="flex gap-1">
            <Button
              variant={fallbackFixed === true ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleFixed(true)}
            >
              {isKorean ? '고정' : 'Fixed'}
            </Button>
            <Button
              variant={fallbackFixed === false ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleFixed(false)}
            >
              {isKorean ? '변동' : 'Variable'}
            </Button>
          </div>
        </div>

        {/* 입력 필드 */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={validationError ? 'border-destructive' : ''}
            />
            <Button onClick={handleSubmit} disabled={createTransaction.isPending || !!validationError}>
              <Plus className="h-4 w-4 mr-1" />
              {isKorean ? '추가' : 'Add'}
            </Button>
          </div>

          {validationError && <p className="text-sm text-destructive">{validationError}</p>}
        </div>

        {/* 파싱 미리보기 */}
        {parsedPreview && !validationError && (
          <div className="flex flex-wrap gap-2 text-sm">
            {parsedPreview.date && (
              <Badge variant="outline">
                📅 {parsedPreview.date}
              </Badge>
            )}
            {parsedPreview.amount && (
              <Badge variant="outline">
                💰 {parsedPreview.amount.toLocaleString()}
              </Badge>
            )}
            {parsedPreview.type && (
              <Badge variant={parsedPreview.type === 'income' ? 'default' : 'secondary'}>
                {parsedPreview.type === 'income' ? (isKorean ? '수입' : 'Income') : (isKorean ? '지출' : 'Expense')}
              </Badge>
            )}
            {parsedPreview.fixed !== undefined && (
              <Badge variant="outline">
                {parsedPreview.fixed ? (isKorean ? '고정' : 'Fixed') : (isKorean ? '변동' : 'Variable')}
              </Badge>
            )}
            {parsedPreview.category && (
              <Badge variant="outline">
                🏷️ {parsedPreview.category}
              </Badge>
            )}
            {parsedPreview.paymentMethod && (
              <Badge variant="outline">
                💳 {parsedPreview.paymentMethod}
              </Badge>
            )}
            {parsedPreview.description && (
              <Badge variant="outline" className="max-w-[200px] truncate">
                📝 {parsedPreview.description}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
