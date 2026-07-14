import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserByEmail, saveUser } from '@/lib/db';

export async function POST(request) {
  try {
    // 1. Verificar si el usuario que hace la solicitud es un Administrador
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');

    if (!sessionCookie) {
      return NextResponse.json({ error: "No autorizado. Inicie sesión primero." }, { status: 401 });
    }

    const currentUser = JSON.parse(sessionCookie.value);
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: "Acceso denegado. Se requieren permisos de administrador." }, { status: 403 });
    }

    // 2. Procesar datos del nuevo administrador a crear
    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 400 });
    }

    // 3. Crear el nuevo usuario con rol de administrador
    const newAdmin = await saveUser({
      name,
      email,
      password,
      role: 'admin'
    });

    return NextResponse.json({
      message: "Cuenta de administrador creada exitosamente",
      user: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
