import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import {
  getStrategyRanking,
  getRecommendations,
  getAIDecisions,
} from '@/lib/hana/repository';
import { sanitizeHanaError } from '@/lib/hana/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Verify authenticated HANA user session
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

    // 3. Query SAP HANA Cloud views
    const [strategyRanking, recommendations, aiDecisions] = await Promise.all([
      getStrategyRanking(disruptionId),
      getRecommendations(disruptionId),
      getAIDecisions(disruptionId),
    ]);

    const schema = process.env.HANA_SCHEMA || 'HACKFEST0145';

    // 4. Return sanitized data payload
    return NextResponse.json({
      success: true,
      source: 'sap-hana',
      schema,
      strategyRanking,
      strategies: strategyRanking,
      recommendations,
      aiDecisions,
    });
  } catch (error) {
    const safeError = sanitizeHanaError(error);
    console.error('SAP HANA recovery-strategies API error:', safeError);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve recovery strategies from SAP HANA Cloud',
        message: safeError,
      },
      { status: 500 }
    );
  }
}
