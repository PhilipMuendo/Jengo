import { NextResponse } from 'next/server';
import { createClient, getCurrentUser } from '@/lib/supabase/server';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user });
}
