'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { OverviewView } from '@/components/views/OverviewView';
import { ProfileView } from '@/components/views/ProfileView';
import { OpportunitiesView } from '@/components/views/OpportunitiesView';
import { WorkspaceView } from '@/components/views/WorkspaceView';
import { SettingsView } from '@/components/views/SettingsView';
import { loadAppState, AppStateData } from '@/lib/store';

export default function HomePage() {
  const [appState, setAppState] = useState<AppStateData>(loadAppState());
  const [activeNav, setActiveNav] = useState<string>('overview');
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>('');
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  const effectiveOpportunityId =
    selectedOpportunityId && appState.opportunities.some((o) => o.id === selectedOpportunityId)
      ? selectedOpportunityId
      : appState.opportunities[0]?.id || '';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      {/* Top Application Header */}
      <Header
        appState={appState}
        setAppState={setAppState}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          opportunities={appState.opportunities}
          activeOpportunityId={effectiveOpportunityId}
          setActiveOpportunityId={setSelectedOpportunityId}
          onOpenImportModal={() => {
            setActiveNav('opportunities');
            setIsImportModalOpen(true);
          }}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeNav === 'overview' && (
            <OverviewView
              appState={appState}
              setActiveNav={setActiveNav}
              setActiveOpportunityId={setSelectedOpportunityId}
              onOpenImportModal={() => {
                setActiveNav('opportunities');
                setIsImportModalOpen(true);
              }}
            />
          )}

          {activeNav === 'profile' && (
            <ProfileView appState={appState} setAppState={setAppState} />
          )}

          {activeNav === 'opportunities' && (
            <OpportunitiesView
              appState={appState}
              setAppState={setAppState}
              setActiveNav={setActiveNav}
              setActiveOpportunityId={setSelectedOpportunityId}
              isImportModalOpen={isImportModalOpen}
              setIsImportModalOpen={setIsImportModalOpen}
            />
          )}

          {activeNav === 'workspace' && (
            <WorkspaceView
              appState={appState}
              setAppState={setAppState}
              activeOpportunityId={effectiveOpportunityId}
              setActiveOpportunityId={setSelectedOpportunityId}
              setActiveNav={setActiveNav}
            />
          )}

          {activeNav === 'settings' && (
            <SettingsView appState={appState} setAppState={setAppState} />
          )}
        </main>
      </div>
    </div>
  );
}
