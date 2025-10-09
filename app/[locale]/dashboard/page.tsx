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

  // 거래 내역 조회 (payPeriod가 있을 때만 활성화)
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions(
    {
      startDate: payPeriod?.startISO || '',
      endDate: payPeriod?.endISO || '',
    },
    {
      enabled: !!payPeriod?.startISO && !!payPeriod?.endISO,
    }
  );

  // 통계 조회 (payPeriod가 있을 때만 활성화)
  const { data: summary, isLoading: summaryLoading } = useSummary(
    {
      startDate: payPeriod?.startISO || '',
      endDate: payPeriod?.endISO || '',
    },
    {
      enabled: !!payPeriod?.startISO && !!payPeriod?.endISO,
    }
  );

  // 첫 로그인 감지 (salaryDay가 null이면 온보딩 필요)
  useEffect(() => {
    if (userSettings && !settingsLoading) {
      // 이미 온보딩을 완료한 경우(showOnboarding이 false로 설정된 적이 있음) 다시 열지 않음
      setShowOnboarding((prev) => {
        // 이미 false면 그대로 유지
        if (prev === false) return false;
        // salaryDay가 null이면 온보딩 필요
        if (userSettings.salaryDay === null || userSettings.salaryDay === undefined) {
          return true;
        }
        return false;
      });
    }
  }, [userSettings, settingsLoading]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // React Query가 자동으로 데이터를 무효화하므로 별도 새로고침 불필요
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
        {/* 헤더 섹션 */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {isKorean ? '가계부' : 'Personal Dashboard'}
          </h1>
          {session?.user && (
            <p className="text-blue-50 text-sm sm:text-base">
              {isKorean ? '환영합니다' : 'Welcome'}, {session.user.name}! 👋
            </p>
          )}
          {payPeriod && (
            <div className="mt-4 flex items-center gap-2 text-sm text-blue-50">
              <span className="font-semibold">{isKorean ? '급여일 설정' : 'Salary Day'}:</span>
              <span>{salaryDay}{isKorean ? '일' : 'th'}</span>
              <span className="mx-2">|</span>
              <span className="font-semibold">{isKorean ? '기간 적산 선택' : 'Period'}:</span>
              <span>
                {payPeriod.startISO?.split('T')[0]} ~ {payPeriod.endISO?.split('T')[0]}
              </span>
            </div>
          )}
        </div>

        {/* Progress Cards */}
        <ProgressCardGrid
          income={summary?.income || 0}
          expense={summary?.expense || 0}
          saving={summary?.saving || 0}
          balance={summary?.balance || 0}
          currency={currency}
          isLoading={summaryLoading}
        />

        {/* Quick Add Bar */}
        <QuickAddBar currency={currency} />

        {/* Period Chips */}
        <PeriodChips salaryDay={salaryDay} maxMonths={24} />

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
