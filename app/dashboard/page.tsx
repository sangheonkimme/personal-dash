import { requireAuth } from '@/lib/auth-utils';
import { signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, Mail, Hash, CheckCircle2 } from 'lucide-react';

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Hash className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">개인 대시보드</h1>
                <p className="text-xs text-muted-foreground">월급일 기준 가계부</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-sm font-medium">{session.user.name}</p>
                <p className="text-xs text-muted-foreground">{session.user.email}</p>
              </div>
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/login' });
                }}
              >
                <Button type="submit" variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  로그아웃
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">환영합니다! 👋</CardTitle>
              <CardDescription>
                Phase 1 구현이 성공적으로 완료되었습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    인증 시스템 구현 완료
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Google OAuth, NextAuth v5, Prisma Adapter, 미들웨어 보호 설정 완료
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* User Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  사용자 정보
                </CardTitle>
                <CardDescription>현재 로그인된 계정 정보</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">이름</p>
                    <p className="text-sm font-medium">{session.user.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">이메일</p>
                    <p className="text-sm font-medium break-all">{session.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Hash className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">사용자 ID</p>
                    <p className="text-sm font-medium font-mono text-xs">{session.user.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps Card */}
            <Card>
              <CardHeader>
                <CardTitle>다음 단계</CardTitle>
                <CardDescription>구현 예정인 기능들</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    { phase: 'Phase 2', title: '코어 유틸리티 & 타입 정의' },
                    { phase: 'Phase 3', title: 'i18n & 다국어 지원' },
                    { phase: 'Phase 4', title: 'API 라우트 구현' },
                    { phase: 'Phase 5', title: 'Quick Add Bar 파서' },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.phase}</p>
                        <p className="text-xs text-muted-foreground">{item.title}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Features Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle>v0.1 주요 기능 (개발 예정)</CardTitle>
              <CardDescription>가계부 핵심 기능 미리보기</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { icon: '💰', title: '수입 관리', desc: '급여 및 수입 추적' },
                  { icon: '💸', title: '지출 관리', desc: '고정/변동 지출 구분' },
                  { icon: '📊', title: 'Progress 카드', desc: '4가지 지표 요약' },
                  { icon: '📅', title: '급여월 조회', desc: '월급일 기준 기간' },
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="text-3xl mb-2">{feature.icon}</div>
                    <p className="text-sm font-medium mb-1">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
