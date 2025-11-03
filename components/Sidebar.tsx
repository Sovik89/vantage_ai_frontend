'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight,
  LayoutDashboard,
  FileText,
  Heart,
  UserCheck,
  ActivitySquare,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { useSidebar } from '@/context/SidebarContext';

const menuItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    label: 'PA+HR Journal',
    icon: FileText,
    path: '/journal',
  },
  {
    label: 'Sentiment',
    icon: Heart,
    path: '/sentiment',
  },
  {
    label: 'ATS Checker',
    icon: UserCheck,
    path: '/ats',
  },
  {
    label: 'Sessions',
    icon: ActivitySquare,
    path: '/sessions',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { isCollapsed, toggleSidebar } = useSidebar();

  // Update CSS variable for sidebar width
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isCollapsed ? '64px' : '240px'
    );
  }, [isCollapsed]);

  return (
    <aside 
      className={cn(
        isCollapsed ? 'w-16' : 'w-64',
        'fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out lg:block',
        theme === 'dark' 
          ? 'bg-[#0B1221] border-[#1a2235]' 
          : 'bg-white border-gray-200',
        'border-r'
      )}
    >
      {/* Logo and Collapse Button */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-inherit">
        {!isCollapsed && (
          <Link href="/">
            <img 
              src="/images/logo.png" 
              alt="orvahr.ai" 
              className="h-8 w-auto"
              style={{ 
                filter: theme === 'dark' ? 'brightness(1)' : 'brightness(0.8)'
              }}
            />
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            'p-2 rounded-lg',
            theme === 'dark' 
              ? 'hover:bg-[#1a2235] text-gray-400 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          )}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'flex items-center rounded-lg transition-colors p-2',
                  isActive
                    ? theme === 'dark'
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'bg-primary-50 text-primary-600'
                    : theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-[#1a2235]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
                  !isCollapsed && 'space-x-3'
                )}
              >
                <Icon size={20} />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            'w-full p-2 rounded-lg flex items-center justify-center mt-8',
            theme === 'dark' 
              ? 'hover:bg-[#1a2235] text-gray-400 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          )}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          {!isCollapsed && (
            <span className="ml-2">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>

        {/* User Info */}
        {!isCollapsed && (
          <div className={cn(
            'mt-8 p-4 rounded-lg',
            theme === 'dark' ? 'bg-[#1a2235]' : 'bg-gray-100'
          )}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">G</span>
              </div>
              <div>
                <p className={cn(
                  'font-medium',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>Guest User</p>
                <p className={cn(
                  'text-sm',
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                )}>Free Plan</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
