import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import {
  getDisruptions,
  getRecommendations,
  getAIDecisions,
  getRecoveryExecutions,
  getDisruptionContext,
  getHanaNotificationCounts,
} from '@/lib/hana/repository';
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

    // 2. Fetch authoritative SAP HANA Cloud data in parallel
    const [
      disruptions,
      recommendations,
      aiDecisions,
      recoveryExecutions,
      disruptionContext,
      notificationCounts,
    ] = await Promise.all([
      getDisruptions(),
      getRecommendations(),
      getAIDecisions(),
      getRecoveryExecutions(),
      getDisruptionContext('DIS-1001').catch(() => []),
      getHanaNotificationCounts(user.userId).catch(() => ({
        monitorDetect: 0,
        analyzeSimulate: 0,
        decideApprove: 0,
        executeLearn: 0,
        totalUnread: 0,
      })),
    ]);

    // 3. Compute live summary metrics
    const totalDisruptions = disruptions.length;
    const criticalDisruptions = disruptions.filter(
      (d) => d.SEVERITY?.toUpperCase() === 'CRITICAL'
    ).length;
    const highDisruptions = disruptions.filter(
      (d) => d.SEVERITY?.toUpperCase() === 'HIGH'
    ).length;
    const activeDisruptions = disruptions.filter(
      (d) => d.STATUS?.toUpperCase() === 'ACTIVE'
    ).length;

    const totalRecommendations = recommendations.length;
    const topRecommendation = recommendations[0] || null;
    const recommendedStrategy = topRecommendation?.STRATEGY_NAME || 'Combined Recovery';
    const recommendedRecoveryScore = topRecommendation
      ? parseFloat(Number(topRecommendation.RECOVERY_SCORE).toFixed(2))
      : 94.0;

    const topAIDecision = aiDecisions[0] || null;
    const orchestratorScore = topAIDecision
      ? parseFloat(Number(topAIDecision.ORCHESTRATOR_SCORE).toFixed(2))
      : 82.3;

    const executionsInProgress = recoveryExecutions.filter(
      (e) => e.EXECUTION_STATUS?.toUpperCase() === 'IN_PROGRESS'
    ).length;
    const plannedExecutions = recoveryExecutions.filter(
      (e) => e.EXECUTION_STATUS?.toUpperCase() === 'PLANNED'
    ).length;
    const completedExecutions = recoveryExecutions.filter(
      (e) =>
        e.EXECUTION_STATUS?.toUpperCase() === 'COMPLETED' ||
        e.EXECUTION_STATUS?.toUpperCase() === 'RESOLVED'
    ).length;
    const totalExecutions = recoveryExecutions.length;

    // Primary incident details (DIS-1001)
    const primaryDisruption =
      disruptions.find((d) => d.DISRUPTION_ID === 'DIS-1001') ||
      disruptions[0] ||
      null;

    // Current primary recovery execution (EXE-1001)
    const currentExecution =
      recoveryExecutions.find((e) => e.EXECUTION_ID === 'EXE-1001') ||
      recoveryExecutions[0] ||
      null;

    const schema = process.env.HANA_SCHEMA || 'HACKFEST0145';

    // 4. Return unified comprehensive payload
    return NextResponse.json({
      success: true,
      source: 'sap-hana',
      schema,
      summary: {
        totalDisruptions,
        criticalDisruptions,
        highDisruptions,
        activeDisruptions,
        totalRecommendations,
        recommendedStrategy,
        recommendedRecoveryScore,
        orchestratorScore,
        executionsInProgress,
        plannedExecutions,
        completedExecutions,
        totalExecutions,
      },
      disruptions,
      primaryDisruption,
      disruptionContext: disruptionContext[0] || null,
      topAIDecision,
      recommendations,
      recoveryExecutions,
      currentExecution,
      notificationCounts,
    });
  } catch (error) {
    const safeError = sanitizeHanaError(error);
    console.error('SAP HANA dashboard API error:', safeError);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve dashboard summary from SAP HANA Cloud',
        message: safeError,
      },
      { status: 500 }
    );
  }
}
