'use client';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/date';
import type { Notice } from '@/types/database.types';

interface NoticeListProps {
  notices: (Notice & { buildings?: { name: string } | null })[];
  loading?: boolean;
}

const TYPE_COLORS: Record<string, 'gray' | 'blue' | 'yellow' | 'red'> = {
  general: 'gray',
  maintenance: 'blue',
  payment: 'yellow',
  emergency: 'red',
};

export function NoticeList({ notices, loading }: NoticeListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    );
  }

  if (!notices.length) {
    return <Card><p className="text-gray-500 text-center py-8">No notices published yet.</p></Card>;
  }

  return (
    <div className="space-y-4">
      {notices.map((notice) => (
        <Card key={notice.id}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={TYPE_COLORS[notice.type] || 'gray'} className="capitalize">{notice.type}</Badge>
                {notice.buildings && <span className="text-xs text-gray-400">{notice.buildings.name}</span>}
              </div>
              <h3 className="font-semibold text-gray-900">{notice.title}</h3>
              <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{notice.body}</p>
            </div>
            <time className="text-xs text-gray-400 shrink-0">{formatDate(notice.published_at)}</time>
          </div>
        </Card>
      ))}
    </div>
  );
}
