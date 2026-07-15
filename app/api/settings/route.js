import { NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { apiError } from '@/lib/apiError';

export const dynamic = 'force-dynamic';

// Campos editables desde el panel (nunca exponer stripeSecretKey al cliente).
const PUBLIC_FIELDS = [
  'hotelName',
  'hotelEmail',
  'hotelPhone',
  'hotelAddress',
  'currency',
  'logoUrl',
  'primaryColor',
  'accentColor',
  'heroImage',
  'heroTitle',
  'heroDescription',
];

function sanitize(settings) {
  const safe = {};
  for (const k of PUBLIC_FIELDS) safe[k] = settings[k];
  return safe;
}

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(sanitize(settings));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const guard = await requireAdmin(request);
  if (guard) return guard;
  try {
    const body = await request.json();
    const data = {};
    for (const k of PUBLIC_FIELDS) {
      if (body[k] !== undefined) data[k] = body[k];
    }
    const updated = await saveSettings(data);
    return NextResponse.json(sanitize(updated));
  } catch (error) {
    return apiError(error);
  }
}
