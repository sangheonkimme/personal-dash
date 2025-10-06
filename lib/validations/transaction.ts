import { z } from 'zod';
import { TransactionType } from '@/app/generated/prisma';

/**
 * Transaction 생성 스키마
 */
export const createTransactionSchema = z.object({
  date: z.string().datetime({ message: 'Invalid ISO 8601 date format' }),
  type: z.nativeEnum(TransactionType, {
    message: 'Type must be either income or expense',
  }),
  fixed: z.boolean({
    message: 'Fixed must be a boolean',
  }),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must be 50 characters or less'),
  subcategory: z
    .string()
    .max(50, 'Subcategory must be 50 characters or less')
    .nullable()
    .optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description must be 200 characters or less'),
  amount: z
    .number({
      message: 'Amount must be a number',
    })
    .positive('Amount must be positive')
    .finite('Amount must be finite'),
  paymentMethod: z
    .string()
    .max(20, 'Payment method must be 20 characters or less')
    .nullable()
    .optional(),
  recurrence: z
    .string()
    .max(200, 'Recurrence rule must be 200 characters or less')
    .nullable()
    .optional(),
  tags: z.array(z.string().max(30, 'Tag must be 30 characters or less')).optional().default([]),
});

/**
 * Transaction 수정 스키마
 */
export const updateTransactionSchema = z.object({
  date: z.string().datetime({ message: 'Invalid ISO 8601 date format' }).optional(),
  type: z
    .nativeEnum(TransactionType, {
      message: 'Type must be either income or expense',
    })
    .optional(),
  fixed: z.boolean().optional(),
  category: z.string().min(1).max(50).optional(),
  subcategory: z.string().max(50).nullable().optional(),
  description: z.string().min(1).max(200).optional(),
  amount: z.number().positive().finite().optional(),
  paymentMethod: z.string().max(20).nullable().optional(),
  recurrence: z.string().max(200).nullable().optional(),
  tags: z.array(z.string().max(30)).optional(),
});

/**
 * Transaction 조회 쿼리 스키마
 */
export const getTransactionsQuerySchema = z.object({
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
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.nativeEnum(TransactionType).optional(),
  category: z.string().max(50).optional(),
  fixed: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  q: z.string().max(100).optional(), // 검색어
  sort: z.string().regex(/^(date|amount|category|createdAt):(asc|desc)$/).optional(),
});

/**
 * Transaction ID 파라미터 스키마
 */
export const transactionIdSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
});

// Export types from schemas
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type GetTransactionsQueryInput = z.infer<typeof getTransactionsQuerySchema>;
export type TransactionIdInput = z.infer<typeof transactionIdSchema>;
