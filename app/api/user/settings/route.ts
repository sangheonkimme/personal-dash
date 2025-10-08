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
import { withRateLimit } from '@/lib/rate-limit';
import { sanitizeObject } from '@/lib/sanitize';
import { logAuditEvent, AuditEventType, extractRequestMetadata } from '@/lib/audit-log';

/**
 * GET /api/user/settings
 * 사용자 설정 조회
 */
export async function GET() {
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
 * 사용자 설정 업데이트 (Rate Limited: 1분당 10 요청)
 */
export const PATCH = withRateLimit(
  async (request: NextRequest) => {
    const { ip, userAgent } = extractRequestMetadata(request);

    try {
      const userId = await requireUserId();

      // 요청 바디 파싱 및 검증
      const body = await request.json();

      // XSS 방지: 입력 sanitization
      const sanitizedBody = sanitizeObject(body);

      const validatedData = updateUserSettingsSchema.parse(sanitizedBody);

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

      // Audit 로그 기록
      await logAuditEvent({
        eventType: AuditEventType.USER_SETTINGS_UPDATED,
        userId,
        ip,
        userAgent,
        metadata: {
          updatedFields: Object.keys(validatedData),
        },
        success: true,
      });

      return successResponse(user);
    } catch (error) {
      if (error instanceof ZodError) {
        return zodErrorResponse(error);
      }

      if (error instanceof Error && error.message.includes('Unauthorized')) {
        await logAuditEvent({
          eventType: AuditEventType.UNAUTHORIZED_ACCESS,
          ip,
          userAgent,
          metadata: { endpoint: '/api/user/settings' },
          success: false,
          errorMessage: 'Unauthorized access attempt',
        });

        return unauthorizedResponse();
      }

      console.error('PATCH /api/user/settings error:', error);
      return serverErrorResponse();
    }
  },
  { interval: 60000, maxRequests: 10 } // 1분당 10 요청
);
