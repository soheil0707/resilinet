import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getDisruptions, getDisruptionContext } from '@/lib/hana/repository';
import { sanitizeHanaError } from '@/lib/hana/client';

// Explicitly use Node.js runtime for native SAP HANA driver
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Verify authenticated Supabase user session
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

    // 2. Query live disruption records from SAP HANA Cloud ORCH_DISRUPTION and V_ORCH_DISRUPTION_CONTEXT
    const { searchParams } = new URL(request.url);
    const disruptionId = searchParams.get('disruptionId') || undefined;
    const disruptions = await getDisruptions(disruptionId);
    let disruptionContext: any[] = [];
    try {
      disruptionContext = await getDisruptionContext(disruptionId);
    } catch (ctxErr) {
      console.warn('V_ORCH_DISRUPTION_CONTEXT query warning:', ctxErr);
    }
    const schema = process.env.HANA_SCHEMA || 'HACKFEST0145';

    // 3. Return sanitized data payload
    return NextResponse.json({
      success: true,
      source: 'sap-hana',
      schema,
      data: disruptions,
      context: disruptionContext,
    });
  } catch (error) {
    const safeError = sanitizeHanaError(error);
    console.error('SAP HANA disruptions API error:', safeError);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve disruption records from SAP HANA Cloud',
        message: safeError,
      },
      { status: 500 }
    );
  }
}
