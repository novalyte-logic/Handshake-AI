'use client';

import {
  CandidateProfile,
  Opportunity,
  FitAssessment,
  ApplicationMaterials,
  CompanyResearchBrief,
  ContactsAndOutreach,
  InterviewPrep,
  ActivityLogItem,
  ActivityType,
} from './types';
import {
  INITIAL_CANDIDATE_PROFILE,
  INITIAL_OPPORTUNITIES,
  INITIAL_FIT_ASSESSMENT,
  INITIAL_APPLICATION_MATERIALS,
  INITIAL_COMPANY_BRIEFS,
  INITIAL_CONTACTS_OUTREACH,
  INITIAL_INTERVIEW_PREP,
  INITIAL_ACTIVITIES,
} from './mock-data';

const STORAGE_KEY_PROFILE = 'proofreach_profile_v1';
const STORAGE_KEY_OPPORTUNITIES = 'proofreach_opportunities_v1';
const STORAGE_KEY_FIT = 'proofreach_fit_v1';
const STORAGE_KEY_MATERIALS = 'proofreach_materials_v1';
const STORAGE_KEY_BRIEFS = 'proofreach_briefs_v1';
const STORAGE_KEY_OUTREACH = 'proofreach_outreach_v1';
const STORAGE_KEY_INTERVIEW = 'proofreach_interview_v1';
const STORAGE_KEY_ACTIVITIES = 'proofreach_activities_v1';

export interface AppStateData {
  profile: CandidateProfile;
  opportunities: Opportunity[];
  fitAssessments: Record<string, FitAssessment>;
  materials: Record<string, ApplicationMaterials>;
  briefs: Record<string, CompanyResearchBrief>;
  contactsOutreach: Record<string, ContactsAndOutreach>;
  interviewPreps: Record<string, InterviewPrep>;
  activities: ActivityLogItem[];
}

export function loadAppState(): AppStateData {
  if (typeof window === 'undefined') {
    return {
      profile: INITIAL_CANDIDATE_PROFILE,
      opportunities: INITIAL_OPPORTUNITIES,
      fitAssessments: INITIAL_FIT_ASSESSMENT,
      materials: INITIAL_APPLICATION_MATERIALS,
      briefs: INITIAL_COMPANY_BRIEFS,
      contactsOutreach: INITIAL_CONTACTS_OUTREACH,
      interviewPreps: INITIAL_INTERVIEW_PREP,
      activities: INITIAL_ACTIVITIES,
    };
  }

  try {
    const profile = localStorage.getItem(STORAGE_KEY_PROFILE);
    const opportunities = localStorage.getItem(STORAGE_KEY_OPPORTUNITIES);
    const fitAssessments = localStorage.getItem(STORAGE_KEY_FIT);
    const materials = localStorage.getItem(STORAGE_KEY_MATERIALS);
    const briefs = localStorage.getItem(STORAGE_KEY_BRIEFS);
    const contactsOutreach = localStorage.getItem(STORAGE_KEY_OUTREACH);
    const interviewPreps = localStorage.getItem(STORAGE_KEY_INTERVIEW);
    const activities = localStorage.getItem(STORAGE_KEY_ACTIVITIES);

    return {
      profile: profile ? JSON.parse(profile) : INITIAL_CANDIDATE_PROFILE,
      opportunities: opportunities ? JSON.parse(opportunities) : INITIAL_OPPORTUNITIES,
      fitAssessments: fitAssessments ? JSON.parse(fitAssessments) : INITIAL_FIT_ASSESSMENT,
      materials: materials ? JSON.parse(materials) : INITIAL_APPLICATION_MATERIALS,
      briefs: briefs ? JSON.parse(briefs) : INITIAL_COMPANY_BRIEFS,
      contactsOutreach: contactsOutreach ? JSON.parse(contactsOutreach) : INITIAL_CONTACTS_OUTREACH,
      interviewPreps: interviewPreps ? JSON.parse(interviewPreps) : INITIAL_INTERVIEW_PREP,
      activities: activities ? JSON.parse(activities) : INITIAL_ACTIVITIES,
    };
  } catch (err) {
    console.error('Failed to load from localStorage, returning defaults', err);
    return {
      profile: INITIAL_CANDIDATE_PROFILE,
      opportunities: INITIAL_OPPORTUNITIES,
      fitAssessments: INITIAL_FIT_ASSESSMENT,
      materials: INITIAL_APPLICATION_MATERIALS,
      briefs: INITIAL_COMPANY_BRIEFS,
      contactsOutreach: INITIAL_CONTACTS_OUTREACH,
      interviewPreps: INITIAL_INTERVIEW_PREP,
      activities: INITIAL_ACTIVITIES,
    };
  }
}

export function saveAppState(data: Partial<AppStateData>) {
  if (typeof window === 'undefined') return;

  try {
    if (data.profile) localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(data.profile));
    if (data.opportunities) localStorage.setItem(STORAGE_KEY_OPPORTUNITIES, JSON.stringify(data.opportunities));
    if (data.fitAssessments) localStorage.setItem(STORAGE_KEY_FIT, JSON.stringify(data.fitAssessments));
    if (data.materials) localStorage.setItem(STORAGE_KEY_MATERIALS, JSON.stringify(data.materials));
    if (data.briefs) localStorage.setItem(STORAGE_KEY_BRIEFS, JSON.stringify(data.briefs));
    if (data.contactsOutreach) localStorage.setItem(STORAGE_KEY_OUTREACH, JSON.stringify(data.contactsOutreach));
    if (data.interviewPreps) localStorage.setItem(STORAGE_KEY_INTERVIEW, JSON.stringify(data.interviewPreps));
    if (data.activities) localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(data.activities));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

export function resetToDemoData(): AppStateData {
  const demoData: AppStateData = {
    profile: INITIAL_CANDIDATE_PROFILE,
    opportunities: INITIAL_OPPORTUNITIES,
    fitAssessments: INITIAL_FIT_ASSESSMENT,
    materials: INITIAL_APPLICATION_MATERIALS,
    briefs: INITIAL_COMPANY_BRIEFS,
    contactsOutreach: INITIAL_CONTACTS_OUTREACH,
    interviewPreps: INITIAL_INTERVIEW_PREP,
    activities: INITIAL_ACTIVITIES,
  };
  saveAppState(demoData);
  return demoData;
}

export function logEvent(
  currentState: AppStateData,
  event: {
    title: string;
    description: string;
    type: ActivityType;
    opportunityId?: string;
  }
): AppStateData {
  const newActivityItem: ActivityLogItem = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    opportunityId: event.opportunityId || '',
    timestamp: new Date().toISOString(),
    title: event.title,
    description: event.description,
    type: event.type,
  };

  const updatedActivities = [newActivityItem, ...(currentState.activities || [])].slice(0, 100);
  const updatedState = { ...currentState, activities: updatedActivities };
  saveAppState({ activities: updatedActivities });
  return updatedState;
}

export function exportBackupJSON(data: AppStateData) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `proofreach_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
