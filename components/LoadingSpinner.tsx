'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text,
  className 
}: LoadingSpinnerProps) {
  const { theme } = useTheme();
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <Loader2 className={cn(
        'animate-spin',
        sizeClasses[size],
        theme === 'dark' ? 'text-primary-400' : 'text-primary-600'
      )} />
      {text && (
        <p className={cn(
          'text-sm mt-2',
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        )}>
          {text}
        </p>
      )}
    </div>
  );
}
