import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/**
 * Server-only SAP BTP Destination Service client for ResiliNet.
 * Retrieves the MAIL destination (RESILINET_MAIL) via SAP Destination Service REST API
 * using OAuth2 client-credentials flow, and builds a nodemailer SMTP transport.
 *
 * Secrets (passwords, tokens, client secrets) are NEVER logged or exposed.
 */

export interface SapMailDestinationConfig {
  name: string;
  type: string;
  proxyType: string;
  authentication: string;
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  starttlsRequired: boolean;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

interface CachedDestination {
  config: SapMailDestinationConfig;
  expiresAt: number;
}

// In-memory short-lived caches (ephemeral, never stored in DB)
let tokenCache: CachedToken | null = null;
let destinationCache: CachedDestination | null = null;

const TOKEN_EXPIRY_BUFFER_MS = 60 * 1000; // 60 seconds safety buffer
const DESTINATION_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

/**
 * Resolves the OAuth token endpoint URL for the Destination Service.
 * Supports SAP_DESTINATION_TOKEN_URL, SAP_DESTINATION_URL, or SAP_XSUAA_URL.
 */
function getOAuthTokenUrl(): string | null {
  if (process.env.SAP_DESTINATION_TOKEN_URL) {
    return process.env.SAP_DESTINATION_TOKEN_URL.trim();
  }
  const baseUrl = process.env.SAP_DESTINATION_URL || process.env.SAP_XSUAA_URL;
  if (baseUrl) {
    const trimmed = baseUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/oauth/token') ? trimmed : `${trimmed}/oauth/token`;
  }
  return null;
}

/**
 * Retrieves an OAuth access token from SAP BTP XSUAA / OAuth service
 * using client-credentials grant.
 */
export async function getSapDestinationOAuthToken(): Promise<string> {
  // Check in-memory cache
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const clientId = process.env.SAP_DESTINATION_CLIENT_ID?.trim();
  const clientSecret = process.env.SAP_DESTINATION_CLIENT_SECRET?.trim();
  const tokenUrl = getOAuthTokenUrl();

  if (!clientId || !clientSecret) {
    throw new Error('SAP Destination Service client credentials not configured (SAP_DESTINATION_CLIENT_ID / SAP_DESTINATION_CLIENT_SECRET).');
  }

  if (!tokenUrl) {
    throw new Error('SAP Destination Service token URL not configured (SAP_DESTINATION_TOKEN_URL or SAP_DESTINATION_URL).');
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
      Accept: 'application/json',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const status = response.status;
    const errorText = await response.text().catch(() => '');
    throw new Error(`Failed to obtain SAP Destination OAuth token (HTTP ${status}): ${errorText.substring(0, 120)}`);
  }

  const data = await response.json().catch(() => null);
  if (!data || !data.access_token) {
    throw new Error('SAP OAuth endpoint returned an invalid response missing access_token.');
  }

  const expiresInSec = typeof data.expires_in === 'number' ? data.expires_in : 3600;
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + expiresInSec * 1000 - TOKEN_EXPIRY_BUFFER_MS,
  };

  return data.access_token;
}

/**
 * Calls SAP Destination Service REST API to retrieve destination configuration.
 */
export async function getSapMailDestination(destinationName?: string): Promise<SapMailDestinationConfig> {
  const targetName = destinationName || process.env.SAP_DESTINATION_NAME || 'RESILINET_MAIL';

  // Check in-memory destination cache
  if (destinationCache && destinationCache.config.name === targetName && Date.now() < destinationCache.expiresAt) {
    return destinationCache.config;
  }

  const destinationUri = process.env.SAP_DESTINATION_URI?.trim();
  if (!destinationUri) {
    throw new Error('SAP_DESTINATION_URI is not configured.');
  }

  const accessToken = await getSapDestinationOAuthToken();

  const baseUri = destinationUri.replace(/\/+$/, '');
  const url = `${baseUri}/destination-configuration/v1/destinations/${encodeURIComponent(targetName)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const status = response.status;
    const errorText = await response.text().catch(() => '');
    throw new Error(`Failed to retrieve destination '${targetName}' from SAP Destination Service (HTTP ${status}): ${errorText.substring(0, 120)}`);
  }

  const payload = await response.json().catch(() => null);
  const config = payload?.destinationConfiguration;

  if (!config) {
    throw new Error(`Destination '${targetName}' not found or missing destinationConfiguration.`);
  }

  // Validate destination properties
  const type = String(config.Type || config.type || '').toUpperCase();
  if (type !== 'MAIL') {
    throw new Error(`Invalid destination Type '${type}' for '${targetName}'. Expected 'MAIL'.`);
  }

  const proxyType = String(config.ProxyType || config.proxyType || 'Internet');
  const authentication = String(config.Authentication || config.authentication || 'BasicAuthentication');

  // Extract SMTP configuration properties with standard SAP fallbacks
  const host = config['mail.smtp.host'] || config['mail.host'] || config.Host || config.host;
  const port = Number(config['mail.smtp.port'] || config['mail.port'] || config.Port || 587);
  const user = config['mail.user'] || config.User || config.user || config['mail.smtp.user'] || '';
  const password = config['mail.password'] || config.Password || config.password || config['mail.smtp.password'] || '';
  const from = config['mail.smtp.from'] || config['mail.from'] || config.From || user;
  const starttlsRequired =
    config['mail.smtp.starttls.required'] === 'true' ||
    config['mail.smtp.starttls.enable'] === 'true' ||
    port === 587;

  if (!host) {
    throw new Error(`Destination '${targetName}' is missing mail.smtp.host property.`);
  }

  if (!user || !password) {
    throw new Error(`Destination '${targetName}' is missing mail.user or mail.password credentials.`);
  }

  const mailConfig: SapMailDestinationConfig = {
    name: targetName,
    type,
    proxyType,
    authentication,
    host,
    port,
    user,
    password,
    from,
    starttlsRequired,
  };

  destinationCache = {
    config: mailConfig,
    expiresAt: Date.now() + DESTINATION_CACHE_TTL_MS,
  };

  return mailConfig;
}

/**
 * Creates a nodemailer Transporter using SMTP settings dynamically fetched
 * from the SAP BTP Destination Service.
 */
export async function createSapDestinationMailTransporter(): Promise<{
  transporter: Transporter;
  fromAddress: string;
  destinationName: string;
}> {
  const mailConfig = await getSapMailDestination();

  const transporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.port === 465, // true for 465, false for 587
    auth: {
      user: mailConfig.user,
      pass: mailConfig.password,
    },
    requireTLS: mailConfig.starttlsRequired,
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: true,
    },
  });

  return {
    transporter,
    fromAddress: mailConfig.from || `"ResiliNet Orchestrator" <${mailConfig.user}>`,
    destinationName: mailConfig.name,
  };
}

/**
 * Safe test/verification helper that validates the SAP Destination configuration
 * and verifies SMTP transport connection without dispatching any real emails.
 * Never exposes credentials.
 */
export async function verifySapDestinationConfiguration(): Promise<{
  success: boolean;
  destinationName: string;
  host?: string;
  port?: number;
  from?: string;
  stage: string;
  error?: string;
}> {
  try {
    // 1. Fetch OAuth token
    await getSapDestinationOAuthToken();

    // 2. Fetch destination
    const mailConfig = await getSapMailDestination();

    // 3. Create transport and verify connectivity
    const { transporter } = await createSapDestinationMailTransporter();
    await transporter.verify();

    return {
      success: true,
      stage: 'VERIFIED',
      destinationName: mailConfig.name,
      host: mailConfig.host,
      port: mailConfig.port,
      from: mailConfig.from,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown SAP Destination error';
    // Sanitize any potential sensitive details
    return {
      success: false,
      stage: 'FAILED',
      destinationName: process.env.SAP_DESTINATION_NAME || 'RESILINET_MAIL',
      error: message.replace(/bearer\s+[a-zA-Z0-9._-]+/gi, 'Bearer [REDACTED]'),
    };
  }
}
