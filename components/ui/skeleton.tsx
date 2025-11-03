import * as React from 'react';

export function Skeleton({ className = '', width = '100%', height = 16 }: { className?: string; width?: string | number; height?: number }) {
  return (
    <div
      className={`rounded bg-[#111827] animate-pulse ${className}`}
      style={{ width, height }}
      role="status"
      aria-label="loading"
    />
  );
}
export default Skeleton;
