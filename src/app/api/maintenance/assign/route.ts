import { NextRequest, NextResponse } from 'next/server';
import { createClient, getCurrentUser } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !['owner', 'property_manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestId, assignedTo } = await request.json();
    if (!requestId || !assignedTo) {
      return NextResponse.json({ error: 'requestId and assignedTo are required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('maintenance_requests')
      .update({ assigned_to: assignedTo, status: 'assigned' })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Failed to assign maintenance request' }, { status: 500 });
  }
}
