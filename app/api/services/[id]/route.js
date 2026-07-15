import { NextResponse } from 'next/server';
import { getServiceById, deleteService } from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { apiError } from '@/lib/apiError';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const service = await getServiceById(id);
    if (!service) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }
    return NextResponse.json(service);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request, { params }) {
  const guard = await requireAdmin(request);
  if (guard) return guard;
  try {
    const { id } = await params;
    const success = await deleteService(id);
    if (!success) {
      return NextResponse.json({ error: "No se pudo eliminar el servicio" }, { status: 404 });
    }
    return NextResponse.json({ message: "Servicio eliminado correctamente" });
  } catch (error) {
    return apiError(error);
  }
}
