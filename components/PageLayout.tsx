'use client';

import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  heading?: string;
  subheading?: string;
}

export default function PageLayout({
  children,
  heading,
  subheading,
}: PageLayoutProps) {
  const { theme } = useTheme();

  return (
    <div className={cn(
      'rounded-xl border transition-colors duration-200',
      theme === 'dark'
        ? 'bg-[#0B1221] border-[#1a2235] text-gray-100'
        : 'bg-white border-gray-200 text-gray-900'
    )}>
      {(heading || subheading) && (
        <div className="p-6 border-b border-inherit">
          {heading && (
            <h1 className={cn(
              "text-2xl font-semibold tracking-tight",
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              {heading}
            </h1>
          )}
          {subheading && (
            <p className={cn(
              "mt-2",
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              {subheading}
            </p>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}