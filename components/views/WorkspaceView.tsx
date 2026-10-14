'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  ShieldCheck,
  Building2,
  FileText,
  Send,
  MessageSquare,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Download,
  Printer,
  Edit3,
  Check,
  UserCheck,
  RefreshCw,
  Plus,
  ChevronDown,
} from 'lucide-react';
import { AppStateData, saveAppState, logEvent } from '@/lib/store';
import {
  Opportunity,
  FitAssessment,
  ApplicationMaterials,
  CompanyResearchBrief,
  ContactsAndOutreach,
  InterviewPrep,
  ApplicationStage,
  OutreachStatus,
  OutreachDraft,
} from '@/lib/types';

interface WorkspaceViewProps {
  appState: AppStateData;
  setAppState: React.Dispatch<React.SetStateAction<AppStateData>>;
  activeOpportunityId: string;
  setActiveOpportunityId: (id: string) => void;
  setActiveNav: (nav: string) => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  appState,
  setAppState,
  activeOpportunityId,
  setActiveOpportunityId,
  setActiveNav,
}) => {
  const [activeTab, setActiveTab] = useState<
    'fit' | 'brief' | 'materials' | 'outreach' | 'interview' | 'activity'
  >('fit');

  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const activeOpp = appState.opportunities.find((o) => o.id === activeOpportunityId) || appState.opportunities[0];

  useEffect(() => {
    if (!activeOpportunityId && appState.opportunities.length > 0) {
      setActiveOpportunityId(appState.opportunities[0].id);
    }
  }, [activeOpportunityId, appState.opportunities, setActiveOpportunityId]);

  if (!activeOpp) {
    return (
      <div className="p-12 text-center bg-white border border-[#E5E9E7] rounded-xl my-8">
        <h2 className="text-lg font-bold text-[#171D27] mb-2">No Opportunity Selected</h2>
        <p className="text-xs text-[#626B78] mb-4">Import an opportunity or select one from the sidebar.</p>
        <button
          onClick={() => setActiveNav('opportunities')}
          className="px-4 py-2 bg-[#009B87] text-white font-semibold text-xs rounded-lg shadow-xs"
        >
          Go to Opportunities
        </button>
      </div>
    );
  }

  const currentFit = appState.fitAssessments[activeOpp.id];
  const currentMaterials = appState.materials[activeOpp.id];
  const currentBrief = appState.briefs[activeOpp.id];
  const currentOutreach = appState.contactsOutreach[activeOpp.id];
  const currentInterview = appState.interviewPreps[activeOpp.id];

  // Generator Trigger Handlers
  const handleRunFitAssessment = async () => {
    setIsGenerating('fit');
    try {
      const res = await fetch('/api/opportunity/fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity: activeOpp,
          candidateProfile: appState.profile,
        }),
      });
      const json = await res.json();
      if (res.ok && json.fitAssessment) {
        const updatedFits = { ...appState.fitAssessments, [activeOpp.id]: json.fitAssessment };
        let newState = { ...appState, fitAssessments: updatedFits };
        saveAppState({ fitAssessments: updatedFits });

        newState = logEvent(newState, {
          title: 'Fit Assessment Computed',
          description: `Evaluated evidence coverage (${json.fitAssessment.evidenceCoverageScore}%) for ${activeOpp.companyName}`,
          type: 'research',
          opportunityId: activeOpp.id,
        });
        setAppState(newState);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(null);
    }
  };

  const handleRunMaterials = async () => {
    setIsGenerating('materials');
    try {
      const res = await fetch('/api/opportunity/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity: activeOpp,
          candidateProfile: appState.profile,
        }),
      });
      const json = await res.json();
      if (res.ok && json.materials) {
        const updatedMats = { ...appState.materials, [activeOpp.id]: json.materials };
        let newState = { ...appState, materials: updatedMats };
        saveAppState({ materials: updatedMats });

        newState = logEvent(newState, {
          title: 'Application Materials Drafted',
          description: `Generated tailored resume & cover letter for ${activeOpp.companyName}`,
          type: 'materials',
          opportunityId: activeOpp.id,
        });
        setAppState(newState);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(null);
    }
  };

  const handleRunResearchBrief = async () => {
    setIsGenerating('brief');
    try {
      const res = await fetch('/api/opportunity/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity: activeOpp,
          candidateProfile: appState.profile,
        }),
      });
      const json = await res.json();
      if (res.ok && json.brief) {
        const updatedBriefs = { ...appState.briefs, [activeOpp.id]: json.brief };
        let newState = { ...appState, briefs: updatedBriefs };
        saveAppState({ briefs: updatedBriefs });

        newState = logEvent(newState, {
          title: 'Company Brief Generated',
          description: `Synthesized research brief & public claims for ${activeOpp.companyName}`,
          type: 'research',
          opportunityId: activeOpp.id,
        });
        setAppState(newState);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(null);
    }
  };

  const handleRunContactsOutreach = async () => {
    setIsGenerating('outreach');
    try {
      const res = await fetch('/api/opportunity/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity: activeOpp,
          candidateProfile: appState.profile,
        }),
      });
      const json = await res.json();
      if (res.ok && json.contactsAndOutreach) {
        const updatedOutreach = { ...appState.contactsOutreach, [activeOpp.id]: json.contactsAndOutreach };
        let newState = { ...appState, contactsOutreach: updatedOutreach };
        saveAppState({ contactsOutreach: updatedOutreach });

        newState = logEvent(newState, {
          title: 'Contacts & Outreach Drafted',
          description: `Identified contacts & generated outreach drafts for ${activeOpp.companyName}`,
          type: 'outreach',
          opportunityId: activeOpp.id,
        });
        setAppState(newState);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(null);
    }
  };

  const handleRunInterviewPrep = async () => {
    setIsGenerating('interview');
    try {
      const res = await fetch('/api/opportunity/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunity: activeOpp,
          candidateProfile: appState.profile,
        }),
      });
      const json = await res.json();
      if (res.ok && json.interviewPrep) {
        const updatedInterview = { ...appState.interviewPreps, [activeOpp.id]: json.interviewPrep };
        let newState = { ...appState, interviewPreps: updatedInterview };
        saveAppState({ interviewPreps: updatedInterview });

        newState = logEvent(newState, {
          title: 'Interview Prep Generated',
          description: `Created STAR outlines & predicted questions for ${activeOpp.companyName}`,
          type: 'research',
          opportunityId: activeOpp.id,
        });
        setAppState(newState);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(null);
    }
  };

  const handleUpdateStage = (newStage: ApplicationStage) => {
    const updatedOpp = { ...activeOpp, stage: newStage, updatedAt: new Date().toISOString() };
    const updatedOpps = appState.opportunities.map((o) => (o.id === activeOpp.id ? updatedOpp : o));
    let newState = { ...appState, opportunities: updatedOpps };
    saveAppState({ opportunities: updatedOpps });

    newState = logEvent(newState, {
      title: 'Application Stage Changed',
      description: `Moved ${activeOpp.companyName} stage from "${activeOpp.stage}" to "${newStage}"`,
      type: 'stage_change',
      opportunityId: activeOpp.id,
    });
    setAppState(newState);
  };

  const handleUpdateDraftStatus = (draftId: string, newStatus: 'Draft' | 'Needs review' | 'Approved' | 'Sent manually') => {
    if (!currentOutreach) return;
    const targetDraft = currentOutreach.drafts.find((d) => d.id === draftId);
    const updatedDrafts = currentOutreach.drafts.map((d) =>
      d.id === draftId
        ? {
            ...d,
            status: newStatus,
            approvalTimestamp: newStatus === 'Approved' ? new Date().toISOString() : d.approvalTimestamp,
            manualSentTimestamp: newStatus === 'Sent manually' ? new Date().toISOString() : d.manualSentTimestamp,
          }
        : d
    );
    const updatedOutreachObj = { ...currentOutreach, drafts: updatedDrafts, updatedAt: new Date().toISOString() };
    const newOutreach = { ...appState.contactsOutreach, [activeOpp.id]: updatedOutreachObj };

    // Also update parent opportunity outreachStatus if appropriate
    let newOutreachStatus: OutreachStatus = activeOpp.outreachStatus;
    if (newStatus === 'Approved') newOutreachStatus = 'Approved';
    if (newStatus === 'Sent manually') newOutreachStatus = 'Sent manually';

    const updatedOpp = { ...activeOpp, outreachStatus: newOutreachStatus };
    const updatedOpps = appState.opportunities.map((o) => (o.id === activeOpp.id ? updatedOpp : o));

    let newState = { ...appState, contactsOutreach: newOutreach, opportunities: updatedOpps };
    saveAppState({ contactsOutreach: newOutreach, opportunities: updatedOpps });

    const draftTitle = targetDraft ? targetDraft.type : 'Outreach draft';
    const recipientName = targetDraft?.recipientName ? ` to ${targetDraft.recipientName}` : '';

    newState = logEvent(newState, {
      title: newStatus === 'Approved' ? 'Draft Approved' : newStatus === 'Sent manually' ? 'Outreach Marked Sent' : 'Draft Status Updated',
      description: `${draftTitle}${recipientName} (${activeOpp.companyName}) updated to "${newStatus}"`,
      type: 'outreach',
      opportunityId: activeOpp.id,
    });
    setAppState(newState);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Workspace Header Card */}
      <div className="bg-white border border-[#E5E9E7] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#F3FCF8] text-[#005F58] border border-[#2DD4BF]/30">
                {activeOpp.companyName}
              </span>
              <a
                href={activeOpp.postingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#009B87] hover:underline flex items-center space-x-1"
              >
                <span>View Job Posting</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#171D27] tracking-tight">
              {activeOpp.roleTitle}
            </h1>
            <div className="text-xs text-[#626B78] flex flex-wrap items-center gap-3 pt-1">
              <span>📍 {activeOpp.location}</span>
              <span>•</span>
              <span>💼 {activeOpp.workplaceArrangement} ({activeOpp.employmentType})</span>
              <span>•</span>
              <span>💰 {activeOpp.salary}</span>
            </div>
          </div>

          {/* Role Stage Controls */}
          <div className="flex items-center space-x-3 bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E5E9E7]">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-[#89919B]">
                Application Stage
              </div>
              <select
                value={activeOpp.stage}
                onChange={(e) => handleUpdateStage(e.target.value as ApplicationStage)}
                className="mt-0.5 bg-white border border-[#E5E9E7] rounded-md px-2.5 py-1 text-xs font-semibold text-[#005F58] focus:outline-none focus:border-[#009B87]"
              >
                <option value="Saved">Saved</option>
                <option value="Researching">Researching</option>
                <option value="Preparing">Preparing</option>
                <option value="Ready to apply">Ready to apply</option>
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offer">Offer</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* The 6 Connected Workspace Tabs */}
        <div className="flex border-b border-[#E5E9E7] space-x-2 sm:space-x-6 overflow-x-auto text-xs font-semibold pt-2">
          <button
            onClick={() => setActiveTab('fit')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'fit'
                ? 'border-[#009B87] text-[#009B87]'
                : 'border-transparent text-[#626B78] hover:text-[#171D27]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>1. Fit Assessment</span>
          </button>

          <button
            onClick={() => setActiveTab('brief')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'brief'
                ? 'border-[#009B87] text-[#009B87]'
                : 'border-transparent text-[#626B78] hover:text-[#171D27]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>2. Company Brief</span>
          </button>

          <button
            onClick={() => setActiveTab('materials')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'materials'
                ? 'border-[#009B87] text-[#009B87]'
                : 'border-transparent text-[#626B78] hover:text-[#171D27]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>3. Application Materials</span>
          </button>

          <button
            onClick={() => setActiveTab('outreach')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'outreach'
                ? 'border-[#009B87] text-[#009B87]'
                : 'border-transparent text-[#626B78] hover:text-[#171D27]'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>4. Contacts & Outreach</span>
          </button>

          <button
            onClick={() => setActiveTab('interview')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'interview'
                ? 'border-[#009B87] text-[#009B87]'
                : 'border-transparent text-[#626B78] hover:text-[#171D27]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>5. Interview Prep</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'activity'
                ? 'border-[#009B87] text-[#009B87]'
                : 'border-transparent text-[#626B78] hover:text-[#171D27]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>6. Activity Log</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FIT ASSESSMENT */}
      {activeTab === 'fit' && (
        <div className="space-y-6">
          {!currentFit ? (
            <div className="bg-white border border-[#E5E9E7] rounded-xl p-8 text-center space-y-4">
              <ShieldCheck className="w-10 h-10 text-[#009B87] mx-auto" />
              <div>
                <h3 className="font-bold text-base text-[#171D27]">No Fit Assessment Calculated Yet</h3>
                <p className="text-xs text-[#626B78] mt-1 max-w-md mx-auto">
                  Compare this role against your confirmed candidate profile and evidence library.
                </p>
              </div>
              <button
                onClick={handleRunFitAssessment}
                disabled={isGenerating === 'fit'}
                className="px-4 py-2.5 bg-[#009B87] hover:bg-[#007F73] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating === 'fit' ? 'Analyzing Fit Rubric...' : 'Run Evidence Fit Assessment'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score & Rubric KPI Box */}
              <div className="bg-white border border-[#E5E9E7] rounded-xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="text-center md:text-left space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#89919B]">
                    Evidence Coverage Score
                  </span>
                  <div className="text-4xl font-extrabold text-[#009B87]">
                    {currentFit.evidenceCoverageScore}%
                  </div>
                  <div className="text-[11px] text-[#626B78] italic">
                    Calculated via objective evidence coverage rubric. (Not a hire probability)
                  </div>
                </div>

                <div className="p-4 bg-[#F3FCF8] rounded-xl border border-[#2DD4BF]/30 space-y-1.5">
                  <div className="text-xs font-bold text-[#005F58]">Recommendation Category</div>
                  <div className="text-base font-extrabold text-[#15803D]">
                    {currentFit.categoryRecommendation}
                  </div>
                  <div className="text-[11px] text-[#626B78] dark:text-[#9CA3AF]">
                    Constraints Satisfied:{' '}
                    {!currentFit.weightedRubricBreakdown?.isConstraintBlocked ? 'Yes (100%)' : 'No'}
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <button
                    onClick={handleRunFitAssessment}
                    disabled={isGenerating === 'fit'}
                    className="px-3 py-1.5 border border-[#E5E9E7] hover:bg-[#F7FAF8] text-xs font-semibold text-[#009B87] rounded-lg inline-flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-evaluate Fit</span>
                  </button>
                  <div className="text-[11px] text-[#89919B]">
                    Last assessed: {currentFit.assessedAt ? new Date(currentFit.assessedAt).toLocaleDateString() : 'Just now'}
                  </div>
                </div>
              </div>

              {/* Strengths & Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-[#E5E9E7] rounded-xl p-5 shadow-xs space-y-3">
                  <h3 className="font-semibold text-sm text-[#15803D] flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Primary Evidence Strengths ({currentFit.strengths.length})</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-[#171D27]">
                    {currentFit.strengths.map((s, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-[#15803D] font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white border border-[#E5E9E7] rounded-xl p-5 shadow-xs space-y-3">
                  <h3 className="font-semibold text-sm text-[#B45309] flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Identified Gaps & Transferable Experience</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-[#171D27]">
                    {currentFit.gaps.map((g, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-[#B45309] font-bold">•</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Requirement-by-Requirement Table */}
              <div className="bg-white border border-[#E5E9E7] rounded-xl overflow-hidden shadow-xs space-y-3">
                <div className="p-4 bg-[#FAF9F6] border-b border-[#E5E9E7] font-semibold text-xs text-[#171D27] uppercase tracking-wider">
                  Requirement-by-Requirement Evidence Matrix
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF9F6] text-[#89919B] border-b border-[#E5E9E7] font-semibold text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Job Requirement</th>
                        <th className="p-3">Candidate Evidence</th>
                        <th className="p-3">Assessment</th>
                        <th className="p-3">Explanation & Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF1EF]">
                      {currentFit.requirementsTable.map((req, i) => {
                        let badgeClass = 'bg-gray-100 text-gray-700';
                        if (req.assessment === 'strong match') badgeClass = 'bg-[#15803D]/10 text-[#15803D] font-semibold';
                        if (req.assessment === 'partial match') badgeClass = 'bg-[#B45309]/10 text-[#B45309] font-semibold';
                        if (req.assessment === 'gap') badgeClass = 'bg-[#DC2626]/10 text-[#DC2626] font-semibold';

                        return (
                          <tr key={i} className="hover:bg-[#F7FAF8]">
                            <td className="p-3 font-semibold text-[#171D27] max-w-xs">
                              {req.jobRequirement}
                              {req.category === 'Constraint' && (
                                <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-[#B45309]/10 text-[#B45309] dark:bg-amber-950 dark:text-amber-300 rounded font-bold">
                                  Eligibility Constraint
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-[#626B78] max-w-xs">{req.candidateEvidence}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[11px] ${badgeClass}`}>
                                {req.assessment}
                              </span>
                            </td>
                            <td className="p-3 text-[#626B78]">
                              <div>{req.explanation}</div>
                              <div className="text-[11px] text-[#009B87] font-medium mt-0.5">
                                Action: {req.suggestedNextAction}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPANY RESEARCH BRIEF */}
      {activeTab === 'brief' && (
        <div className="space-y-6">
          {!currentBrief ? (
            <div className="bg-white border border-[#E5E9E7] rounded-xl p-8 text-center space-y-4">
              <Building2 className="w-10 h-10 text-[#009B87] mx-auto" />
              <div>
                <h3 className="font-bold text-base text-[#171D27]">No Company Research Brief Generated Yet</h3>
                <p className="text-xs text-[#626B78] mt-1 max-w-md mx-auto">
                  Synthesize public research, recent developments, products, and culture statements.
                </p>
              </div>
              <button
                onClick={handleRunResearchBrief}
                disabled={isGenerating === 'brief'}
                className="px-4 py-2.5 bg-[#009B87] hover:bg-[#007F73] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating === 'brief' ? 'Synthesizing Public Research...' : 'Generate Company Research Brief'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1B2230] border border-[#E5E9E7] dark:border-[#2A3447] rounded-xl p-6 shadow-xs space-y-4">
                {/* Firecrawl AI Grounding & Privacy Header Bar */}
                <div className="p-3 bg-[#F3FCF8] dark:bg-[#122825] border border-[#2DD4BF]/30 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    {currentBrief.firecrawlGrounded ? (
                      <span className="px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider bg-[#15803D]/10 text-[#15803D] dark:text-emerald-400 border border-[#15803D]/30 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Firecrawl AI Grounded</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-md font-medium text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        Public Domain Synthesis
                      </span>
                    )}
                    <span className="text-[11px] text-[#005F58] dark:text-[#2DD4BF] font-semibold">
                      {currentBrief.privacyAudit || 'Privacy Guardrail: Zero candidate PII transmitted to external tools.'}
                    </span>
                  </div>
                  <button
                    onClick={handleRunResearchBrief}
                    className="text-xs text-[#009B87] dark:text-[#2DD4BF] hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh Brief</span>
                  </button>
                </div>

                <div className="flex items-center justify-between border-b border-[#EEF1EF] dark:border-[#232C3D] pb-3">
                  <h3 className="font-bold text-base text-[#171D27] dark:text-[#F3F4F6]">Company Overview & Market Positioning</h3>
                </div>
                <p className="text-xs text-[#171D27] leading-relaxed">{currentBrief.companyOverview}</p>
                <div className="text-xs text-[#626B78] bg-[#FAF9F6] p-3 rounded-lg border border-[#E5E9E7]">
                  <strong className="text-[#171D27]">Customers & Target Market:</strong> {currentBrief.customersAndMarket}
                </div>
              </div>

              {/* Products & Developments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-[#E5E9E7] rounded-xl p-5 shadow-xs space-y-3">
                  <h4 className="font-semibold text-xs text-[#89919B] uppercase tracking-wider">
                    Core Products & Services
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#171D27]">
                    {currentBrief.productsOrServices.map((p, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <span className="text-[#009B87]">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white border border-[#E5E9E7] rounded-xl p-5 shadow-xs space-y-3">
                  <h4 className="font-semibold text-xs text-[#89919B] uppercase tracking-wider">
                    Recent Verified Developments
                  </h4>
                  <div className="space-y-2">
                    {currentBrief.recentDevelopments.map((dev, i) => (
                      <div key={i} className="p-2.5 bg-[#FAF9F6] rounded-lg border border-[#E5E9E7] text-xs">
                        <div className="font-semibold text-[#171D27]">{dev.headline}</div>
                        <div className="text-[#626B78] mt-0.5">{dev.summary}</div>
                        <div className="text-[10px] text-[#89919B] mt-1 flex items-center justify-between">
                          <span>Date: {dev.date}</span>
                          {dev.sourceUrl && (
                            <a
                              href={dev.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#009B87] hover:underline"
                            >
                              Source: {dev.sourceTitle || 'Public Release'}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Research Claims Audit Table */}
              <div className="bg-white border border-[#E5E9E7] rounded-xl overflow-hidden shadow-xs">
                <div className="p-4 bg-[#FAF9F6] border-b border-[#E5E9E7] font-semibold text-xs text-[#171D27] uppercase tracking-wider">
                  Sourced Claims & Fact Distinctions ({currentBrief.researchClaims.length})
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF9F6] text-[#89919B] border-b border-[#E5E9E7] font-semibold text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Claim Statement</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Source & Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF1EF]">
                      {currentBrief.researchClaims.map((claim, i) => (
                        <tr key={i} className="hover:bg-[#F7FAF8]">
                          <td className="p-3 text-[#171D27]">{claim.statement}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                claim.type === 'factual'
                                  ? 'bg-[#15803D]/10 text-[#15803D]'
                                  : 'bg-[#0284C7]/10 text-[#0284C7]'
                              }`}
                            >
                              {claim.type}
                            </span>
                          </td>
                          <td className="p-3 text-[#626B78]">
                            {claim.sourceName || 'Web Source'} ({claim.date})
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: APPLICATION MATERIALS */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          {!currentMaterials ? (
            <div className="bg-white border border-[#E5E9E7] rounded-xl p-8 text-center space-y-4">
              <FileText className="w-10 h-10 text-[#009B87] mx-auto" />
              <div>
                <h3 className="font-bold text-base text-[#171D27]">No Tailored Materials Generated Yet</h3>
                <p className="text-xs text-[#626B78] mt-1 max-w-md mx-auto">
                  Generate tailored résumé, cover letter, and application responses strictly grounded in your verified facts.
                </p>
              </div>
              <button
                onClick={handleRunMaterials}
                disabled={isGenerating === 'materials'}
                className="px-4 py-2.5 bg-[#009B87] hover:bg-[#007F73] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating === 'materials' ? 'Drafting Tailored Materials...' : 'Generate Tailored Application Package'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white border border-[#E5E9E7] rounded-xl shadow-xs">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-[#171D27]">Package Version #{currentMaterials.version}</span>
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="px-3 py-1.5 border border-[#E5E9E7] hover:bg-[#F7FAF8] text-xs font-semibold text-[#171D27] rounded-lg inline-flex items-center space-x-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / PDF</span>
                  </button>
                  <button
                    onClick={() => {
                      const text = `${currentMaterials.tailoredResume.summary}\n\nCOVER LETTER:\n${currentMaterials.coverLetter.bodyParagraphs.join('\n\n')}`;
                      const blob = new Blob([text], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Tailored_Application_${activeOpp.companyName}.txt`;
                      a.click();
                    }}
                    className="px-3 py-1.5 border border-[#E5E9E7] hover:bg-[#F7FAF8] text-xs font-semibold text-[#171D27] rounded-lg inline-flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download TXT/DOCX</span>
                  </button>
                </div>

                <button
                  onClick={handleRunMaterials}
                  disabled={isGenerating === 'materials'}
                  className="px-3 py-1.5 bg-[#009B87] hover:bg-[#007F73] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate Package</span>
                </button>
              </div>

              {/* Side-by-Side Resume View */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Master Source Resume */}
                <div className="bg-[#FAF9F6] border border-[#E5E9E7] rounded-xl p-5 space-y-3">
                  <div className="text-xs font-bold text-[#89919B] uppercase tracking-wider pb-2 border-b border-[#E5E9E7]">
                    Master Source Resume (Facts Only)
                  </div>
                  <div className="text-xs text-[#171D27] space-y-3">
                    <p className="font-semibold">{appState.profile.summary}</p>
                    {appState.profile.employment.map((emp) => (
                      <div key={emp.id} className="space-y-1">
                        <div className="font-bold text-[#171D27]">{emp.role} @ {emp.company}</div>
                        <ul className="list-disc pl-4 text-[#626B78] space-y-1">
                          {emp.highlights.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tailored Resume View */}
                <div className="bg-white border-2 border-[#009B87]/30 rounded-xl p-5 shadow-xs space-y-4">
                  <div className="text-xs font-bold text-[#009B87] uppercase tracking-wider pb-2 border-b border-[#EEF1EF] flex items-center justify-between">
                    <span>Tailored Resume for {activeOpp.companyName}</span>
                    <span className="text-[10px] bg-[#EAFBF5] text-[#005F58] px-2 py-0.5 rounded font-semibold">
                      Truth-Verified
                    </span>
                  </div>

                  <div className="text-xs space-y-4">
                    <div>
                      <div className="font-bold text-[#171D27] mb-1">Tailored Executive Summary</div>
                      <p className="text-[#626B78] bg-[#F7FAF8] p-3 rounded-lg border border-[#EEF1EF]">
                        {currentMaterials.tailoredResume.summary}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="font-bold text-[#171D27]">Reordered Relevant Employment</div>
                      {currentMaterials.tailoredResume.employment.map((emp) => (
                        <div key={emp.id} className="p-3 border border-[#E5E9E7] rounded-lg space-y-2">
                          <div className="font-bold text-[#171D27]">{emp.title} — {emp.company}</div>
                          <div className="text-[11px] text-[#89919B]">{emp.dates}</div>
                          <ul className="list-disc pl-4 text-[#626B78] space-y-1">
                            {emp.highlights.map((h, i) => (
                              <li key={i}>{h}</li>
                            ))}
                          </ul>
                          <div className="text-[11px] text-[#009B87] font-medium pt-1 border-t border-[#EEF1EF]">
                            Tailoring Rationale: {emp.rationale}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Letter Document Box */}
              <div className="bg-white border border-[#E5E9E7] rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EEF1EF]">
                  <h3 className="font-bold text-base text-[#171D27]">Tailored Cover Letter</h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentMaterials.coverLetter.bodyParagraphs.join('\n\n'));
                      alert('Cover letter text copied!');
                    }}
                    className="text-xs text-[#009B87] font-semibold hover:underline flex items-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </button>
                </div>

                <div className="text-xs text-[#171D27] space-y-3 font-serif leading-relaxed max-w-3xl mx-auto p-6 bg-[#FAF9F6] border border-[#E5E9E7] rounded-xl shadow-xs">
                  <div className="font-bold text-sm font-sans text-[#009B87]">{currentMaterials.coverLetter.subject}</div>
                  <div className="font-sans font-medium">{currentMaterials.coverLetter.salutation}</div>
                  {currentMaterials.coverLetter.bodyParagraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                  <div className="pt-2 font-sans font-medium whitespace-pre-line">{currentMaterials.coverLetter.closing}</div>
                </div>
              </div>

              {/* Audit Log of Changes Made */}
              <div className="bg-white border border-[#E5E9E7] rounded-xl p-5 shadow-xs space-y-3">
                <h4 className="font-bold text-xs text-[#89919B] uppercase tracking-wider">
                  Tailoring Audit Trail & Evidence Provenance
                </h4>
                <div className="space-y-2">
                  {currentMaterials.majorChangesExplanation.map((ch, i) => (
                    <div key={i} className="p-3 bg-[#FAF9F6] rounded-lg border border-[#E5E9E7] text-xs space-y-1">
                      <div className="font-bold text-[#171D27]">{ch.section}: {ch.change}</div>
                      <div className="text-[#626B78]">Reason: {ch.reason}</div>
                      <div className="text-[11px] text-[#009B87] font-medium">Backed By Evidence: &quot;{ch.evidenceClaim}&quot;</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CONTACTS & OUTREACH */}
      {activeTab === 'outreach' && (
        <div className="space-y-6">
          {!currentOutreach ? (
            <div className="bg-white border border-[#E5E9E7] rounded-xl p-8 text-center space-y-4">
              <Send className="w-10 h-10 text-[#009B87] mx-auto" />
              <div>
                <h3 className="font-bold text-base text-[#171D27]">No Contacts or Outreach Drafts Prepared</h3>
                <p className="text-xs text-[#626B78] mt-1 max-w-md mx-auto">
                  Discover professional contacts and generate personalized outreach messages.
                </p>
              </div>
              <button
                onClick={handleRunContactsOutreach}
                disabled={isGenerating === 'outreach'}
                className="px-4 py-2.5 bg-[#009B87] hover:bg-[#007F73] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating === 'outreach' ? 'Searching Contacts & Drafts...' : 'Prepare Contacts & Outreach Drafts'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Contacts Table */}
              <div className="bg-white border border-[#E5E9E7] rounded-xl overflow-hidden shadow-xs">
                <div className="p-4 bg-[#FAF9F6] border-b border-[#E5E9E7] flex items-center justify-between">
                  <div className="font-semibold text-xs text-[#171D27] uppercase tracking-wider">
                    Identified Professional Contacts ({currentOutreach.contacts.length})
                  </div>
                  <button
                    onClick={handleRunContactsOutreach}
                    className="text-xs text-[#009B87] font-semibold hover:underline flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Search Again</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF9F6] text-[#89919B] border-b border-[#E5E9E7] font-semibold text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Contact Name</th>
                        <th className="p-3">Title & Company</th>
                        <th className="p-3">Relationship Status</th>
                        <th className="p-3">Email & Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF1EF]">
                      {currentOutreach.contacts.map((c) => (
                        <tr key={c.id} className="hover:bg-[#F7FAF8] dark:hover:bg-[#222C3D]">
                          <td className="p-3 font-semibold text-[#171D27] dark:text-[#F3F4F6]">
                            {c.name}
                            <div className="text-[10px] text-[#626B78] dark:text-[#9CA3AF]">{c.evidenceRelevantToOpening || c.evidenceWorksAtCompany}</div>
                          </td>
                          <td className="p-3 text-[#626B78] dark:text-[#9CA3AF]">
                            <div>{c.currentTitle}</div>
                            <div className="text-[10px] text-[#89919B]">{c.company}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAFBF5] dark:bg-[#12332F] text-[#005F58] dark:text-[#2DD4BF]">
                              {c.relationshipStatus}
                            </span>
                          </td>
                          <td className="p-3 text-[#626B78] dark:text-[#9CA3AF]">
                            <div>{c.email || 'No email found'}</div>
                            <div className="text-[10px] text-[#15803D] dark:text-emerald-400 font-semibold">
                              {c.emailVerificationStatus ? `Status: ${c.emailVerificationStatus}` : 'Unverified'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Outreach Drafts List */}
              <div className="space-y-4">
                <h3 className="font-bold text-base text-[#171D27]">Tailored Outreach Drafts ({currentOutreach.drafts.length})</h3>

                {currentOutreach.drafts.map((draft) => {
                  let statusBadgeClass = 'bg-[#B45309]/10 text-[#B45309]';
                  if (draft.status === 'Approved') statusBadgeClass = 'bg-[#15803D]/10 text-[#15803D] font-bold';
                  if (draft.status === 'Sent manually') statusBadgeClass = 'bg-[#009B87]/10 text-[#009B87] font-bold';

                  return (
                    <div key={draft.id} className="bg-white dark:bg-[#1B2230] border border-[#E5E9E7] dark:border-[#2A3447] rounded-xl p-5 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-[#EEF1EF] dark:border-[#232C3D]">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-[#171D27] dark:text-[#F3F4F6]">{draft.type}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs ${statusBadgeClass}`}>
                              {draft.status}
                            </span>
                          </div>
                          <div className="text-xs text-[#626B78] dark:text-[#9CA3AF] mt-0.5">
                            Recipient: {draft.recipientName} ({draft.recipientTitle})
                          </div>
                        </div>

                        {/* Approval / Sent Toggles */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              handleUpdateDraftStatus(
                                draft.id,
                                draft.status === 'Approved' ? 'Needs review' : 'Approved'
                              )
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                              draft.status === 'Approved'
                                ? 'bg-[#15803D] text-white'
                                : 'bg-[#EAFBF5] dark:bg-[#12332F] text-[#005F58] dark:text-[#2DD4BF] hover:bg-[#2DD4BF]/30'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{draft.status === 'Approved' ? 'Approved' : 'Approve Draft'}</span>
                          </button>

                          <button
                            onClick={() =>
                              handleUpdateDraftStatus(
                                draft.id,
                                draft.status === 'Sent manually' ? 'Approved' : 'Sent manually'
                              )
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer ${
                              draft.status === 'Sent manually'
                                ? 'bg-[#009B87] text-white'
                                : 'border border-[#E5E9E7] dark:border-[#2A3447] text-[#626B78] dark:text-[#9CA3AF] hover:bg-[#F7FAF8] dark:hover:bg-[#222C3D]'
                            }`}
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{draft.status === 'Sent manually' ? 'Sent' : 'Mark Sent'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Subject & Body */}
                      <div className="space-y-2 bg-[#FAF9F6] p-4 rounded-xl border border-[#E5E9E7] text-xs">
                        <div className="font-bold text-[#171D27]">Subject: {draft.subject}</div>
                        <div className="text-[#171D27] whitespace-pre-line leading-relaxed">{draft.body}</div>
                      </div>

                      {/* Supporting Evidence Connection */}
                      <div className="text-[11px] text-[#626B78] space-y-1">
                        <div>
                          <strong className="text-[#171D27]">Sourced Company Detail:</strong> {draft.companyDetailUsed}
                        </div>
                        <div>
                          <strong className="text-[#171D27]">Candidate Accomplishment Used:</strong> {draft.candidateAccomplishmentUsed}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: INTERVIEW PREP */}
      {activeTab === 'interview' && (
        <div className="space-y-6">
          {!currentInterview ? (
            <div className="bg-white border border-[#E5E9E7] rounded-xl p-8 text-center space-y-4">
              <MessageSquare className="w-10 h-10 text-[#009B87] mx-auto" />
              <div>
                <h3 className="font-bold text-base text-[#171D27]">No Interview Preparation Generated Yet</h3>
                <p className="text-xs text-[#626B78] mt-1 max-w-md mx-auto">
                  Generate predicted questions, real STAR story outlines, and interviewer questions.
                </p>
              </div>
              <button
                onClick={handleRunInterviewPrep}
                disabled={isGenerating === 'interview'}
                className="px-4 py-2.5 bg-[#009B87] hover:bg-[#007F73] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating === 'interview' ? 'Drafting STAR Prep...' : 'Generate Interview Preparation'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-[#171D27]">
                  Predicted Questions & STAR Stories ({currentInterview.predictedQuestions.length})
                </h3>
                <button
                  onClick={handleRunInterviewPrep}
                  className="text-xs text-[#009B87] font-semibold hover:underline flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Prep</span>
                </button>
              </div>

              {currentInterview.predictedQuestions.map((q, i) => (
                <div key={i} className="bg-white border border-[#E5E9E7] rounded-xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#EEF1EF]">
                    <span className="font-bold text-sm text-[#171D27]">{q.question}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAFBF5] text-[#005F58]">
                      {q.category}
                    </span>
                  </div>

                  <div className="text-xs text-[#626B78]">
                    <strong className="text-[#171D27]">Candidate Real Example:</strong> {q.candidateExample}
                  </div>

                  {/* STAR Outline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#FAF9F6] p-3 rounded-lg border border-[#E5E9E7]">
                    <div>
                      <strong className="text-[#009B87]">Situation:</strong> {q.starOutline.situation}
                    </div>
                    <div>
                      <strong className="text-[#009B87]">Task:</strong> {q.starOutline.task}
                    </div>
                    <div>
                      <strong className="text-[#009B87]">Action:</strong> {q.starOutline.action}
                    </div>
                    <div>
                      <strong className="text-[#009B87]">Result:</strong> {q.starOutline.result}
                    </div>
                  </div>
                </div>
              ))}

              {/* Questions to Ask Interviewer */}
              <div className="bg-white border border-[#E5E9E7] rounded-xl p-5 shadow-xs space-y-3">
                <h4 className="font-bold text-xs text-[#89919B] uppercase tracking-wider">
                  Strategic Questions to Ask Interviewer
                </h4>
                <ul className="space-y-1.5 text-xs text-[#171D27]">
                  {currentInterview.questionsToAskInterviewer.map((q, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-[#009B87] font-bold">?</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: ACTIVITY LOG & NOTES */}
      {activeTab === 'activity' && (
        <div className="bg-white border border-[#E5E9E7] rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#171D27]">Opportunity Notes & Stage History</h3>
          <textarea
            rows={4}
            value={activeOpp.notes || ''}
            onChange={(e) => {
              const updated = { ...activeOpp, notes: e.target.value };
              const updatedOpps = appState.opportunities.map((o) => (o.id === activeOpp.id ? updated : o));
              setAppState({ ...appState, opportunities: updatedOpps });
              saveAppState({ opportunities: updatedOpps });
            }}
            placeholder="Add private interview notes, recruiter feedback, salary discussion notes..."
            className="w-full p-3 border border-[#E5E9E7] rounded-lg text-xs focus:border-[#009B87]"
          />
        </div>
      )}
    </div>
  );
};
