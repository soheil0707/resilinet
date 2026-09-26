import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import {
  getDisruptions,
  getRecommendations,
  getAIDecisions,
  getRecoveryExecutions,
} from '@/lib/hana/repository';
import { sanitizeHanaError } from '@/lib/hana/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Active HANA session required' },
        { status: 401 }
      );
    }

    const [disruptions, recommendations, aiDecisions, recoveryExecutions] = await Promise.all([
      getDisruptions(),
      getRecommendations(),
      getAIDecisions(),
      getRecoveryExecutions(),
    ]);

    const schema = process.env.HANA_SCHEMA || 'HACKFEST0145';

    return NextResponse.json({
      success: true,
      schema,
      counts: {
        disruptions: disruptions.length,
        recommendations: recommendations.length,
        aiDecisions: aiDecisions.length,
        recoveryExecutions: recoveryExecutions.length,
      },
    });
  } catch (error) {
    const safeError = sanitizeHanaError(error);
    console.error('SAP HANA data-test route error:', safeError);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to query SAP HANA Cloud repository',
        message: safeError,
      },
      { status: 500 }
    );
  }
}
