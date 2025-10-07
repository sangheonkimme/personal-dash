import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth-utils';
import {
  successResponse,
  errorResponse,
  zodErrorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import {
  createTransactionSchema,
  getTransactionsQuerySchema,
} from '@/lib/validations/transaction';
import { ZodError } from 'zod';
import type { PaginatedResponse } from '@/types';
import { Transaction } from '@/app/generated/prisma';

/**
 * GET /api/transactions
 * 거래 내역 목록 조회 (페이지네이션, 필터링, 정렬)
 */
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const userId = await requireUserId();

    // 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const queryObject = Object.fromEntries(searchParams.entries());

    const validatedQuery = getTransactionsQuerySchema.parse(queryObject);

    const {
      page = 1,
      pageSize = 20,
      startDate,
      endDate,
      type,
      category,
      fixed,
      q,
      sort = 'date:desc',
    } = validatedQuery;

    // WHERE 조건 구성
    const where: any = { userId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (fixed !== undefined) {
      where.fixed = fixed;
    }

    if (q) {
      where.OR = [
        { description: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ];
    }

    // 정렬 파라미터 파싱
    const [sortField, sortOrder] = sort.split(':');
    const orderBy = { [sortField]: sortOrder };

    // 총 개수 조회
    const totalCount = await prisma.transaction.count({ where });

    // 데이터 조회
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 페이지네이션 메타데이터
    const totalPages = Math.ceil(totalCount / pageSize);
    const response: PaginatedResponse<Transaction> = {
      items: transactions,
      meta: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    return successResponse(response);
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error);
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return unauthorizedResponse();
    }

    console.error('GET /api/transactions error:', error);
    return serverErrorResponse();
  }
}

/**
 * POST /api/transactions
 * 거래 내역 생성
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const userId = await requireUserId();

    // 요청 바디 파싱
    const body = await request.json();

    // 검증
    const validatedData = createTransactionSchema.parse(body);

    // 거래 생성
    const transaction = await prisma.transaction.create({
      data: {
        ...validatedData,
        userId,
        amount: validatedData.amount.toString(), // Decimal 변환
        tags: validatedData.tags || [],
      },
    });

    return successResponse(transaction, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return zodErrorResponse(error);
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return unauthorizedResponse();
    }

    console.error('POST /api/transactions error:', error);
    return serverErrorResponse();
  }
}
