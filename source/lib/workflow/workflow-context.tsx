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
  module: string; // e.g. 'SAP MM', 'SAP EWM'
  action: string;
  reference: string;
  status: ExecutionStepStatus;
  completedAt?: string;
}

export interface WorkflowContextValue {
  workflowState: WorkflowState;
  approvedStrategy: RecoveryStrategy | null;
  executionSteps: ExecutionStep[];
  setWorkflowState: (state: WorkflowState) => void;
  setApprovedStrategy: (strategy: RecoveryStrategy) => void;
  completeExecution: (steps: ExecutionStep[]) => void;
  resetCrisisWorkflow: () => void;
}

const STORAGE_KEY = 'resilinet_workflow_state';

const DEFAULT_EXECUTION_STEPS: ExecutionStep[] = [
  {
    id: 'STEP-01',
    module: 'SAP MM',
    action: 'Create Alternate Sourcing Purchase Requisition (Bharat Precision, Pune)',
    reference: 'PR-45009101',
    status: 'PENDING',
  },
  {
    id: 'STEP-02',
    module: 'SAP EWM',
    action: 'Issue Stock Transport Order — PL-02 Chennai → PL-01 Hyderabad (120 units M-101)',
    reference: 'STO-881203',
    status: 'PENDING',
  },
  {
    id: 'STEP-03',
    module: 'SAP TM',
    action: 'Book Priority Air Freight Dispatch — Jamshedpur Buffer → Hyderabad (100 units)',
    reference: 'FO-9021-AIR',
    status: 'PENDING',
  },
  {
    id: 'STEP-04',
    module: 'SAP PP',
    action: 'Reschedule Assembly Lines 1 & 2 — PL-01 Hyderabad (CO02 Rescheduling)',
    reference: 'CO02-HYD-7710',
    status: 'PENDING',
  },
  {
    id: 'STEP-05',
    module: 'SAP SD',
    action: 'Re-commit Customer Order Delivery Confirmations — 20 Fleet Orders (VA02)',
    reference: 'VA02-ALLOC-221',
    status: 'PENDING',
  },
];

const DEFAULT_WORKFLOW_CONTEXT: WorkflowContextValue = {
  workflowState: 'DETECTED',
  approvedStrategy: null,
  executionSteps: DEFAULT_EXECUTION_STEPS,
  setWorkflowState: () => {},
  setApprovedStrategy: () => {},
  completeExecution: () => {},
  resetCrisisWorkflow: () => {},
};

// ─── Context ──────────────────────────────────────────────────────────────────

const WorkflowContext = createContext<WorkflowContextValue>(DEFAULT_WORKFLOW_CONTEXT);

interface PersistedState {
  workflowState: WorkflowState;
  approvedStrategy: RecoveryStrategy | null;
  executionSteps: ExecutionStep[];
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [workflowState, setWorkflowStateInternal] = useState<WorkflowState>('DETECTED');
  const [approvedStrategy, setApprovedStrategyInternal] = useState<RecoveryStrategy | null>(null);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>(DEFAULT_EXECUTION_STEPS);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: PersistedState = JSON.parse(raw);
        setWorkflowStateInternal(parsed.workflowState || 'DETECTED');
        setApprovedStrategyInternal(parsed.approvedStrategy || null);
        setExecutionSteps(parsed.executionSteps || DEFAULT_EXECUTION_STEPS);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const persist = useCallback(
    (state: WorkflowState, strategy: RecoveryStrategy | null, steps: ExecutionStep[]) => {
      try {
        const toSave: PersistedState = { workflowState: state, approvedStrategy: strategy, executionSteps: steps };
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
      setApprovedStrategyInternal((prev) => {
        setExecutionSteps((steps) => {
          persist(state, prev, steps);
          return steps;
        });
        return prev;
      });
    },
    [persist]
  );

  const setApprovedStrategy = useCallback(
    (strategy: RecoveryStrategy) => {
      setApprovedStrategyInternal(strategy);
      setWorkflowStateInternal((state) => {
        setExecutionSteps((steps) => {
          persist(state, strategy, steps);
          return steps;
        });
        return state;
      });
    },
    [persist]
  );

  const completeExecution = useCallback(
    (steps: ExecutionStep[]) => {
      setExecutionSteps(steps);
      setWorkflowStateInternal('RECOVERED');
      setApprovedStrategyInternal((strategy) => {
        persist('RECOVERED', strategy, steps);
        return strategy;
      });
    },
    [persist]
  );

  const resetCrisisWorkflow = useCallback(() => {
    const freshSteps = DEFAULT_EXECUTION_STEPS.map((s) => ({ ...s, status: 'PENDING' as ExecutionStepStatus }));
    setWorkflowStateInternal('DETECTED');
    setApprovedStrategyInternal(null);
    setExecutionSteps(freshSteps);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <WorkflowContext.Provider
      value={{
        workflowState,
        approvedStrategy,
        executionSteps,
        setWorkflowState,
        setApprovedStrategy,
        completeExecution,
        resetCrisisWorkflow,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWorkflow(): WorkflowContextValue {
  const ctx = useContext(WorkflowContext);
  return ctx || DEFAULT_WORKFLOW_CONTEXT;
}
