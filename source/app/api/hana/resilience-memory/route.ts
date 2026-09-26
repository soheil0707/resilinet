import { NextRequest, NextResponse } from 'next/server';
import { getHanaResilienceMemory, createHanaResilienceMemory } from '@/lib/hana/repository';
import { getSessionUser } from '@/lib/auth/session';
import { sanitizeHanaError } from '@/lib/hana/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Session required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const disruptionId = searchParams.get('disruptionId') || undefined;

    const memories = await getHanaResilienceMemory(disruptionId);
    const schema = process.env.HANA_SCHEMA || 'HACKFEST0145';

    return NextResponse.json({
      success: true,
      source: 'sap-hana',
      schema,
      data: memories,
    });
  } catch (error) {
    const safeError = sanitizeHanaError(error);
    console.error('SAP HANA resilience-memory GET error:', safeError);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve resilience memory from SAP HANA Cloud', message: safeError },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Session required' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.title) {
      return NextResponse.json(
        { success: false, error: 'Title is required for resilience memory record' },
        { status: 400 }
      );
    }

    const memoryId = body.memoryId || `MEM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const created = await createHanaResilienceMemory({
      memoryId,
      disruptionId: body.disruptionId,
      executionId: body.executionId,
      strategyId: body.strategyId,
      memoryType: body.memoryType || 'RECOVERY_COMPLETION',
      title: body.title,
      summary: body.summary,
      decision: body.decision,
      outcome: body.outcome,
      lessonsLearned: body.lessonsLearned,
      recoveryScore: body.recoveryScore ? Number(body.recoveryScore) : null,
      orchestratorScore: body.orchestratorScore ? Number(body.orchestratorScore) : null,
      recoveryStatus: body.recoveryStatus || 'RESOLVED',
      createdBy: user.fullName || user.email,
    });

    return NextResponse.json({
      success: true,
      source: 'sap-hana',
      data: created,
    });
  } catch (error) {
    const safeError = sanitizeHanaError(error);
    console.error('SAP HANA resilience-memory POST error:', safeError);
    return NextResponse.json(
      { success: false, error: 'Failed to create resilience memory record in SAP HANA Cloud', message: safeError },
      { status: 500 }
    );
  }
}
