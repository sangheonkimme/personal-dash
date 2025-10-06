import { z } from 'zod';

/**
 * 급여월 쿼리 스키마
 */
export const getPayPeriodQuerySchema = z.object({
  anchorDate: z.string().datetime({ message: 'Invalid ISO 8601 date format' }),
});

/**
 * 통계 요약 쿼리 스키마
 */
export const getSummaryQuerySchema = z.object({
  startDate: z.string().datetime({ message: 'Invalid ISO 8601 date format' }),
  endDate: z.string().datetime({ message: 'Invalid ISO 8601 date format' }),
});

/**
 * 페이지네이션 쿼리 스키마
 */
export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive()),
  pageSize: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().positive().max(100)),
});

/**
 * API 성공 응답 스키마
 */
export const apiSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

/**
 * API 에러 응답 스키마
 */
export const apiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
  }),
});

/**
 * 페이지네이션 메타데이터 스키마
 */
export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalCount: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

/**
 * 페이지네이션 응답 스키마
 */
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    meta: paginationMetaSchema,
  });

// Export types from schemas
export type GetPayPeriodQueryInput = z.infer<typeof getPayPeriodQuerySchema>;
export type GetSummaryQueryInput = z.infer<typeof getSummaryQuerySchema>;
export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
