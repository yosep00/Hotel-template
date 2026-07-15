import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
      return NextResponse.json({ user: null });
    }

    const userData = await verifySession(sessionCookie.value);
    return NextResponse.json({ user: userData });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}
