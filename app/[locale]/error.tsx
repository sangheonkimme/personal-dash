'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle>오류가 발생했습니다</CardTitle>
          </div>
          <CardDescription>
            {error.message || '알 수 없는 오류가 발생했습니다.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={reset} className="w-full">
            다시 시도
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/ko/dashboard">
              <Home className="mr-2 h-4 w-4" />
              홈으로 돌아가기
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
