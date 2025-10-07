import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { DashboardHeader } from '@/components/DashboardHeader';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;

  if (!session) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      <main className="flex-1 container py-6">
        {children}
      </main>
    </div>
  );
}
