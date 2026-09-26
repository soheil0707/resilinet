import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  getActiveEmailVerificationByTokenHash,
  markEmailVerificationUsed,
  markUserEmailVerified,
  getHanaUserById,
} from '@/lib/hana/repository';
import { sanitizeHanaError } from '@/lib/hana/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const token = body?.token;

    if (!token || typeof token !== 'string' || token.trim().length < 16) {
      return NextResponse.json(
        {
          success: false,
          error: 'A valid email verification token is required.',
        },
        { status: 400 }
      );
    }

    // 1. Hash the incoming token with SHA-256
    const cleanToken = token.trim();
    const tokenHash = crypto.createHash('sha256').update(cleanToken).digest('hex');

    // 2. Find unused, unexpired verification record in SAP HANA Cloud
    const verification = await getActiveEmailVerificationByTokenHash(tokenHash);

    if (!verification) {
      return NextResponse.json(
        {
          success: false,
          error: 'Verification token is invalid, expired, or has already been used. Please request a new verification email.',
        },
        { status: 400 }
      );
    }

    // 3. Verify user exists and update verification state
    const user = await getHanaUserById(verification.USER_ID);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Associated enterprise account could not be found.',
        },
        { status: 404 }
      );
    }

    // 4. Mark token as USED (safe against token reuse)
    await markEmailVerificationUsed(verification.VERIFICATION_ID);

    // 5. Update USER_ACCOUNT: EMAIL_VERIFIED = 1, VERIFIED_AT = CURRENT_UTCTIMESTAMP
    await markUserEmailVerified(user.USER_ID);

    return NextResponse.json({
      success: true,
      email: user.EMAIL,
      message: 'Your corporate email address has been successfully verified. You may now sign in.',
    });
  } catch (error) {
    const safeError = sanitizeHanaError(error);
    console.error('Email verification error:', safeError);
    return NextResponse.json(
      {
        success: false,
        error: 'Email verification failed due to a server error. Please try again.',
      },
      { status: 500 }
    );
  }
}
