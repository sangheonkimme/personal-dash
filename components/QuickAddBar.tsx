'use client';

import { useState, KeyboardEvent } from 'react';
import { useLocale } from 'next-intl';
import { useQuickAddStore } from '@/store/use-quick-add-store';
import { useCreateTransaction } from '@/hooks/use-transactions';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import dayjs from 'dayjs';
import { TransactionType } from '@/app/generated/prisma';

export function QuickAddBar() {
  const locale = useLocale() as 'ko' | 'en';
  const isKorean = locale === 'ko';

  const { fallbackType, fallbackFixed, toggleType, toggleFixed, reset } = useQuickAddStore();

  // 개별 필드 상태
  const [date, setDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [type, setType] = useState<TransactionType>(TransactionType.expense);
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [fixed, setFixed] = useState<boolean>(false);
  const [category, setCategory] = useState<string>('expense'); // expense, income, saving
  const [validationError, setValidationError] = useState<string>('');

  const createTransaction = useCreateTransaction();

  const handleSubmit = async () => {
    // 검증
    const amountNum = parseFloat(amount.replace(/,/g, ''));
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setValidationError(isKorean ? '금액을 입력해주세요' : 'Please enter a valid amount');
      toast.error(isKorean ? '금액을 입력해주세요' : 'Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      setValidationError(isKorean ? '내용을 입력해주세요' : 'Please enter description');
      toast.error(isKorean ? '내용을 입력해주세요' : 'Please enter description');
      return;
    }

    setValidationError('');

    // 구분에 따라 type 결정
    let transactionType = type;
    let transactionCategory = '';

    if (category === 'saving') {
      // 저축은 expense로 처리하되 카테고리를 '저축'으로 설정
      transactionType = TransactionType.expense;
      transactionCategory = isKorean ? '저축' : 'Saving';
    } else if (category === 'income') {
      transactionType = TransactionType.income;
      transactionCategory = isKorean ? '미분류' : 'Uncategorized';
    } else {
      transactionType = TransactionType.expense;
      transactionCategory = isKorean ? '미분류' : 'Uncategorized';
    }

    try {
      await createTransaction.mutateAsync({
        date: dayjs(date).toISOString(),
        amount: amountNum,
        type: transactionType,
        fixed: fixed,
        category: transactionCategory,
        description: description.trim(),
        paymentMethod: null,
        tags: [category],
      });

      toast.success(isKorean ? '거래가 추가되었습니다' : 'Transaction added');

      // 필드 초기화
      setDate(dayjs().format('YYYY-MM-DD'));
      setDescription('');
      setAmount('');
      setValidationError('');
      // type, fixed, category는 유지
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

  // 금액 포맷팅 (쉼표 추가)
  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    if (numericValue) {
      const formatted = parseInt(numericValue).toLocaleString();
      setAmount(formatted);
    } else {
      setAmount('');
    }
  };

  return (
    <Card className="p-5 sm:p-6 shadow-sm">
      <h3 className="text-base font-semibold mb-4 text-gray-700">{isKorean ? '항목 추가' : 'Add Transaction'}</h3>

      <div className="space-y-4">
        {/* 입력 필드 - 날짜, 유형, 내용, 금액, 구분 순서 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* 날짜 */}
          <div className="lg:col-span-2">
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">{isKorean ? '날짜' : 'Date'}</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10"
            />
          </div>

          {/* 유형 (고정/변동) - 라디오 버튼 스타일 */}
          <div className="lg:col-span-2">
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">{isKorean ? '유형' : 'Type'}</label>
            <div className="flex border border-gray-200 rounded-md overflow-hidden h-10">
              <button
                type="button"
                onClick={() => setFixed(true)}
                className={`flex-1 text-sm font-medium transition-colors ${
                  fixed
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isKorean ? '고정' : 'Fixed'}
              </button>
              <div className="w-px bg-gray-200" />
              <button
                type="button"
                onClick={() => setFixed(false)}
                className={`flex-1 text-sm font-medium transition-colors ${
                  !fixed
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isKorean ? '변동' : 'Variable'}
              </button>
            </div>
          </div>

          {/* 내용 */}
          <div className="lg:col-span-4">
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">{isKorean ? '내용' : 'Description'}</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isKorean ? '예: 점심 식사' : 'e.g., Lunch'}
              className="h-10"
            />
          </div>

          {/* 금액 */}
          <div className="lg:col-span-2">
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">{isKorean ? '금액' : 'Amount'}</label>
            <Input
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isKorean ? '예: 10000' : 'e.g., 100'}
              className="h-10"
            />
          </div>

          {/* 구분 (지출/수입/저축) - Select */}
          <div className="lg:col-span-1">
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">{isKorean ? '구분' : 'Category'}</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">{isKorean ? '지출' : 'Expense'}</SelectItem>
                <SelectItem value="income">{isKorean ? '수입' : 'Income'}</SelectItem>
                <SelectItem value="saving">{isKorean ? '저축' : 'Saving'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 추가 버튼 */}
          <div className="lg:col-span-1 flex items-end">
            <Button
              onClick={handleSubmit}
              disabled={createTransaction.isPending || !!validationError}
              className="w-full h-10 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              {isKorean ? '추가' : 'Add'}
            </Button>
          </div>
        </div>

        {validationError && <p className="text-sm text-destructive">{validationError}</p>}
      </div>
    </Card>
  );
}
