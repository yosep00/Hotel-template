import { NextResponse } from 'next/server';

export function proxy(request) {
  const cookie = request.cookies.get('user_session');
  let role = null;
  if (cookie) {
    try {
      role = JSON.parse(cookie.value).role;
    } catch {
      role = null;
    }
  }

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
