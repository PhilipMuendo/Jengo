'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/Button';
import { NoticeList } from '@/components/notices/NoticeList';
import { useAuth } from '@/lib/hooks/useAuth';
import { useNotices } from '@/lib/hooks/useNotices';

export default function NoticesPage() {
  const { user } = useAuth();
  const { notices, loading } = useNotices(user?.organization_id);

  if (!user) return null;

  return (
    <div>
      <Topbar
        title="Notices"
        subtitle="Announcements and communications"
        role={user.role}
        actions={
          <Link href="/notices/new">
            <Button size="sm"><Plus className="h-4 w-4" /> Publish Notice</Button>
          </Link>
        }
      />
      <div className="p-6">
        <NoticeList notices={notices} loading={loading} />
      </div>
    </div>
  );
}
