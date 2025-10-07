import { NextResponse } from 'next/server';
import type { ApiErrorResponse, ApiSuccessResponse } from '@/types';
import { ZodError } from 'zod';

/**
 * 성공 응답 생성
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * 에러 응답 생성
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  fieldErrors?: Record<string, string[]>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        fieldErrors,
      },
    },
    { status }
  );
}

/**
 * Zod 검증 에러 응답 생성
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function zodErrorResponse(error: ZodError<any>): NextResponse<ApiErrorResponse> {
  const fieldErrors: Record<string, string[]> = {};

  error.issues.forEach((err) => {
    const path = err.path.join('.');
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(err.message);
  });

  return errorResponse('VALIDATION_ERROR', 'Validation failed', 400, fieldErrors);
}

/**
 * 인증 에러 응답
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse<ApiErrorResponse> {
  return errorResponse('UNAUTHORIZED', message, 401);
}

/**
 * Not Found 에러 응답
 */
export function notFoundResponse(message: string = 'Resource not found'): NextResponse<ApiErrorResponse> {
  return errorResponse('NOT_FOUND', message, 404);
}

/**
 * 서버 에러 응답
 */
export function serverErrorResponse(message: string = 'Internal server error'): NextResponse<ApiErrorResponse> {
  return errorResponse('INTERNAL_ERROR', message, 500);
}
