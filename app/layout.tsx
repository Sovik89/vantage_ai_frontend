import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/context/ThemeContext';
import { SidebarProvider } from '@/context/SidebarContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VANTAGE.AI - AI-Powered HR Analytics',
  description: 'Transform your HR operations with AI-powered analysis for PA+HR journals, sentiment analysis, and ATS optimization.',
  keywords: 'HR Analytics, AI, Sentiment Analysis, ATS, Performance Analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        inter.className,
        'antialiased'
      )}>
        <ThemeProvider>
          <SidebarProvider>
            <div className={cn(
              "min-h-screen transition-colors duration-200",
              "bg-gray-50 text-gray-900",
              "dark:bg-[#080F1B] dark:text-gray-100"
            )}>
              <Navbar />
              <div className="pt-16">
                <div className="flex">
                  <Sidebar />
                  <main 
                    className="flex-1 p-6 lg:p-8 transition-all duration-200" 
                    style={{ marginLeft: 'var(--sidebar-width, 240px)' }}
                  >
                    <div className="max-w-7xl mx-auto">
                      {children}
                    </div>
                  </main>
                </div>
              </div>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
