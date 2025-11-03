'use client';

import Link from 'next/link';
import { Menu, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { useSidebar } from '@/context/SidebarContext';

export default function Navbar() {
  const { theme } = useTheme();
  const { isCollapsed } = useSidebar();

  return (
    <nav 
      className={cn(
        'fixed top-0 right-0 z-50 transition-all duration-200 border-b h-16',
        theme === 'dark' 
          ? 'bg-[#0B1221] border-[#1a2235]' 
          : 'bg-white border-gray-200',
        isCollapsed ? 'left-16' : 'left-[240px]'
      )}
    >
      <div className="h-full w-full px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="flex justify-between items-center w-full">
          {/* Logo */}
          <div className="flex-1 flex items-center">
            <div className="text-xl font-semibold">
              <span className={cn(
                "transition-colors",
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                Version 1.0 beta
              </span>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center">
            <button 
              className={cn(
                'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <User className="w-5 h-5" />
              <span>Guest</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
