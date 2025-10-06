import { z } from 'zod';

/**
 * User 설정 업데이트 스키마
 */
export const updateUserSettingsSchema = z.object({
  salaryDay: z
    .number()
    .int('Salary day must be an integer')
    .min(1, 'Salary day must be between 1 and 31')
    .max(31, 'Salary day must be between 1 and 31')
    .optional(),
  currency: z
    .string()
    .length(3, 'Currency must be a 3-letter ISO 4217 code')
    .regex(/^[A-Z]{3}$/, 'Currency must be uppercase (e.g., KRW, USD)')
    .optional(),
  locale: z
    .string()
    .regex(/^[a-z]{2}-[A-Z]{2}$/, 'Locale must be in BCP 47 format (e.g., ko-KR, en-US)')
    .optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less').optional(),
});

/**
 * User 온보딩 스키마 (첫 로그인 시 필수 설정)
 */
export const onboardingSettingsSchema = z.object({
  salaryDay: z
    .number()
    .int()
    .min(1)
    .max(31)
    .default(25), // 기본값 25일
  currency: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/)
    .default('KRW'), // 기본값 KRW
  locale: z
    .string()
    .regex(/^[a-z]{2}-[A-Z]{2}$/)
    .default('ko-KR'), // 기본값 ko-KR
  name: z.string().min(1).max(100).optional(), // 이름은 OAuth에서 가져옴
});

// Export types from schemas
export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;
export type OnboardingSettingsInput = z.infer<typeof onboardingSettingsSchema>;
