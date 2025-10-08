'use client';

import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { usePeriodStore } from '@/store/use-period-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PeriodChipsProps {
  salaryDay?: number;
  maxMonths?: number;
}

export function PeriodChips({ salaryDay, maxMonths = 24 }: PeriodChipsProps) {
  const { anchorDate, setAnchorDate, goToPreviousPeriod, goToNextPeriod, resetToToday } = usePeriodStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const currentAnchor = dayjs(anchorDate);

  // 현재 선택된 달을 기준으로 ±maxMonths 범위 생성
  const periods = [];
  for (let i = -maxMonths; i <= maxMonths; i++) {
    const periodAnchor = currentAnchor.add(i, 'month');
    periods.push({
      anchor: periodAnchor.toISOString(),
      label: periodAnchor.format('YYYY년 MM월'),
      isCurrent: i === 0,
    });
  }

  // 스크롤 상태 확인
  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [periods]);

  // 현재 선택된 칩으로 스크롤
  useEffect(() => {
    const currentChip = scrollContainerRef.current?.querySelector('[data-current="true"]');
    if (currentChip) {
      currentChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [anchorDate]);

  const handleScrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  };

  const handlePeriodClick = (anchor: string) => {
    setAnchorDate(anchor);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPreviousPeriod();
    } else if (e.key === 'ArrowRight') {
      goToNextPeriod();
    } else if (e.key === 'Home') {
      resetToToday();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative flex items-center gap-1 sm:gap-2">
      {/* 이전 버튼 */}
      {showLeftArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 z-10 bg-background/90 backdrop-blur-sm h-8 w-8 sm:h-10 sm:w-10 shadow-md"
          onClick={handleScrollLeft}
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      )}

      {/* 칩 컨테이너 */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollButtons}
        className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-8 sm:px-10 py-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {periods.map((period) => (
          <Badge
            key={period.anchor}
            variant={period.isCurrent ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer whitespace-nowrap px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm transition-all hover:scale-105 active:scale-95',
              period.isCurrent && 'ring-1 sm:ring-2 ring-ring ring-offset-1 sm:ring-offset-2'
            )}
            data-current={period.isCurrent}
            onClick={() => handlePeriodClick(period.anchor)}
          >
            {period.label}
          </Badge>
        ))}
      </div>

      {/* 다음 버튼 */}
      {showRightArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 z-10 bg-background/90 backdrop-blur-sm h-8 w-8 sm:h-10 sm:w-10 shadow-md"
          onClick={handleScrollRight}
        >
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      )}
    </div>
  );
}
