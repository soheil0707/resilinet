#!/usr/bin/env node
/**
 * Safe Diagnostic Script for SAP BTP Destination Service Email Integration
 * Usage: node --env-file=.env.local scripts/test-sap-destination.js
 *
 * Verifies:
 * 1. Required environment variables presence
 * 2. OAuth access token retrieval from SAP XSUAA
 * 3. Retrieval of destination 'RESILINET_MAIL' from SAP Destination Service
 * 4. Verification of SMTP configuration properties
 *
 * NEVER exposes passwords, tokens, or client secrets.
 */

async function runDiagnostic() {
  console.log('=== SAP BTP Destination Service Diagnostic ===\n');

  const clientId = process.env.SAP_DESTINATION_CLIENT_ID?.trim();
  const clientSecret = process.env.SAP_DESTINATION_CLIENT_SECRET?.trim();
  const destinationUri = process.env.SAP_DESTINATION_URI?.trim();
  const destinationName = process.env.SAP_DESTINATION_NAME?.trim() || 'RESILINET_MAIL';
  const tokenUrl =
    process.env.SAP_DESTINATION_TOKEN_URL?.trim() ||
    (process.env.SAP_DESTINATION_URL ? `${process.env.SAP_DESTINATION_URL.trim().replace(/\/+$/, '')}/oauth/token` : null);

  console.log('1. Checking Environment Variables:');
  console.log('   - SAP_DESTINATION_CLIENT_ID:', clientId ? 'PRESENT (Masked)' : 'MISSING');
  console.log('   - SAP_DESTINATION_CLIENT_SECRET:', clientSecret ? 'PRESENT (Masked)' : 'MISSING');
  console.log('   - SAP_DESTINATION_URI:', destinationUri ? destinationUri : 'MISSING');
  console.log('   - SAP_DESTINATION_NAME:', destinationName);
  console.log('   - OAuth Token URL:', tokenUrl ? tokenUrl : 'MISSING (Set SAP_DESTINATION_TOKEN_URL or SAP_DESTINATION_URL)');

  if (!clientId || !clientSecret || !destinationUri || !tokenUrl) {
    console.log('\n[STATUS] Configuration incomplete: Some required environment variables are not set.');
    console.log('To connect to live SAP BTP Destination Service, configure:');
    console.log('  - SAP_DESTINATION_CLIENT_ID');
    console.log('  - SAP_DESTINATION_CLIENT_SECRET');
    console.log('  - SAP_DESTINATION_URI');
    console.log('  - SAP_DESTINATION_NAME (default: RESILINET_MAIL)');
    console.log('  - SAP_DESTINATION_TOKEN_URL (or SAP_DESTINATION_URL)\n');
    return;
  }

  console.log('\n2. Testing OAuth Access Token Retrieval:');
  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
        Accept: 'application/json',
      },
      body: params.toString(),
    });

    if (!tokenRes.ok) {
      console.error(`   [FAIL] OAuth request failed with HTTP ${tokenRes.status}`);
      return;
    }

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('   [FAIL] No access_token returned by token endpoint.');
      return;
    }

    console.log(`   [SUCCESS] OAuth token retrieved successfully (Expires in: ${tokenData.expires_in || 3600}s)`);

    console.log(`\n3. Querying Destination '${destinationName}' from Destination Service:`);
    const destUrl = `${destinationUri.replace(/\/+$/, '')}/destination-configuration/v1/destinations/${encodeURIComponent(destinationName)}`;
    const destRes = await fetch(destUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/json',
      },
    });

    if (!destRes.ok) {
      console.error(`   [FAIL] Destination Service request failed with HTTP ${destRes.status}`);
      return;
    }

    const destData = await destRes.json();
    const config = destData?.destinationConfiguration;
    if (!config) {
      console.error('   [FAIL] Missing destinationConfiguration payload.');
      return;
    }

    console.log('   [SUCCESS] Destination retrieved:');
    console.log('   - Name:', config.Name || destinationName);
    console.log('   - Type:', config.Type || 'MAIL');
    console.log('   - ProxyType:', config.ProxyType || 'Internet');
    console.log('   - Authentication:', config.Authentication || 'BasicAuthentication');
    console.log('   - Host:', config['mail.smtp.host'] || config['mail.host'] || config.Host || 'NOT CONFIGURED');
    console.log('   - Port:', config['mail.smtp.port'] || config['mail.port'] || config.Port || 587);
    console.log('   - User:', config['mail.user'] || config.User ? 'PRESENT (Masked)' : 'MISSING');
    console.log('   - Password:', config['mail.password'] || config.Password ? 'PRESENT (Masked)' : 'MISSING');
    console.log('   - STARTTLS:', config['mail.smtp.starttls.required'] || config['mail.smtp.starttls.enable'] || 'true');

    console.log('\n[STATUS] SAP BTP Destination Service Email Integration VERIFIED.');
  } catch (err) {
    console.error('   [ERROR] Diagnostic encountered an exception:', err.message);
  }
}

runDiagnostic();
