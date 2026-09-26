import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

export interface AuthSessionUser {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  phoneNumber?: string | null;
}

export const SESSION_COOKIE_NAME = 'resilinet_session';

// Secret key for JWT signing (uses env variable or stable fallback)
const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'resilinet-hana-first-enterprise-secret-key-2026-secure'
);

const TOKEN_EXPIRY = '7d';

/**
 * Creates a signed JWT session token for the user.
 */
export async function createSessionToken(user: AuthSessionUser): Promise<string> {
  return new SignJWT({
    userId: user.userId,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    phoneNumber: user.phoneNumber || null,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Verifies a JWT session token and returns the payload if valid.
 */
export async function verifySessionToken(token: string): Promise<AuthSessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.userId || !payload.email || !payload.role) {
      return null;
    }
    return {
      userId: String(payload.userId),
      fullName: String(payload.fullName || ''),
      email: String(payload.email),
      role: String(payload.role),
      phoneNumber: payload.phoneNumber ? String(payload.phoneNumber) : null,
    };
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies the session from an incoming NextRequest or standard Request.
 */
export async function getSessionUser(req: NextRequest | Request): Promise<AuthSessionUser | null> {
  let token: string | undefined;

  if ('cookies' in req && typeof req.cookies?.get === 'function') {
    token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  } else {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`(?:^|; )${SESSION_COOKIE_NAME}=([^;]*)`));
    token = match ? decodeURIComponent(match[1]) : undefined;
  }

  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Sets the secure session cookie on a NextResponse.
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clears the session cookie on a NextResponse.
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
