import { NextResponse } from 'next/server';

// Respuesta de error genérica: no filtra detalles internos (p. ej. errores de
// Prisma) en producción.
export function apiError(error) {
  const msg =
    process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : error?.message || 'Error interno del servidor';
  return NextResponse.json({ error: msg }, { status: 500 });
}
