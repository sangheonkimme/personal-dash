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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white shadow-sm">
      <div className="container flex h-14 items-center px-4 sm:px-6">
        <div className="mr-2 sm:mr-4 flex">
          <h1 className="text-base sm:text-lg font-semibold text-primary truncate">Personal Dashboard</h1>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-1 sm:space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLocaleToggle}
            title={currentLocale === 'ko' ? 'Switch to English' : '한국어로 전환'}
            className="h-9 w-9 sm:h-10 sm:w-10"
          >
            <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
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
