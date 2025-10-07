'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { useUserSettings } from '@/hooks/use-user-settings';
import { useTransactions } from '@/hooks/use-transactions';
import { useSummary } from '@/hooks/use-stats';
import { usePayPeriod } from '@/hooks/use-pay-period';
import { usePeriodStore } from '@/store/use-period-store';
import { OnboardingDialog } from '@/components/OnboardingDialog';
import { QuickAddBar } from '@/components/QuickAddBar';
import { ProgressCardGrid } from '@/components/ProgressCard';
import { PeriodChips } from '@/components/PeriodChips';
import { TransactionGrid } from '@/components/TransactionGrid';
import { DashboardSkeleton } from '@/components/LoadingSkeleton';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DashboardPage() {
  const { data: session } = useSession();
  const locale = useLocale() as 'ko' | 'en';
  const isKorean = locale === 'ko';
  const { anchorDate } = usePeriodStore();

  const [showOnboarding, setShowOnboarding] = useState(false);

  // 사용자 설정 조회
  const { data: userSettings, isLoading: settingsLoading } = useUserSettings();

  // 급여월 계산
  const { data: payPeriod } = usePayPeriod({
    anchorDate,
  });

  // 거래 내역 조회
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions({
    startDate: payPeriod?.startISO || '',
    endDate: payPeriod?.endISO || '',
  });

  // 통계 조회
  const { data: summary, isLoading: summaryLoading } = useSummary({
    startDate: payPeriod?.startISO || '',
    endDate: payPeriod?.endISO || '',
  });

  // 첫 로그인 감지 (salaryDay가 null이면 온보딩 필요)
  useEffect(() => {
    if (userSettings && !settingsLoading) {
      if (userSettings.salaryDay === null || userSettings.salaryDay === undefined) {
        setShowOnboarding(true);
      }
    }
  }, [userSettings, settingsLoading]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // 로딩 상태
  if (settingsLoading) {
    return <DashboardSkeleton />;
  }

  const currency = userSettings?.currency || 'KRW';
  const salaryDay = userSettings?.salaryDay || 25;

  return (
    <>
      <OnboardingDialog open={showOnboarding} onComplete={handleOnboardingComplete} />

      <div className="space-y-6">
        {/* 환영 메시지 */}
        {session?.user && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {isKorean ? '환영합니다' : 'Welcome'}, {session.user.name}! 👋
              </CardTitle>
              <CardDescription>
                {isKorean
                  ? '월급일 기준 가계부로 수입과 지출을 관리하세요.'
                  : 'Manage your income and expenses with salary-based budgeting.'}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Quick Add Bar */}
        <QuickAddBar />

        {/* Progress Cards */}
        <ProgressCardGrid
          income={summary?.income || 0}
          expense={summary?.expense || 0}
          saving={summary?.saving || 0}
          balance={summary?.balance || 0}
          currency={currency}
          isLoading={summaryLoading}
        />

        {/* Period Chips */}
        <div className="flex justify-center">
          <PeriodChips salaryDay={salaryDay} maxMonths={24} />
        </div>

        {/* Period Info */}
        {payPeriod && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">
                {isKorean ? '현재 급여월' : 'Current Pay Period'}
              </CardTitle>
              <CardDescription>
                {payPeriod.label}: {payPeriod.startISO.split('T')[0]} ~ {payPeriod.endISO.split('T')[0]}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Transaction Grid */}
        <TransactionGrid
          rows={transactionsData?.items || []}
          currency={currency}
          locale={locale}
          isLoading={transactionsLoading}
        />
      </div>
    </>
  );
}
