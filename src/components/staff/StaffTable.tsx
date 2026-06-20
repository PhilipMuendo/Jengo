'use client';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { ROLE_LABELS } from '@/types/auth.types';
import type { User } from '@/types/database.types';

interface StaffTableProps {
  staff: User[];
  loading?: boolean;
}

export function StaffTable({ staff, loading }: StaffTableProps) {
  if (loading) {
    return (
      <Card padding="none">
        <div className="p-6 space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </Card>
    );
  }

  if (!staff.length) {
    return <Card><p className="text-gray-500 text-center py-8">No staff members added yet.</p></Card>;
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Contact</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Role</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {staff.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{member.full_name}</td>
                <td className="px-6 py-4 text-gray-600">
                  <div>{member.email}</div>
                  <div className="text-xs text-gray-400">{member.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="blue">{ROLE_LABELS[member.role]}</Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={member.is_active ? 'green' : 'gray'}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
