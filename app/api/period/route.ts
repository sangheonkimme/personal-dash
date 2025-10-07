import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth-utils';
import {
  successResponse,
  zodErrorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { getPayPeriodQuerySchema } from '@/lib/validations/api';
import { getPayPeriod } from '@/lib/utils/pay-period';
import { ZodError } from 'zod';

/**
 * GET /api/period
 * 급여월 계산 (사용자의 salaryDay 기준)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();

    // 사용자 정보 조회 (salaryDay 가져오기)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { salaryDay: true },
    });

    if (!user) {
      return unauthorizedResponse('User not found');
    }

    const salaryDay = user.salaryDay || 25;

    // 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const queryObject = Object.fromEntries(searchParams.entries());

    const { anchorDate } = getPayPeriodQuerySchema.parse(queryObject);

    // 급여월 계산
    const period = getPayPeriod(anchorDate, salaryDay);

    return successResponse(period);
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error);
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return unauthorizedResponse();
    }

    console.error('GET /api/period error:', error);
    return serverErrorResponse();
  }
}
