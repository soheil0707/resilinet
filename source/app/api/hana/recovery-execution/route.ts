import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getRecoveryExecutions, updateRecoveryExecutionCompleted } from '@/lib/hana/repository';
import { sanitizeHanaError } from '@/lib/hana/client';

// Explicitly use Node.js runtime for native SAP HANA driver
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
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

    // 2. Read optional disruptionId query parameter
    const searchParams = req.nextUrl.searchParams;
    const disruptionId = searchParams.get('disruptionId') || undefined;

    // 3. Query SAP HANA Cloud ORCH_RECOVERY_EXECUTION table
    const executions = await getRecoveryExecutions(disruptionId);
    const schema = process.env.HANA_SCHEMA || 'HACKFEST0145';

    // 4. Return sanitized data payload
    return NextResponse.json({
      success: true,
      source: 'sap-hana',
      schema,
      data: executions,
    });
  } catch (error) {
    const safeError = sanitizeHanaError(error);
    console.error('SAP HANA recovery-execution API error:', safeError);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve recovery execution records from SAP HANA Cloud',
        message: safeError,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // 1. Verify authenticated Supabase session
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Authorization: Check role if available in profiles or user_metadata
    let userRole: string | null = null;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role) {
        userRole = profile.role;
      }
    } catch {
      // Profiles query non-blocking fallback
    }

    if (!userRole && user.user_metadata?.role) {
      userRole = user.user_metadata.role as string;
    }

    const AUTHORIZED_ROLES = ['SUPPLY_CHAIN_MANAGER', 'ADMIN'];
    if (userRole && !AUTHORIZED_ROLES.includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'You are not authorized to complete this execution' },
        { status: 403 }
      );
    }

    // 3. Request validation
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const { executionId, notes } = body || {};

    if (!executionId || typeof executionId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'executionId is required and must be a string' },
        { status: 400 }
      );
    }

    if (!/^EXE-\d+$/.test(executionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid executionId format' },
        { status: 400 }
      );
    }

    // Phase 32C-A safety constraint: Only EXE-1001 is permitted
    if (executionId !== 'EXE-1001') {
      return NextResponse.json(
        {
          success: false,
          error: 'Only execution record EXE-1001 is eligible for completion write-back in this phase',
        },
        { status: 400 }
      );
    }

    let sanitizedNotes: string | undefined;
    if (notes !== undefined && notes !== null) {
      if (typeof notes !== 'string') {
        return NextResponse.json(
          { success: false, error: 'notes must be a string if provided' },
          { status: 400 }
        );
      }
      if (notes.trim().length > 500) {
        return NextResponse.json(
          { success: false, error: 'notes cannot exceed 500 characters' },
          { status: 400 }
        );
      }
      if (notes.trim().length > 0) {
        sanitizedNotes = notes.trim();
      }
    }

    // 4. Execute controlled HANA completion write-back with optimistic locking
    const result = await updateRecoveryExecutionCompleted(
      executionId,
      'IN_PROGRESS',
      sanitizedNotes
    );

    if (result.success && result.affectedRows === 1) {
      return NextResponse.json(
        {
          success: true,
          executionId: result.executionId,
          previousStatus: result.previousStatus,
          newStatus: result.newStatus,
        },
        { status: 200 }
      );
    }

    // Affected rows === 0: Concurrency conflict (or already completed)
    return NextResponse.json(
      {
        success: false,
        error: 'Execution state changed before this action completed',
      },
      { status: 409 }
    );
  } catch (error) {
    const safeError = sanitizeHanaError(error);
    console.error('SAP HANA write-back API error:', safeError);

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to update SAP HANA execution state. No completion was recorded.',
      },
      { status: 500 }
    );
  }
}

