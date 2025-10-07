import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth-utils';
import {
  successResponse,
  zodErrorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { updateUserSettingsSchema } from '@/lib/validations/user';
import { ZodError } from 'zod';

/**
 * GET /api/user/settings
 * 사용자 설정 조회
 */
export async function GET(_request: NextRequest) {
  try {
    const userId = await requireUserId();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        image: true,
        salaryDay: true,
        currency: true,
        locale: true,
      },
    });

    if (!user) {
      return unauthorizedResponse('User not found');
    }

    return successResponse(user);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return unauthorizedResponse();
    }

    console.error('GET /api/user/settings error:', error);
    return serverErrorResponse();
  }
}

/**
 * PATCH /api/user/settings
 * 사용자 설정 업데이트
 */
export async function PATCH(request: NextRequest) {
  try {
    const userId = await requireUserId();

    // 요청 바디 파싱 및 검증
    const body = await request.json();
    const validatedData = updateUserSettingsSchema.parse(body);

    // 사용자 설정 업데이트
    const user = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
      select: {
        name: true,
        email: true,
        image: true,
        salaryDay: true,
        currency: true,
        locale: true,
      },
    });

    return successResponse(user);
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error);
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return unauthorizedResponse();
    }

    console.error('PATCH /api/user/settings error:', error);
    return serverErrorResponse();
  }
}
