'use client';

import React from 'react';
import { EnterpriseShell } from '@/components/layout/EnterpriseShell';
import { Settings, Server, Key, Database, Shield } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export default function SettingsPage() {
  const isConfigured = isSupabaseConfigured();

  return (
    <EnterpriseShell>
      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-slate-100 text-slate-700 border border-slate-200">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">System Settings & Integration Credentials</h2>
            <p className="text-xs text-slate-500">
              Manage Supabase connectivity, Gemini AI model preferences, and SAP Integration Suite endpoints
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Supabase Status */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Database className="w-4 h-4 text-sky-600" />
                <span>Supabase PostgreSQL & Auth</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  isConfigured
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {isConfigured ? 'CONNECTED' : 'OFFLINE DEMO DATASET ACTIVE'}
              </span>
            </div>
            <p className="text-slate-500">
              Configure <code className="font-mono bg-slate-200/60 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
              <code className="font-mono bg-slate-200/60 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{' '}
              <code className="font-mono bg-slate-200/60 px-1 py-0.5 rounded">source/.env.local</code> to connect your live Supabase instance.
            </p>
          </div>

          {/* Gemini AI Settings */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Key className="w-4 h-4 text-sky-600" />
                <span>Gemini API Configuration</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                {process.env.GEMINI_API_KEY ? 'CONFIGURED' : 'PENDING'}
              </span>
            </div>
            <p className="text-slate-500">
              Used by AI Command Center for multi-agent reasoning and narrative explanations. Configure <code className="font-mono bg-slate-200/60 px-1 py-0.5 rounded">GEMINI_API_KEY</code>.
            </p>
          </div>

          {/* SAP Integration Status */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Server className="w-4 h-4 text-sky-600" />
                <span>SAP BTP / Integration Suite Adapter</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                SIMULATED SAP ACTIONS (PROTOTYPE)
              </span>
            </div>
            <p className="text-slate-500">
              All ERP actions (Purchase Orders, Stock Transfer Orders, Freight Requisitions) are safely sandboxed with the <span className="font-bold text-slate-700">SIMULATED SAP ACTION</span> label for the hackathon prototype.
            </p>
          </div>
        </div>
      </div>
    </EnterpriseShell>
  );
}
