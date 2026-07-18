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
        <h1 className="truncate text-lg font-semibold tracking-tight text-gray-900">{title}</h1>
        {subtitle && <p className="truncate text-sm text-gray-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800 sm:inline-flex">
          {ROLE_LABELS[role]}
        </span>
        {actions}
      </div>
    </header>
  );
}
