import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('user_session');
    return NextResponse.json({ message: "Sesión cerrada correctamente" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// También soportar GET para facilidades de redirección
export async function GET() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('user_session');
    // Redirigir al inicio tras cerrar sesión
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
