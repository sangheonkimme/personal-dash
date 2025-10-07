'use client';

import { signOut } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocaleStore } from '@/store/use-locale-store';
import { LogOut, Globe, User } from 'lucide-react';

export function DashboardHeader() {
  const currentLocale = useLocale();
  const { setLocale } = useLocaleStore();

  const handleLocaleToggle = () => {
    const newLocale = currentLocale === 'ko' ? 'en' : 'ko';
    setLocale(newLocale);
    // Redirect to new locale
    window.location.href = `/${newLocale}/dashboard`;
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: `/${currentLocale}/login` });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <h1 className="text-lg font-semibold">Personal Dashboard</h1>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLocaleToggle}
            title={currentLocale === 'ko' ? 'Switch to English' : '한국어로 전환'}
          >
            <Globe className="h-[1.2rem] w-[1.2rem]" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.location.href = `/${currentLocale}/settings`}>
                {currentLocale === 'ko' ? '설정' : 'Settings'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                {currentLocale === 'ko' ? '로그아웃' : 'Logout'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
