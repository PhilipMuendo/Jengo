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
import { NAV_ITEMS } from '@/lib/constants';
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

export function Sidebar({ role, userName, organizationName }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = NAV_ITEMS[role] || [];

  return (
    <aside className={cn(
      'flex flex-col border-r border-gray-200 bg-white transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm">
              J
            </div>
            <span className="font-bold text-gray-900">Jengo</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="border-b px-4 py-3">
          <p className="text-xs text-gray-500 truncate">{organizationName}</p>
          <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] || Home;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-2">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
              'text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors'
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
