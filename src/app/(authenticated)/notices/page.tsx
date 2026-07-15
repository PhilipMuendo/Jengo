'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { Button } from '@/components/ui/Button';
import { NoticeList } from '@/components/notices/NoticeList';
import { Pagination } from '@/components/ui/Pagination';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePaginatedQuery } from '@/lib/hooks/usePaginatedQuery';
import { getNoticesPage } from '@/services/notices';

export default function NoticesPage() {
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const { items, loading, fetching, count, page, pageCount, pageSize, setPage } = usePaginatedQuery(
    ['notices', orgId],
    (p, s) => getNoticesPage(orgId!, p, s),
    !!orgId,
  );

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
        <NoticeList notices={items} loading={loading} />
        <Pagination
          page={page}
          pageCount={pageCount}
          count={count}
          pageSize={pageSize}
          onPageChange={setPage}
          busy={fetching}
        />
      </div>
    </div>
  );
}
