import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getHanaUserById } from '@/lib/hana/repository';
import { sanitizeHanaError } from '@/lib/hana/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json(
        { success: false, user: null, authenticated: false },
        { status: 401 }
      );
    }

    // Refresh user state from SAP HANA Cloud
    const hanaUser = await getHanaUserById(session.userId);
    if (!hanaUser) {
      return NextResponse.json(
        { success: false, user: null, authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        userId: hanaUser.USER_ID,
        fullName: hanaUser.FULL_NAME,
        email: hanaUser.EMAIL,
        role: hanaUser.ROLE,
        phoneNumber: hanaUser.PHONE_NUMBER,
        lastLoginAt: hanaUser.LAST_LOGIN_AT,
      },
    });
  } catch (error) {
    const safeError = sanitizeHanaError(error);
    console.error('Session verification error:', safeError);
    return NextResponse.json(
      { success: false, error: 'Session verification failed', message: safeError },
      { status: 500 }
    );
  }
}
