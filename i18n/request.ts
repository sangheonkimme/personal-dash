import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export const locales = ['ko', 'en'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  // 헤더에서 로케일 추출 또는 기본값 사용
  const headersList = await headers();
  const locale = (headersList.get('x-locale') as Locale) || 'ko';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: 'Asia/Seoul',
  };
});
