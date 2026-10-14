export type ProvenanceLabel =
  | 'Demo'
  | 'User confirmed'
  | 'Imported — needs review'
  | 'AI generated — needs review'
  | 'Public source'
  | 'Provider verified'
  | 'Unverified'
  | 'Retrieval failed'
  | 'Integration unavailable';

export type EvidenceStatus = 'user-confirmed' | 'imported/unreviewed' | 'needs clarification';

export interface EvidenceItem {
  id: string;
  claim: string;
  supportingContext: string;
  sourceDocOrLink: string;
  status: EvidenceStatus;
  provenance: ProvenanceLabel;
  updatedAt: string;
  isDemo?: boolean;
}

export interface EmploymentExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationYear: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  link?: string;
  techStack: string[];
}

export interface AccomplishmentItem {
  id: string;
  title: string;
  description: string;
  metric?: string;
  date?: string;
}

export interface CandidatePreferences {
  targetRoles: string[];
  preferredLocations: string[];
  workArrangement: ('Remote' | 'Hybrid' | 'Onsite')[];
  salaryExpectation: string;
  seniority: string;
  workAuthorization: string;
}

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  summary: string;
  employment: EmploymentExperience[];
  education: EducationItem[];
  skills: string[];
  projects: ProjectItem[];
  accomplishments: AccomplishmentItem[];
  preferences: CandidatePreferences;
  evidenceLibrary: EvidenceItem[];
  isApproved: boolean;
  updatedAt: string;
  isDemo?: boolean;
}

export type WorkplaceArrangement = 'Remote' | 'Hybrid' | 'Onsite' | 'Not disclosed';
export type EmploymentType = 'Full-time' | 'Contract' | 'Part-time' | 'Not disclosed';

export type ApplicationStage =
  | 'Saved'
  | 'Researching'
  | 'Preparing'
  | 'Ready to apply'
  | 'Applied'
  | 'Interviewing'
  | 'Offer'
  | 'Closed';

export type OutreachStatus =
  | 'No draft'
  | 'Draft'
  | 'Needs review'
  | 'Approved'
  | 'Sent manually'
  | 'Response received';

export interface Opportunity {
  id: string;
  companyName: string;
  companyDomain: string;
  companyLogo?: string;
  roleTitle: string;
  postingUrl: string;
  applicationUrl?: string;
  location: string;
  workplaceArrangement: WorkplaceArrangement;
  employmentType: EmploymentType;
  salary: string;
  responsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  explicitEligibility: string[];
  deadline?: string;
  stage: ApplicationStage;
  outreachStatus: OutreachStatus;
  source: string;
  dateChecked: string;
  isLiveChecked: boolean;
  notes?: string;
  nextAction?: string;
  nextActionDate?: string;
  rawJobDescription?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
  provenance: ProvenanceLabel;
}

export type AssessmentMatch = 'strong match' | 'partial match' | 'gap' | 'unknown';
export type RecommendationCategory =
  | 'Apply'
  | 'Consider applying'
  | 'Resolve a key question first'
  | 'Low priority';

export type FitAssessmentStatus =
  | 'Not assessed'
  | 'Assessment running'
  | 'Assessed'
  | 'Assessment failed'
  | 'Needs review';

export interface RequirementAssessment {
  jobRequirement: string;
  category: 'Required' | 'Preferred' | 'Responsibility' | 'Constraint';
  weight: number; // e.g. 60 for required, 20 for preferred, 15 for responsibilities, 5 for constraint
  candidateEvidence: string;
  assessment: AssessmentMatch;
  explanation: string;
  sourceEvidence?: string;
  scoreContribution: number;
  suggestedNextAction: string;
}

export interface FitAssessment {
  opportunityId: string;
  status: FitAssessmentStatus;
  categoryRecommendation?: RecommendationCategory;
  evidenceCoverageScore?: number; // 0 to 100
  weightedRubricBreakdown?: {
    requiredScore: number; // Max 60
    preferredScore: number; // Max 20
    responsibilitiesScore: number; // Max 15
    constraintsScore: number; // Max 5
    totalScore: number;
    isConstraintBlocked: boolean;
    blockedConstraintExplanation?: string;
  };
  strengths: string[];
  gaps: string[];
  transferableExperience: string[];
  unansweredQuestions: string[];
  adjacentRoleSuggestions: string[];
  requirementsTable: RequirementAssessment[];
  assessedAt?: string;
  candidateProfileTimestamp?: string;
  isDemo?: boolean;
  provenance: ProvenanceLabel;
}

export interface TailoredResumeHighlight {
  highlight: string;
  evidenceClaim: string;
}

export interface TailoredEmployment {
  id: string;
  company: string;
  title: string;
  dates: string;
  highlights: string[];
  rationale: string;
}

export interface MaterialsReviewPanel {
  confirmedClaimsCount: number;
  userProvidedStatementsCount: number;
  statementsRequiringConfirmationCount: number;
  blockedUnsupportedStatementsCount: number;
  lastReviewedTimestamp: string;
  confirmedStatementsUsed: string[];
  userProvidedStatementsUsed: string[];
  statementsRequiringConfirmation: string[];
  blockedUnsupportedStatements: string[];
}

export interface ApplicationMaterials {
  opportunityId: string;
  tailoredResume: {
    summary: string;
    employment: TailoredEmployment[];
    skills: string[];
    education: Array<{ degree: string; institution: string; year: string }>;
  };
  coverLetter: {
    subject: string;
    salutation: string;
    bodyParagraphs: string[];
    closing: string;
    supportingEvidenceIds: string[];
  };
  shortSummary: string;
  applicationQuestionResponses: Array<{
    question: string;
    response: string;
    supportedByClaims: string[];
  }>;
  majorChangesExplanation: Array<{
    section: string;
    change: string;
    reason: string;
    evidenceClaim: string;
  }>;
  reviewPanel: MaterialsReviewPanel;
  version: number;
  isApproved: boolean;
  updatedAt: string;
  isDemo?: boolean;
  provenance: ProvenanceLabel;
}

export interface ResearchClaim {
  statement: string;
  type: 'factual' | 'interpretation' | 'unanswered';
  sourceUrl?: string;
  sourceName?: string;
  date: string;
  provenance: ProvenanceLabel;
}

export interface CompanyResearchBrief {
  opportunityId: string;
  companyOverview: string;
  customersAndMarket: string;
  productsOrServices: string[];
  recentDevelopments: Array<{
    headline: string;
    summary: string;
    date: string;
    sourceUrl?: string;
    sourceTitle?: string;
  }>;
  roleResponsibilitiesBrief: string;
  whyCandidateIsRelevant: string;
  potentialContributions: string[];
  questionsToInvestigate: string[];
  cultureStatements: {
    officialCompanyStatements: string[];
    thirdPartyReports: string[];
  };
  researchClaims: ResearchClaim[];
  sourceConflicts?: string[];
  updatedAt: string;
  isDemo?: boolean;
  provenance: ProvenanceLabel;
  firecrawlGrounded?: boolean;
  privacyAudit?: string;
}

export type ContactRelationship =
  | 'Confirmed on the job posting'
  | 'Confirmed recruiting contact'
  | 'Possible department contact'
  | 'Possible recruiting contact'
  | 'Relevance unknown'
  | 'Demo contact';

export type EmailVerificationStatus =
  | 'Deliverable'
  | 'Risky'
  | 'Undeliverable'
  | 'Unverified'
  | 'Unavailable';

export interface ContactPerson {
  id: string;
  name: string;
  currentTitle: string;
  company: string;
  publicSourceUrl?: string;
  sourceDate?: string;
  evidenceWorksAtCompany?: string;
  evidenceRelevantToOpening?: string;
  relationshipStatus: ContactRelationship;
  email?: string;
  emailDiscoveryProvider?: string;
  emailDiscoveryConfidence?: number;
  emailVerificationStatus?: EmailVerificationStatus;
  emailVerificationDate?: string;
  dateChecked: string;
  provenance: ProvenanceLabel;
  isDemo?: boolean;
  isUserProvided?: boolean;
}

export type OutreachType =
  | 'Hiring-manager introduction'
  | 'Recruiter introduction'
  | 'LinkedIn message'
  | 'Application follow-up'
  | 'Interview thank-you';

export interface OutreachDraft {
  id: string;
  type: OutreachType;
  recipientName: string;
  recipientTitle: string;
  subject: string;
  body: string;
  supportingEvidence: string[];
  companyDetailUsed: string;
  candidateAccomplishmentUsed: string;
  status: 'Draft' | 'Needs review' | 'Approved' | 'Sent manually';
  approvalTimestamp?: string;
  manualSentTimestamp?: string;
  manualSentNote?: string;
  responseReceivedTimestamp?: string;
  responseNote?: string;
  provenance: ProvenanceLabel;
}

export interface ContactsAndOutreach {
  opportunityId: string;
  contacts: ContactPerson[];
  drafts: OutreachDraft[];
  updatedAt: string;
  isDemo?: boolean;
  provenance: ProvenanceLabel;
}

export interface StarOutline {
  situation: string;
  task: string;
  action: string;
  result: string;
  missingDetailsNeeded?: string[];
}

export interface PredictedQuestion {
  question: string;
  category: 'Behavioral' | 'Technical / Domain' | 'Role-Specific' | 'Culture & Leadership';
  candidateExample: string;
  starOutline: StarOutline;
  provenance: ProvenanceLabel;
}

export interface InterviewPrep {
  opportunityId: string;
  predictedQuestions: PredictedQuestion[];
  questionsToAskInterviewer: string[];
  gapExplanationsAndTasks: Array<{
    gap: string;
    recommendedExplanation: string;
    prepTask: string;
  }>;
  companyTopicsToDiscuss: string[];
  updatedAt: string;
  isDemo?: boolean;
  provenance: ProvenanceLabel;
}

export type ActivityType =
  | 'stage_change'
  | 'outreach'
  | 'materials'
  | 'note'
  | 'research'
  | 'opportunity'
  | 'profile';

export interface ActivityLogItem {
  id: string;
  opportunityId?: string;
  timestamp: string;
  title: string;
  description: string;
  type: ActivityType;
  provenance?: ProvenanceLabel;
  isDemo?: boolean;
}

export interface ProviderStatus {
  gemini: { connected: boolean; model: string; note: string; statusCheckedAt: string };
  firecrawl: { connected: boolean; note: string };
  exa: { connected: boolean; note: string };
  hunter: { connected: boolean; note: string };
  openai: { connected: boolean; note: string };
}
