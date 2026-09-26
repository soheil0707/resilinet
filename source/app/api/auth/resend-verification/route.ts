import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  getHanaUserByEmail,
  getLatestVerificationForUser,
  invalidatePendingEmailVerifications,
  createEmailVerification,
} from '@/lib/hana/repository';
import { emailService } from '@/lib/email/service';
import { sanitizeHanaError } from '@/lib/hana/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COOLDOWN_SECONDS = 60;

export async function POST(req: NextRequest) {
  // Generic success message to prevent user enumeration
  const genericResponse = {
    success: true,
    message: 'If an unverified account exists for this corporate email, a verification link has been dispatched.',
  };

  try {
    const body = await req.json().catch(() => null);
    const email = body?.email;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide a valid corporate email address.',
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Look up user by email in SAP HANA Cloud
    const user = await getHanaUserByEmail(cleanEmail);

    // If account doesn't exist, return generic success (prevents account enumeration)
    if (!user) {
      return NextResponse.json(genericResponse);
    }

    // If account is already verified, return generic success
    if (user.EMAIL_VERIFIED === 1) {
      return NextResponse.json(genericResponse);
    }

    // 2. Cooldown check: prevent rapid resend abuse
    const latest = await getLatestVerificationForUser(user.USER_ID);
    if (latest && latest.CREATED_AT) {
      const createdAtMs = new Date(latest.CREATED_AT).getTime();
      const nowMs = Date.now();
      const elapsedSeconds = (nowMs - createdAtMs) / 1000;

      if (elapsedSeconds < COOLDOWN_SECONDS) {
        // Enforce cooldown without revealing sensitive information
        return NextResponse.json(genericResponse);
      }
    }

    // 3. Invalidate any existing unused verification tokens
    await invalidatePendingEmailVerifications(user.USER_ID);

    // 4. Generate a new secure verification token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const verificationId = `VERIF-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);

    // 5. Store ONLY token hash in ORCH_EMAIL_VERIFICATION
    await createEmailVerification({
      verificationId,
      userId: user.USER_ID,
      tokenHash,
      expiresAt,
    });

    // 6. Dispatch email via delivery service abstraction (never log raw token)
    await emailService.sendVerificationEmail({
      toEmail: user.EMAIL,
      fullName: user.FULL_NAME,
      verificationToken: rawToken,
    }).catch((emailErr) => {
      console.warn('Resend email notice:', emailErr instanceof Error ? emailErr.message : 'Notice');
    });

    return NextResponse.json(genericResponse);
  } catch (error) {
    const safeError = sanitizeHanaError(error);
    console.error('Resend verification error:', safeError);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process verification request. Please try again.',
      },
      { status: 500 }
    );
  }
}
