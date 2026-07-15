import { NextResponse } from 'next/server';
import { getBookingById, saveBooking, deleteBooking } from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { apiError } from '@/lib/apiError';

export async function GET(request, { params }) {
  const guard = await requireAdmin(request);
  if (guard) return guard;
  try {
    const { id } = await params;
    const booking = await getBookingById(id);
    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }
    return NextResponse.json(booking);
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request, { params }) {
  const guard = await requireAdmin(request);
  if (guard) return guard;
  try {
    const { id } = await params;
    const body = await request.json();
    const existingBooking = await getBookingById(id);
    if (!existingBooking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    const updatedBooking = await saveBooking({
      ...existingBooking,
      ...body,
      id // Garantizar que se mantiene el ID
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request, { params }) {
  const guard = await requireAdmin(request);
  if (guard) return guard;
  try {
    const { id } = await params;
    const success = await deleteBooking(id);
    if (!success) {
      return NextResponse.json({ error: "No se pudo eliminar la reserva" }, { status: 404 });
    }
    return NextResponse.json({ message: "Reserva eliminada correctamente" });
  } catch (error) {
    return apiError(error);
  }
}
