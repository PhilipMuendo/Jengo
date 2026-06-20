import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { canAccessRoute } from '@/lib/constants/roles';
import { ROLE_REDIRECTS } from '@/types/auth.types';
import type { UserRole } from '@/types/database.types';

const publicRoutes = ['/', '/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/invite'];
const authRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password'];

export async function middleware(request: NextRequest) {
  const { supabase, user, supabaseResponse } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some((r) => pathname === r || pathname.startsWith(r + '/'));
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));
  const isApiRoute = pathname.startsWith('/api');

  if (isApiRoute) return supabaseResponse;

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const redirect = profile?.role ? ROLE_REDIRECTS[profile.role as UserRole] : '/dashboard';
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  if (user && !isPublicRoute) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, is_active')
      .eq('id', user.id)
      .single();

    if (!profile?.is_active) {
      return NextResponse.redirect(new URL('/auth/login?error=inactive', request.url));
    }

    if (profile?.role && !canAccessRoute(profile.role as UserRole, pathname)) {
      return NextResponse.redirect(new URL(ROLE_REDIRECTS[profile.role as UserRole], request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
