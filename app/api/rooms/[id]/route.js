import { NextResponse } from 'next/server';
import { getRoomById, deleteRoom } from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { apiError } from '@/lib/apiError';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const room = await getRoomById(id);
    if (!room) {
      return NextResponse.json({ error: "Habitación no encontrada" }, { status: 404 });
    }
    return NextResponse.json(room);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request, { params }) {
  const guard = await requireAdmin(request);
  if (guard) return guard;
  try {
    const { id } = await params;
    const success = await deleteRoom(id);
    if (!success) {
      return NextResponse.json({ error: "No se pudo eliminar la habitación" }, { status: 404 });
    }
    return NextResponse.json({ message: "Habitación eliminada correctamente" });
  } catch (error) {
    return apiError(error);
  }
}
