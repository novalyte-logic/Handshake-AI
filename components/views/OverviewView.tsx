'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Send,
  MessageSquare,
  ShieldAlert,
  UserCheck,
  FileText,
  Sparkles,
  Building2,
  Layers,
  ChevronRight,
  BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
  Cell,
} from 'recharts';
import { AppStateData } from '@/lib/store';
import { ApplicationStage, OutreachStatus, ActivityType } from '@/lib/types';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { DEMO_NOTICE_TEXT } from '@/lib/mock-data';

interface OverviewViewProps {
  appState: AppStateData;
  setActiveNav: (nav: string) => void;
  setActiveOpportunityId: (id: string) => void;
  onOpenImportModal: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  appState,
  setActiveNav,
  setActiveOpportunityId,
  onOpenImportModal,
}) => {
  const { opportunities, fitAssessments, materials, activities, profile } = appState;
  const [activityFilter, setActivityFilter] = useState<string>('all');

  const isDemo = Boolean(profile.isDemo);

  // Derive Current Guided Step and Primary CTA
  const hasProfile = Boolean(profile.name && profile.employment && profile.employment.length > 0);
  const hasOpportunities = opportunities.length > 0;
  const firstOpp = opportunities[0];
  const firstFit = firstOpp ? fitAssessments[firstOpp.id] : null;
  const firstMats = firstOpp ? materials[firstOpp.id] : null;

  let currentStepNum = 1;
  let guidedTitle = '1. Complete Master Candidate Profile';
  let guidedDescription = 'Upload your resume or enter your verified career accomplishments into the Master Profile.';
  let guidedCtaText = 'Create candidate profile';
  let guidedAction = () => setActiveNav('profile');

  if (!hasProfile) {
    currentStepNum = 1;
    guidedTitle = '1. Complete Master Candidate Profile';
    guidedDescription = 'Your master profile establishes the evidence foundation for all tailored materials.';
    guidedCtaText = 'Create candidate profile';
    guidedAction = () => setActiveNav('profile');
  } else if (!hasOpportunities) {
    currentStepNum = 2;
    guidedTitle = '2. Add Your First Job Opportunity';
    guidedDescription = 'Paste a job description or URL to import and extract structured role requirements.';
    guidedCtaText = 'Add your first opportunity';
    guidedAction = () => {
      setActiveNav('opportunities');
      onOpenImportModal();
    };
  } else if (!firstFit || firstFit.status === 'Not assessed') {
    currentStepNum = 3;
    guidedTitle = `3. Assess Evidence Fit for ${firstOpp.companyName}`;
    guidedDescription = 'Run an evidence coverage assessment against your confirmed profile facts.';
    guidedCtaText = 'Run evidence fit assessment';
    guidedAction = () => {
      setActiveOpportunityId(firstOpp.id);
      setActiveNav('workspace');
    };
  } else if (!firstMats) {
    currentStepNum = 4;
    guidedTitle = `4. Prepare Application Materials for ${firstOpp.companyName}`;
    guidedDescription = 'Generate a tailored resume and cover letter strictly grounded in verified evidence.';
    guidedCtaText = 'Prepare application materials';
    guidedAction = () => {
      setActiveOpportunityId(firstOpp.id);
      setActiveNav('workspace');
    };
  } else {
    currentStepNum = 5;
    guidedTitle = `5. Research & Review Outreach for ${firstOpp.companyName}`;
    guidedDescription = 'Review public research claims, verify contacts, and approve personalized outreach drafts.';
    guidedCtaText = 'Review outreach drafts';
    guidedAction = () => {
      setActiveOpportunityId(firstOpp.id);
      setActiveNav('workspace');
    };
  }

  // Pipeline Stage Counts
  const stages: ApplicationStage[] = [
    'Saved',
    'Researching',
    'Preparing',
    'Ready to apply',
    'Applied',
    'Interviewing',
    'Offer',
    'Closed',
  ];

  const stageCounts = stages.reduce((acc, stage) => {
    acc[stage] = opportunities.filter((o) => o.stage === stage).length;
    return acc;
  }, {} as Record<ApplicationStage, number>);

  const outreachStatuses: OutreachStatus[] = [
    'No draft',
    'Draft',
    'Needs review',
    'Approved',
    'Sent manually',
    'Response received',
  ];

  const outreachCounts = outreachStatuses.reduce((acc, status) => {
    acc[status] = opportunities.filter((o) => o.outreachStatus === status).length;
    return acc;
  }, {} as Record<OutreachStatus, number>);

  // Recharts Data 1: Opportunities by Stage
  const stageChartData = stages.map((stage) => ({
    stage,
    count: stageCounts[stage] || 0,
  }));

  // Recharts Data 2: Weekly Progress & Actions Timeline
  const getWeeklyTimelineData = () => {
    const reorderedDays: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      reorderedDays.push(dayName);
    }

    const dayMap: Record<string, { outreach: number; materials: number; stage_change: number; total: number }> = {};
    reorderedDays.forEach((day) => {
      dayMap[day] = { outreach: 0, materials: 0, stage_change: 0, total: 0 };
    });

    activities.forEach((act) => {
      try {
        const actDate = new Date(act.timestamp);
        const dayName = actDate.toLocaleDateString('en-US', { weekday: 'short' });
        if (dayMap[dayName]) {
          if (act.type === 'outreach') dayMap[dayName].outreach += 1;
          else if (act.type === 'materials') dayMap[dayName].materials += 1;
          else if (act.type === 'stage_change') dayMap[dayName].stage_change += 1;
          dayMap[dayName].total += 1;
        }
      } catch {
        // Fallback
      }
    });

    return reorderedDays.map((day) => ({
      day,
      outreach: dayMap[day]?.outreach || 0,
      materials: dayMap[day]?.materials || 0,
      stage_change: dayMap[day]?.stage_change || 0,
      total: dayMap[day]?.total || 0,
    }));
  };

  const weeklyActivityData = getWeeklyTimelineData();

  const urgentOpportunities = opportunities.filter(
    (o) =>
      o.outreachStatus === 'Needs review' ||
      o.nextAction ||
      o.stage === 'Preparing' ||
      o.stage === 'Ready to apply'
  );

  const highPriority = [...opportunities].sort((a, b) => {
    const scoreA = fitAssessments[a.id]?.evidenceCoverageScore || 0;
    const scoreB = fitAssessments[b.id]?.evidenceCoverageScore || 0;
    return scoreB - scoreA;
  });

  const handleSelectOpp = (id: string) => {
    setActiveOpportunityId(id);
    setActiveNav('workspace');
  };

  const unconfirmedClaims = profile.evidenceLibrary.filter(
    (e) => e.status !== 'user-confirmed'
  ).length;

  const filteredActivities = activities.filter((act) => {
    if (activityFilter === 'all') return true;
    if (activityFilter === 'stage_change') return act.type === 'stage_change';
    if (activityFilter === 'outreach') return act.type === 'outreach';
    if (activityFilter === 'materials') return act.type === 'materials';
    if (activityFilter === 'profile') return act.type === 'profile';
    if (activityFilter === 'opportunity') return act.type === 'opportunity';
    if (activityFilter === 'research') return act.type === 'research' || act.type === 'note';
    return true;
  });

  const getActivityTypeMeta = (type: ActivityType) => {
    switch (type) {
      case 'stage_change':
        return { icon: TrendingUp, badgeBg: 'bg-[#EAFBF5]', badgeText: 'text-[#005F58]', label: 'Stage Change' };
      case 'outreach':
        return { icon: Send, badgeBg: 'bg-[#0284C7]/10', badgeText: 'text-[#0284C7]', label: 'Outreach' };
      case 'materials':
        return { icon: FileText, badgeBg: 'bg-[#15803D]/10', badgeText: 'text-[#15803D]', label: 'Materials' };
      case 'profile':
        return { icon: UserCheck, badgeBg: 'bg-purple-100 dark:bg-purple-950', badgeText: 'text-purple-800 dark:text-purple-300', label: 'Profile' };
      case 'opportunity':
        return { icon: Briefcase, badgeBg: 'bg-teal-100 dark:bg-teal-950', badgeText: 'text-teal-900 dark:text-teal-200', label: 'Opportunity' };
      case 'research':
        return { icon: Sparkles, badgeBg: 'bg-emerald-100 dark:bg-emerald-950', badgeText: 'text-emerald-800 dark:text-emerald-300', label: 'Research' };
      case 'note':
      default:
        return { icon: Clock, badgeBg: 'bg-gray-100 dark:bg-gray-800', badgeText: 'text-gray-700 dark:text-gray-300', label: 'Note' };
    }
  };

  const formatActivityTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E5E9E7] dark:border-[#2A3447]">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#171D27] dark:text-[#F3F4F6] tracking-tight">
              Application Overview & Analytics
            </h1>
            {isDemo && <ProvenanceBadge label="Demo" note={DEMO_NOTICE_TEXT} />}
          </div>
          <p className="text-sm text-[#626B78] dark:text-[#9CA3AF] mt-1">
            Track active opportunities, evidence coverage, outreach readiness, and weekly progress visual analytics.
          </p>
        </div>
        <button
          onClick={onOpenImportModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#009B87] hover:bg-[#007F73] text-white rounded-lg text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Briefcase className="w-4 h-4" />
          <span>Import New Role</span>
        </button>
      </div>

      {/* Demo Workspace Banner Notice */}
      {isDemo && (
        <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl flex items-center justify-between text-xs text-purple-900 dark:text-purple-200">
          <div className="flex items-center space-x-3">
            <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
            <div>
              <div className="font-bold text-sm">Fictional Demo Workspace Active</div>
              <div>{DEMO_NOTICE_TEXT}</div>
            </div>
          </div>
          <ProvenanceBadge label="Demo" note="Fictional dataset" />
        </div>
      )}

      {/* Unconfirmed Evidence Banner if present */}
      {!isDemo && unconfirmedClaims > 0 && (
        <div className="p-4 bg-[#FFFBEB] dark:bg-amber-950/40 border border-[#FCD34D] dark:border-amber-800 rounded-xl flex items-center justify-between text-xs text-[#78350F] dark:text-amber-200">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 text-[#B45309] dark:text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-sm text-[#92400E] dark:text-amber-300">
                {unconfirmedClaims} imported evidence claims require user verification
              </div>
              <div>
                Tailored materials run strictly on confirmed facts. Please verify newly imported resume claims.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveNav('profile')}
            className="text-xs font-semibold px-3 py-1.5 bg-[#92400E] text-white rounded-lg hover:bg-[#78350F] transition-colors shrink-0 cursor-pointer"
          >
            Review Evidence
          </button>
        </div>
      )}

      {/* GUIDED PRIMARY WORKFLOW CTA CARD */}
      <div className="bg-white dark:bg-[#1B2230] border-2 border-[#009B87]/40 dark:border-[#2DD4BF]/40 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EEF1EF] dark:border-[#232C3D]">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#EAFBF5] dark:bg-[#12332F] text-[#009B87] dark:text-[#2DD4BF]">
              Guided Primary Workflow — Step {currentStepNum} of 6
            </span>
          </div>
          <span className="text-xs font-medium text-[#89919B]">Next Action Guide</span>
        </div>

        {/* Workflow Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[11px] font-semibold">
          {[
            '1. Profile',
            '2. Add Role',
            '3. Fit Assessment',
            '4. Materials',
            '5. Research',
            '6. Outreach',
          ].map((stepName, i) => {
            const isDone = i + 1 < currentStepNum;
            const isCurrent = i + 1 === currentStepNum;
            return (
              <div
                key={i}
                className={`p-2 rounded-lg text-center border transition-colors ${
                  isCurrent
                    ? 'bg-[#009B87] text-white font-bold border-[#009B87]'
                    : isDone
                    ? 'bg-[#EAFBF5] dark:bg-[#12332F] text-[#005F58] dark:text-[#2DD4BF] border-[#2DD4BF]/30'
                    : 'bg-[#FAF9F6] dark:bg-[#161D2A] text-[#89919B] border-[#E5E9E7] dark:border-[#2A3447]'
                }`}
              >
                {stepName} {isDone && '✓'}
              </div>
            );
          })}
        </div>

        {/* Primary CTA Box */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-[#F3FCF8] dark:bg-[#122825] border border-[#2DD4BF]/30 rounded-xl">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-[#171D27] dark:text-[#F3F4F6]">{guidedTitle}</h3>
            <p className="text-xs text-[#626B78] dark:text-[#9CA3AF]">{guidedDescription}</p>
          </div>

          <button
            onClick={guidedAction}
            className="px-5 py-2.5 bg-[#009B87] hover:bg-[#007F73] text-white text-xs font-bold rounded-lg shadow-xs transition-colors inline-flex items-center space-x-2 shrink-0 cursor-pointer"
          >
            <span>{guidedCtaText}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RECHARTS VISUALIZATION DASHBOARD SECTION */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#171D27] dark:text-[#F3F4F6] flex items-center space-x-2">
          <BarChart2 className="w-5 h-5 text-[#009B87] dark:text-[#2DD4BF]" />
          <span>Progress & Activity Visualizations</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Opportunities by Stage Bar Chart */}
          <div className="bg-white dark:bg-[#1B2230] border border-[#E5E9E7] dark:border-[#2A3447] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEF1EF] dark:border-[#232C3D]">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-[#009B87] dark:text-[#2DD4BF]" />
                <h3 className="font-bold text-sm text-[#171D27] dark:text-[#F3F4F6]">
                  Opportunities by Pipeline Stage
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-[#89919B]">
                Total Roles: {opportunities.length}
              </span>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF1EF" />
                  <XAxis
                    dataKey="stage"
                    tick={{ fontSize: 10, fill: '#89919B' }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#89919B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1B2230',
                      borderColor: '#2A3447',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#F3F4F6',
                    }}
                    formatter={(value: any) => [`${value ?? 0} opportunities`, 'Count']}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stageChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.count > 0 ? '#009B87' : '#E5E9E7'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Weekly Progress & Outreach Activity Area Chart */}
          <div className="bg-white dark:bg-[#1B2230] border border-[#E5E9E7] dark:border-[#2A3447] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEF1EF] dark:border-[#232C3D]">
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4 text-[#009B87] dark:text-[#2DD4BF]" />
                <h3 className="font-bold text-sm text-[#171D27] dark:text-[#F3F4F6]">
                  Weekly Actions & Outreach Volume
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-[#009B87] dark:text-[#2DD4BF]">
                {activities.length} total events logged
              </span>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOutreach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#009B87" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#009B87" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorMaterials" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF1EF" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#89919B' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#89919B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1B2230',
                      borderColor: '#2A3447',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#F3F4F6',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area
                    type="monotone"
                    dataKey="outreach"
                    name="Outreach Actions"
                    stroke="#009B87"
                    fillOpacity={1}
                    fill="url(#colorOutreach)"
                  />
                  <Area
                    type="monotone"
                    dataKey="materials"
                    name="Tailored Materials"
                    stroke="#2DD4BF"
                    fillOpacity={1}
                    fill="url(#colorMaterials)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Application Stage Pipeline KPI Row */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-[#171D27] dark:text-[#F3F4F6] flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-[#009B87] dark:text-[#2DD4BF]" />
          <span>Application Stage KPI Breakdown</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {stages.map((stage) => {
            const count = stageCounts[stage] || 0;
            return (
              <div
                key={stage}
                className={`p-3 rounded-xl border bg-white dark:bg-[#1B2230] shadow-xs transition-all ${
                  count > 0 ? 'border-[#009B87]/40 dark:border-[#2DD4BF]/40 bg-[#F3FCF8]/50 dark:bg-[#122825]/50' : 'border-[#E5E9E7] dark:border-[#2A3447]'
                }`}
              >
                <div className="text-[11px] font-semibold text-[#89919B] truncate">{stage}</div>
                <div className="text-2xl font-bold text-[#171D27] dark:text-[#F3F4F6] mt-1">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Outreach Readiness Row */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-[#171D27] dark:text-[#F3F4F6] flex items-center space-x-2">
          <Send className="w-4 h-4 text-[#009B87] dark:text-[#2DD4BF]" />
          <span>Outreach Status Breakdown</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {outreachStatuses.map((status) => {
            const count = outreachCounts[status] || 0;
            let statusColor = 'text-[#626B78] dark:text-[#9CA3AF]';
            if (status === 'Needs review') statusColor = 'text-[#B45309] dark:text-amber-400 font-bold';
            if (status === 'Approved') statusColor = 'text-[#15803D] dark:text-emerald-400 font-bold';
            if (status === 'Sent manually') statusColor = 'text-[#009B87] dark:text-[#2DD4BF] font-bold';

            return (
              <div key={status} className="p-3 bg-white dark:bg-[#1B2230] border border-[#E5E9E7] dark:border-[#2A3447] rounded-xl shadow-xs">
                <div className="text-[11px] font-semibold text-[#89919B] truncate">{status}</div>
                <div className={`text-2xl font-bold mt-1 ${statusColor}`}>{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable Split: Opportunities Needing Attention & High Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Needs Attention Card */}
        <div className="bg-white dark:bg-[#1B2230] border border-[#E5E9E7] dark:border-[#2A3447] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EEF1EF] dark:border-[#232C3D]">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-[#B45309] dark:text-amber-400" />
              <h3 className="font-semibold text-base text-[#171D27] dark:text-[#F3F4F6]">
                Opportunities Requiring Attention ({urgentOpportunities.length})
              </h3>
            </div>
            <span className="text-xs text-[#89919B]">Next steps & deadlines</span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {urgentOpportunities.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#89919B]">
                No pending urgent actions. All saved opportunities are up to date!
              </div>
            ) : (
              urgentOpportunities.map((opp) => (
                <div
                  key={opp.id}
                  onClick={() => handleSelectOpp(opp.id)}
                  className="p-3.5 rounded-lg border border-[#E5E9E7] dark:border-[#2A3447] hover:border-[#009B87]/50 hover:bg-[#F7FAF8] dark:hover:bg-[#222C3D] cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-sm text-[#171D27] dark:text-[#F3F4F6] group-hover:text-[#009B87] dark:group-hover:text-[#2DD4BF] transition-colors">
                        {opp.companyName} — {opp.roleTitle}
                      </div>
                      <div className="text-xs text-[#626B78] dark:text-[#9CA3AF] flex items-center space-x-2 mt-0.5">
                        <span>Stage: {opp.stage}</span>
                        <span>•</span>
                        <span>Outreach: {opp.outreachStatus}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#89919B] group-hover:text-[#009B87] transition-colors" />
                  </div>

                  {opp.nextAction && (
                    <div className="text-xs bg-[#F3FCF8] dark:bg-[#122825] text-[#005F58] dark:text-[#2DD4BF] p-2 rounded-md border border-[#2DD4BF]/30 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#009B87] dark:text-[#2DD4BF] shrink-0" />
                      <span className="truncate">Next Action: {opp.nextAction}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Highest Priority Opportunities Card */}
        <div className="bg-white dark:bg-[#1B2230] border border-[#E5E9E7] dark:border-[#2A3447] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EEF1EF] dark:border-[#232C3D]">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#15803D] dark:text-emerald-400" />
              <h3 className="font-semibold text-base text-[#171D27] dark:text-[#F3F4F6]">
                Highest-Priority Roles (By Evidence Fit)
              </h3>
            </div>
            <button
              onClick={() => setActiveNav('opportunities')}
              className="text-xs text-[#009B87] dark:text-[#2DD4BF] hover:underline font-semibold cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {highPriority.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#89919B]">No roles imported yet.</div>
            ) : (
              highPriority.map((opp) => {
                const fit = fitAssessments[opp.id];
                const status = fit?.status || 'Not assessed';

                return (
                  <div
                    key={opp.id}
                    onClick={() => handleSelectOpp(opp.id)}
                    className="p-3.5 rounded-lg border border-[#E5E9E7] dark:border-[#2A3447] hover:border-[#009B87]/50 hover:bg-[#F7FAF8] dark:hover:bg-[#222C3D] cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm text-[#171D27] dark:text-[#F3F4F6] group-hover:text-[#009B87] dark:group-hover:text-[#2DD4BF] transition-colors">
                          {opp.companyName} — {opp.roleTitle}
                        </div>
                        <div className="text-xs text-[#626B78] dark:text-[#9CA3AF] mt-0.5">
                          {opp.location} • {opp.salary}
                        </div>
                      </div>
                      <div className="text-right">
                        {status === 'Assessed' && fit?.evidenceCoverageScore !== undefined ? (
                          <>
                            <div className="text-base font-bold text-[#009B87] dark:text-[#2DD4BF]">
                              {fit.evidenceCoverageScore}%
                            </div>
                            <div className="text-[10px] text-[#89919B]">Coverage</div>
                          </>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-semibold rounded">
                            {status}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EEF1EF] dark:border-[#232C3D]">
                      <span className="px-2 py-0.5 bg-[#EAFBF5] dark:bg-[#12332F] text-[#005F58] dark:text-[#2DD4BF] font-semibold rounded-md border border-[#2DD4BF]/20">
                        {status === 'Assessed' ? `Rec: ${fit?.categoryRecommendation || 'Apply'}` : status}
                      </span>
                      <span className="text-[#626B78] dark:text-[#9CA3AF] text-[11px]">
                        {fit?.strengths?.[0] ? `Strength: ${fit.strengths[0].slice(0, 50)}...` : 'Fit assessment required'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Unified Event Activity Log & Audit Trail */}
      <div className="bg-white dark:bg-[#1B2230] border border-[#E5E9E7] dark:border-[#2A3447] rounded-xl p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#EEF1EF] dark:border-[#232C3D]">
          <div className="flex items-center space-x-2">
            <Clock className="w-4.5 h-4.5 text-[#009B87] dark:text-[#2DD4BF]" />
            <h3 className="font-bold text-base text-[#171D27] dark:text-[#F3F4F6]">
              Unified Activity Log & Provenance Audit ({filteredActivities.length})
            </h3>
          </div>

          {/* Activity Category Filters */}
          <div className="flex items-center space-x-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
            {['all', 'stage_change', 'outreach', 'materials', 'profile', 'opportunity'].map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setActivityFilter(filterKey)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer capitalize ${
                  activityFilter === filterKey
                    ? 'bg-[#009B87] text-white'
                    : 'bg-[#FAF9F6] dark:bg-[#161D2A] text-[#626B78] dark:text-[#9CA3AF] hover:bg-[#F3FCF8] dark:hover:bg-[#222C3D] hover:text-[#171D27] dark:hover:text-[#F3F4F6]'
                }`}
              >
                {filterKey.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Event List */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {filteredActivities.length === 0 ? (
            <p className="text-xs text-[#89919B] py-6 text-center italic">
              No activity logs match the selected filter.
            </p>
          ) : (
            filteredActivities.map((act) => {
              const meta = getActivityTypeMeta(act.type);
              const Icon = meta.icon;

              const linkedOpp = act.opportunityId
                ? opportunities.find((o) => o.id === act.opportunityId)
                : null;

              return (
                <div
                  key={act.id}
                  onClick={() => {
                    if (linkedOpp) {
                      handleSelectOpp(linkedOpp.id);
                    } else if (act.type === 'profile') {
                      setActiveNav('profile');
                    } else if (act.type === 'opportunity') {
                      setActiveNav('opportunities');
                    }
                  }}
                  className={`flex items-start space-x-3 text-xs p-3 rounded-xl border border-[#E5E9E7] dark:border-[#2A3447] transition-all bg-[#FAF9F6] dark:bg-[#161D2A] hover:bg-white dark:hover:bg-[#1B2230] hover:border-[#009B87]/40 ${
                    linkedOpp || act.type === 'profile' ? 'cursor-pointer group' : ''
                  }`}
                >
                  <div className={`mt-0.5 p-2 rounded-lg ${meta.badgeBg} ${meta.badgeText} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[#171D27] dark:text-[#F3F4F6] group-hover:text-[#009B87] dark:group-hover:text-[#2DD4BF] transition-colors">
                          {act.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${meta.badgeBg} ${meta.badgeText}`}>
                          {meta.label}
                        </span>
                        {act.provenance && <ProvenanceBadge label={act.provenance} />}
                        {linkedOpp && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EAFBF5] dark:bg-[#12332F] text-[#005F58] dark:text-[#2DD4BF] border border-[#2DD4BF]/20">
                            {linkedOpp.companyName}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-[#89919B] font-medium shrink-0">
                        {formatActivityTime(act.timestamp)}
                      </span>
                    </div>

                    <p className="text-[#626B78] dark:text-[#9CA3AF] leading-relaxed">{act.description}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
