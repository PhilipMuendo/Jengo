import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/Toast';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect('/auth/login');

  const { data: org } = await (await import('@/lib/supabase/server')).createClient()
    .then((sb) => sb.from('organizations').select('name').eq('id', user.organization_id).single());

  return (
    <ToastProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          role={user.role}
          userName={user.full_name}
          organizationName={org?.name || 'Organization'}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </ToastProvider>
  );
}
