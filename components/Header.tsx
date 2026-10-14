'use client';

import React from 'react';
import { Download, Upload, RotateCcw, ShieldCheck, Layers, LogOut } from 'lucide-react';
import { AppStateData, exportBackupJSON, resetToDemoData, saveAppState } from '@/lib/store';
import { ThemeToggle } from '@/components/ThemeToggle';

interface HeaderProps {
  appState: AppStateData;
  setAppState: React.Dispatch<React.SetStateAction<AppStateData>>;
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  appState,
  setAppState,
  setActiveNav,
}) => {
  const handleLoadDemo = () => {
    if (
      confirm(
        'Load Fictional Demo Dataset?\n\nThis action will load a fictional dataset (Alex Morgan @ AeroCloud Systems) so you can test features. Any current unsaved workspace records will be replaced. Proceed?'
      )
    ) {
      const fresh = resetToDemoData();
      setAppState(fresh);
    }
  };

  const handleExitDemo = () => {
    if (confirm('Exit Demo Workspace?\n\nThis will clear the fictional demo records and open a clean, empty workspace for your real profile and job applications.')) {
      const cleanState: AppStateData = {
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
          isDemo: false,
        },
        opportunities: [],
        fitAssessments: {},
        materials: {},
        briefs: {},
        contactsOutreach: {},
        interviewPreps: {},
        activities: [],
      };
      setAppState(cleanState);
      saveAppState(cleanState);
    }
  };

  const handleExportBackup = () => {
    exportBackupJSON(appState);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (json.profile && json.opportunities) {
          setAppState(json);
          alert('Workspace restored successfully from JSON backup!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const approvedEvidenceCount = appState.profile.evidenceLibrary.filter(
    (e) => e.status === 'user-confirmed'
  ).length;

  const isDemoActive = Boolean(appState.profile.isDemo);

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-[#1B2230] border-b border-[#E5E9E7] dark:border-[#2A3447] px-4 md:px-8 py-3.5 flex items-center justify-between shadow-[0_1px_3px_rgba(16,24,40,0.04)] transition-colors">
      {/* Brand Logo & Identifier */}
      <div className="flex items-center space-x-3">
        <div className="h-9 w-9 rounded-lg bg-[#009B87] flex items-center justify-center text-white font-bold text-lg shadow-sm">
          P
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg text-[#171D27] dark:text-[#F3F4F6] tracking-tight">ProofReach</span>
            {isDemoActive ? (
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 flex items-center space-x-1">
                <Layers className="w-3 h-3" />
                <span>Demo Workspace</span>
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-semibold bg-[#EAFBF5] dark:bg-[#12332F] text-[#009B87] dark:text-[#2DD4BF] border border-[#2DD4BF]/30">
                Evidence Workspace
              </span>
            )}
          </div>
          <p className="text-xs text-[#626B78] dark:text-[#9CA3AF] hidden sm:block">
            {isDemoActive
              ? 'Fictional demo data active — all companies, people, and roles are fictional.'
              : 'Evidence-backed job application suite & outreach workspace'}
          </p>
        </div>
      </div>

      {/* Header Actions & Profile Quick Indicator */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Dark / Light Mode Toggle Component */}
        <ThemeToggle />

        {/* Evidence Status Indicator */}
        <button
          onClick={() => setActiveNav('profile')}
          className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F3FCF8] dark:bg-[#12332F] text-[#005F58] dark:text-[#2DD4BF] border border-[#2DD4BF]/30 hover:bg-[#EAFBF5] transition-colors"
          title="Click to manage candidate evidence library"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#009B87] dark:text-[#2DD4BF]" />
          <span>{approvedEvidenceCount} Evidence Claims Confirmed</span>
        </button>

        {/* Demo Toggle Control */}
        {isDemoActive ? (
          <button
            onClick={handleExitDemo}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 transition-colors"
            title="Exit Demo and start clean workspace"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Exit Demo</span>
          </button>
        ) : (
          <button
            onClick={handleLoadDemo}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#626B78] dark:text-[#9CA3AF] hover:text-[#171D27] dark:hover:text-[#F3F4F6] hover:bg-[#F7FAF8] dark:hover:bg-[#222C3D] transition-colors"
            title="Load fictional demo dataset"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#009B87] dark:text-[#2DD4BF]" />
            <span className="hidden md:inline">Load Demo Data</span>
          </button>
        )}

        <button
          onClick={handleExportBackup}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#626B78] dark:text-[#9CA3AF] hover:text-[#171D27] dark:hover:text-[#F3F4F6] hover:bg-[#F7FAF8] dark:hover:bg-[#222C3D] transition-colors"
          title="Export workspace backup JSON"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Export</span>
        </button>

        <label
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#626B78] dark:text-[#9CA3AF] hover:text-[#171D27] dark:hover:text-[#F3F4F6] hover:bg-[#F7FAF8] dark:hover:bg-[#222C3D] cursor-pointer transition-colors"
          title="Restore workspace backup JSON"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Restore</span>
          <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
        </label>

        {/* User Avatar */}
        <div className="pl-2 border-l border-[#E5E9E7] dark:border-[#2A3447] flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-[#EAFBF5] dark:bg-[#12332F] text-[#009B87] dark:text-[#2DD4BF] font-semibold text-xs flex items-center justify-center border border-[#009B87]/30">
            {appState.profile.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase() || 'U'}
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-[#171D27] dark:text-[#F3F4F6]">
              {appState.profile.name || 'Real Candidate'}
            </div>
            <div className="text-[11px] text-[#626B78] dark:text-[#9CA3AF]">
              {appState.profile.location || 'Location Not Set'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
