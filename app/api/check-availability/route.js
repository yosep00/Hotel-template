import { NextResponse } from 'next/server';
import { getRemainingStock } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const excludeBookingId = searchParams.get('excludeBookingId') || null;

    if (!roomId || !checkIn || !checkOut) {
      return NextResponse.json({ error: "Faltan parámetros obligatorios: roomId, checkIn, checkOut" }, { status: 400 });
    }

    const remaining = await getRemainingStock(roomId, checkIn, checkOut, excludeBookingId);
    return NextResponse.json({ 
      available: remaining > 0,
      remaining 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
