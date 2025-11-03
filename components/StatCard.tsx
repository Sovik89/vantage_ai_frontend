'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'bg-primary-600',
  trend,
}: StatCardProps) {
  const { theme } = useTheme();

  return (
    <div className={cn(
      'rounded-xl p-6 transition-all duration-200 hover:scale-[1.02] group',
      theme === 'dark'
        ? 'bg-[#0B1221] shadow-lg shadow-primary-900/5 hover:shadow-xl hover:shadow-primary-900/10'
        : 'bg-white shadow-md shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-200/80',
      'border',
      theme === 'dark' 
        ? 'border-[#1a2235] hover:border-primary-500/50 hover:bg-[#0d1526]' 
        : 'border-gray-100 hover:border-primary-400/50 hover:bg-gray-50'
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            'text-sm font-medium mb-1.5',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          )}>
            {title}
          </p>
          <p className={cn(
            'text-3xl font-bold tracking-tight transition-colors',
            theme === 'dark' 
              ? 'text-white group-hover:text-primary-400' 
              : 'text-gray-900 group-hover:text-primary-600'
          )}>
            {value.toLocaleString()}
          </p>
          {trend && (
            <div className="flex items-center mt-3">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive 
                    ? theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className={cn(
                'text-sm ml-2',
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              )}>
                vs last month
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110',
          color,
          theme === 'dark' ? 'bg-opacity-90 group-hover:bg-opacity-100' : 'bg-opacity-100'
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
