'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
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

export function PeriodChips({ maxMonths = 24 }: PeriodChipsProps) {
  const { anchorDate, setAnchorDate, goToPreviousPeriod, goToNextPeriod, resetToToday } = usePeriodStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const currentAnchor = dayjs(anchorDate);
  const isKorean = true; // Default to Korean for now

  // 현재 선택된 달을 기준으로 ±maxMonths 범위 생성
  const periods = useMemo(() => {
    const result = [];
    for (let i = -maxMonths; i <= maxMonths; i++) {
      const periodAnchor = currentAnchor.add(i, 'month');
      result.push({
        anchor: periodAnchor.toISOString(),
        label: periodAnchor.format('YYYY년 MM월'),
        isCurrent: i === 0,
      });
    }
    return result;
  }, [currentAnchor, maxMonths]);

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

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPreviousPeriod();
    } else if (e.key === 'ArrowRight') {
      goToNextPeriod();
    } else if (e.key === 'Home') {
      resetToToday();
    }
  }, [goToPreviousPeriod, goToNextPeriod, resetToToday]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{isKorean ? '월 선택' : 'Select Period'}</h3>
        <span className="text-xs text-gray-500">
          {currentAnchor.format('YYYY년 MM월')}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={resetToToday}
          className="ml-auto h-7 text-xs px-3"
        >
          {isKorean ? '오늘' : 'Today'}
        </Button>
      </div>

      <div className="relative flex items-center gap-1 sm:gap-2">
        {/* 이전 버튼 */}
        {showLeftArrow && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 z-10 bg-white shadow-md h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-gray-100"
            onClick={handleScrollLeft}
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}

        {/* 칩 컨테이너 */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollButtons}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-10 sm:px-12 py-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {periods.map((period) => (
            <Badge
              key={period.anchor}
              variant={period.isCurrent ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-all hover:scale-105 active:scale-95',
                period.isCurrent
                  ? 'bg-blue-500 text-white ring-2 ring-blue-300 ring-offset-2 shadow-lg'
                  : 'bg-white hover:bg-blue-50 hover:border-blue-400 border-gray-300'
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
            className="absolute right-0 z-10 bg-white shadow-md h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-gray-100"
            onClick={handleScrollRight}
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
