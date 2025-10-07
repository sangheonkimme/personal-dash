import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth-utils';
import {
  successResponse,
  zodErrorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { getSummaryQuerySchema } from '@/lib/validations/api';
import { ZodError } from 'zod';
import type { PeriodSummary } from '@/types';

/**
 * GET /api/stats
 * 기간별 통계 요약 조회
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();

    // 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const queryObject = Object.fromEntries(searchParams.entries());

    const { startDate, endDate } = getSummaryQuerySchema.parse(queryObject);

    // 수입 합계
    const incomeResult = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'income',
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      _sum: {
        amount: true,
      },
    });

    // 지출 합계
    const expenseResult = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'expense',
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      _sum: {
        amount: true,
      },
    });

    // 고정 지출 합계
    const fixedExpenseResult = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'expense',
        fixed: true,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      _sum: {
        amount: true,
      },
    });

    const income = Number(incomeResult._sum.amount || 0);
    const expense = Number(expenseResult._sum.amount || 0);
    const fixedExpense = Number(fixedExpenseResult._sum.amount || 0);
    const variableExpense = expense - fixedExpense;
    const saving = income - expense;

    // TODO: balance는 이전 기간 누적 계산 필요 (추후 구현)
    const balance = saving;

    const summary: PeriodSummary = {
      income,
      expense,
      saving,
      balance,
      fixedExpense,
      variableExpense,
    };

    return successResponse(summary);
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error);
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return unauthorizedResponse();
    }

    console.error('GET /api/stats error:', error);
    return serverErrorResponse();
  }
}
