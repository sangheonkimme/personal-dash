'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useUserSettings, useUpdateUserSettings } from '@/hooks/use-user-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, DollarSign, Globe, Calendar, Save } from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const locale = useLocale() as 'ko' | 'en';
  const router = useRouter();
  const isKorean = locale === 'ko';

  const { data: userSettings, isLoading } = useUserSettings();
  const updateSettings = useUpdateUserSettings();

  const [salaryDay, setSalaryDay] = useState<number>(25);
  const [currency, setCurrency] = useState<string>('KRW');
  const [selectedLocale, setSelectedLocale] = useState<string>(locale);

  useEffect(() => {
    if (userSettings) {
      setSalaryDay(userSettings.salaryDay || 25);
      setCurrency(userSettings.currency || 'KRW');
      setSelectedLocale(userSettings.locale || locale);
    }
  }, [userSettings, locale]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        salaryDay,
        currency,
        locale: selectedLocale as 'ko' | 'en',
      });

      toast.success(isKorean ? '설정이 저장되었습니다' : 'Settings saved successfully');

      // 언어가 변경된 경우 리다이렉트
      if (selectedLocale !== locale) {
        router.push(`/${selectedLocale}/settings`);
      }
    } catch (error) {
      toast.error(isKorean ? '설정 저장 실패' : 'Failed to save settings');
      console.error('Settings save error:', error);
    }
  };

  const hasChanges =
    salaryDay !== userSettings?.salaryDay ||
    currency !== userSettings?.currency ||
    selectedLocale !== userSettings?.locale;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isKorean ? '설정' : 'Settings'}
        </h1>
        <p className="text-muted-foreground">
          {isKorean ? '가계부 설정을 관리합니다' : 'Manage your budget settings'}
        </p>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isKorean ? '계정 정보' : 'Account Information'}
          </CardTitle>
          <CardDescription>
            {isKorean ? '현재 로그인된 계정 정보입니다' : 'Your current account information'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">
              {isKorean ? '이름' : 'Name'}
            </Label>
            <p className="text-base font-medium">{session?.user?.name}</p>
          </div>
          <Separator />
          <div>
            <Label className="text-sm text-muted-foreground">
              {isKorean ? '이메일' : 'Email'}
            </Label>
            <p className="text-base font-medium">{session?.user?.email}</p>
          </div>
          <Separator />
          <div>
            <Label className="text-sm text-muted-foreground">
              {isKorean ? '사용자 ID' : 'User ID'}
            </Label>
            <p className="text-sm font-mono">{session?.user?.id}</p>
          </div>
        </CardContent>
      </Card>

      {/* Budget Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isKorean ? '가계부 설정' : 'Budget Settings'}
          </CardTitle>
          <CardDescription>
            {isKorean ? '월급일과 통화 설정을 관리합니다' : 'Manage your salary day and currency settings'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Salary Day */}
          <div className="space-y-2">
            <Label htmlFor="salaryDay" className="text-base font-medium">
              {isKorean ? '월급일' : 'Salary Day'}
            </Label>
            <p className="text-sm text-muted-foreground">
              {isKorean
                ? '급여월 계산의 기준이 됩니다. (예: 25일 → 25일~익월 24일)'
                : 'This will be the anchor for your pay period. (e.g., 25th → 25th to 24th next month)'}
            </p>
            <Select value={salaryDay.toString()} onValueChange={(val) => setSalaryDay(parseInt(val))}>
              <SelectTrigger id="salaryDay">
                <SelectValue placeholder={isKorean ? '월급일 선택' : 'Select salary day'} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}{isKorean ? '일' : 'th'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency" className="text-base font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {isKorean ? '통화' : 'Currency'}
            </Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue placeholder={isKorean ? '통화 선택' : 'Select currency'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="KRW">🇰🇷 KRW (원)</SelectItem>
                <SelectItem value="USD">🇺🇸 USD ($)</SelectItem>
                <SelectItem value="EUR">🇪🇺 EUR (€)</SelectItem>
                <SelectItem value="JPY">🇯🇵 JPY (¥)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {isKorean ? '언어 설정' : 'Language Settings'}
          </CardTitle>
          <CardDescription>
            {isKorean ? '인터페이스 언어를 선택합니다' : 'Select your interface language'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="locale" className="text-base font-medium">
              {isKorean ? '언어' : 'Language'}
            </Label>
            <Select value={selectedLocale} onValueChange={setSelectedLocale}>
              <SelectTrigger id="locale">
                <SelectValue placeholder={isKorean ? '언어 선택' : 'Select language'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ko">🇰🇷 한국어</SelectItem>
                <SelectItem value="en">🇺🇸 English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || updateSettings.isPending}
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {updateSettings.isPending
            ? isKorean
              ? '저장 중...'
              : 'Saving...'
            : isKorean
            ? '저장'
            : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
