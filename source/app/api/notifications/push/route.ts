import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import {
  saveHanaPushSubscription,
  deactivateHanaPushSubscription,
  getActiveHanaPushSubscriptions,
} from '@/lib/hana/repository';
import { getSessionUser } from '@/lib/auth/session';
import { sanitizeHanaError } from '@/lib/hana/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Stable VAPID credentials for ResiliNet Enterprise PWA
// Public key can be safely sent to browser clients
const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  'BJ8c8Z7G5xL4vM3rN7Qp4sK1bX9yZ6aE2wF8tD3uC5vP7rQ9sT1wX4yZ7bA3cD6eF9gH2jK5mN8qR1sU4vW7xZ0=';
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || 'N3rN7Qp4sK1bX9yZ6aE2wF8tD3uC5vP7rQ9sT1wX4yY=';
const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || 'mailto:operations@astramotors.com';

try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch {
  // If invalid key format in testing, webpush setup will fallback gracefully
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptions = await getActiveHanaPushSubscriptions(user.userId);

    return NextResponse.json({
      success: true,
      publicKey: VAPID_PUBLIC_KEY,
      isSubscribed: subscriptions.length > 0,
      activeDevicesCount: subscriptions.length,
    });
  } catch (error) {
    const safe = sanitizeHanaError(error);
    return NextResponse.json({ success: false, error: safe }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.subscription || !body.subscription.endpoint) {
      return NextResponse.json(
        { success: false, error: 'Valid PushSubscription object is required' },
        { status: 400 }
      );
    }

    const { endpoint, keys } = body.subscription;
    const subscriptionId = `SUB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    await saveHanaPushSubscription({
      subscriptionId,
      userId: user.userId,
      endpoint,
      p256dh: keys?.p256dh || '',
      authKey: keys?.auth || '',
      deviceName: body.deviceName || 'Web/Mobile Client',
    });

    return NextResponse.json({
      success: true,
      message: 'Push subscription registered in SAP HANA Cloud',
    });
  } catch (error) {
    const safe = sanitizeHanaError(error);
    console.error('Push registration error:', safe);
    return NextResponse.json({ success: false, error: safe }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const endpoint = body?.endpoint;

    if (!endpoint) {
      return NextResponse.json({ success: false, error: 'endpoint is required' }, { status: 400 });
    }

    await deactivateHanaPushSubscription(endpoint);

    return NextResponse.json({
      success: true,
      message: 'Push subscription deactivated',
    });
  } catch (error) {
    const safe = sanitizeHanaError(error);
    return NextResponse.json({ success: false, error: safe }, { status: 500 });
  }
}

// Send test push notification
export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptions = await getActiveHanaPushSubscriptions(user.userId);
    if (subscriptions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No active push subscriptions found for this account' },
        { status: 404 }
      );
    }

    const payload = JSON.stringify({
      title: 'ResiliNet Crisis Alert',
      body: 'DIS-1001: Global Metals delay active. Line buffer at 2.4 days.',
      tag: 'resilinet-alert',
      data: { url: '/early-warning' },
    });

    let sentCount = 0;
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.ENDPOINT,
            keys: {
              p256dh: sub.P256DH,
              auth: sub.AUTH_KEY,
            },
          },
          payload
        );
        sentCount++;
      } catch (err: unknown) {
        const errorStatusCode = (err as { statusCode?: number })?.statusCode;
        if (errorStatusCode === 410 || errorStatusCode === 404) {
          // Subscription has expired or is no longer valid
          await deactivateHanaPushSubscription(sub.ENDPOINT).catch(() => {});
        }
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      totalSubscribed: subscriptions.length,
    });
  } catch (error) {
    const safe = sanitizeHanaError(error);
    return NextResponse.json({ success: false, error: safe }, { status: 500 });
  }
}
