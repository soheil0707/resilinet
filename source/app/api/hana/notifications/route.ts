import { NextRequest, NextResponse } from 'next/server';
import {
  getHanaNotifications,
  getHanaNotificationCounts,
  markHanaNotificationRead,
  markAllHanaNotificationsRead,
  createHanaNotification,
} from '@/lib/hana/repository';
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
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const [notifications, counts] = await Promise.all([
      getHanaNotifications({ userId: user.userId, unreadOnly, limit }),
      getHanaNotificationCounts(user.userId),
    ]);

    return NextResponse.json({
      success: true,
      source: 'sap-hana',
      counts,
      data: notifications,
    });
  } catch (error) {
    const safeError = sanitizeHanaError(error);
    console.error('SAP HANA notifications GET error:', safeError);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve notifications from SAP HANA Cloud', message: safeError },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Session required' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const { notificationId, markAll } = body || {};

    if (markAll) {
      const updatedCount = await markAllHanaNotificationsRead(user.userId);
      const counts = await getHanaNotificationCounts(user.userId);
      return NextResponse.json({
        success: true,
        updatedCount,
        counts,
      });
    }

    if (!notificationId || typeof notificationId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'notificationId is required' },
        { status: 400 }
      );
    }

    const success = await markHanaNotificationRead(notificationId);
    const counts = await getHanaNotificationCounts(user.userId);

    return NextResponse.json({
      success,
      notificationId,
      counts,
    });
  } catch (error) {
    const safeError = sanitizeHanaError(error);
    console.error('SAP HANA notifications PATCH error:', safeError);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification in SAP HANA Cloud', message: safeError },
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
    if (!body || !body.title || !body.category) {
      return NextResponse.json(
        { success: false, error: 'title and category are required' },
        { status: 400 }
      );
    }

    const notificationId = body.notificationId || `NOTIF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const created = await createHanaNotification({
      notificationId,
      userId: body.userId || null,
      notificationType: body.notificationType || body.category,
      category: body.category,
      title: body.title,
      message: body.message,
      severity: body.severity || 'INFO',
      disruptionId: body.disruptionId,
      executionId: body.executionId,
    });

    const counts = await getHanaNotificationCounts(user.userId);

    return NextResponse.json({
      success: true,
      source: 'sap-hana',
      data: created,
      counts,
    });
  } catch (error) {
    const safeError = sanitizeHanaError(error);
    console.error('SAP HANA notifications POST error:', safeError);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification in SAP HANA Cloud', message: safeError },
      { status: 500 }
    );
  }
}
