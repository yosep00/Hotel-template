import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
      return NextResponse.json({ user: null });
    }

    const userData = JSON.parse(sessionCookie.value);
    return NextResponse.json({ user: userData });
  } catch (error) {
    return NextResponse.json({ user: null, error: error.message });
  }
}
