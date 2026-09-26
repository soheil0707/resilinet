import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Signed out successfully',
  });
  clearSessionCookie(response);
  return response;
}
