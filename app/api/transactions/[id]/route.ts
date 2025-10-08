import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth-utils';
import {
  successResponse,
  zodErrorResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { updateTransactionSchema, transactionIdSchema } from '@/lib/validations/transaction';
import { ZodError } from 'zod';
import { withRateLimit } from '@/lib/rate-limit';
import { sanitizeObject } from '@/lib/sanitize';

type Params = Promise<{ id: string }>;

/**
 * GET /api/transactions/[id]
 * 특정 거래 내역 조회
 */
export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    // ID 검증
    const { id: transactionId } = transactionIdSchema.parse({ id });

    // 거래 조회
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
    });

    if (!transaction) {
      return notFoundResponse('Transaction not found');
    }

    return successResponse(transaction);
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error);
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return unauthorizedResponse();
    }

    console.error('GET /api/transactions/[id] error:', error);
    return serverErrorResponse();
  }
}

/**
 * PATCH /api/transactions/[id]
 * 거래 내역 수정 (Rate Limited: 1분당 30 요청)
 */
export const PATCH = withRateLimit(
  async (request: NextRequest, context: { params: Params }) => {
    try {
      const userId = await requireUserId();
      const { id } = await context.params;

      // ID 검증
      const { id: transactionId } = transactionIdSchema.parse({ id });

      // 기존 거래 확인
      const existing = await prisma.transaction.findFirst({
        where: {
          id: transactionId,
          userId,
        },
      });

      if (!existing) {
        return notFoundResponse('Transaction not found');
      }

      // 요청 바디 파싱 및 검증
      const body = await request.json();

      // XSS 방지: 입력 sanitization
      const sanitizedBody = sanitizeObject(body);

      const validatedData = updateTransactionSchema.parse(sanitizedBody);

      // 거래 수정
      const transaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          ...validatedData,
          amount: validatedData.amount ? validatedData.amount.toString() : undefined,
        },
      });

      return successResponse(transaction);
    } catch (error) {
      if (error instanceof ZodError) {
        return zodErrorResponse(error);
      }

      if (error instanceof Error && error.message.includes('Unauthorized')) {
        return unauthorizedResponse();
      }

      console.error('PATCH /api/transactions/[id] error:', error);
      return serverErrorResponse();
    }
  },
  { interval: 60000, maxRequests: 30 } // 1분당 30 요청
);

/**
 * DELETE /api/transactions/[id]
 * 거래 내역 삭제 (Rate Limited: 1분당 30 요청)
 */
export const DELETE = withRateLimit(
  async (request: NextRequest, context: { params: Params }) => {
    try {
      const userId = await requireUserId();
      const { id } = await context.params;

      // ID 검증
      const { id: transactionId } = transactionIdSchema.parse({ id });

      // 기존 거래 확인
      const existing = await prisma.transaction.findFirst({
        where: {
          id: transactionId,
          userId,
        },
      });

      if (!existing) {
        return notFoundResponse('Transaction not found');
      }

      // 거래 삭제
      await prisma.transaction.delete({
        where: { id: transactionId },
      });

      return successResponse({ message: 'Transaction deleted successfully' });
    } catch (error) {
      if (error instanceof ZodError) {
        return zodErrorResponse(error);
      }

      if (error instanceof Error && error.message.includes('Unauthorized')) {
        return unauthorizedResponse();
      }

      console.error('DELETE /api/transactions/[id] error:', error);
      return serverErrorResponse();
    }
  },
  { interval: 60000, maxRequests: 30 } // 1분당 30 요청
);
