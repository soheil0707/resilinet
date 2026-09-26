const hana = require('@sap/hana-client');
const bcrypt = require('bcryptjs');

const host = (process.env.HANA_HOST || '').replace(/:.*/, '');
const port = process.env.HANA_PORT || 443;
const connOptions = {
  serverNode: host + ':' + port,
  uid: process.env.HANA_USER,
  pwd: process.env.HANA_PASSWORD,
  encrypt: true,
  sslValidateCertificate: false,
  currentSchema: process.env.HANA_SCHEMA || 'HACKFEST0145'
};

const conn = hana.createConnection();

function execSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    conn.exec(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

async function tableExists(tableName) {
  const rows = await execSql(
    'SELECT TABLE_NAME FROM TABLES WHERE SCHEMA_NAME = ? AND TABLE_NAME = ?',
    [connOptions.currentSchema, tableName]
  );
  return Array.isArray(rows) && rows.length > 0;
}

async function main() {
  console.log(`Connecting to SAP HANA Cloud (${connOptions.serverNode}, schema: ${connOptions.currentSchema})...`);
  await new Promise((resolve, reject) => {
    conn.connect(connOptions, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
  console.log('Connected successfully to SAP HANA Cloud.');

  // 1. USER_ACCOUNT
  const hasUserAccount = await tableExists('USER_ACCOUNT');
  if (!hasUserAccount) {
    console.log('Creating table USER_ACCOUNT...');
    await execSql(`
      CREATE TABLE USER_ACCOUNT (
        USER_ID VARCHAR(64) PRIMARY KEY,
        FULL_NAME NVARCHAR(128) NOT NULL,
        EMAIL NVARCHAR(256) NOT NULL,
        PASSWORD_HASH NVARCHAR(256) NOT NULL,
        ROLE VARCHAR(64) NOT NULL,
        PHONE_NUMBER NVARCHAR(64),
        IS_ACTIVE TINYINT DEFAULT 1,
        CREATED_AT TIMESTAMP DEFAULT CURRENT_UTCTIMESTAMP,
        UPDATED_AT TIMESTAMP DEFAULT CURRENT_UTCTIMESTAMP,
        LAST_LOGIN_AT TIMESTAMP
      )
    `);
    await execSql('CREATE UNIQUE INDEX IDX_USER_ACCOUNT_EMAIL ON USER_ACCOUNT(EMAIL)');
    console.log('USER_ACCOUNT table created.');
  } else {
    console.log('USER_ACCOUNT table already exists.');
  }

  // Seed default admin and manager users if empty
  const userCount = await execSql('SELECT COUNT(*) AS CNT FROM USER_ACCOUNT');
  const count = Number(userCount[0]?.CNT || 0);
  if (count === 0) {
    console.log('Seeding initial enterprise user accounts...');
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('ResiliNet2026!', salt);

    const initialUsers = [
      {
        id: 'USR-001',
        name: 'Rajesh Sharma',
        email: 'manager@astramotors.com',
        role: 'SUPPLY_CHAIN_MANAGER',
        phone: '+91 98201 12345'
      },
      {
        id: 'USR-002',
        name: 'Enterprise Admin',
        email: 'admin@astramotors.com',
        role: 'ADMIN',
        phone: '+91 98201 54321'
      },
      {
        id: 'USR-003',
        name: 'Aakash Verma',
        email: 'analyst@astramotors.com',
        role: 'ANALYST',
        phone: '+91 98201 67890'
      }
    ];

    for (const u of initialUsers) {
      await execSql(
        `INSERT INTO USER_ACCOUNT (USER_ID, FULL_NAME, EMAIL, PASSWORD_HASH, ROLE, PHONE_NUMBER, IS_ACTIVE)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [u.id, u.name, u.email, defaultPasswordHash, u.role, u.phone]
      );
      console.log(`Seeded user: ${u.email} (${u.role})`);
    }
  }

  // 2. ORCH_RESILIENCE_MEMORY
  const hasResilienceMemory = await tableExists('ORCH_RESILIENCE_MEMORY');
  if (!hasResilienceMemory) {
    console.log('Creating table ORCH_RESILIENCE_MEMORY...');
    await execSql(`
      CREATE TABLE ORCH_RESILIENCE_MEMORY (
        MEMORY_ID VARCHAR(64) PRIMARY KEY,
        DISRUPTION_ID VARCHAR(32),
        EXECUTION_ID VARCHAR(32),
        STRATEGY_ID VARCHAR(32),
        MEMORY_TYPE VARCHAR(64),
        TITLE NVARCHAR(256) NOT NULL,
        SUMMARY NVARCHAR(2000),
        DECISION NVARCHAR(2000),
        OUTCOME NVARCHAR(2000),
        LESSONS_LEARNED NVARCHAR(5000),
        RECOVERY_SCORE DECIMAL(5,2),
        ORCHESTRATOR_SCORE DECIMAL(5,2),
        RECOVERY_STATUS VARCHAR(64),
        CREATED_BY NVARCHAR(128),
        CREATED_AT TIMESTAMP DEFAULT CURRENT_UTCTIMESTAMP,
        UPDATED_AT TIMESTAMP DEFAULT CURRENT_UTCTIMESTAMP
      )
    `);
    console.log('ORCH_RESILIENCE_MEMORY table created.');
  } else {
    console.log('ORCH_RESILIENCE_MEMORY table already exists.');
  }

  // Seed historical memory records if empty
  const memCount = await execSql('SELECT COUNT(*) AS CNT FROM ORCH_RESILIENCE_MEMORY');
  if (Number(memCount[0]?.CNT || 0) === 0) {
    console.log('Seeding historical resilience memory records...');
    const historicalMemories = [
      {
        id: 'MEM-2025-014',
        disruptionId: 'DIS-2025-089',
        executionId: 'EXE-2025-044',
        strategyId: 'STRAT-004',
        memoryType: 'SUPPLIER_SHUTDOWN',
        title: 'Q3 Axle Assembly Supplier Delay (Bharat Forge)',
        summary: 'Raw material ingot shortage and regional transport strike in Maharashtra created 6-day projected line stoppage.',
        decision: 'Authorized dual-modal emergency shipment via air charter and scheduled road transfer.',
        outcome: 'Successfully mitigated 6-day projected line stoppage down to 1 day. Preserved Tier-1 OEM SLA obligations with 100% customer retention.',
        lessonsLearned: 'Dual-modal logistics (air + road express) reliably beats single-mode strategies when inventory buffers are below 3 days. Inter-plant STO authorization should be pre-delegated to SCM level to reduce approval latency by 4-6 hours.',
        recoveryScore: 91.0,
        orchestratorScore: 88.5,
        status: 'RESOLVED',
        createdBy: 'SCM Operations'
      },
      {
        id: 'MEM-2025-008',
        disruptionId: 'DIS-2025-041',
        executionId: 'EXE-2025-021',
        strategyId: 'STRAT-002',
        memoryType: 'LOGISTICS_BOTTLENECK',
        title: 'Chennai Port Container Clearance Congestion',
        summary: 'Customs port congestion delayed imported semiconductor control modules for EV-X production lines.',
        decision: 'Diverted maritime consignment to Ennore port with expedited bonded warehouse clearance and dedicated road convoy.',
        outcome: 'Reduced demurrage and prevented factory idling across 12 shifts.',
        lessonsLearned: 'Secondary port routing protocols must be pre-approved with customs clearance partners prior to peak maritime season.',
        recoveryScore: 88.0,
        orchestratorScore: 84.0,
        status: 'RESOLVED',
        createdBy: 'Logistics Control Tower'
      },
      {
        id: 'MEM-2024-032',
        disruptionId: 'DIS-2024-019',
        executionId: 'EXE-2024-009',
        strategyId: 'STRAT-001',
        memoryType: 'QUALITY_DEFECT',
        title: 'Braking Caliper Hydraulic Seal Defect Batch',
        summary: 'Batch defect detected in brake caliper seals (M-102) from Tier-2 supplier.',
        decision: 'Immediate quarantine of stock and automated activation of Bosch secondary line with emergency air dispatch.',
        outcome: 'Zero defective assemblies reached vehicle testing line; zero customer delivery impact.',
        lessonsLearned: 'Pre-qualified alternate vendors must be maintained in SAP AVL with up-to-date capacity confirmations for rapid emergency activation.',
        recoveryScore: 95.0,
        orchestratorScore: 92.0,
        status: 'RESOLVED',
        createdBy: 'Quality Assurance'
      }
    ];

    for (const m of historicalMemories) {
      await execSql(
        `INSERT INTO ORCH_RESILIENCE_MEMORY (
          MEMORY_ID, DISRUPTION_ID, EXECUTION_ID, STRATEGY_ID, MEMORY_TYPE,
          TITLE, SUMMARY, DECISION, OUTCOME, LESSONS_LEARNED,
          RECOVERY_SCORE, ORCHESTRATOR_SCORE, RECOVERY_STATUS, CREATED_BY
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          m.id, m.disruptionId, m.executionId, m.strategyId, m.memoryType,
          m.title, m.summary, m.decision, m.outcome, m.lessonsLearned,
          m.recoveryScore, m.orchestratorScore, m.status, m.createdBy
        ]
      );
    }
    console.log('Seeded historical resilience memory.');
  }

  // 3. ORCH_NOTIFICATION
  const hasNotification = await tableExists('ORCH_NOTIFICATION');
  if (!hasNotification) {
    console.log('Creating table ORCH_NOTIFICATION...');
    await execSql(`
      CREATE TABLE ORCH_NOTIFICATION (
        NOTIFICATION_ID VARCHAR(64) PRIMARY KEY,
        USER_ID VARCHAR(64),
        NOTIFICATION_TYPE VARCHAR(64),
        CATEGORY VARCHAR(64) NOT NULL,
        TITLE NVARCHAR(256) NOT NULL,
        MESSAGE NVARCHAR(2000),
        SEVERITY VARCHAR(32) NOT NULL,
        DISRUPTION_ID VARCHAR(32),
        EXECUTION_ID VARCHAR(32),
        IS_READ TINYINT DEFAULT 0,
        CREATED_AT TIMESTAMP DEFAULT CURRENT_UTCTIMESTAMP,
        READ_AT TIMESTAMP
      )
    `);
    console.log('ORCH_NOTIFICATION table created.');
  } else {
    console.log('ORCH_NOTIFICATION table already exists.');
  }

  // Seed initial notification state reflecting live HANA condition
  const notifCount = await execSql('SELECT COUNT(*) AS CNT FROM ORCH_NOTIFICATION');
  if (Number(notifCount[0]?.CNT || 0) === 0) {
    console.log('Seeding initial notifications based on current HANA state...');
    const initialNotifs = [
      {
        id: 'NOTIF-001',
        userId: null,
        type: 'EARLY_WARNING',
        category: 'EARLY_WARNING',
        title: 'Early Warning Trigger: S-104 Delivery Anomaly',
        message: 'Advance shipping notice cancellation detected from Global Metals Ltd. Buffer coverage dropped to 2.4 days.',
        severity: 'HIGH',
        disruptionId: 'DIS-1001',
        executionId: null,
        isRead: 0
      },
      {
        id: 'NOTIF-002',
        userId: null,
        type: 'CRISIS_ALERT',
        category: 'CRISIS',
        title: 'Critical Disruption Active: DIS-1001',
        message: 'Smelter shutdown at Global Metals Jamshedpur halts M-101 Steering Assemblies. 17 production orders at risk.',
        severity: 'CRITICAL',
        disruptionId: 'DIS-1001',
        executionId: null,
        isRead: 0
      },
      {
        id: 'NOTIF-003',
        userId: null,
        type: 'DECISION_READY',
        category: 'DECISION',
        title: 'AI Recovery Strategy Formulated: STR-001',
        message: 'Multi-Modal Transfer + Priority Air dispatch evaluated with Recovery Score 94.0 and Orchestrator Score 82.3.',
        severity: 'INFO',
        disruptionId: 'DIS-1001',
        executionId: null,
        isRead: 0
      },
      {
        id: 'NOTIF-004',
        userId: null,
        type: 'APPROVAL_REQUIRED',
        category: 'APPROVAL',
        title: 'Executive Sign-Off Pending: STR-001',
        message: 'Inter-plant STO and air charter freight allocation requires authorized SCM approval.',
        severity: 'HIGH',
        disruptionId: 'DIS-1001',
        executionId: null,
        isRead: 0
      },
      {
        id: 'NOTIF-005',
        userId: null,
        type: 'EXECUTION_IN_PROGRESS',
        category: 'EXECUTION',
        title: 'Recovery Execution Live: EXE-1001',
        message: 'Recovery pipeline EXE-1001 is IN_PROGRESS on SAP HANA Cloud. Air freight buffer leg active.',
        severity: 'INFO',
        disruptionId: 'DIS-1001',
        executionId: 'EXE-1001',
        isRead: 0
      }
    ];

    for (const n of initialNotifs) {
      await execSql(
        `INSERT INTO ORCH_NOTIFICATION (
          NOTIFICATION_ID, USER_ID, NOTIFICATION_TYPE, CATEGORY, TITLE, MESSAGE,
          SEVERITY, DISRUPTION_ID, EXECUTION_ID, IS_READ
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [n.id, n.userId, n.type, n.category, n.title, n.message, n.severity, n.disruptionId, n.executionId, n.isRead]
      );
    }
    console.log('Seeded initial notifications.');
  }

  // 4. ORCH_PUSH_SUBSCRIPTION
  const hasPush = await tableExists('ORCH_PUSH_SUBSCRIPTION');
  if (!hasPush) {
    console.log('Creating table ORCH_PUSH_SUBSCRIPTION...');
    await execSql(`
      CREATE TABLE ORCH_PUSH_SUBSCRIPTION (
        SUBSCRIPTION_ID VARCHAR(64) PRIMARY KEY,
        USER_ID VARCHAR(64),
        ENDPOINT NVARCHAR(2000) NOT NULL,
        P256DH NVARCHAR(500) NOT NULL,
        AUTH_KEY NVARCHAR(500) NOT NULL,
        DEVICE_NAME NVARCHAR(256),
        CREATED_AT TIMESTAMP DEFAULT CURRENT_UTCTIMESTAMP,
        LAST_USED_AT TIMESTAMP,
        IS_ACTIVE TINYINT DEFAULT 1
      )
    `);
    console.log('ORCH_PUSH_SUBSCRIPTION table created.');
  } else {
    console.log('ORCH_PUSH_SUBSCRIPTION table already exists.');
  }

  console.log('All SAP HANA Cloud schemas and tables successfully verified!');
  conn.disconnect();
}

main().catch((err) => {
  console.error('Fatal error during HANA initialization:', err);
  if (conn) conn.disconnect();
  process.exit(1);
});
