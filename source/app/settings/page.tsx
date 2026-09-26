'use client';

import React, { useState, useEffect } from 'react';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import {
  Settings,
  Server,
  Key,
  Database,
  Shield,
  Bell,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Send,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [testPushLoading, setTestPushLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true);
      // Check current push subscription status from backend
      fetch('/api/notifications/push')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.isSubscribed) {
            setPushSubscribed(true);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleTogglePush = async () => {
    setErrorMessage(null);
    setFeedbackMessage(null);
    setPushLoading(true);

    try {
      if (!pushSubscribed) {
        // Request browser permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setErrorMessage('Push notification permission was declined. In-app HANA notifications remain active.');
          setPushLoading(false);
          return;
        }

        // Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        // Get VAPID public key from backend
        const keyRes = await fetch('/api/notifications/push');
        const keyData = await keyRes.json();
        if (!keyData.publicKey) {
          throw new Error('Could not retrieve VAPID public key');
        }

        // Convert base64 VAPID key to Uint8Array
        const convertedVapidKey = urlBase64ToUint8Array(keyData.publicKey);

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });

        // Save subscription in HANA ORCH_PUSH_SUBSCRIPTION
        const saveRes = await fetch('/api/notifications/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription,
            deviceName: navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Workstation',
          }),
        });

        if (saveRes.ok) {
          setPushSubscribed(true);
          setFeedbackMessage('Web Push notifications enabled and registered in SAP HANA Cloud (ORCH_PUSH_SUBSCRIPTION).');
        } else {
          throw new Error('Failed to register subscription in SAP HANA Cloud');
        }
      } else {
        // Unsubscribe
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await fetch('/api/notifications/push', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          });
        }
        setPushSubscribed(false);
        setFeedbackMessage('Push notifications disabled.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error configuring push notifications';
      setErrorMessage(msg);
    } finally {
      setPushLoading(false);
    }
  };

  const handleTestPush = async () => {
    setTestPushLoading(true);
    setErrorMessage(null);
    setFeedbackMessage(null);
    try {
      const res = await fetch('/api/notifications/push', { method: 'PUT' });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackMessage(`Test push notification dispatched to ${data.sentCount} active registered device(s)!`);
      } else {
        setErrorMessage(data.error || 'Failed to dispatch test push');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Test push failed');
    } finally {
      setTestPushLoading(false);
    }
  };

  return (
    <EnterpriseShell>
      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-slate-100 text-slate-700 border border-slate-200">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">System Settings & Data Architecture</h2>
            <p className="text-xs text-slate-500">
              SAP HANA Cloud Single Source of Truth, Web Push mobile notifications, and AI credentials
            </p>
          </div>
        </div>

        {feedbackMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          {/* SAP HANA Cloud Status */}
          <div className="p-4 rounded-lg border border-sky-200 bg-sky-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Database className="w-4 h-4 text-sky-600" />
                <span>SAP HANA Cloud (Single Source of Truth)</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-emerald-50 text-emerald-800 border-emerald-200 font-mono">
                AUTHORITATIVE ACTIVE
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Schema: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">HACKFEST0145</code>. All user accounts, operational disruptions, recovery executions, resilience memory, notifications, and push subscriptions are stored exclusively in SAP HANA Cloud.
            </p>
            <div className="pt-2 border-t border-sky-200/60 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px] text-slate-700">
              <div>• USER_ACCOUNT</div>
              <div>• ORCH_DISRUPTION</div>
              <div>• ORCH_RECOVERY_EXECUTION</div>
              <div>• ORCH_RESILIENCE_MEMORY</div>
              <div>• ORCH_NOTIFICATION</div>
              <div>• ORCH_PUSH_SUBSCRIPTION</div>
              <div>• V_ORCH_STRATEGY_RANKING</div>
              <div>• V_ORCH_RECOMMENDATIONS</div>
            </div>
          </div>

          {/* Web Push / Mobile Notifications */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Smartphone className="w-4 h-4 text-sky-600" />
                <span>Mobile & Web Push Notifications</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  pushSubscribed
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {pushSubscribed ? 'ACTIVE ON THIS DEVICE' : 'DISABLED'}
              </span>
            </div>

            <p className="text-slate-500 leading-relaxed">
              Delivers instant mobile/browser alerts for Early Crisis Alerts, Critical Disruptions, Approval Requests, and Recovery Completions. Subscriptions are stored in SAP HANA table <code className="font-mono bg-slate-200/60 px-1 py-0.5 rounded">ORCH_PUSH_SUBSCRIPTION</code>.
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              <Button
                size="sm"
                onClick={handleTogglePush}
                disabled={pushLoading || !pushSupported}
                variant={pushSubscribed ? 'outline' : 'primary'}
                className="text-xs"
              >
                {pushLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <Bell className="w-3.5 h-3.5 mr-1.5" />
                )}
                {pushSubscribed ? 'Disable Push on Device' : 'Enable Mobile Push Alerts'}
              </Button>

              {pushSubscribed && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTestPush}
                  disabled={testPushLoading}
                  className="text-xs border-slate-300 text-slate-700"
                >
                  {testPushLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Send className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
                  )}
                  Send Test Alert
                </Button>
              )}
            </div>

            {!pushSupported && (
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                Notice: Browser push notifications are not supported by this browser environment. The application will gracefully fall back to in-app SAP HANA notifications.
              </p>
            )}
          </div>

          {/* Gemini AI Settings */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Key className="w-4 h-4 text-sky-600" />
                <span>Gemini API Multi-Agent Engine</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                GEMINI 2.5 FLASH ACTIVE
              </span>
            </div>
            <p className="text-slate-500">
              Powers AI Command Center multi-agent reasoning, narrative generation, and strategy explainability.
            </p>
          </div>

          {/* Governance Notice */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Governance & Controlled Write-Back Principle</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              ResiliNet strictly enforces the controlled state boundary: <strong>AI recommends. Human approves. Operations execute.</strong> Controlled execution write-back requires verified SCM authentication with optimistic locking against SAP HANA Cloud.
            </p>
          </div>
        </div>
      </div>
    </EnterpriseShell>
  );
}

// Helper to convert base64 VAPID string
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
