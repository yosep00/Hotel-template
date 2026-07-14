import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getUserByEmail } from '@/lib/db';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    // Guardar sesión en cookie (como string JSON simple para demostración local)
    const sessionData = JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    const cookieStore = await cookies();
    cookieStore.set('user_session', sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 día
      path: '/'
    });

    return NextResponse.json({
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
