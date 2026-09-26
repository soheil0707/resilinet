import { NextRequest, NextResponse } from 'next/server';
import { verifySapDestinationConfiguration } from '@/lib/email/sap-destination';
import { getSessionUser } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Diagnostic endpoint to safely verify SAP BTP Destination Service configuration
 * and SMTP transport connectivity without dispatching any emails.
 *
 * Secrets (passwords, tokens, client secrets) are NEVER exposed.
 */
export async function GET(req: NextRequest) {
  try {
    // Check if session user is ADMIN (or allow diagnostic access in development)
    const session = await getSessionUser(req);
    const isDev = process.env.NODE_ENV !== 'production';

    if (!session && !isDev) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin session required for diagnostic endpoint.' },
        { status: 401 }
      );
    }

    if (session && session.role !== 'ADMIN' && !isDev) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin role required for diagnostic endpoint.' },
        { status: 403 }
      );
    }

    const result = await verifySapDestinationConfiguration();

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      service: 'SAP BTP Destination Service',
      testOnly: true,
      emailSent: false,
      result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown diagnostic error';
    return NextResponse.json(
      {
        success: false,
        error: message.replace(/bearer\s+[a-zA-Z0-9._-]+/gi, 'Bearer [REDACTED]'),
      },
      { status: 500 }
    );
  }
}
