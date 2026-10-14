'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Database,
  Building2,
  Key,
} from 'lucide-react';
import { AppStateData, exportBackupJSON, resetToDemoData, saveAppState } from '@/lib/store';
import { ProviderStatus } from '@/lib/types';

interface SettingsViewProps {
  appState: AppStateData;
  setAppState: React.Dispatch<React.SetStateAction<AppStateData>>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ appState, setAppState }) => {
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);

  useEffect(() => {
    fetch('/api/integrations/status')
      .then((res) => res.json())
      .then((data) => {
        setProviderStatus(data);
        setIsLoadingProviders(false);
      })
      .catch((err) => {
        console.error('Failed to load provider status', err);
        setIsLoadingProviders(false);
      });
  }, []);

  const handleResetDemo = () => {
    if (confirm('Reset workspace with fictional demo dataset (Alex Morgan @ AeroCloud)? Custom changes will be overwritten.')) {
      const fresh = resetToDemoData();
      setAppState(fresh);
      alert('Workspace reset to fictional demo state.');
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all candidate profiles and opportunities?')) {
      const emptyState: AppStateData = {
        profile: {
          id: `cand-${Date.now()}`,
          name: '',
          email: '',
          phone: '',
          location: '',
          linkedin: '',
          github: '',
          website: '',
          summary: '',
          employment: [],
          education: [],
          skills: [],
          projects: [],
          accomplishments: [],
          preferences: {
            targetRoles: [],
            preferredLocations: [],
            workArrangement: ['Remote'],
            salaryExpectation: '',
            seniority: '',
            workAuthorization: '',
          },
          evidenceLibrary: [],
          isApproved: false,
          updatedAt: new Date().toISOString(),
        },
        opportunities: [],
        fitAssessments: {},
        materials: {},
        briefs: {},
        contactsOutreach: {},
        interviewPreps: {},
        activities: [],
      };
      setAppState(emptyState);
      saveAppState(emptyState);
      alert('Workspace cleared.');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-[#E5E9E7]">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#171D27] tracking-tight">
          Settings & Integrations
        </h1>
        <p className="text-sm text-[#626B78] mt-1">
          Manage AI providers, data backup & restore, and workspace persistence options.
        </p>
      </div>

      {/* Connected Providers Panel */}
      <div className="bg-white border border-[#E5E9E7] rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-semibold text-[#171D27] pb-3 border-b border-[#EEF1EF] flex items-center space-x-2">
          <Key className="w-4 h-4 text-[#009B87]" />
          <span>Provider Integrations Status</span>
        </h2>

        {isLoadingProviders ? (
          <div className="p-4 text-xs text-[#89919B]">Checking provider connections...</div>
        ) : !providerStatus ? (
          <div className="p-4 text-xs text-[#DC2626]">Failed to load provider status.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gemini Status */}
            <div className="p-4 border border-[#E5E9E7] rounded-xl bg-[#FAF9F6] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#171D27]">Gemini Intelligence Engine</span>
                {providerStatus.gemini.connected ? (
                  <span className="px-2 py-0.5 rounded-full bg-[#15803D]/10 text-[#15803D] text-[10px] font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-[#DC2626]/10 text-[#DC2626] text-[10px] font-bold">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-xs text-[#626B78]">{providerStatus.gemini.note}</p>
            </div>

            {/* Firecrawl Status */}
            <div className="p-4 border border-[#E5E9E7] rounded-xl bg-[#FAF9F6] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#171D27]">Firecrawl Job Web Extraction</span>
                {providerStatus.firecrawl.connected ? (
                  <span className="px-2 py-0.5 rounded-full bg-[#15803D]/10 text-[#15803D] text-[10px] font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-[#89919B]/10 text-[#89919B] text-[10px] font-bold">
                    Fallback Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-[#626B78]">{providerStatus.firecrawl.note}</p>
            </div>

            {/* Hunter Status */}
            <div className="p-4 border border-[#E5E9E7] rounded-xl bg-[#FAF9F6] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#171D27]">Hunter Email Verification</span>
                {providerStatus.hunter.connected ? (
                  <span className="px-2 py-0.5 rounded-full bg-[#15803D]/10 text-[#15803D] text-[10px] font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-[#89919B]/10 text-[#89919B] text-[10px] font-bold">
                    Simulation Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-[#626B78]">{providerStatus.hunter.note}</p>
            </div>

            {/* Exa Status */}
            <div className="p-4 border border-[#E5E9E7] rounded-xl bg-[#FAF9F6] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#171D27]">Exa Discovery</span>
                {providerStatus.exa.connected ? (
                  <span className="px-2 py-0.5 rounded-full bg-[#15803D]/10 text-[#15803D] text-[10px] font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-[#89919B]/10 text-[#89919B] text-[10px] font-bold">
                    Optional
                  </span>
                )}
              </div>
              <p className="text-xs text-[#626B78]">{providerStatus.exa.note}</p>
            </div>
          </div>
        )}
      </div>

      {/* Data Management & Backup Box */}
      <div className="bg-white border border-[#E5E9E7] rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-semibold text-[#171D27] pb-3 border-b border-[#EEF1EF] flex items-center space-x-2">
          <Database className="w-4 h-4 text-[#009B87]" />
          <span>Data Backup & Persistence Controls</span>
        </h2>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={() => exportBackupJSON(appState)}
            className="px-4 py-2 bg-[#009B87] hover:bg-[#007F73] text-white text-xs font-semibold rounded-lg shadow-xs inline-flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup JSON</span>
          </button>

          <button
            onClick={handleResetDemo}
            className="px-4 py-2 border border-[#E5E9E7] dark:border-[#2A3447] hover:bg-[#F7FAF8] dark:hover:bg-[#222C3D] text-xs font-semibold text-[#171D27] dark:text-[#F3F4F6] rounded-lg inline-flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4 text-[#009B87] dark:text-[#2DD4BF]" />
            <span>Load Fictional Demo Data (Alex Morgan)</span>
          </button>

          <button
            onClick={handleClearAll}
            className="px-4 py-2 border border-[#FCA5A5] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] text-xs font-semibold rounded-lg inline-flex items-center space-x-2"
          >
            <span>Clear Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
