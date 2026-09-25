import { NextResponse } from 'next/server';
import { executeHanaQuery, isHanaConfigured, sanitizeHanaError } from '@/lib/hana/client';

// Explicitly specify Node.js runtime for native SAP HANA client
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!isHanaConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'SAP HANA Cloud is not configured. Missing required environment variables (HANA_HOST, HANA_USER, HANA_PASSWORD).',
        },
        { status: 503 }
      );
    }

    // Execute standard current schema verification on SAP HANA
    const rows = await executeHanaQuery<{
      CURRENT_SCHEMA?: string;
      current_schema?: string;
      [key: string]: unknown;
    }>('SELECT CURRENT_SCHEMA FROM DUMMY;');

    const schema =
      rows[0]?.CURRENT_SCHEMA ||
      rows[0]?.current_schema ||
      (rows[0] ? Object.values(rows[0])[0] : null) ||
      process.env.HANA_SCHEMA ||
      'HACKFEST0145';

    return NextResponse.json({
      success: true,
      schema: String(schema),
    });
  } catch (error) {
    const safeErrorMessage = sanitizeHanaError(error);
    console.error('SAP HANA Cloud test query error:', safeErrorMessage);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to connect to SAP HANA Cloud',
        details: safeErrorMessage,
      },
      { status: 500 }
    );
  }
}
