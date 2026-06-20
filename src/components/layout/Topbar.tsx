'use client';

import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
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
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:block relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search..."
            className="w-64 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
          {ROLE_LABELS[role]}
        </span>

        {actions}
      </div>
    </header>
  );
}
