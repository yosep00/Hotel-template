import { NextResponse } from 'next/server';
import { getUsersWithBookings } from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { apiError } from '@/lib/apiError';

export async function GET(request) {
  const guard = await requireAdmin(request);
  if (guard) return guard;
  try {
    const users = await getUsersWithBookings();
    return NextResponse.json(users);
  } catch (error) {
    return apiError(error);
  }
}
