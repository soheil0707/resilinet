import { executeHanaQuery, executeHanaDml } from './client';

// ─── TypeScript Types for SAP HANA Cloud Objects ─────────────────────────────

export interface HanaDisruption {
  DISRUPTION_ID: string;
  DISRUPTION_TYPE: string;
  SEVERITY: string;
  LOCATION: string;
  AFFECTED_SUPPLIER_ID: string | null;
  AFFECTED_PLANT_ID: string | null;
  START_TIME: string;
  EXPECTED_DURATION_HOURS: number;
  STATUS: string;
  DESCRIPTION: string;
}

export interface HanaRecoveryStrategy {
  STRATEGY_ID: string;
  STRATEGY_NAME: string;
  STRATEGY_TYPE: string;
  TRANSPORT_MODE: string;
  ESTIMATED_COST: number | string;
  TRANSIT_TIME_HOURS: number;
  RECOVERY_SCORE: number | string;
  RISK_LEVEL: string;
  DESCRIPTION: string;
}

export interface HanaRecoveryExecution {
  EXECUTION_ID: string;
  DISRUPTION_ID: string;
  STRATEGY_ID: string;
  EXECUTION_STATUS: string;
  START_TIME: string;
  EXPECTED_COMPLETION: string | null;
  ACTUAL_COMPLETION: string | null;
  EXECUTED_BY: string;
  NOTES: string | null;
}

export interface HanaDisruptionContext {
  DISRUPTION_ID: string;
  DISRUPTION_TYPE: string;
  SEVERITY: string;
  LOCATION: string;
  AFFECTED_SUPPLIER_ID: string | null;
  AFFECTED_PLANT_ID: string | null;
  EXPECTED_DURATION_HOURS: number;
  DISRUPTION_STATUS: string;
  INVENTORY_ID: string;
  MATERIAL_ID: string;
  CURRENT_STOCK: number;
  SAFETY_STOCK: number;
  REORDER_LEVEL: number;
  DAILY_CONSUMPTION: number;
  PLANT_NAME: string;
  PLANT_REGION: string;
  CAPACITY: number;
  UTILIZATION_PERCENT: number | string;
  PLANT_STATUS: string;
  INVENTORY_RISK: string;
}

export interface HanaStrategyRanking {
  DISRUPTION_ID: string;
  DISRUPTION_TYPE: string;
  SEVERITY: string;
  LOCATION: string;
  AFFECTED_PLANT_ID: string;
  EXPECTED_DURATION_HOURS: number;
  STRATEGY_ID: string;
  STRATEGY_NAME: string;
  STRATEGY_TYPE: string;
  TRANSPORT_MODE: string;
  ESTIMATED_COST: number | string;
  TRANSIT_TIME_HOURS: number;
  RECOVERY_SCORE: number | string;
  RISK_LEVEL: string;
  ORCHESTRATOR_SCORE: number | string;
}

export interface HanaRecommendation {
  DISRUPTION_ID: string;
  DISRUPTION_TYPE: string;
  SEVERITY: string;
  LOCATION: string;
  AFFECTED_PLANT_ID: string;
  EXPECTED_DURATION_HOURS: number;
  STRATEGY_ID: string;
  STRATEGY_NAME: string;
  STRATEGY_TYPE: string;
  TRANSPORT_MODE: string;
  ESTIMATED_COST: number | string;
  TRANSIT_TIME_HOURS: number;
  RECOVERY_SCORE: number | string;
  RISK_LEVEL: string;
  ORCHESTRATOR_SCORE: number | string;
}

export interface HanaAIDecision {
  DISRUPTION_ID: string;
  DISRUPTION_TYPE: string;
  SEVERITY: string;
  LOCATION: string;
  AFFECTED_PLANT_ID: string;
  EXPECTED_DURATION_HOURS: number;
  STRATEGY_ID: string;
  STRATEGY_NAME: string;
  STRATEGY_TYPE: string;
  TRANSPORT_MODE: string;
  ESTIMATED_COST: number | string;
  TRANSIT_TIME_HOURS: number;
  RECOVERY_SCORE: number | string;
  RISK_LEVEL: string;
  ORCHESTRATOR_SCORE: number | string;
  AI_REASON: string;
}

// ─── READ-ONLY Repository Functions ──────────────────────────────────────────

/**
 * 1. Read disruptions from ORCH_DISRUPTION table.
 */
export async function getDisruptions(disruptionId?: string): Promise<HanaDisruption[]> {
  if (disruptionId) {
    return executeHanaQuery<HanaDisruption>(
      'SELECT * FROM ORCH_DISRUPTION WHERE DISRUPTION_ID = ? ORDER BY START_TIME DESC',
      [disruptionId]
    );
  }
  return executeHanaQuery<HanaDisruption>(
    'SELECT * FROM ORCH_DISRUPTION ORDER BY START_TIME DESC'
  );
}

/**
 * 2. Read disruption context from V_ORCH_DISRUPTION_CONTEXT view.
 */
export async function getDisruptionContext(disruptionId?: string): Promise<HanaDisruptionContext[]> {
  if (disruptionId) {
    return executeHanaQuery<HanaDisruptionContext>(
      'SELECT * FROM V_ORCH_DISRUPTION_CONTEXT WHERE DISRUPTION_ID = ?',
      [disruptionId]
    );
  }
  return executeHanaQuery<HanaDisruptionContext>(
    'SELECT * FROM V_ORCH_DISRUPTION_CONTEXT'
  );
}

/**
 * 3. Read strategy ranking from V_ORCH_STRATEGY_RANKING view.
 */
export async function getStrategyRanking(disruptionId?: string): Promise<HanaStrategyRanking[]> {
  if (disruptionId) {
    return executeHanaQuery<HanaStrategyRanking>(
      'SELECT * FROM V_ORCH_STRATEGY_RANKING WHERE DISRUPTION_ID = ? ORDER BY ORCHESTRATOR_SCORE DESC',
      [disruptionId]
    );
  }
  return executeHanaQuery<HanaStrategyRanking>(
    'SELECT * FROM V_ORCH_STRATEGY_RANKING ORDER BY ORCHESTRATOR_SCORE DESC'
  );
}

/**
 * 4. Read recommendations from V_ORCH_RECOMMENDATIONS view.
 */
export async function getRecommendations(disruptionId?: string): Promise<HanaRecommendation[]> {
  if (disruptionId) {
    return executeHanaQuery<HanaRecommendation>(
      'SELECT * FROM V_ORCH_RECOMMENDATIONS WHERE DISRUPTION_ID = ?',
      [disruptionId]
    );
  }
  return executeHanaQuery<HanaRecommendation>(
    'SELECT * FROM V_ORCH_RECOMMENDATIONS'
  );
}

/**
 * 5. Read AI decisions from V_ORCH_AI_DECISION view.
 */
export async function getAIDecisions(disruptionId?: string): Promise<HanaAIDecision[]> {
  if (disruptionId) {
    return executeHanaQuery<HanaAIDecision>(
      'SELECT * FROM V_ORCH_AI_DECISION WHERE DISRUPTION_ID = ?',
      [disruptionId]
    );
  }
  return executeHanaQuery<HanaAIDecision>(
    'SELECT * FROM V_ORCH_AI_DECISION'
  );
}

/**
 * 6. Read recovery executions from ORCH_RECOVERY_EXECUTION table.
 */
export async function getRecoveryExecutions(disruptionId?: string): Promise<HanaRecoveryExecution[]> {
  if (disruptionId) {
    return executeHanaQuery<HanaRecoveryExecution>(
      'SELECT * FROM ORCH_RECOVERY_EXECUTION WHERE DISRUPTION_ID = ? ORDER BY START_TIME DESC',
      [disruptionId]
    );
  }
  return executeHanaQuery<HanaRecoveryExecution>(
    'SELECT * FROM ORCH_RECOVERY_EXECUTION ORDER BY START_TIME DESC'
  );
}

// ─── CONTROLLED WRITE-BACK FUNCTIONS ─────────────────────────────────────────

export interface UpdateExecutionResult {
  success: boolean;
  affectedRows: number;
  executionId: string;
  previousStatus: string;
  newStatus: string;
  error?: string;
}

/**
 * 7. Controlled Execution Write-Back: Transitions EXE-1001 from IN_PROGRESS to COMPLETED.
 *
 * CRITICAL SAFETY RULES ENFORCED:
 * - Scope: EXE-1001 ONLY.
 * - Transition: IN_PROGRESS -> COMPLETED ONLY.
 * - Optimistic locking: WHERE EXECUTION_ID = ? AND DISRUPTION_ID = 'DIS-1001' AND STRATEGY_ID = 'STR-001' AND EXECUTION_STATUS = 'IN_PROGRESS'
 * - Parameterized SQL values only.
 * - Verification: Returns success ONLY if affectedRows === 1.
 */
export async function updateRecoveryExecutionCompleted(
  executionId: string,
  expectedStatus: string = 'IN_PROGRESS',
  notes?: string
): Promise<UpdateExecutionResult> {
  // Strict execution ID scope guard
  if (executionId !== 'EXE-1001') {
    return {
      success: false,
      affectedRows: 0,
      executionId,
      previousStatus: expectedStatus,
      newStatus: expectedStatus,
      error: `Execution ID '${executionId}' is not authorized for write-back. Only 'EXE-1001' is supported in this phase.`,
    };
  }

  // Sanitize notes (max 500 characters, parameterized)
  const sanitizedNotes = notes && typeof notes === 'string'
    ? notes.trim().slice(0, 500)
    : 'Execution completed via ResiliNet SCM Cockpit';

  const sql = `
    UPDATE ORCH_RECOVERY_EXECUTION
    SET EXECUTION_STATUS = 'COMPLETED',
        ACTUAL_COMPLETION = CURRENT_UTCTIMESTAMP,
        NOTES = ?
    WHERE EXECUTION_ID = ?
      AND DISRUPTION_ID = 'DIS-1001'
      AND STRATEGY_ID = 'STR-001'
      AND EXECUTION_STATUS = 'IN_PROGRESS'
  `;

  const affectedRows = await executeHanaDml(sql, [sanitizedNotes, executionId]);

  if (affectedRows === 1) {
    return {
      success: true,
      affectedRows: 1,
      executionId,
      previousStatus: 'IN_PROGRESS',
      newStatus: 'COMPLETED',
    };
  }

  return {
    success: false,
    affectedRows: 0,
    executionId,
    previousStatus: 'UNKNOWN_OR_ALREADY_COMPLETED',
    newStatus: 'IN_PROGRESS',
    error: 'Execution state changed before this action completed (0 rows updated)',
  };
}

