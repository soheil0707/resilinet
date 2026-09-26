'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  HanaDisruption,
  HanaRecoveryStrategy,
  HanaRecoveryExecution,
  HanaAIDecision,
  HanaDisruptionContext,
  HanaNotificationCounts,
} from './repository';

export interface DashboardSummary {
  totalDisruptions: number;
  criticalDisruptions: number;
  highDisruptions: number;
  activeDisruptions: number;
  totalRecommendations: number;
  recommendedStrategy: string;
  recommendedRecoveryScore: number;
  orchestratorScore: number;
  executionsInProgress: number;
  plannedExecutions: number;
  completedExecutions: number;
  totalExecutions: number;
}

export interface DashboardData {
  summary: DashboardSummary | null;
  disruptions: HanaDisruption[];
  primaryDisruption: HanaDisruption | null;
  disruptionContext: HanaDisruptionContext | null;
  topAIDecision: HanaAIDecision | null;
  recommendations: HanaRecoveryStrategy[];
  recoveryExecutions: HanaRecoveryExecution[];
  currentExecution: HanaRecoveryExecution | null;
  notificationCounts: HanaNotificationCounts;
  source: string;
  schema: string;
}

const DEFAULT_COUNTS: HanaNotificationCounts = {
  monitorDetect: 0,
  analyzeSimulate: 0,
  decideApprove: 0,
  executeLearn: 0,
  totalUnread: 0,
};

export function useHanaDashboard() {
  const [data, setData] = useState<DashboardData>({
    summary: null,
    disruptions: [],
    primaryDisruption: null,
    disruptionContext: null,
    topAIDecision: null,
    recommendations: [],
    recoveryExecutions: [],
    currentExecution: null,
    notificationCounts: DEFAULT_COUNTS,
    source: 'sap-hana',
    schema: 'HACKFEST0145',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchDashboard = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setIsRefreshing(true);
    }
    try {
      const res = await fetch('/api/hana/dashboard', {
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!res.ok) {
        throw new Error(`HANA Dashboard responded with status ${res.status}`);
      }

      const json = await res.json();
      if (json.success && mountedRef.current) {
        setData({
          summary: json.summary || null,
          disruptions: json.disruptions || [],
          primaryDisruption: json.primaryDisruption || null,
          disruptionContext: json.disruptionContext || null,
          topAIDecision: json.topAIDecision || null,
          recommendations: json.recommendations || [],
          recoveryExecutions: json.recoveryExecutions || [],
          currentExecution: json.currentExecution || null,
          notificationCounts: json.notificationCounts || DEFAULT_COUNTS,
          source: json.source || 'sap-hana',
          schema: json.schema || 'HACKFEST0145',
        });
        setError(null);
      }
    } catch (err: unknown) {
      if (mountedRef.current) {
        const msg = err instanceof Error ? err.message : 'Failed to load HANA dashboard data';
        setError(msg);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchDashboard();

    // Sensible polling interval: 30 seconds
    const interval = setInterval(() => {
      // Pause polling if document is hidden to conserve bandwidth and prevent hammering HANA
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchDashboard(true);
      }
    }, 30000);

    // Event-driven revalidation triggers
    const handleRevalidate = () => {
      fetchDashboard(true);
    };

    window.addEventListener('resilinet:dashboard-refresh', handleRevalidate);
    window.addEventListener('focus', handleRevalidate);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
      window.removeEventListener('resilinet:dashboard-refresh', handleRevalidate);
      window.removeEventListener('focus', handleRevalidate);
    };
  }, [fetchDashboard]);

  return {
    ...data,
    isLoading,
    isRefreshing,
    error,
    refresh: () => fetchDashboard(false),
  };
}
