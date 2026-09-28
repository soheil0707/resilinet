import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import {
  getHanaUserByEmail,
  createHanaUserAccount,
  createEmailVerification,
} from '@/lib/hana/repository';
import { emailService } from '@/lib/email/service';
import { sanitizeHanaError } from '@/lib/hana/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_ROLES = [
  'SUPPLY_CHAIN_MANAGER',
  'ADMIN',
  'ANALYST',
  'PROCUREMENT_MANAGER',
  'PRODUCTION_PLANNER',
  'LOGISTICS_MANAGER',
  'FINANCE_MANAGER',
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request payload' },
        { status: 400 }
      );
    }

    const { fullName, email, phoneNumber, password, confirmPassword, role } = body;

    // 1. Validation
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Full name is required' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid corporate email address is required' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters in length' },
        { status: 400 }
      );
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Password and confirmation password do not match' },
        { status: 400 }
      );
    }

    const assignedRole = role && ALLOWED_ROLES.includes(role) ? role : 'SUPPLY_CHAIN_MANAGER';

    // 2. Check if email already registered in SAP HANA
    const cleanEmail = email.trim().toLowerCase();
    const existing = await getHanaUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
  { success: false, error: 'This email address is already registered. Please sign in or use a different email address.' },
  { status: 409 }
);
    }

    // 3. Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Generate user ID
    const userId = `USR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 5. Create user in SAP HANA Cloud with EMAIL_VERIFIED = 0 and VERIFIED_AT = NULL
    const newUser = await createHanaUserAccount({
      userId,
      fullName: fullName.trim(),
      email: cleanEmail,
      passwordHash,
      role: assignedRole,
      phoneNumber: phoneNumber ? String(phoneNumber).trim() : null,
      emailVerified: 0,
    });

    // 6. Generate cryptographically secure email verification token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const verificationId = `VERIF-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);

    // 7. Store ONLY token hash in ORCH_EMAIL_VERIFICATION (never raw token)
    await createEmailVerification({
      verificationId,
      userId: newUser.USER_ID,
      tokenHash,
      expiresAt,
    });

    // 8. Invoke email delivery service abstraction (do not log raw token)
    const emailResult = await emailService.sendVerificationEmail({
      toEmail: newUser.EMAIL,
      fullName: newUser.FULL_NAME,
      verificationToken: rawToken,
    }).catch((emailErr) => {
      console.warn('Email dispatch notice:', emailErr instanceof Error ? emailErr.message : 'Service notice');
      return { success: false, configured: false, provider: 'SAP_BTP_EMAIL', error: 'Email service unconfigured' };
    });

    // 9. Respond to client: do NOT create session, require verification before login
    return NextResponse.json({
      success: true,
      requiresVerification: true,
      email: newUser.EMAIL,
      message: 'Account registered successfully. Please verify your corporate email address before signing in.',
      emailDelivery: {
        configured: emailResult.configured,
        provider: emailResult.provider,
        ...(emailResult.error ? { notice: emailResult.error } : {}),
      },
    });
  } catch (error) {
    const safeError = sanitizeHanaError(error);
    console.error('HANA user registration error:', safeError);
    return NextResponse.json(
      {
        success: false,
        error: 'Registration failed due to a database error',
        message: safeError,
      },
      { status: 500 }
    );
  }
}
