import './globals.css';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/lib/AuthContext';
import { SiteProvider } from '@/lib/SiteContext';
import { DateRangeProvider } from '@/lib/DateRangeContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ConsoleWarningFilter } from '@/components/ConsoleWarningFilter';
import { Toaster } from 'sonner';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'ticket. Admin Dashboard',
  description: 'Dashboard und Analytics für ticket. Kino',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={outfit.className}>
        <ConsoleWarningFilter />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SiteProvider>
              <DateRangeProvider>
                <DashboardLayout>
                  {children}
                </DashboardLayout>
              </DateRangeProvider>
            </SiteProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
