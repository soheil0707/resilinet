import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getAIDecisions } from '@/lib/hana/repository';
import { sanitizeHanaError } from '@/lib/hana/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Verify authenticated HANA session
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Active HANA session required' },
        { status: 401 }
      );
    }

    // 2. Read optional disruptionId query parameter
    const searchParams = req.nextUrl.searchParams;
    const disruptionId = searchParams.get('disruptionId') || undefined;

    // 3. Query SAP HANA Cloud V_ORCH_AI_DECISION view
    const aiDecisions = await getAIDecisions(disruptionId);
    const schema = process.env.HANA_SCHEMA || 'HACKFEST0145';

    // 4. Return sanitized data payload
    return NextResponse.json({
      success: true,
      source: 'sap-hana',
      schema,
      data: aiDecisions,
    });
  } catch (error) {
    const safeError = sanitizeHanaError(error);
    console.error('SAP HANA ai-decisions API error:', safeError);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve AI decisions from SAP HANA Cloud',
        message: safeError,
      },
      { status: 500 }
    );
  }
}
