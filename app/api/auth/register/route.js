import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserByEmail, saveUser } from '@/lib/db';
import { createSession } from '@/lib/session';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 400 });
    }

    // Guardar nuevo cliente
    const newUser = await saveUser({
      name,
      email,
      password,
      role: 'client' // Solo los administradores pueden crear más administradores
    });

    const token = await createSession({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });

    const cookieStore = await cookies();
    cookieStore.set('user_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 día
      path: '/'
    });

    return NextResponse.json({
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
