'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Topbar } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { NoticeForm } from '@/components/notices/NoticeForm';
import { useAuth } from '@/lib/hooks/useAuth';
import { useBuildings } from '@/lib/hooks/useBuildings';
import { useToast } from '@/lib/hooks/useToast';
import { createNotice, type NoticeInput } from '@/services/notices';

export default function NewNoticePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { buildings } = useBuildings(user?.organization_id);
  const { toast } = useToast();

  if (!user) return null;

  async function handleSubmit(data: NoticeInput) {
    await createNotice(user!.organization_id, data, user!.id);
    toast('Notice published', 'success');
    await queryClient.invalidateQueries({ queryKey: ['notices'] });
    router.push('/notices');
  }

  return (
    <div>
      <Topbar title="Publish Notice" subtitle="Send an announcement to tenants" role={user.role} />
      <div className="p-6">
        <Card>
          <NoticeForm buildings={buildings} onSubmit={handleSubmit} />
        </Card>
      </div>
    </div>
  );
}
