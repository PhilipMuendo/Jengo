'use client';

import { Bell, Search } from 'lucide-react';
import { ROLE_LABELS } from '@/types/auth.types';
import type { UserRole } from '@/types/database.types';

interface TopbarProps {
  title: string;
  subtitle?: string;
  role: UserRole;
  actions?: React.ReactNode;
}

export function Topbar({ title, subtitle, role, actions }: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:px-6">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold tracking-tight text-gray-900">{title}</h1>
        {subtitle && <p className="truncate text-sm text-gray-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden md:block relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search..."
            className="w-56 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm transition-colors duration-150 placeholder:text-gray-400 hover:border-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 lg:w-64"
          />
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:bg-gray-200"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
          {ROLE_LABELS[role]}
        </span>

        {actions}
      </div>
    </header>
  );
}
