import { z } from 'zod';
import { TransactionType } from '@/app/generated/prisma';

/**
 * Quick Add Bar 입력 파싱 결과 스키마
 */
export const parsedInputSchema = z.object({
  date: z.string().datetime().nullable(),
  amount: z.number().positive().finite().nullable(),
  type: z.nativeEnum(TransactionType).nullable(),
  fixed: z.boolean().nullable(),
  category: z.string().max(50).nullable(),
  subcategory: z.string().max(50).nullable(),
  description: z.string().max(200),
  tags: z.array(z.string().max(30)),
  paymentMethod: z.string().max(20).nullable(),
});

/**
 * Quick Add Bar 원본 입력 스키마
 */
export const quickInputSchema = z.object({
  raw: z.string().min(1, 'Input is required').max(500, 'Input must be 500 characters or less'),
  locale: z.enum(['ko', 'en']).default('ko'),
  fallbackType: z.nativeEnum(TransactionType).optional(), // 토글 값
  fallbackFixed: z.boolean().optional(), // 토글 값
});

// Export types from schemas
export type ParsedInputValidated = z.infer<typeof parsedInputSchema>;
export type QuickInputValidated = z.infer<typeof quickInputSchema>;
