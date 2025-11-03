import * as React from 'react';

export function Alert({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-md border border-[#334155] bg-[#111827] p-3 text-[#e6eef8] ${className || ''}`}
    >
      {children}
    </div>
  );
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-[#9ca3af]">{children}</div>;
}
