import { NextResponse } from 'next/server';
import { getServiceById, deleteService } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const service = await getServiceById(id);
    if (!service) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }
    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const success = await deleteService(id);
    if (!success) {
      return NextResponse.json({ error: "No se pudo eliminar el servicio" }, { status: 404 });
    }
    return NextResponse.json({ message: "Servicio eliminado correctamente" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
