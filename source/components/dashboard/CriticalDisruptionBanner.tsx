'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Building,
  Clock,
  ArrowRight,
  Flame,
  ShieldAlert,
  Calendar,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Disruption } from '@/lib/supabase/types';
import { useWorkflow } from '@/lib/workflow/workflow-context';

interface CriticalDisruptionBannerProps {
  disruption: Disruption;
}

export function CriticalDisruptionBanner({
  disruption,
}: CriticalDisruptionBannerProps) {
  const router = useRouter();
  const { setWorkflowState } = useWorkflow();
  const [isActivating, setIsActivating] = useState(false);
  const [showActivatedModal, setShowActivatedModal] = useState(false);

  const handleActivateCrisis = () => {
    setWorkflowState('CRISIS_ACTIVE');
    setShowActivatedModal(true);
  };

  const proceedToAnalysis = () => {
    setShowActivatedModal(false);
    setWorkflowState('CRISIS_ACTIVE');
    router.push('/crisis-analysis');
  };

  return (
    <div className="bg-white rounded-lg border-2 border-red-500/80 shadow-sm overflow-hidden">
      {/* Top Banner Alert Bar */}
      <div className="bg-red-600 text-white px-5 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-100" />
          <span className="font-bold text-xs uppercase tracking-wider">
            Critical Disruption Detected — Severity Tier 1
          </span>
        </div>
        <span className="text-xs bg-red-700/80 border border-red-500 px-2 py-0.5 rounded font-mono font-medium">
          Incident ID: {disruption.id}
        </span>
      </div>

      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Main Info */}
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {disruption.title}
              </h2>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                Active Shutdown
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              {disruption.description}
            </p>

            {/* Grid of parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                  Supplier
                </span>
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {disruption.supplier?.name || 'Global Metals Ltd.'} (S-104)
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                  Material
                </span>
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {disruption.material?.name || 'Steering Assembly'} (M-101)
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                  Affected Plant
                </span>
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {disruption.plant?.name || 'PL-01 Hyderabad Assembly Plant'}
                </span>
              </div>

              <div className="bg-red-50/70 border border-red-200 rounded p-2.5">
                <span className="text-[10px] font-semibold text-red-700 uppercase block">
                  Supplier Shutdown
                </span>
                <span className="text-xs font-bold text-red-900 block">
                  {disruption.duration_days} days
                </span>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded p-2.5">
                <span className="text-[10px] font-semibold text-amber-700 uppercase block">
                  Inventory Coverage
                </span>
                <span className="text-xs font-bold text-amber-900 block">
                  {disruption.coverage_days} days
                </span>
              </div>

              <div className="bg-red-50/70 border border-red-200 rounded p-2.5">
                <span className="text-[10px] font-semibold text-red-700 uppercase block">
                  Revenue at Risk
                </span>
                <span className="text-xs font-bold text-red-900 block">
                  ₹27.4L
                </span>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded p-2.5">
                <span className="text-[10px] font-semibold text-amber-700 uppercase block">
                  Expected Delay
                </span>
                <span className="text-xs font-bold text-amber-900 block">
                  {disruption.expected_delay_days} days
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                  Affected Scope
                </span>
                <span className="text-xs font-bold text-slate-900 block">
                  17 POs / 20 Orders
                </span>
              </div>
            </div>
          </div>

          {/* Call To Action Box */}
          <div className="lg:w-64 flex flex-col justify-center items-stretch gap-2.5 pt-2 lg:pt-0 lg:border-l lg:border-slate-200 lg:pl-6 shrink-0">
            <button
              onClick={handleActivateCrisis}
              disabled={isActivating}
              className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-md shadow-sm transition flex items-center justify-center gap-2 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {isActivating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synchronizing...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 text-amber-300" />
                  <span>ACTIVATE CRISIS MODE</span>
                </>
              )}
            </button>

            <Link
              href="/crisis-analysis"
              className="w-full text-center text-xs font-semibold text-slate-700 hover:text-slate-900 py-2 border border-slate-200 hover:border-slate-300 rounded bg-white transition flex items-center justify-center gap-1.5"
            >
              <span>View Deep Analysis</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <div className="text-[11px] text-slate-500 text-center font-medium">
              Human-in-the-loop review required
            </div>
          </div>
        </div>
      </div>

      {/* Activation Confirmation Modal */}
      {showActivatedModal && (
        <div
          onClick={() => setShowActivatedModal(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="w-12 h-12 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-red-600 mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Crisis Mode Activated
              </h3>
              <p className="text-xs text-slate-600">
                Astra Motors Crisis Orchestrator has engaged. Multi-agent evaluation
                pipeline initialized for S-104 Global Metals Ltd disruption.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Incident:</span>
                <span className="font-semibold text-slate-800">
                  Global Metals Ltd. (S-104) Shutdown
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Revenue at Risk:</span>
                <span className="font-bold text-red-600">₹27.4L</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Active Agents:</span>
                <span className="font-medium text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  6 Agents Ready
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowActivatedModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded text-xs font-semibold"
              >
                Stay on Dashboard
              </button>
              <button
                onClick={proceedToAnalysis}
                className="flex-1 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <span>Go to Crisis Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
