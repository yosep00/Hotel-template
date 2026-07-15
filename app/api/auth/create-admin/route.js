import { NextResponse } from 'next/server';
import { getUserByEmail, saveUser } from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { apiError } from '@/lib/apiError';

export async function POST(request) {
  const guard = await requireAdmin(request);
  if (guard) return guard;
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 400 });
    }

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
    return apiError(error);
  }
}
