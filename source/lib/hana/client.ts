import * as hana from '@sap/hana-client';

export interface HanaConnectionOptions {
  serverNode: string;
  uid: string;
  pwd: string;
  encrypt: boolean;
  sslValidateCertificate: boolean;
  currentSchema: string;
}

/**
 * Checks whether the minimum required SAP HANA environment variables are defined.
 * Note: Must be invoked only in a server-side context.
 */
export function isHanaConfigured(): boolean {
  return Boolean(
    process.env.HANA_HOST?.trim() &&
    process.env.HANA_USER?.trim() &&
    process.env.HANA_PASSWORD?.trim()
  );
}

/**
 * Safely constructs connection options from server environment variables.
 * Credentials are kept in memory and never logged.
 */
function getHanaConnectionOptions(): HanaConnectionOptions {
  const host = process.env.HANA_HOST?.trim();
  const port = process.env.HANA_PORT?.trim() || '443';
  const user = process.env.HANA_USER?.trim();
  const password = process.env.HANA_PASSWORD?.trim();
  const schema = process.env.HANA_SCHEMA?.trim() || 'HACKFEST0145';

  if (!host || !user || !password) {
    throw new Error(
      'SAP HANA Cloud credentials are not fully configured. Please set HANA_HOST, HANA_USER, and HANA_PASSWORD.'
    );
  }

  // Normalize host: strip port if already provided in HANA_HOST
  const cleanHost = host.includes(':') ? host.split(':')[0] : host;
  const serverNode = `${cleanHost}:${port}`;

  // Default sslValidateCertificate to false so standard TLS works in Node/cloud environments without local CA store conflicts
  const sslValidateCertificate = process.env.HANA_SSL_VALIDATE_CERTIFICATE === 'true' ? true : false;

  return {
    serverNode,
    uid: user,
    pwd: password,
    encrypt: true,
    sslValidateCertificate,
    currentSchema: schema,
  };
}

/**
 * Sanitizes error messages by masking any potential credentials or sensitive connection strings.
 */
export function sanitizeHanaError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/(pwd|password)\s*=\s*[^;,\s]+/gi, '$1=***')
    .replace(/(uid|user)\s*=\s*[^;,\s]+/gi, '$1=***');
}

const HANA_OPERATION_TIMEOUT_MS = 8000;

/**
 * Reusable function to execute a query against SAP HANA Cloud with automated connection lifecycle management.
 * Automatically connects, executes, disconnects, and returns rows.
 * Enforces an 8-second timeout to prevent serverless function hangs.
 */
export async function executeHanaQuery<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<T[]> {
  const connOptions = getHanaConnectionOptions();
  const connection = hana.createConnection();

  return new Promise<T[]>((resolve, reject) => {
    let isSettled = false;
    let isDisconnected = false;

    const safeDisconnect = () => {
      if (isDisconnected) return;
      isDisconnected = true;
      try {
        connection.disconnect((discErr) => {
          if (discErr) {
            console.warn('Warning during SAP HANA connection disconnect:', sanitizeHanaError(discErr.message));
          }
        });
      } catch {
        // Ignore synchronous disconnect errors
      }
    };

    const timer = setTimeout(() => {
      if (isSettled) return;
      isSettled = true;
      safeDisconnect();
      reject(new Error(`SAP HANA query timed out after ${HANA_OPERATION_TIMEOUT_MS}ms`));
    }, HANA_OPERATION_TIMEOUT_MS);

    connection.connect(connOptions, (connectErr) => {
      if (isSettled) {
        safeDisconnect();
        return;
      }

      if (connectErr) {
        clearTimeout(timer);
        isSettled = true;
        safeDisconnect();
        const safeErr = sanitizeHanaError(connectErr.message);
        return reject(new Error(safeErr));
      }

      connection.exec(sql, params, (execErr, results) => {
        clearTimeout(timer);
        if (isSettled) {
          safeDisconnect();
          return;
        }
        isSettled = true;
        safeDisconnect();

        if (execErr) {
          const safeErr = sanitizeHanaError(execErr.message);
          return reject(new Error(safeErr));
        }

        resolve((results as T[]) || []);
      });
    });
  });
}

/**
 * Reusable function to execute a DML statement (UPDATE, INSERT, DELETE) against SAP HANA Cloud.
 * Safely manages connection lifecycle, sanitizes errors, and returns the exact count of affected rows.
 * Enforces an 8-second timeout to prevent serverless function hangs.
 */
export async function executeHanaDml(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<number> {
  const connOptions = getHanaConnectionOptions();
  const connection = hana.createConnection();

  return new Promise<number>((resolve, reject) => {
    let isSettled = false;
    let isDisconnected = false;

    const safeDisconnect = () => {
      if (isDisconnected) return;
      isDisconnected = true;
      try {
        connection.disconnect((discErr) => {
          if (discErr) {
            console.warn('Warning during SAP HANA connection disconnect:', sanitizeHanaError(discErr.message));
          }
        });
      } catch {
        // Ignore synchronous disconnect errors
      }
    };

    const timer = setTimeout(() => {
      if (isSettled) return;
      isSettled = true;
      safeDisconnect();
      reject(new Error(`SAP HANA statement timed out after ${HANA_OPERATION_TIMEOUT_MS}ms`));
    }, HANA_OPERATION_TIMEOUT_MS);

    connection.connect(connOptions, (connectErr) => {
      if (isSettled) {
        safeDisconnect();
        return;
      }

      if (connectErr) {
        clearTimeout(timer);
        isSettled = true;
        safeDisconnect();
        const safeErr = sanitizeHanaError(connectErr.message);
        return reject(new Error(safeErr));
      }

      connection.exec(sql, params, (execErr, results) => {
        clearTimeout(timer);
        if (isSettled) {
          safeDisconnect();
          return;
        }
        isSettled = true;
        safeDisconnect();

        if (execErr) {
          const safeErr = sanitizeHanaError(execErr.message);
          return reject(new Error(safeErr));
        }

        resolve(typeof results === 'number' ? results : Number(results) || 0);
      });
    });
  });
}

