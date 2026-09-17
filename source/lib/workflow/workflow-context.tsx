'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { RecoveryStrategy } from '../supabase/types';

// ─── Workflow State Types ──────────────────────────────────────────────────────

export type WorkflowState =
  | 'DETECTED'
  | 'CRISIS_ACTIVE'
  | 'AGENTS_ANALYZING'
  | 'AGENTS_COMPLETE'
  | 'STRATEGY_SELECTED'
  | 'APPROVED'
  | 'EXECUTING'
  | 'RECOVERED';

export type ExecutionStepStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ExecutionStep {
  id: string;
  module: string; // e.g. 'SAP MM', 'SAP EWM', 'SAP TM', 'SAP PP', 'SAP SD'
  action: string;
  reference: string;
  status: ExecutionStepStatus;
  completedAt?: string;
}

export interface ResilienceRecord {
  id: string;
  disruption_id: string;
  crisis_title: string;
  supplier: string;
  material: string;
  plant: string;
  ai_recommended_strategy: string;
  human_selected_strategy: string;
  is_override: boolean;
  cost_inr: number;
  recovery_time_days: number;
  revenue_protected_inr: number;
  risk_level: string;
  outcome: string;
  completed_at: string;
}

export function getExecutionStepsForStrategy(strategy?: RecoveryStrategy | null): ExecutionStep[] {
  const stratId = strategy?.id || 'STRAT-004';

  switch (stratId) {
    case 'STRAT-003': // EXPEDITED AIR LOGISTICS (7 steps)
      return [
        {
          id: 'STEP-01',
          module: 'SAP TM',
          action: '1. Confirm emergency air shipment',
          reference: 'FO-9033-AIR',
          status: 'PENDING',
        },
        {
          id: 'STEP-02',
          module: 'SAP MM',
          action: '2. Allocate shipment quantity',
          reference: 'PO-45009822',
          status: 'PENDING',
        },
        {
          id: 'STEP-03',
          module: 'SAP TM',
          action: '3. Dispatch material',
          reference: 'FO-9033-DSP',
          status: 'PENDING',
        },
        {
          id: 'STEP-04',
          module: 'SAP TM',
          action: '4. Track expedited shipment',
          reference: 'TRK-881023',
          status: 'PENDING',
        },
        {
          id: 'STEP-05',
          module: 'SAP EWM',
          action: '5. Receive critical material',
          reference: 'MIGO-AIR-102',
          status: 'PENDING',
        },
        {
          id: 'STEP-06',
          module: 'SAP PP',
          action: '6. Resume affected production',
          reference: 'CO02-AIR-7711',
          status: 'PENDING',
        },
        {
          id: 'STEP-07',
          module: 'SAP SD',
          action: '7. Complete recovery',
          reference: 'REC-FINISH-003',
          status: 'PENDING',
        },
      ];

    case 'STRAT-002': // INVENTORY TRANSFER (6 steps)
      return [
        {
          id: 'STEP-01',
          module: 'SAP EWM',
          action: '1. Identify available inventory',
          reference: 'INV-CHN-002',
          status: 'PENDING',
        },
        {
          id: 'STEP-02',
          module: 'SAP MM',
          action: '2. Reserve inventory',
          reference: 'STO-992104',
          status: 'PENDING',
        },
        {
          id: 'STEP-03',
          module: 'SAP TM',
          action: '3. Transfer stock to affected plant',
          reference: 'FO-9045-ROAD',
          status: 'PENDING',
        },
        {
          id: 'STEP-04',
          module: 'SAP EWM',
          action: '4. Confirm receipt',
          reference: 'MIGO-STO-881',
          status: 'PENDING',
        },
        {
          id: 'STEP-05',
          module: 'SAP PP',
          action: '5. Resume production',
          reference: 'CO02-STO-7712',
          status: 'PENDING',
        },
        {
          id: 'STEP-06',
          module: 'SAP SD',
          action: '6. Complete recovery',
          reference: 'REC-FINISH-002',
          status: 'PENDING',
        },
      ];

    case 'STRAT-001': // ALTERNATE SUPPLIER (8 steps)
      return [
        {
          id: 'STEP-01',
          module: 'SAP MM',
          action: '1. Identify alternate supplier',
          reference: 'AVL-PUR-101',
          status: 'PENDING',
        },
        {
          id: 'STEP-02',
          module: 'SAP QM',
          action: '2. Validate supplier availability',
          reference: 'QA-440291',
          status: 'PENDING',
        },
        {
          id: 'STEP-03',
          module: 'SAP MM',
          action: '3. Create sourcing request',
          reference: 'PO-45009101',
          status: 'PENDING',
        },
        {
          id: 'STEP-04',
          module: 'SAP MM',
          action: '4. Confirm material allocation',
          reference: 'ALLOC-PUN-01',
          status: 'PENDING',
        },
        {
          id: 'STEP-05',
          module: 'SAP TM',
          action: '5. Arrange transportation',
          reference: 'FO-9060-AVL',
          status: 'PENDING',
        },
        {
          id: 'STEP-06',
          module: 'SAP EWM',
          action: '6. Receive material',
          reference: 'MIGO-AVL-101',
          status: 'PENDING',
        },
        {
          id: 'STEP-07',
          module: 'SAP PP',
          action: '7. Resume production',
          reference: 'CO02-AVL-7713',
          status: 'PENDING',
        },
        {
          id: 'STEP-08',
          module: 'SAP SD',
          action: '8. Complete recovery',
          reference: 'REC-FINISH-001',
          status: 'PENDING',
        },
      ];

    case 'STRAT-004': // COMBINED RECOVERY (6 steps)
    default:
      return [
        {
          id: 'STEP-01',
          module: 'SAP MM',
          action: '1. Activate alternate supplier',
          reference: 'PR-45009101',
          status: 'PENDING',
        },
        {
          id: 'STEP-02',
          module: 'SAP EWM',
          action: '2. Reallocate available inventory',
          reference: 'STO-881203',
          status: 'PENDING',
        },
        {
          id: 'STEP-03',
          module: 'SAP TM',
          action: '3. Expedite critical logistics',
          reference: 'FO-9021-AIR',
          status: 'PENDING',
        },
        {
          id: 'STEP-04',
          module: 'SAP PP',
          action: '4. Re-sequence production',
          reference: 'CO02-HYD-7710',
          status: 'PENDING',
        },
        {
          id: 'STEP-05',
          module: 'SAP SD',
          action: '5. Confirm customer impact mitigation',
          reference: 'VA02-ALLOC-221',
          status: 'PENDING',
        },
        {
          id: 'STEP-06',
          module: 'SAP EWM',
          action: '6. Complete recovery',
          reference: 'REC-FINISH-004',
          status: 'PENDING',
        },
      ];
  }
}

export interface WorkflowContextValue {
  workflowState: WorkflowState;
  selectedStrategy: RecoveryStrategy | null;
  approvedStrategy: RecoveryStrategy | null;
  isOverride: boolean;
  executionSteps: ExecutionStep[];
  resilienceRecords: ResilienceRecord[];
  setWorkflowState: (state: WorkflowState) => void;
  setSelectedStrategy: (strategy: RecoveryStrategy | null, isOverride?: boolean) => void;
  setApprovedStrategy: (strategy: RecoveryStrategy | null, isOverride?: boolean) => void;
  setIsOverride: (isOverride: boolean) => void;
  completeExecution: (steps: ExecutionStep[]) => void;
  resetCrisisWorkflow: () => void;
}

const STORAGE_KEY = 'resilinet_workflow_state';

const DEFAULT_WORKFLOW_CONTEXT: WorkflowContextValue = {
  workflowState: 'DETECTED',
  selectedStrategy: null,
  approvedStrategy: null,
  isOverride: false,
  executionSteps: getExecutionStepsForStrategy(null),
  resilienceRecords: [],
  setWorkflowState: () => {},
  setSelectedStrategy: () => {},
  setApprovedStrategy: () => {},
  setIsOverride: () => {},
  completeExecution: () => {},
  resetCrisisWorkflow: () => {},
};

// ─── Context ──────────────────────────────────────────────────────────────────

const WorkflowContext = createContext<WorkflowContextValue>(DEFAULT_WORKFLOW_CONTEXT);

interface PersistedState {
  workflowState: WorkflowState;
  selectedStrategy: RecoveryStrategy | null;
  approvedStrategy: RecoveryStrategy | null;
  isOverride: boolean;
  executionSteps: ExecutionStep[];
  resilienceRecords: ResilienceRecord[];
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [workflowState, setWorkflowStateInternal] = useState<WorkflowState>('DETECTED');
  const [selectedStrategy, setSelectedStrategyInternal] = useState<RecoveryStrategy | null>(null);
  const [approvedStrategy, setApprovedStrategyInternal] = useState<RecoveryStrategy | null>(null);
  const [isOverride, setIsOverrideInternal] = useState<boolean>(false);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>(getExecutionStepsForStrategy(null));
  const [resilienceRecords, setResilienceRecords] = useState<ResilienceRecord[]>([]);

  // Mutable ref for current values to keep all updater callbacks referentially stable
  const stateRef = React.useRef({
    workflowState,
    selectedStrategy,
    approvedStrategy,
    isOverride,
    executionSteps,
    resilienceRecords,
  });

  useEffect(() => {
    stateRef.current = {
      workflowState,
      selectedStrategy,
      approvedStrategy,
      isOverride,
      executionSteps,
      resilienceRecords,
    };
  }, [workflowState, selectedStrategy, approvedStrategy, isOverride, executionSteps, resilienceRecords]);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: PersistedState = JSON.parse(raw);
        setWorkflowStateInternal(parsed.workflowState || 'DETECTED');
        setSelectedStrategyInternal(parsed.selectedStrategy || null);
        setApprovedStrategyInternal(parsed.approvedStrategy || null);
        setIsOverrideInternal(parsed.isOverride ?? false);
        setResilienceRecords(parsed.resilienceRecords || []);
        const activeStrat = parsed.approvedStrategy || parsed.selectedStrategy;
        setExecutionSteps(
          parsed.executionSteps && parsed.executionSteps.length > 0
            ? parsed.executionSteps
            : getExecutionStepsForStrategy(activeStrat)
        );
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const persist = useCallback(
    (
      state: WorkflowState,
      selected: RecoveryStrategy | null,
      approved: RecoveryStrategy | null,
      override: boolean,
      steps: ExecutionStep[],
      records: ResilienceRecord[]
    ) => {
      try {
        const toSave: PersistedState = {
          workflowState: state,
          selectedStrategy: selected,
          approvedStrategy: approved,
          isOverride: override,
          executionSteps: steps,
          resilienceRecords: records,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch {
        // ignore storage errors
      }
    },
    []
  );

  const setWorkflowState = useCallback(
    (state: WorkflowState) => {
      setWorkflowStateInternal(state);
      const current = stateRef.current;
      persist(state, current.selectedStrategy, current.approvedStrategy, current.isOverride, current.executionSteps, current.resilienceRecords);
    },
    [persist]
  );

  const setSelectedStrategy = useCallback(
    (strategy: RecoveryStrategy | null, overrideParam?: boolean) => {
      setSelectedStrategyInternal(strategy);
      setApprovedStrategyInternal(strategy);
      const overrideVal = overrideParam !== undefined ? overrideParam : (strategy ? strategy.id !== 'STRAT-004' : false);
      setIsOverrideInternal(overrideVal);
      const dynamicSteps = getExecutionStepsForStrategy(strategy);
      setExecutionSteps(dynamicSteps);
      const current = stateRef.current;
      persist(current.workflowState, strategy, strategy, overrideVal, dynamicSteps, current.resilienceRecords);
    },
    [persist]
  );

  const setApprovedStrategy = useCallback(
    (strategy: RecoveryStrategy | null, overrideParam?: boolean) => {
      setApprovedStrategyInternal(strategy);
      const current = stateRef.current;
      const overrideVal = overrideParam !== undefined ? overrideParam : (strategy ? strategy.id !== 'STRAT-004' : current.isOverride);
      setIsOverrideInternal(overrideVal);
      if (strategy) {
        setSelectedStrategyInternal(strategy);
        const dynamicSteps = getExecutionStepsForStrategy(strategy);
        setExecutionSteps(dynamicSteps);
        persist(current.workflowState, strategy, strategy, overrideVal, dynamicSteps, current.resilienceRecords);
      } else {
        persist(current.workflowState, current.selectedStrategy, null, overrideVal, current.executionSteps, current.resilienceRecords);
      }
    },
    [persist]
  );

  const setIsOverride = useCallback(
    (override: boolean) => {
      setIsOverrideInternal(override);
      const current = stateRef.current;
      persist(current.workflowState, current.selectedStrategy, current.approvedStrategy, override, current.executionSteps, current.resilienceRecords);
    },
    [persist]
  );

  const completeExecution = useCallback(
    (steps: ExecutionStep[]) => {
      setExecutionSteps(steps);
      setWorkflowStateInternal('RECOVERED');
      const current = stateRef.current;
      const executedStrat = current.approvedStrategy || current.selectedStrategy;

      const newRecord: ResilienceRecord = {
        id: `MEM-2026-${Date.now().toString().slice(-4)}`,
        disruption_id: 'DIS-2026-001',
        crisis_title: 'Global Metals Ltd. (S-104) Supplier Shutdown',
        supplier: 'Global Metals Ltd. (S-104)',
        material: 'Steering Assembly (M-101)',
        plant: 'PL-01 Hyderabad Assembly Plant',
        ai_recommended_strategy: 'Combined Recovery (Multi-Modal Transfer + Priority Air)',
        human_selected_strategy: executedStrat?.name || 'Combined Recovery',
        is_override: current.isOverride || (executedStrat ? executedStrat.id !== 'STRAT-004' : false),
        cost_inr: executedStrat?.cost_inr || 210000,
        recovery_time_days: executedStrat?.recovery_time_days || 1,
        revenue_protected_inr: executedStrat?.revenue_protected_inr || 2420000,
        risk_level: executedStrat?.risk_level || 'LOW',
        outcome: `Executed ${executedStrat?.name || 'Combined Recovery'}. Reduced disruption downtime to ${executedStrat?.recovery_time_days || 1} day(s), protecting ₹${((executedStrat?.revenue_protected_inr || 2420000) / 100000).toFixed(1)}L in customer order value.`,
        completed_at: new Date().toISOString(),
      };

      const updatedRecords = [newRecord, ...current.resilienceRecords];
      setResilienceRecords(updatedRecords);

      persist('RECOVERED', current.selectedStrategy, current.approvedStrategy, current.isOverride, steps, updatedRecords);
    },
    [persist]
  );

  const resetCrisisWorkflow = useCallback(() => {
    const freshSteps = getExecutionStepsForStrategy(null);
    setWorkflowStateInternal('DETECTED');
    setSelectedStrategyInternal(null);
    setApprovedStrategyInternal(null);
    setIsOverrideInternal(false);
    setExecutionSteps(freshSteps);
    setResilienceRecords([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = React.useMemo(
    () => ({
      workflowState,
      selectedStrategy,
      approvedStrategy,
      isOverride,
      executionSteps,
      resilienceRecords,
      setWorkflowState,
      setSelectedStrategy,
      setApprovedStrategy,
      setIsOverride,
      completeExecution,
      resetCrisisWorkflow,
    }),
    [
      workflowState,
      selectedStrategy,
      approvedStrategy,
      isOverride,
      executionSteps,
      resilienceRecords,
      setWorkflowState,
      setSelectedStrategy,
      setApprovedStrategy,
      setIsOverride,
      completeExecution,
      resetCrisisWorkflow,
    ]
  );

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWorkflow(): WorkflowContextValue {
  const ctx = useContext(WorkflowContext);
  return ctx || DEFAULT_WORKFLOW_CONTEXT;
}
