import { NextResponse } from 'next/server';
import { getRooms, saveRoom } from '@/lib/db';

export async function GET() {
  try {
    const rooms = await getRooms();
    return NextResponse.json(rooms);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || !body.basePrice || !body.stock) {
      return NextResponse.json({ error: "Nombre, precio base y stock son obligatorios" }, { status: 400 });
    }
    const newRoom = await saveRoom(body);
    return NextResponse.json(newRoom);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
