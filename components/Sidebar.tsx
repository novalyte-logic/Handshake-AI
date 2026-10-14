'use client';

import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Briefcase,
  Layers,
  Settings,
  PlusCircle,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { Opportunity } from '@/lib/types';

interface SidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  opportunities: Opportunity[];
  activeOpportunityId: string;
  setActiveOpportunityId: (id: string) => void;
  onOpenImportModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  setActiveNav,
  opportunities,
  activeOpportunityId,
  setActiveOpportunityId,
  onOpenImportModal,
}) => {
  const navItems = [
    { id: 'overview', label: '1. Overview', icon: LayoutDashboard },
    { id: 'profile', label: '2. My Profile', icon: UserCheck },
    { id: 'opportunities', label: '3. Opportunities', icon: Briefcase, count: opportunities.length },
    { id: 'workspace', label: '4. Application Workspace', icon: Layers },
    { id: 'settings', label: '5. Settings', icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-[#E5E9E7] flex flex-col justify-between shrink-0 min-h-[calc(100vh-57px)]">
      {/* Primary Navigation */}
      <div className="p-4 space-y-6">
        <div className="space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-[#89919B] uppercase tracking-wider">
            Main Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#EAFBF5] text-[#009B87] font-semibold shadow-xs border-l-4 border-[#009B87]'
                      : 'text-[#626B78] hover:text-[#171D27] hover:bg-[#F7FAF8]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#009B87]' : 'text-[#89919B]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isActive ? 'bg-[#009B87] text-white' : 'bg-[#EEF1EF] text-[#626B78]'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Saved Opportunities Quick List */}
        <div className="pt-4 border-t border-[#EEF1EF]">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[11px] font-semibold text-[#89919B] uppercase tracking-wider">
              Saved Roles
            </span>
            <button
              onClick={onOpenImportModal}
              className="text-xs text-[#009B87] hover:text-[#007F73] font-medium flex items-center space-x-1"
              title="Add Opportunity"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>
          </div>

          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {opportunities.length === 0 ? (
              <p className="px-3 py-2 text-xs text-[#89919B] italic">No opportunities saved yet.</p>
            ) : (
              opportunities.map((opp) => {
                const isSelected = activeNav === 'workspace' && activeOpportunityId === opp.id;
                return (
                  <button
                    key={opp.id}
                    onClick={() => {
                      setActiveOpportunityId(opp.id);
                      setActiveNav('workspace');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors flex items-center justify-between group ${
                      isSelected
                        ? 'bg-[#F3FCF8] text-[#005F58] font-semibold border-l-2 border-[#009B87]'
                        : 'text-[#626B78] hover:bg-[#F7FAF8] hover:text-[#171D27]'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate font-medium text-[#171D27] group-hover:text-[#009B87]">
                        {opp.companyName}
                      </div>
                      <div className="truncate text-[11px] text-[#89919B]">{opp.roleTitle}</div>
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                        isSelected ? 'text-[#009B87]' : 'text-[#E5E9E7] group-hover:text-[#89919B]'
                      }`}
                    />
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 m-3 bg-[#F3FCF8] border border-[#2DD4BF]/30 rounded-xl space-y-2">
        <div className="flex items-center space-x-2 text-[#005F58]">
          <Building2 className="w-4 h-4 text-[#009B87]" />
          <span className="text-xs font-semibold">Evidence Integrity</span>
        </div>
        <p className="text-[11px] text-[#626B78] leading-relaxed">
          100% of generated application materials are anchored in your verified candidate claims.
        </p>
      </div>
    </aside>
  );
};
