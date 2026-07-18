'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Building2, DoorOpen, Users, CreditCard,
  FileText, AlertTriangle, Wrench, Bell, UserCog, BarChart3,
  Settings, Home, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils/format';
import { NAV_ITEMS, APP_NAME } from '@/lib/constants';
import type { UserRole } from '@/types/database.types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Building2, DoorOpen, Users, CreditCard,
  FileText, AlertTriangle, Wrench, Bell, UserCog, BarChart3,
  Settings, Home,
};

interface SidebarProps {
  role: UserRole;
  userName: string;
  organizationName: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Sidebar({ role, userName, organizationName }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = NAV_ITEMS[role] || [];

  return (
    <aside
      className={cn(
        'flex flex-col bg-sidebar text-gray-300 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className={cn('flex h-16 items-center border-b border-white/10', collapsed ? 'justify-center px-2' : 'justify-between px-4')}>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white shadow-sm">
              J
            </div>
            <span className="text-base font-semibold tracking-tight text-white">{APP_NAME}</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] || Home;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                isActive
                  ? 'bg-sidebar-active text-white'
                  : 'text-gray-400 hover:bg-sidebar-hover hover:text-white',
                collapsed && 'justify-center px-2',
              )}
              title={collapsed ? item.label : undefined}
            >
              {isActive && !collapsed && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-brand-400" />
              )}
              <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-brand-400' : 'text-gray-500 group-hover:text-gray-300')} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-2">
        <div className={cn('flex items-center gap-3 rounded-lg px-2 py-2', collapsed && 'justify-center')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-900 text-xs font-semibold text-brand-200">
            {initials(userName) || 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{userName}</p>
              <p className="truncate text-xs text-gray-500">{organizationName}</p>
            </div>
          )}
          {!collapsed && (
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                aria-label="Sign out"
                title="Sign out"
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
        {collapsed && (
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              aria-label="Sign out"
              title="Sign out"
              className="mt-1 flex w-full items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </aside>
  );
}
