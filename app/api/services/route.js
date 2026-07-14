import { NextResponse } from 'next/server';
import { getServices, saveService } from '@/lib/db';

export async function GET() {
  try {
    const services = await getServices();
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || !body.description) {
      return NextResponse.json({ error: "Nombre y descripción son obligatorios" }, { status: 400 });
    }
    const newService = await saveService(body);
    return NextResponse.json(newService);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
