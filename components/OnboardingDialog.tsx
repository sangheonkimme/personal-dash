'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useUpdateUserSettings } from '@/hooks/use-user-settings';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface OnboardingDialogProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingDialog({ open, onComplete }: OnboardingDialogProps) {
  const locale = useLocale();
  const isKorean = locale === 'ko';

  const [salaryDay, setSalaryDay] = useState<number>(25);
  const [currency, setCurrency] = useState<string>('KRW');
  const [selectedLocale, setSelectedLocale] = useState<string>(locale);

  const updateSettings = useUpdateUserSettings();

  const handleComplete = async () => {
    try {
      await updateSettings.mutateAsync({
        salaryDay,
        currency,
        locale: selectedLocale as 'ko' | 'en',
      });

      toast.success(isKorean ? '설정이 완료되었습니다!' : 'Settings saved successfully!');
      onComplete();
    } catch (error) {
      toast.error(isKorean ? '설정 저장 실패' : 'Failed to save settings');
      console.error('Onboarding error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" hideClose>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isKorean ? '환영합니다! 👋' : 'Welcome! 👋'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isKorean
              ? '몇 가지 설정을 완료하여 개인 대시보드를 시작하세요.'
              : 'Complete a few settings to get started with your personal dashboard.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 월급일 설정 */}
          <div className="space-y-2">
            <Label htmlFor="salaryDay" className="text-base font-medium">
              {isKorean ? '💰 월급일' : '💰 Salary Day'}
            </Label>
            <p className="text-sm text-muted-foreground">
              {isKorean
                ? '급여월 계산의 기준이 됩니다. (예: 25일 → 25일~익월 24일)'
                : 'This will be the anchor for your pay period. (e.g., 25th → 25th to 24th next month)'}
            </p>
            <Select value={salaryDay.toString()} onValueChange={(val) => setSalaryDay(parseInt(val))}>
              <SelectTrigger id="salaryDay">
                <SelectValue placeholder={isKorean ? '월급일 선택' : 'Select salary day'} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}{isKorean ? '일' : 'th'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 통화 설정 */}
          <div className="space-y-2">
            <Label htmlFor="currency" className="text-base font-medium">
              {isKorean ? '💵 통화' : '💵 Currency'}
            </Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue placeholder={isKorean ? '통화 선택' : 'Select currency'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KRW">🇰🇷 KRW (원)</SelectItem>
                <SelectItem value="USD">🇺🇸 USD ($)</SelectItem>
                <SelectItem value="EUR">🇪🇺 EUR (€)</SelectItem>
                <SelectItem value="JPY">🇯🇵 JPY (¥)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 언어 설정 */}
          <div className="space-y-2">
            <Label htmlFor="locale" className="text-base font-medium">
              {isKorean ? '🌐 언어' : '🌐 Language'}
            </Label>
            <Select value={selectedLocale} onValueChange={setSelectedLocale}>
              <SelectTrigger id="locale">
                <SelectValue placeholder={isKorean ? '언어 선택' : 'Select language'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ko">🇰🇷 한국어</SelectItem>
                <SelectItem value="en">🇺🇸 English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={handleComplete} disabled={updateSettings.isPending} className="w-full sm:w-auto">
            {updateSettings.isPending
              ? isKorean
                ? '저장 중...'
                : 'Saving...'
              : isKorean
              ? '시작하기'
              : 'Get Started'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
