'use client';

import { UserCog } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
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
        <div className="space-y-3 p-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </Card>
    );
  }

  if (!staff.length) {
    return (
      <Card padding="none">
        <EmptyState
          icon={UserCog}
          title="No staff yet"
          description="Add property managers and caretakers to help run your buildings."
        />
      </Card>
    );
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <Table>
        <THead>
          <TH>Name</TH>
          <TH>Contact</TH>
          <TH>Role</TH>
          <TH>Status</TH>
        </THead>
        <TBody>
          {staff.map((member) => (
            <TR key={member.id}>
              <TD className="font-medium text-gray-900">{member.full_name}</TD>
              <TD>
                <div>{member.email}</div>
                <div className="text-xs text-gray-400">{member.phone}</div>
              </TD>
              <TD>
                <Badge variant="blue">{ROLE_LABELS[member.role]}</Badge>
              </TD>
              <TD>
                <Badge variant={member.is_active ? 'green' : 'gray'}>
                  {member.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </Card>
  );
}
