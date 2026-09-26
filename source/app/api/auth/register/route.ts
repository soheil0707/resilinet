import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getHanaUserByEmail, createHanaUserAccount } from '@/lib/hana/repository';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
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
        { success: false, error: 'An enterprise account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // 3. Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Generate user ID
    const userId = `USR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 5. Create user in SAP HANA Cloud
    const newUser = await createHanaUserAccount({
      userId,
      fullName: fullName.trim(),
      email: cleanEmail,
      passwordHash,
      role: assignedRole,
      phoneNumber: phoneNumber ? String(phoneNumber).trim() : null,
    });

    const sessionUser = {
      userId: newUser.USER_ID,
      fullName: newUser.FULL_NAME,
      email: newUser.EMAIL,
      role: newUser.ROLE,
      phoneNumber: newUser.PHONE_NUMBER,
    };

    // 6. Automatically authenticate: issue signed session token
    const token = await createSessionToken(sessionUser);

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
      redirectTo: '/',
    });

    setSessionCookie(response, token);

    return response;
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
