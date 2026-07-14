import { NextResponse } from 'next/server';
import { getBookings, saveBooking, checkAvailability, getRoomById } from '@/lib/db';

export async function GET() {
  try {
    const bookings = await getBookings();
    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { roomId, checkIn, checkOut, guestName, guestEmail, guestPhone } = body;

    // Validar campos obligatorios
    if (!roomId || !checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
      return NextResponse.json({ error: "Todos los campos de la reserva son obligatorios" }, { status: 400 });
    }

    // Verificar disponibilidad en el motor de reservas
    const available = await checkAvailability(roomId, checkIn, checkOut);
    if (!available) {
      return NextResponse.json({ error: "Lo sentimos, ya no queda disponibilidad para las fechas seleccionadas" }, { status: 400 });
    }

    const room = await getRoomById(roomId);
    if (!room) {
      return NextResponse.json({ error: "La habitación seleccionada no existe" }, { status: 404 });
    }

    // Calcular precio total
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24)));
    const totalPrice = nights * room.basePrice;

    // Crear la reserva pendiente
    const newBooking = await saveBooking({
      roomId,
      checkIn,
      checkOut,
      guestName,
      guestEmail,
      guestPhone,
      totalPrice,
      status: 'pending',       // Se confirma al pagar
      paymentStatus: 'unpaid'   // Se marca pagado tras Stripe
    });

    return NextResponse.json(newBooking);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
