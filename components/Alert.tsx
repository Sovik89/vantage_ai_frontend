// components/Alert.tsx (NEW)
import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
  className?: string;
}

export function Alert({ children, variant = 'default', className = '' }: AlertProps) {
  const baseStyles = 'p-4 rounded-lg border flex gap-3 items-start';
  const variantStyles = {
    default: 'bg-blue-500/10 border-blue-500/50 text-blue-400',
    destructive: 'bg-red-500/10 border-red-500/50 text-red-400'
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <div className="text-sm flex-1">{children}</div>;
}

export function AlertTitle({ children }: { children: React.ReactNode }) {
  return <div className="font-semibold text-sm mb-1">{children}</div>;
}