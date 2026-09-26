/**
 * Enterprise Email Delivery Service for ResiliNet.
 * Powered by SAP BTP Destination Service (RESILINET_MAIL -> Gmail SMTP).
 * Supabase email is strictly NOT used.
 *
 * Secrets (passwords, tokens, client secrets) are NEVER logged or exposed.
 */

import { createSapDestinationMailTransporter } from './sap-destination';

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
  configured: boolean;
}

export interface IEmailService {
  sendVerificationEmail(options: {
    toEmail: string;
    fullName: string;
    verificationToken: string;
    verificationUrl?: string;
  }): Promise<SendEmailResult>;

  sendEarlyWarningEmail(options: {
    toEmail: string;
    recipientName: string;
    alertTitle: string;
    severity: string;
    details: string;
  }): Promise<SendEmailResult>;

  sendCrisisNotificationEmail(options: {
    toEmail: string;
    recipientName: string;
    disruptionId: string;
    strategyName: string;
    estimatedCost: string | number;
  }): Promise<SendEmailResult>;
}

function resolveAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/+$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.trim().replace(/\/+$/, '')}`;
  }
  return 'http://localhost:3000';
}

function sanitizeErrorMessage(error: unknown): string {
  if (!error) return 'Unknown error occurred during email delivery.';
  const msg = error instanceof Error ? error.message : String(error);
  // Redact any tokens, passwords, or auth headers that might appear in SMTP/HTTP errors
  return msg
    .replace(/bearer\s+[a-zA-Z0-9._-]+/gi, 'Bearer [REDACTED]')
    .replace(/(password|pass|secret)=[^&\s]+/gi, '$1=[REDACTED]');
}

export class SapBtpEmailService implements IEmailService {
  public isConfigured(): boolean {
    return Boolean(
      process.env.SAP_DESTINATION_CLIENT_ID &&
      process.env.SAP_DESTINATION_CLIENT_SECRET &&
      process.env.SAP_DESTINATION_URI
    );
  }

  /**
   * Sends an account verification email via SAP BTP Destination Service (RESILINET_MAIL).
   */
  async sendVerificationEmail(options: {
    toEmail: string;
    fullName: string;
    verificationToken: string;
    verificationUrl?: string;
  }): Promise<SendEmailResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        configured: false,
        provider: 'SAP_BTP_DESTINATION',
        error: 'SAP Destination Service credentials not configured (requires SAP_DESTINATION_CLIENT_ID, SAP_DESTINATION_CLIENT_SECRET, SAP_DESTINATION_URI).',
      };
    }

    try {
      const baseUrl = resolveAppBaseUrl();
      const verificationUrl =
        options.verificationUrl ||
        `${baseUrl}/verify-email?token=${encodeURIComponent(options.verificationToken)}`;

      const { transporter, fromAddress, destinationName } = await createSapDestinationMailTransporter();

      const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
            .card { background-color: #ffffff; max-width: 560px; margin: 0 auto; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
            .header { text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
            .brand { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }
            .tagline { font-size: 11px; font-weight: 600; color: #0284c7; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }
            .greeting { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
            .body-text { font-size: 13px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
            .btn-container { text-align: center; margin: 28px 0; }
            .btn { display: inline-block; background-color: #0f172a; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 13px; font-weight: 700; }
            .alert-box { background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px; font-size: 11px; color: #0369a1; margin-top: 24px; }
            .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
            .raw-link { word-break: break-all; font-family: monospace; font-size: 11px; color: #0284c7; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1 class="brand">ResiliNet</h1>
              <div class="tagline">Astra Motors Manufacturing • Crisis Orchestration Platform</div>
            </div>

            <div class="greeting">Dear ${escapeHtml(options.fullName)},</div>

            <div class="body-text">
              An enterprise account has been created for your corporate email on the <strong>ResiliNet Supply Chain Crisis Orchestration Platform</strong>.
              <br><br>
              In accordance with Astra Motors corporate security policies, you must verify ownership of this email address before logging in.
            </div>

            <div class="btn-container">
              <a href="${verificationUrl}" class="btn" target="_blank">Verify Corporate Email</a>
            </div>

            <div class="body-text">
              If the button does not work, copy and paste the following link into your browser:
              <br>
              <a href="${verificationUrl}" class="raw-link">${verificationUrl}</a>
            </div>

            <div class="alert-box">
              <strong>Notice:</strong> This verification link is valid for <strong>24 hours</strong> and can only be used once. If you did not request this registration, please notify IT Security.
            </div>

            <div class="footer">
              Dispatched securely via SAP BTP Destination Service (<code>${destinationName}</code>).
              <br>
              © ${new Date().getFullYear()} Astra Motors Manufacturing. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `;

      const textBody = `
ResiliNet • Astra Motors Manufacturing
Corporate Identity Verification

Dear ${options.fullName},

An enterprise account has been registered for your corporate email on the ResiliNet Platform.
To activate your access, please verify your email address by opening the following link:

${verificationUrl}

This link is valid for 24 hours.

Dispatched securely via SAP BTP Destination Service (${destinationName}).
      `.trim();

      const info = await transporter.sendMail({
        from: fromAddress,
        to: options.toEmail,
        subject: '[ResiliNet] Activate Your Corporate Enterprise Account',
        text: textBody,
        html: htmlBody,
      });

      return {
        success: true,
        configured: true,
        messageId: info.messageId,
        provider: 'SAP_BTP_DESTINATION',
      };
    } catch (error) {
      const sanitized = sanitizeErrorMessage(error);
      console.error('SAP BTP Destination email delivery failed:', sanitized);
      return {
        success: false,
        configured: true,
        provider: 'SAP_BTP_DESTINATION',
        error: sanitized,
      };
    }
  }

  /**
   * Sends an early-warning telemetry alert email.
   */
  async sendEarlyWarningEmail(options: {
    toEmail: string;
    recipientName: string;
    alertTitle: string;
    severity: string;
    details: string;
  }): Promise<SendEmailResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        configured: false,
        provider: 'SAP_BTP_DESTINATION',
        error: 'SAP Destination Service credentials not configured.',
      };
    }

    try {
      const { transporter, fromAddress } = await createSapDestinationMailTransporter();

      const info = await transporter.sendMail({
        from: fromAddress,
        to: options.toEmail,
        subject: `[ResiliNet Early Warning] ${options.severity}: ${options.alertTitle}`,
        text: `Dear ${options.recipientName},\n\nEarly Warning Alert: ${options.alertTitle}\nSeverity: ${options.severity}\n\nDetails:\n${options.details}\n\nReview live telemetry on ResiliNet Executive Dashboard.`,
      });

      return {
        success: true,
        configured: true,
        messageId: info.messageId,
        provider: 'SAP_BTP_DESTINATION',
      };
    } catch (error) {
      const sanitized = sanitizeErrorMessage(error);
      return {
        success: false,
        configured: true,
        provider: 'SAP_BTP_DESTINATION',
        error: sanitized,
      };
    }
  }

  /**
   * Sends a crisis resolution notification email.
   */
  async sendCrisisNotificationEmail(options: {
    toEmail: string;
    recipientName: string;
    disruptionId: string;
    strategyName: string;
    estimatedCost: string | number;
  }): Promise<SendEmailResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        configured: false,
        provider: 'SAP_BTP_DESTINATION',
        error: 'SAP Destination Service credentials not configured.',
      };
    }

    try {
      const { transporter, fromAddress } = await createSapDestinationMailTransporter();

      const info = await transporter.sendMail({
        from: fromAddress,
        to: options.toEmail,
        subject: `[ResiliNet Crisis Response] Disruption ${options.disruptionId} - Strategy Authorized`,
        text: `Dear ${options.recipientName},\n\nRecovery Strategy '${options.strategyName}' has been authorized for Disruption ${options.disruptionId}.\nEstimated Cost: $${Number(options.estimatedCost).toLocaleString()}\n\nTrack execution in ResiliNet Recovery Console.`,
      });

      return {
        success: true,
        configured: true,
        messageId: info.messageId,
        provider: 'SAP_BTP_DESTINATION',
      };
    } catch (error) {
      const sanitized = sanitizeErrorMessage(error);
      return {
        success: false,
        configured: true,
        provider: 'SAP_BTP_DESTINATION',
        error: sanitized,
      };
    }
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const emailService: IEmailService = new SapBtpEmailService();
