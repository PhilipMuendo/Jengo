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

  if (!user) return supabaseResponse;

  // Role/is_active come from JWT app_metadata (stamped at account creation).
  // Accounts created before the claims rollout fall back to one profile query.
  let role = user.app_metadata?.role as UserRole | undefined;
  let isActive = user.app_metadata?.is_active as boolean | undefined;

  if ((role === undefined || isActive === undefined) && (isAuthRoute || !isPublicRoute)) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, is_active')
      .eq('id', user.id)
      .single();
    role = role ?? (profile?.role as UserRole | undefined);
    isActive = isActive ?? profile?.is_active;
  }

  if (isAuthRoute) {
    const redirect = role ? ROLE_REDIRECTS[role] : '/dashboard';
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  if (!isPublicRoute) {
    if (isActive === false) {
      return NextResponse.redirect(new URL('/auth/login?error=inactive', request.url));
    }

    if (role && !canAccessRoute(role, pathname)) {
      return NextResponse.redirect(new URL(ROLE_REDIRECTS[role], request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
