'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Plus,
  ExternalLink,
  MapPin,
  DollarSign,
  Clock,
  Layers,
  Sparkles,
  Trash2,
  CheckCircle2,
  Building2,
  Globe,
  AlertCircle,
  X,
  Copy,
  ChevronRight,
} from 'lucide-react';
import { AppStateData, saveAppState, logEvent } from '@/lib/store';
import { Opportunity, WorkplaceArrangement, EmploymentType, ApplicationStage } from '@/lib/types';

interface OpportunitiesViewProps {
  appState: AppStateData;
  setAppState: React.Dispatch<React.SetStateAction<AppStateData>>;
  setActiveNav: (nav: string) => void;
  setActiveOpportunityId: (id: string) => void;
  isImportModalOpen: boolean;
  setIsImportModalOpen: (open: boolean) => void;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  appState,
  setAppState,
  setActiveNav,
  setActiveOpportunityId,
  isImportModalOpen,
  setIsImportModalOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [importTab, setImportTab] = useState<'paste' | 'url' | 'careers'>('paste');

  // Drawer / Extraction form states
  const [rawInputText, setRawInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  // Extracted preview ready for user review & save
  const [extractedOpp, setExtractedOpp] = useState<Partial<Opportunity> | null>(null);

  const handleExtractWithAI = async () => {
    setIsExtracting(true);
    setExtractError(null);

    try {
      const res = await fetch('/api/opportunity/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: rawInputText,
          inputType: importTab,
          url: inputUrl,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || 'Failed to extract opportunity.');
      }

      setExtractedOpp(json.opportunity);
    } catch (err: any) {
      setExtractError(err.message || 'Failed to process job description.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveOpportunity = () => {
    if (!extractedOpp || !extractedOpp.companyName || !extractedOpp.roleTitle) return;

    // Deduplication check by posting URL or company + role
    const existing = appState.opportunities.find(
      (o) =>
        (extractedOpp.postingUrl && o.postingUrl === extractedOpp.postingUrl) ||
        (o.companyName.toLowerCase() === extractedOpp.companyName?.toLowerCase() &&
          o.roleTitle.toLowerCase() === extractedOpp.roleTitle?.toLowerCase())
    );

    let updatedList: Opportunity[];
    const newId = existing ? existing.id : `opp-${Date.now()}`;

    const newOpportunity: Opportunity = {
      id: newId,
      companyName: extractedOpp.companyName || 'Company',
      companyDomain: extractedOpp.companyDomain || 'company.com',
      roleTitle: extractedOpp.roleTitle || 'Target Role',
      postingUrl: extractedOpp.postingUrl || 'https://company.com/careers',
      applicationUrl: extractedOpp.applicationUrl || extractedOpp.postingUrl,
      location: extractedOpp.location || 'Not disclosed',
      workplaceArrangement: (extractedOpp.workplaceArrangement as WorkplaceArrangement) || 'Not disclosed',
      employmentType: (extractedOpp.employmentType as EmploymentType) || 'Full-time',
      salary: extractedOpp.salary || 'Not disclosed',
      responsibilities: extractedOpp.responsibilities || [],
      requiredQualifications: extractedOpp.requiredQualifications || [],
      preferredQualifications: extractedOpp.preferredQualifications || [],
      explicitEligibility: extractedOpp.explicitEligibility || [],
      deadline: extractedOpp.deadline || 'Not disclosed',
      stage: existing ? existing.stage : 'Saved',
      outreachStatus: existing ? existing.outreachStatus : 'No draft',
      source: importTab === 'url' ? 'Live URL Extraction' : 'Pasted Job Description',
      dateChecked: new Date().toISOString().split('T')[0],
      isLiveChecked: Boolean(extractedOpp.isLiveChecked),
      notes: extractedOpp.notes || '',
      provenance: importTab === 'url' ? 'Public source' : 'Imported — needs review',
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rawJobDescription: extractedOpp.rawJobDescription,
    };

    if (existing) {
      updatedList = appState.opportunities.map((o) => (o.id === existing.id ? newOpportunity : o));
    } else {
      updatedList = [newOpportunity, ...appState.opportunities];
    }

    let newState = { ...appState, opportunities: updatedList };
    saveAppState({ opportunities: updatedList });

    newState = logEvent(newState, {
      title: existing ? 'Opportunity Updated' : 'Opportunity Created',
      description: `Saved ${newOpportunity.companyName} — ${newOpportunity.roleTitle} (${newOpportunity.location})`,
      type: 'opportunity',
      opportunityId: newId,
    });

    setAppState(newState);

    setExtractedOpp(null);
    setRawInputText('');
    setInputUrl('');
    setIsImportModalOpen(false);

    // Auto navigate to workspace
    setActiveOpportunityId(newId);
    setActiveNav('workspace');
  };

  const handleDeleteOpp = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetOpp = appState.opportunities.find((o) => o.id === id);
    if (confirm('Are you sure you want to delete this opportunity?')) {
      const updatedList = appState.opportunities.filter((o) => o.id !== id);
      let newState = { ...appState, opportunities: updatedList };
      saveAppState({ opportunities: updatedList });

      if (targetOpp) {
        newState = logEvent(newState, {
          title: 'Opportunity Removed',
          description: `Deleted ${targetOpp.companyName} — ${targetOpp.roleTitle}`,
          type: 'opportunity',
        });
      }
      setAppState(newState);
    }
  };

  const filteredOpportunities = appState.opportunities.filter((opp) => {
    const matchesSearch =
      opp.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'All' || opp.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E5E9E7]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171D27] tracking-tight">
            Target Opportunities
          </h1>
          <p className="text-sm text-[#626B78] mt-1">
            Import, deduplicate, and manage targeted role opportunities across employers.
          </p>
        </div>
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#009B87] hover:bg-[#007F73] text-white rounded-lg text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Import Opportunity</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-[#E5E9E7] rounded-xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#89919B] absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, title, or location..."
            className="w-full pl-9 pr-3 py-2 border border-[#E5E9E7] rounded-lg text-xs focus:outline-none focus:border-[#009B87]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-[#626B78] font-medium shrink-0">Stage Filter:</span>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="p-2 border border-[#E5E9E7] rounded-lg text-xs bg-white focus:border-[#009B87]"
          >
            <option value="All">All Stages</option>
            <option value="Saved">Saved</option>
            <option value="Researching">Researching</option>
            <option value="Preparing">Preparing</option>
            <option value="Ready to apply">Ready to apply</option>
            <option value="Applied">Applied</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offer">Offer</option>
          </select>
        </div>
      </div>

      {/* Opportunities List Table */}
      <div className="bg-white border border-[#E5E9E7] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] text-[#89919B] border-b border-[#E5E9E7] font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Company & Role</th>
                <th className="p-3.5">Arrangement / Salary</th>
                <th className="p-3.5">Stage</th>
                <th className="p-3.5">Source & Verified</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF1EF]">
              {filteredOpportunities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#89919B]">
                    No opportunities match your search or filter. Click &quot;Import Opportunity&quot; to add one.
                  </td>
                </tr>
              ) : (
                filteredOpportunities.map((opp) => (
                  <tr
                    key={opp.id}
                    onClick={() => {
                      setActiveOpportunityId(opp.id);
                      setActiveNav('workspace');
                    }}
                    className="hover:bg-[#F7FAF8] cursor-pointer transition-colors group"
                  >
                    <td className="p-3.5">
                      <div className="font-semibold text-sm text-[#171D27] group-hover:text-[#009B87] transition-colors">
                        {opp.companyName} — {opp.roleTitle}
                      </div>
                      <div className="text-[11px] text-[#626B78] flex items-center space-x-2 mt-0.5">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-[#89919B]" />
                          <span>{opp.location}</span>
                        </span>
                        <span>•</span>
                        <a
                          href={opp.postingUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#009B87] hover:underline flex items-center space-x-0.5"
                        >
                          <span>Posting Link</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-[#171D27]">{opp.workplaceArrangement}</div>
                      <div className="text-[11px] text-[#626B78]">{opp.salary}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-[#EAFBF5] text-[#005F58] font-semibold text-[11px] border border-[#2DD4BF]/30">
                        {opp.stage}
                      </span>
                    </td>
                    <td className="p-3.5 text-[11px] text-[#626B78]">
                      <div>{opp.source}</div>
                      <div className="text-[10px] text-[#89919B]">
                        {opp.isLiveChecked ? 'Live Checked' : 'Pasted Text'} • {opp.dateChecked}
                      </div>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveOpportunityId(opp.id);
                          setActiveNav('workspace');
                        }}
                        className="px-3 py-1.5 bg-[#009B87] hover:bg-[#007F73] text-white font-semibold rounded-md text-xs transition-colors inline-flex items-center space-x-1"
                      >
                        <span>Workspace</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteOpp(opp.id, e)}
                        className="p-1.5 text-[#DC2626] hover:bg-[#FEF2F2] rounded"
                        title="Delete opportunity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal Drawer */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E9E7] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEF1EF]">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-[#009B87]" />
                <h2 className="text-lg font-bold text-[#171D27]">Import Opportunity</h2>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="text-[#89919B] hover:text-[#171D27]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Import Tabs */}
            <div className="flex border-b border-[#E5E9E7] space-x-4 text-xs font-semibold">
              <button
                onClick={() => setImportTab('paste')}
                className={`pb-2 border-b-2 transition-colors ${
                  importTab === 'paste'
                    ? 'border-[#009B87] text-[#009B87]'
                    : 'border-transparent text-[#626B78] hover:text-[#171D27]'
                }`}
              >
                1. Paste Job Description
              </button>
              <button
                onClick={() => setImportTab('url')}
                className={`pb-2 border-b-2 transition-colors ${
                  importTab === 'url'
                    ? 'border-[#009B87] text-[#009B87]'
                    : 'border-transparent text-[#626B78] hover:text-[#171D27]'
                }`}
              >
                2. Import Job Posting URL
              </button>
            </div>

            {extractError && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-xs text-[#DC2626] flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{extractError}</span>
              </div>
            )}

            {!extractedOpp ? (
              <div className="space-y-4">
                {importTab === 'url' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#171D27] mb-1">
                      Job Posting URL
                    </label>
                    <input
                      type="url"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="https://company.com/careers/role-123"
                      className="w-full p-2.5 border border-[#E5E9E7] rounded-lg text-xs focus:border-[#009B87]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#171D27] mb-1">
                    Job Description Text
                  </label>
                  <textarea
                    rows={6}
                    value={rawInputText}
                    onChange={(e) => setRawInputText(e.target.value)}
                    placeholder="Paste full job description text including responsibilities, required skills, salary, location, etc."
                    className="w-full p-3 border border-[#E5E9E7] rounded-lg text-xs focus:border-[#009B87]"
                  />
                </div>

                <button
                  onClick={handleExtractWithAI}
                  disabled={isExtracting || (!rawInputText.trim() && !inputUrl.trim())}
                  className="w-full py-2.5 bg-[#009B87] hover:bg-[#007F73] disabled:bg-[#E5E9E7] text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-colors shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isExtracting ? 'Extracting Structured Job Fields...' : 'Extract Job Opportunity'}</span>
                </button>
              </div>
            ) : (
              /* Review & Edit Extracted Fields Before Save */
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-[#F3FCF8] border border-[#2DD4BF]/30 rounded-lg font-semibold text-[#005F58]">
                  Extracted Opportunity Preview — Review & Save
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#171D27]">Company Name</label>
                    <input
                      type="text"
                      value={extractedOpp.companyName || ''}
                      onChange={(e) => setExtractedOpp({ ...extractedOpp, companyName: e.target.value })}
                      className="w-full p-2 border border-[#E5E9E7] rounded-md text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#171D27]">Role Title</label>
                    <input
                      type="text"
                      value={extractedOpp.roleTitle || ''}
                      onChange={(e) => setExtractedOpp({ ...extractedOpp, roleTitle: e.target.value })}
                      className="w-full p-2 border border-[#E5E9E7] rounded-md text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#171D27]">Location</label>
                    <input
                      type="text"
                      value={extractedOpp.location || ''}
                      onChange={(e) => setExtractedOpp({ ...extractedOpp, location: e.target.value })}
                      className="w-full p-2 border border-[#E5E9E7] rounded-md text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#171D27]">Salary</label>
                    <input
                      type="text"
                      value={extractedOpp.salary || ''}
                      onChange={(e) => setExtractedOpp({ ...extractedOpp, salary: e.target.value })}
                      className="w-full p-2 border border-[#E5E9E7] rounded-md text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#171D27]">Arrangement</label>
                    <input
                      type="text"
                      value={extractedOpp.workplaceArrangement || ''}
                      onChange={(e) =>
                        setExtractedOpp({ ...extractedOpp, workplaceArrangement: e.target.value as any })
                      }
                      className="w-full p-2 border border-[#E5E9E7] rounded-md text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#171D27]">Deadline</label>
                    <input
                      type="text"
                      value={extractedOpp.deadline || ''}
                      onChange={(e) => setExtractedOpp({ ...extractedOpp, deadline: e.target.value })}
                      className="w-full p-2 border border-[#E5E9E7] rounded-md text-xs mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#EEF1EF]">
                  <button
                    onClick={() => setExtractedOpp(null)}
                    className="px-4 py-2 border border-[#E5E9E7] text-[#626B78] rounded-lg hover:bg-[#F7FAF8]"
                  >
                    Back to Edit Input
                  </button>
                  <button
                    onClick={handleSaveOpportunity}
                    className="px-4 py-2 bg-[#009B87] hover:bg-[#007F73] text-white font-semibold rounded-lg shadow-xs"
                  >
                    Confirm & Save Opportunity
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
