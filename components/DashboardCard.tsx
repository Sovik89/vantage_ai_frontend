'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color?: string;
  stats?: {
    label: string;
    value: string | number;
  };
}

export default function DashboardCard({
  title,
  description,
  icon: Icon,
  href,
  color = 'bg-primary-600',
  stats,
}: DashboardCardProps) {
  const { theme } = useTheme();

  return (
    <Link href={href}>
      <div className={cn(
        'rounded-xl p-6 transition-all duration-200 cursor-pointer group hover:scale-[1.02]',
        theme === 'dark'
          ? 'bg-[#0B1221] shadow-lg shadow-primary-900/5 hover:shadow-xl hover:shadow-primary-900/10'
          : 'bg-white shadow-md shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-200/80',
        'border',
        theme === 'dark' ? 'border-[#1a2235]' : 'border-gray-100',
        theme === 'dark' 
          ? 'hover:border-primary-500/50 hover:bg-[#0d1526]' 
          : 'hover:border-primary-400/50 hover:bg-gray-50'
      )}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110',
                color,
                theme === 'dark' ? 'bg-opacity-90 group-hover:bg-opacity-100' : 'bg-opacity-100'
              )}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className={cn(
                'text-xl font-semibold transition-colors tracking-tight',
                theme === 'dark'
                  ? 'text-white group-hover:text-primary-400'
                  : 'text-gray-900 group-hover:text-primary-600'
              )}>
                {title}
              </h3>
            </div>
            <p className={cn(
              'text-sm mb-4 leading-relaxed max-w-[90%]',
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              {description}
            </p>
            {stats && (
              <div className="flex items-baseline space-x-2">
                <span className={cn(
                  'text-2xl font-bold',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {stats.value}
                </span>
                <span className={cn(
                  'text-sm',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>
                  {stats.label}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className={cn(
          'mt-4 flex items-center text-sm font-medium',
          theme === 'dark' ? 'text-primary-400' : 'text-primary-600'
        )}>
          <span>Get Started</span>
          <svg
            className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
