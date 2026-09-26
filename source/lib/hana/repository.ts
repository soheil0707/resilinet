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

// ─── USER_ACCOUNT (HANA-FIRST AUTHENTICATION) ─────────────────────────────────

export interface HanaUserAccount {
  USER_ID: string;
  FULL_NAME: string;
  EMAIL: string;
  PASSWORD_HASH: string;
  ROLE: string;
  PHONE_NUMBER: string | null;
  IS_ACTIVE: number;
  CREATED_AT: string;
  UPDATED_AT: string;
  LAST_LOGIN_AT: string | null;
}

export async function getHanaUserByEmail(email: string): Promise<HanaUserAccount | null> {
  const rows = await executeHanaQuery<HanaUserAccount>(
    'SELECT * FROM USER_ACCOUNT WHERE LOWER(EMAIL) = LOWER(?) AND IS_ACTIVE = 1',
    [email.trim()]
  );
  return rows[0] || null;
}

export async function getHanaUserById(userId: string): Promise<HanaUserAccount | null> {
  const rows = await executeHanaQuery<HanaUserAccount>(
    'SELECT * FROM USER_ACCOUNT WHERE USER_ID = ? AND IS_ACTIVE = 1',
    [userId]
  );
  return rows[0] || null;
}

export async function createHanaUserAccount(data: {
  userId: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: string;
  phoneNumber?: string | null;
}): Promise<HanaUserAccount> {
  const sql = `
    INSERT INTO USER_ACCOUNT (
      USER_ID, FULL_NAME, EMAIL, PASSWORD_HASH, ROLE, PHONE_NUMBER, IS_ACTIVE
    ) VALUES (?, ?, ?, ?, ?, ?, 1)
  `;
  await executeHanaDml(sql, [
    data.userId,
    data.fullName.trim(),
    data.email.trim().toLowerCase(),
    data.passwordHash,
    data.role,
    data.phoneNumber || null,
  ]);

  const user = await getHanaUserById(data.userId);
  if (!user) throw new Error('User created but retrieval failed from SAP HANA Cloud');
  return user;
}

export async function updateHanaUserLastLogin(userId: string): Promise<void> {
  await executeHanaDml(
    'UPDATE USER_ACCOUNT SET LAST_LOGIN_AT = CURRENT_UTCTIMESTAMP, UPDATED_AT = CURRENT_UTCTIMESTAMP WHERE USER_ID = ?',
    [userId]
  );
}

// ─── ORCH_RESILIENCE_MEMORY (HANA-FIRST MEMORY) ──────────────────────────────

export interface HanaResilienceMemory {
  MEMORY_ID: string;
  DISRUPTION_ID: string | null;
  EXECUTION_ID: string | null;
  STRATEGY_ID: string | null;
  MEMORY_TYPE: string | null;
  TITLE: string;
  SUMMARY: string | null;
  DECISION: string | null;
  OUTCOME: string | null;
  LESSONS_LEARNED: string | null;
  RECOVERY_SCORE: number | string | null;
  ORCHESTRATOR_SCORE: number | string | null;
  RECOVERY_STATUS: string | null;
  CREATED_BY: string | null;
  CREATED_AT: string;
  UPDATED_AT: string;
}

export async function getHanaResilienceMemory(disruptionId?: string): Promise<HanaResilienceMemory[]> {
  if (disruptionId) {
    return executeHanaQuery<HanaResilienceMemory>(
      'SELECT * FROM ORCH_RESILIENCE_MEMORY WHERE DISRUPTION_ID = ? ORDER BY CREATED_AT DESC',
      [disruptionId]
    );
  }
  return executeHanaQuery<HanaResilienceMemory>(
    'SELECT * FROM ORCH_RESILIENCE_MEMORY ORDER BY CREATED_AT DESC'
  );
}

export async function createHanaResilienceMemory(item: {
  memoryId: string;
  disruptionId?: string | null;
  executionId?: string | null;
  strategyId?: string | null;
  memoryType?: string | null;
  title: string;
  summary?: string | null;
  decision?: string | null;
  outcome?: string | null;
  lessonsLearned?: string | null;
  recoveryScore?: number | null;
  orchestratorScore?: number | null;
  recoveryStatus?: string | null;
  createdBy?: string | null;
}): Promise<HanaResilienceMemory> {
  const sql = `
    INSERT INTO ORCH_RESILIENCE_MEMORY (
      MEMORY_ID, DISRUPTION_ID, EXECUTION_ID, STRATEGY_ID, MEMORY_TYPE,
      TITLE, SUMMARY, DECISION, OUTCOME, LESSONS_LEARNED,
      RECOVERY_SCORE, ORCHESTRATOR_SCORE, RECOVERY_STATUS, CREATED_BY
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  await executeHanaDml(sql, [
    item.memoryId,
    item.disruptionId || null,
    item.executionId || null,
    item.strategyId || null,
    item.memoryType || 'RECOVERY_COMPLETION',
    item.title,
    item.summary || null,
    item.decision || null,
    item.outcome || null,
    item.lessonsLearned || null,
    item.recoveryScore || null,
    item.orchestratorScore || null,
    item.recoveryStatus || 'RESOLVED',
    item.createdBy || 'Orchestrator System',
  ]);

  const rows = await executeHanaQuery<HanaResilienceMemory>(
    'SELECT * FROM ORCH_RESILIENCE_MEMORY WHERE MEMORY_ID = ?',
    [item.memoryId]
  );
  return rows[0];
}

// ─── ORCH_NOTIFICATION (HANA-FIRST NOTIFICATIONS) ────────────────────────────

export interface HanaNotification {
  NOTIFICATION_ID: string;
  USER_ID: string | null;
  NOTIFICATION_TYPE: string | null;
  CATEGORY: string; // EARLY_WARNING | CRISIS | DECISION | APPROVAL | EXECUTION | RECOVERY | SYSTEM
  TITLE: string;
  MESSAGE: string | null;
  SEVERITY: string; // CRITICAL | HIGH | MEDIUM | LOW | INFO
  DISRUPTION_ID: string | null;
  EXECUTION_ID: string | null;
  IS_READ: number;
  CREATED_AT: string;
  READ_AT: string | null;
}

export interface HanaNotificationCounts {
  monitorDetect: number;
  analyzeSimulate: number;
  decideApprove: number;
  executeLearn: number;
  totalUnread: number;
}

export async function getHanaNotifications(options?: {
  userId?: string;
  unreadOnly?: boolean;
  limit?: number;
}): Promise<HanaNotification[]> {
  const { userId, unreadOnly = false, limit = 50 } = options || {};

  let sql = 'SELECT * FROM ORCH_NOTIFICATION WHERE 1=1';
  const params: (string | number)[] = [];

  if (userId) {
    sql += ' AND (USER_ID = ? OR USER_ID IS NULL)';
    params.push(userId);
  }

  if (unreadOnly) {
    sql += ' AND IS_READ = 0';
  }

  sql += ' ORDER BY CREATED_AT DESC';

  if (limit) {
    sql += ` LIMIT ${Math.max(1, Math.min(limit, 100))}`;
  }

  return executeHanaQuery<HanaNotification>(sql, params);
}

export async function getHanaNotificationCounts(userId?: string): Promise<HanaNotificationCounts> {
  const notifs = await getHanaNotifications({ userId, unreadOnly: true, limit: 100 });

  let monitorDetect = 0;
  let analyzeSimulate = 0;
  let decideApprove = 0;
  let executeLearn = 0;

  for (const n of notifs) {
    const cat = (n.CATEGORY || '').toUpperCase();
    if (cat === 'EARLY_WARNING' || cat === 'CRISIS') {
      monitorDetect++;
    }
    if (cat === 'CRISIS' || cat === 'DECISION') {
      analyzeSimulate++;
    }
    if (cat === 'DECISION' || cat === 'APPROVAL') {
      decideApprove++;
    }
    if (cat === 'EXECUTION' || cat === 'RECOVERY') {
      executeLearn++;
    }
  }

  return {
    monitorDetect,
    analyzeSimulate,
    decideApprove,
    executeLearn,
    totalUnread: notifs.length,
  };
}

export async function markHanaNotificationRead(notificationId: string): Promise<boolean> {
  const sql = `
    UPDATE ORCH_NOTIFICATION
    SET IS_READ = 1,
        READ_AT = CURRENT_UTCTIMESTAMP
    WHERE NOTIFICATION_ID = ?
  `;
  const affected = await executeHanaDml(sql, [notificationId]);
  return affected > 0;
}

export async function markAllHanaNotificationsRead(userId?: string): Promise<number> {
  let sql = `
    UPDATE ORCH_NOTIFICATION
    SET IS_READ = 1,
        READ_AT = CURRENT_UTCTIMESTAMP
    WHERE IS_READ = 0
  `;
  const params: string[] = [];
  if (userId) {
    sql += ' AND (USER_ID = ? OR USER_ID IS NULL)';
    params.push(userId);
  }
  return executeHanaDml(sql, params);
}

export async function createHanaNotification(data: {
  notificationId: string;
  userId?: string | null;
  notificationType?: string | null;
  category: string;
  title: string;
  message?: string | null;
  severity: string;
  disruptionId?: string | null;
  executionId?: string | null;
}): Promise<HanaNotification> {
  const sql = `
    INSERT INTO ORCH_NOTIFICATION (
      NOTIFICATION_ID, USER_ID, NOTIFICATION_TYPE, CATEGORY, TITLE, MESSAGE,
      SEVERITY, DISRUPTION_ID, EXECUTION_ID, IS_READ
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `;
  await executeHanaDml(sql, [
    data.notificationId,
    data.userId || null,
    data.notificationType || data.category,
    data.category.toUpperCase(),
    data.title,
    data.message || null,
    data.severity.toUpperCase(),
    data.disruptionId || null,
    data.executionId || null,
  ]);

  const rows = await executeHanaQuery<HanaNotification>(
    'SELECT * FROM ORCH_NOTIFICATION WHERE NOTIFICATION_ID = ?',
    [data.notificationId]
  );
  return rows[0];
}

// ─── ORCH_PUSH_SUBSCRIPTION (WEB PUSH) ────────────────────────────────────────

export interface HanaPushSubscription {
  SUBSCRIPTION_ID: string;
  USER_ID: string | null;
  ENDPOINT: string;
  P256DH: string;
  AUTH_KEY: string;
  DEVICE_NAME: string | null;
  CREATED_AT: string;
  LAST_USED_AT: string | null;
  IS_ACTIVE: number;
}

export async function saveHanaPushSubscription(data: {
  subscriptionId: string;
  userId?: string | null;
  endpoint: string;
  p256dh: string;
  authKey: string;
  deviceName?: string | null;
}): Promise<void> {
  // Check if endpoint already registered
  const existing = await executeHanaQuery<HanaPushSubscription>(
    'SELECT * FROM ORCH_PUSH_SUBSCRIPTION WHERE ENDPOINT = ?',
    [data.endpoint]
  );

  if (existing.length > 0) {
    await executeHanaDml(
      `UPDATE ORCH_PUSH_SUBSCRIPTION
       SET USER_ID = ?, P256DH = ?, AUTH_KEY = ?, DEVICE_NAME = ?, IS_ACTIVE = 1, LAST_USED_AT = CURRENT_UTCTIMESTAMP
       WHERE ENDPOINT = ?`,
      [data.userId || null, data.p256dh, data.authKey, data.deviceName || null, data.endpoint]
    );
  } else {
    await executeHanaDml(
      `INSERT INTO ORCH_PUSH_SUBSCRIPTION (
        SUBSCRIPTION_ID, USER_ID, ENDPOINT, P256DH, AUTH_KEY, DEVICE_NAME, IS_ACTIVE
      ) VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [data.subscriptionId, data.userId || null, data.endpoint, data.p256dh, data.authKey, data.deviceName || null]
    );
  }
}

export async function getActiveHanaPushSubscriptions(userId?: string): Promise<HanaPushSubscription[]> {
  if (userId) {
    return executeHanaQuery<HanaPushSubscription>(
      'SELECT * FROM ORCH_PUSH_SUBSCRIPTION WHERE IS_ACTIVE = 1 AND (USER_ID = ? OR USER_ID IS NULL)',
      [userId]
    );
  }
  return executeHanaQuery<HanaPushSubscription>(
    'SELECT * FROM ORCH_PUSH_SUBSCRIPTION WHERE IS_ACTIVE = 1'
  );
}

export async function deactivateHanaPushSubscription(endpoint: string): Promise<void> {
  await executeHanaDml(
    'UPDATE ORCH_PUSH_SUBSCRIPTION SET IS_ACTIVE = 0 WHERE ENDPOINT = ?',
    [endpoint]
  );
}


