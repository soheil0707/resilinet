import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import {
  getRecoveryExecutions,
  updateRecoveryExecutionCompleted,
  createHanaResilienceMemory,
  createHanaNotification,
} from '@/lib/hana/repository';
import { sanitizeHanaError } from '@/lib/hana/client';

// Explicitly use Node.js runtime for native SAP HANA driver
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
    // 1. Verify authenticated HANA session
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Active HANA session required' },
        { status: 401 }
      );
    }

    // 2. Authorization: Check role
    const AUTHORIZED_ROLES = ['SUPPLY_CHAIN_MANAGER', 'ADMIN'];
    if (!AUTHORIZED_ROLES.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You are not authorized to complete this execution' },
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

    // Controlled scope guard: Only EXE-1001 is permitted in this phase
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
      const completionTime = new Date().toISOString();

      // Step 4.4 & 3: Create resilience memory record in SAP HANA Cloud
      const memoryId = `MEM-${Date.now().toString(36).toUpperCase()}`;
      await createHanaResilienceMemory({
        memoryId,
        disruptionId: 'DIS-1001',
        executionId: 'EXE-1001',
        strategyId: 'STR-001',
        memoryType: 'SUPPLIER_DELAY_RECOVERY',
        title: 'Global Metals Ltd. (S-104) Disruption Recovery Completed',
        summary: 'Combined recovery via road express and air charter buffer leg successfully executed.',
        decision: 'Authorized dual-modal recovery strategy STR-001 to prevent starving 17 assembly orders.',
        outcome: 'Steering Assembly inventory replenished at PL-01 Hyderabad. Projected delay eliminated.',
        lessonsLearned: 'Dual-modal air+road response preserved ₹24.2L revenue with zero OEM penalty activation.',
        recoveryScore: 94.0,
        orchestratorScore: 82.3,
        recoveryStatus: 'COMPLETED',
        createdBy: user.fullName || user.email,
      }).catch((memErr) => {
        console.warn('Could not auto-insert resilience memory record:', memErr);
      });

      // Step 4.5 & 8: Create completion notification in SAP HANA Cloud
      const notificationId = `NOTIF-${Date.now().toString(36).toUpperCase()}`;
      await createHanaNotification({
        notificationId,
        category: 'RECOVERY',
        notificationType: 'RECOVERY_COMPLETED',
        title: 'Recovery Completed: EXE-1001',
        message: `Recovery EXE-1001 for DIS-1001 has been completed successfully via Combined Recovery (STR-001) at ${completionTime}.`,
        severity: 'INFO',
        disruptionId: 'DIS-1001',
        executionId: 'EXE-1001',
      }).catch((notifErr) => {
        console.warn('Could not auto-insert completion notification:', notifErr);
      });

      return NextResponse.json(
        {
          success: true,
          executionId: result.executionId,
          previousStatus: result.previousStatus,
          newStatus: result.newStatus,
          completionTime,
          memoryId,
          notificationId,
        },
        { status: 200 }
      );
    }

    // Concurrency conflict / already completed
    return NextResponse.json(
      {
        success: false,
        error: 'Execution state changed before this action completed (0 rows updated)',
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
