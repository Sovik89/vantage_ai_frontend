'use client';

import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export default function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  const { theme } = useTheme();

  return (
    <div className={cn(
      "rounded-lg p-4 flex items-start space-x-3",
      theme === 'dark'
        ? 'bg-red-500/10 border border-red-500/20'
        : 'bg-red-50 border border-red-100'
    )}>
      <AlertCircle className={cn(
        "w-5 h-5 flex-shrink-0 mt-0.5",
        theme === 'dark' ? 'text-red-500' : 'text-red-600'
      )} />
      <div className="flex-1">
        <p className={cn(
          "text-sm",
          theme === 'dark' ? 'text-red-400' : 'text-red-600'
        )}>{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            "transition-colors",
            theme === 'dark'
              ? 'text-red-400 hover:text-red-300'
              : 'text-red-500 hover:text-red-600'
          )}
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
