import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getHanaUserByEmail, updateHanaUserLastLogin } from '@/lib/hana/repository';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { sanitizeHanaError } from '@/lib/hana/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request payload' },
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Corporate email is required' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    // Authenticate against SAP HANA Cloud USER_ACCOUNT table
    const user = await getHanaUserByEmail(email.trim());

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid corporate email or password. Please verify your credentials.' },
        { status: 401 }
      );
    }

    if (!user.IS_ACTIVE) {
      return NextResponse.json(
        { success: false, error: 'This enterprise account has been deactivated. Contact IT Administration.' },
        { status: 403 }
      );
    }

    // Verify bcrypt password hash
    const passwordMatch = await bcrypt.compare(password, user.PASSWORD_HASH);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid corporate email or password. Please verify your credentials.' },
        { status: 401 }
      );
    }

    // Mandatory Email Verification Gate: Reject login if EMAIL_VERIFIED != 1
    if (user.EMAIL_VERIFIED !== 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please verify your email address before signing in.',
          unverified: true,
          email: user.EMAIL,
        },
        { status: 403 }
      );
    }

    // 4. Assemble session user payload
    const sessionUser = {
      userId: user.USER_ID,
      fullName: user.FULL_NAME,
      email: user.EMAIL,
      role: user.ROLE,
      phoneNumber: user.PHONE_NUMBER,
    };

    // 5. Issue signed JWT session token
    const token = await createSessionToken(sessionUser);

    // 6. After credentials validation and session JWT creation, update LAST_LOGIN_AT in SAP HANA
    try {
      await updateHanaUserLastLogin(user.USER_ID);
    } catch (updateError) {
      // Safe logging without exposing passwords or credentials
      console.error('Failed to update LAST_LOGIN_AT in SAP HANA:', sanitizeHanaError(updateError));
    }

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
      redirectTo: '/',
    });

    // Set secure HttpOnly session cookie
    setSessionCookie(response, token);

    return response;
  } catch (error) {
    const safeError = sanitizeHanaError(error);
    console.error('HANA authentication error:', safeError);
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication failed due to an internal server error',
        message: safeError,
      },
      { status: 500 }
    );
  }
}
