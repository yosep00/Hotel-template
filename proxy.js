import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';

export function proxy(request) {
  const cookie = request.cookies.get('user_session');
  const session = cookie ? verifySession(cookie.value) : null;
  const role = session?.role || null;

  if (role !== 'admin') {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
