import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getDisruptions,
  getRecommendations,
  getAIDecisions,
  getRecoveryExecutions,
} from '@/lib/hana/repository';
import { sanitizeHanaError } from '@/lib/hana/client';

// Explicitly use Node.js runtime for native SAP HANA driver
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Verify authenticated Supabase session
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized: Valid Supabase session required' },
          { status: 401 }
        );
      }
    }

    // 2. Query SAP HANA Cloud via the dedicated read-only repository
    const [disruptions, recommendations, aiDecisions, recoveryExecutions] = await Promise.all([
      getDisruptions(),
      getRecommendations(),
      getAIDecisions(),
      getRecoveryExecutions(),
    ]);

    const schema = process.env.HANA_SCHEMA || 'HACKFEST0145';

    // 3. Return safe summary JSON response without sensitive details
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
