import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth-utils';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api/response';
import { withRateLimit } from '@/lib/rate-limit';
import { logAuditEvent, AuditEventType, extractRequestMetadata } from '@/lib/audit-log';

/**
 * DELETE /api/user/delete
 * 계정 삭제 (모든 관련 데이터 영구 삭제)
 * GDPR/PIPA 준수: 사용자 데이터 삭제 권리
 *
 * Rate Limited: 1분당 2 요청 (실수 방지)
 */
export const DELETE = withRateLimit(
  async (request: NextRequest) => {
    const { ip, userAgent } = extractRequestMetadata(request);

    try {
      const userId = await requireUserId();

      // 거래 내역 먼저 삭제 (Foreign Key 제약)
      const transactionCount = await prisma.transaction.count({
        where: { userId },
      });

      await prisma.transaction.deleteMany({
        where: { userId },
      });

      // 고정 지출 템플릿 삭제
      await prisma.fixedExpenseTemplate.deleteMany({
        where: { userId },
      });

      // 세션 삭제 (NextAuth)
      await prisma.session.deleteMany({
        where: { userId },
      });

      // 계정 삭제 (NextAuth)
      await prisma.account.deleteMany({
        where: { userId },
      });

      // 사용자 삭제
      await prisma.user.delete({
        where: { id: userId },
      });

      // Audit 로그 기록
      await logAuditEvent({
        eventType: AuditEventType.USER_DELETED,
        userId,
        ip,
        userAgent,
        metadata: {
          transactionCount,
          deletedAt: new Date().toISOString(),
        },
        success: true,
      });

      console.log(`User ${userId} account deleted successfully`);

      return successResponse({
        message: 'Account deleted successfully',
        deletedAt: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        await logAuditEvent({
          eventType: AuditEventType.UNAUTHORIZED_ACCESS,
          ip,
          userAgent,
          metadata: { endpoint: '/api/user/delete' },
          success: false,
          errorMessage: 'Unauthorized access attempt',
        });

        return unauthorizedResponse();
      }

      console.error('DELETE /api/user/delete error:', error);

      await logAuditEvent({
        eventType: AuditEventType.USER_DELETED,
        ip,
        userAgent,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      return serverErrorResponse('Failed to delete account');
    }
  },
  { interval: 60000, maxRequests: 2 } // 1분당 2 요청
);
