import {
  CandidateProfile,
  Opportunity,
  FitAssessment,
  ApplicationMaterials,
  CompanyResearchBrief,
  ContactsAndOutreach,
  InterviewPrep,
  ActivityLogItem,
} from './types';

export const DEMO_NOTICE_TEXT =
  'All companies, people, roles, accomplishments, and contact details in this workspace are fictional.';

export const INITIAL_CANDIDATE_PROFILE: CandidateProfile = {
  id: 'cand-alex-morgan-demo',
  isDemo: true,
  name: 'Alex Morgan (Demo Candidate)',
  email: 'alex.morgan@example.com',
  phone: '+1 (555) 019-2834',
  location: 'San Francisco, CA (Fictional Location)',
  linkedin: 'https://example.com/in/alex-morgan-demo',
  github: 'https://example.com/alexmorgan-demo',
  website: 'https://example.com',
  summary:
    'Fictional Demo Candidate: Lead Systems Architect and Product Manager with 7+ years experience designing cloud workflows and telemetry pipelines for fictional B2B platforms.',
  employment: [
    {
      id: 'emp-demo-1',
      company: 'Acroflow Cloud (Fictional Corp)',
      role: 'Staff Product Manager - Cloud Infrastructure',
      location: 'San Francisco, CA',
      startDate: '2023-01',
      endDate: 'Present',
      current: true,
      highlights: [
        'Built automated telemetry pipeline for fictional microservices, reducing server error rates by 35% in internal benchmarks.',
        'Managed cross-functional squad of 8 engineers delivering enterprise API compliance monitoring.',
        'Led workflow automation initiative used by fictional enterprise beta clients.',
      ],
    },
    {
      id: 'emp-demo-2',
      company: 'Vortex Data Tech (Fictional Corp)',
      role: 'Senior Product Manager',
      location: 'San Francisco, CA',
      startDate: '2020-03',
      endDate: '2022-12',
      current: false,
      highlights: [
        'Scaled developer API integration tools for fictitious SaaS platform.',
        'Spearheaded internal SOC 2 Type II audit readiness for fictional cloud infrastructure.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-demo-1',
      institution: 'Example University',
      degree: 'B.S.',
      field: 'Computer Science & Software Systems',
      graduationYear: '2018',
    },
  ],
  skills: [
    'Cloud System Architecture',
    'B2B SaaS Workflows',
    'TypeScript & Node.js',
    'API Design & Integration',
    'Product Evals & Telemetry',
    'SOC 2 Compliance',
  ],
  projects: [
    {
      id: 'proj-demo-1',
      name: 'SimulEval (Fictional Open Source)',
      description: 'Fictional benchmark runner for testing API schema compliance.',
      link: 'https://example.com/simuleval',
      techStack: ['TypeScript', 'Next.js', 'Tailwind CSS'],
    },
  ],
  accomplishments: [
    {
      id: 'acc-demo-1',
      title: 'Fictional Telemetry Error Reduction',
      description: 'Reduced microservices error rate by 35% in internal Acroflow Cloud testing environments.',
      metric: '35% benchmark error reduction',
      date: '2024-03',
    },
    {
      id: 'acc-demo-2',
      title: 'Fictional SOC 2 Audit Readiness',
      description: 'Achieved internal SOC 2 readiness milestone across 3 product squads at Vortex Tech.',
      metric: '100% audit pass (Fictional)',
      date: '2022-05',
    },
  ],
  preferences: {
    targetRoles: ['Staff Product Manager', 'Lead Platform PM', 'Head of Cloud Workflows'],
    preferredLocations: ['San Francisco, CA', 'Remote'],
    workArrangement: ['Remote', 'Hybrid'],
    salaryExpectation: '$200,000 - $250,000 (Demo Preference)',
    seniority: 'Staff / Lead',
    workAuthorization: 'Authorized to work without sponsorship (Demo)',
  },
  evidenceLibrary: [
    {
      id: 'ev-demo-1',
      isDemo: true,
      claim: 'Reduced fictional microservices error rate by 35% in Acroflow testing benchmarks',
      supportingContext: 'Verified in internal synthetic benchmark suite at Acroflow Cloud.',
      sourceDocOrLink: 'Fictional Acroflow Benchmark Report Q1 2024',
      status: 'user-confirmed',
      provenance: 'Demo',
      updatedAt: '2026-10-14',
    },
    {
      id: 'ev-demo-2',
      isDemo: true,
      claim: 'Built automated SOC 2 audit readiness framework across 3 product squads',
      supportingContext: 'Documented in internal compliance checklist at Vortex Tech.',
      sourceDocOrLink: 'Fictional Vortex Compliance Spec #102',
      status: 'user-confirmed',
      provenance: 'Demo',
      updatedAt: '2026-10-14',
    },
  ],
  isApproved: true,
  updatedAt: '2026-10-14',
};

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-demo-aerocloud-1',
    isDemo: true,
    provenance: 'Demo',
    companyName: 'AeroCloud Systems (Fictional Employer)',
    companyDomain: 'example.com',
    roleTitle: 'Staff PM - Enterprise Cloud Workflows (Fictional Role)',
    postingUrl: 'https://example.com/careers/aerocloud-staff-pm',
    applicationUrl: 'https://example.com/careers/aerocloud-staff-pm/apply',
    location: 'San Francisco, CA (Hybrid Demo)',
    workplaceArrangement: 'Hybrid',
    employmentType: 'Full-time',
    salary: '$220,000 - $280,000 (Disclosed in Fictional Posting)',
    responsibilities: [
      'Define vision and roadmap for fictional enterprise cloud platform interfaces.',
      'Partner with system engineers to convert cloud telemetry into reliable user dashboards.',
      'Establish evaluation standards for workflow safety, audit logging, and task execution.',
    ],
    requiredQualifications: [
      '6+ years of product management experience with complex B2B or cloud platforms.',
      'Proven track record scaling SaaS products from early deployment to enterprise tier.',
      'Deep understanding of API architectures, telemetry, and modern web frameworks.',
    ],
    preferredQualifications: [
      'Hands-on coding experience in TypeScript or Node.js.',
      'Background in compliance tooling or SOC 2 readiness.',
    ],
    explicitEligibility: [
      'Must be located in San Francisco, CA for 3-day hybrid schedule (Fictional constraint).',
    ],
    deadline: '2026-11-15 (Fictional Deadline)',
    stage: 'Preparing',
    outreachStatus: 'Needs review',
    source: 'Fictional Demo Posting',
    dateChecked: '2026-10-14',
    isLiveChecked: false,
    notes: 'Demo workspace opportunity for testing evidence coverage, materials drafting, and outreach.',
    nextAction: 'Review hiring manager introduction draft and export materials.',
    nextActionDate: '2026-10-16',
    rawJobDescription: `Fictional Job Description for AeroCloud Systems: Seeking a Staff PM to lead enterprise cloud workflow interfaces. Salary: $220,000 - $280,000. Hybrid in San Francisco, CA. Requires 6+ years B2B SaaS PM experience.`,
    createdAt: '2026-10-14',
    updatedAt: '2026-10-14',
  },
];

export const INITIAL_FIT_ASSESSMENT: Record<string, FitAssessment> = {
  'opp-demo-aerocloud-1': {
    opportunityId: 'opp-demo-aerocloud-1',
    isDemo: true,
    provenance: 'Demo',
    status: 'Assessed',
    categoryRecommendation: 'Apply',
    evidenceCoverageScore: 88,
    weightedRubricBreakdown: {
      requiredScore: 55, // Max 60
      preferredScore: 18, // Max 20
      responsibilitiesScore: 12, // Max 15
      constraintsScore: 3, // Max 5
      totalScore: 88,
      isConstraintBlocked: false,
    },
    strengths: [
      'Direct experience leading cloud platform workflows at Acroflow Cloud (Fictional).',
      '7+ years B2B SaaS experience satisfies the 6+ years requirement.',
      'Technical background in TypeScript and SOC 2 compliance readiness.',
    ],
    gaps: [
      'AeroCloud emphasizes high-throughput network telemetry; candidate experience is focused on application layer telemetry.',
    ],
    transferableExperience: [
      'Acroflow telemetry pipelines transfer directly to AeroCloud cloud workflow dashboards.',
    ],
    unansweredQuestions: [
      'What specific engineering group owns the underlying multi-tenant cloud storage engine?',
    ],
    adjacentRoleSuggestions: [
      'Principal PM - Platform Telemetry (Fictional)',
      'Head of Developer Platform APIs (Fictional)',
    ],
    requirementsTable: [
      {
        jobRequirement: '6+ years PM experience with B2B or cloud platforms',
        category: 'Required',
        weight: 60,
        candidateEvidence: '7+ years experience (Staff PM at Acroflow Cloud, Senior PM at Vortex Tech).',
        assessment: 'strong match',
        explanation: 'Exceeds duration requirement with direct cloud platform leadership.',
        scoreContribution: 20,
        suggestedNextAction: 'Highlight Acroflow cloud platform scaling in summary statement.',
      },
      {
        jobRequirement: 'Deep understanding of API architectures and telemetry',
        category: 'Required',
        weight: 60,
        candidateEvidence: 'Built automated telemetry pipeline reducing microservice error rates by 35%.',
        assessment: 'strong match',
        explanation: 'Direct evidence of telemetry pipeline development.',
        scoreContribution: 20,
        suggestedNextAction: 'Reference synthetic telemetry benchmark in cover letter.',
      },
      {
        jobRequirement: 'Located in San Francisco, CA for 3-day hybrid schedule',
        category: 'Constraint',
        weight: 5,
        candidateEvidence: 'Located in San Francisco, CA (Demo).',
        assessment: 'strong match',
        explanation: 'Explicit location constraint satisfied.',
        scoreContribution: 3,
        suggestedNextAction: 'Confirm SF residence in header.',
      },
    ],
    assessedAt: '2026-10-14T15:00:00Z',
    candidateProfileTimestamp: '2026-10-14T14:00:00Z',
  },
};

export const INITIAL_APPLICATION_MATERIALS: Record<string, ApplicationMaterials> = {
  'opp-demo-aerocloud-1': {
    opportunityId: 'opp-demo-aerocloud-1',
    isDemo: true,
    provenance: 'Demo',
    version: 1,
    isApproved: false,
    updatedAt: '2026-10-14T15:10:00Z',
    shortSummary:
      'Fictional Demo Summary: Product Leader with 7+ years experience designing cloud workflows and telemetry systems. Built error reduction pipelines at Acroflow Cloud and led SOC 2 compliance readiness.',
    tailoredResume: {
      summary:
        'Staff Product Manager with 7+ years leading cloud infrastructure platforms. Proven record of designing telemetry pipelines (35% error reduction in benchmarks) and leading SOC 2 compliance readiness.',
      employment: [
        {
          id: 'emp-demo-1',
          company: 'Acroflow Cloud (Fictional Corp)',
          title: 'Staff Product Manager - Cloud Infrastructure',
          dates: '2023 - Present | San Francisco, CA',
          highlights: [
            'Architected telemetry pipeline for fictional microservices, reducing benchmark error rates by 35%.',
            'Led cross-functional squad of 8 engineers delivering enterprise API compliance monitoring.',
          ],
          rationale: 'Prioritized telemetry and cloud infrastructure experience for AeroCloud Systems.',
        },
      ],
      skills: ['Cloud Systems', 'Telemetry Evals', 'TypeScript', 'SOC 2 Compliance', 'API Integration'],
      education: [
        {
          degree: 'B.S. in Computer Science',
          institution: 'Example University',
          year: '2018',
        },
      ],
    },
    coverLetter: {
      subject: 'Application for Staff PM - Enterprise Cloud Workflows (Demo)',
      salutation: 'Dear AeroCloud Hiring Team,',
      bodyParagraphs: [
        'I am writing to express my enthusiasm for the Staff PM role at AeroCloud Systems. Over the past 7 years, I have focused on building reliable cloud infrastructure platforms—most recently at Acroflow Cloud, where I led the telemetry pipeline squad.',
        'At AeroCloud Systems, delivering trustworthy cloud workflows with rigorous monitoring is paramount. At Acroflow, I designed an error monitoring workflow that reduced microservices test error rates by 35%.',
        'Holding a B.S. in Computer Science from Example University and located in San Francisco, I am excited about the opportunity to partner with your cloud systems team.',
      ],
      closing: 'Best regards,\nAlex Morgan (Demo Candidate)',
      supportingEvidenceIds: ['ev-demo-1', 'ev-demo-2'],
    },
    applicationQuestionResponses: [
      {
        question: 'Describe a time you built telemetry pipelines for cloud infrastructure.',
        response:
          'At Acroflow Cloud, I led a squad of 8 engineers to build an automated telemetry error pipeline that achieved a 35% reduction in microservices test errors.',
        supportedByClaims: ['ev-demo-1'],
      },
    ],
    majorChangesExplanation: [
      {
        section: 'Summary',
        change: 'Framed experience around telemetry and cloud workflows.',
        reason: 'Matches AeroCloud requirements.',
        evidenceClaim: 'Reduced microservices error rate by 35%',
      },
    ],
    reviewPanel: {
      confirmedClaimsCount: 2,
      userProvidedStatementsCount: 1,
      statementsRequiringConfirmationCount: 0,
      blockedUnsupportedStatementsCount: 0,
      lastReviewedTimestamp: '2026-10-14T15:10:00Z',
      confirmedStatementsUsed: [
        'Reduced fictional microservices error rate by 35% in Acroflow testing benchmarks',
        'Built automated SOC 2 audit readiness framework across 3 product squads',
      ],
      userProvidedStatementsUsed: ['7+ years experience in B2B SaaS'],
      statementsRequiringConfirmation: [],
      blockedUnsupportedStatements: [],
    },
  },
};

export const INITIAL_COMPANY_BRIEFS: Record<string, CompanyResearchBrief> = {
  'opp-demo-aerocloud-1': {
    opportunityId: 'opp-demo-aerocloud-1',
    isDemo: true,
    provenance: 'Demo',
    companyOverview:
      'AeroCloud Systems is a fictional enterprise software provider specializing in cloud telemetry and workflow automation.',
    customersAndMarket:
      'Serves fictional B2B enterprise software companies and cloud infrastructure teams.',
    productsOrServices: [
      'AeroCloud Telemetry Engine (Fictional)',
      'AeroCloud Workspaces (Fictional)',
    ],
    recentDevelopments: [
      {
        headline: 'Fictional Expansion of AeroCloud Telemetry API',
        summary: 'Introduced simulated telemetry webhooks for enterprise developers.',
        date: '2026-09-01',
        sourceUrl: 'https://example.com/news/aerocloud-api',
        sourceTitle: 'Fictional Press Release',
      },
    ],
    roleResponsibilitiesBrief:
      'Own the enterprise cloud workflow product suite for AeroCloud Systems.',
    whyCandidateIsRelevant:
      'Candidate brings telemetry experience from Acroflow Cloud and SOC 2 readiness from Vortex Tech.',
    potentialContributions: [
      'Accelerate cloud workflow adoption by adding built-in audit logs.',
    ],
    questionsToInvestigate: [
      'How does the AeroCloud PM team partner with core infrastructure engineers?',
    ],
    cultureStatements: {
      officialCompanyStatements: [
        'Committed to reliable, safety-first cloud infrastructure development (Fictional).',
      ],
      thirdPartyReports: [
        'Fictional Glassdoor reports indicate collaborative engineering culture.',
      ],
    },
    researchClaims: [
      {
        statement: 'AeroCloud Systems is a fictional company used in the ProofReach demo workspace.',
        type: 'factual',
        sourceUrl: 'https://example.com',
        sourceName: 'ProofReach Fictional Dataset',
        date: '2026-10-14',
        provenance: 'Demo',
      },
    ],
    updatedAt: '2026-10-14',
  },
};

export const INITIAL_CONTACTS_OUTREACH: Record<string, ContactsAndOutreach> = {
  'opp-demo-aerocloud-1': {
    opportunityId: 'opp-demo-aerocloud-1',
    isDemo: true,
    provenance: 'Demo',
    contacts: [
      {
        id: 'cnt-demo-1',
        isDemo: true,
        name: 'Jordan Lee (Demo Contact)',
        currentTitle: 'VP of Cloud Engineering (Fictional)',
        company: 'AeroCloud Systems (Fictional)',
        publicSourceUrl: 'https://example.com/contacts/jordan-lee',
        sourceDate: '2026-10-14',
        evidenceWorksAtCompany: 'Fictional demo record',
        evidenceRelevantToOpening: 'Leads fictional cloud engineering division',
        relationshipStatus: 'Demo contact',
        email: 'jordan.lee@example.com',
        emailDiscoveryProvider: 'Demo Fictional Generator',
        emailDiscoveryConfidence: 100,
        emailVerificationStatus: 'Unverified',
        emailVerificationDate: '2026-10-14',
        dateChecked: '2026-10-14',
        provenance: 'Demo',
      },
      {
        id: 'cnt-demo-2',
        isDemo: true,
        name: 'Taylor Reed (Demo Contact)',
        currentTitle: 'Talent Acquisition Partner (Fictional)',
        company: 'AeroCloud Systems (Fictional)',
        publicSourceUrl: 'https://example.com/contacts/taylor-reed',
        sourceDate: '2026-10-14',
        evidenceWorksAtCompany: 'Fictional demo record',
        evidenceRelevantToOpening: 'Recruiter listed for demo role',
        relationshipStatus: 'Demo contact',
        email: 'taylor.reed@example.com',
        emailDiscoveryProvider: 'Demo Fictional Generator',
        emailDiscoveryConfidence: 100,
        emailVerificationStatus: 'Unverified',
        emailVerificationDate: '2026-10-14',
        dateChecked: '2026-10-14',
        provenance: 'Demo',
      },
    ],
    drafts: [
      {
        id: 'draft-demo-1',
        type: 'Hiring-manager introduction',
        recipientName: 'Jordan Lee (Demo Contact)',
        recipientTitle: 'VP of Cloud Engineering',
        subject: 'Fictional Demo Intro: Cloud Telemetry & AeroCloud Systems - Alex Morgan',
        body: `Hi Jordan,\n\nI noticed the Staff PM opening for Enterprise Cloud Workflows at AeroCloud Systems. At Acroflow Cloud, I led our telemetry pipeline squad to reduce microservices error rates by 35% in synthetic testing.\n\nAeroCloud's focus on reliable workflow automation deeply aligns with my background. I'd love to share how my experience in cloud infrastructure telemetry could support your product roadmap.\n\nBest regards,\nAlex Morgan (Demo Candidate)\nalex.morgan@example.com`,
        supportingEvidence: [
          'Reduced microservices error rate by 35% in Acroflow testing benchmarks',
        ],
        companyDetailUsed: 'AeroCloud telemetry webhooks and enterprise cloud workflows',
        candidateAccomplishmentUsed: 'Acroflow Cloud 35% error reduction telemetry benchmark',
        status: 'Needs review',
        provenance: 'Demo',
      },
    ],
    updatedAt: '2026-10-14',
  },
};

export const INITIAL_INTERVIEW_PREP: Record<string, InterviewPrep> = {
  'opp-demo-aerocloud-1': {
    opportunityId: 'opp-demo-aerocloud-1',
    isDemo: true,
    provenance: 'Demo',
    predictedQuestions: [
      {
        question: 'How do you design cloud telemetry pipelines to handle high-frequency microservice logs?',
        category: 'Technical / Domain',
        candidateExample: 'Telemetry error reduction pipeline at Acroflow Cloud (Fictional)',
        starOutline: {
          situation: 'Acroflow Cloud microservice test environments experienced frequent unhandled errors.',
          task: 'Build an automated telemetry pipeline to catch microservice exceptions in real time.',
          action: 'Partnered with 8 engineers to construct an automated error tracking pipeline.',
          result: 'Reduced synthetic microservices error rates by 35%.',
          missingDetailsNeeded: [],
        },
        provenance: 'Demo',
      },
    ],
    questionsToAskInterviewer: [
      'How does the AeroCloud PM team partner with cloud platform engineers?',
      'What are the primary performance metrics for AeroCloud enterprise workflows?',
    ],
    gapExplanationsAndTasks: [
      {
        gap: 'Candidate background is focused on application layer telemetry rather than low-level kernel networking.',
        recommendedExplanation: 'Highlight that application layer telemetry offers immediate user workflow visibility while partnering closely with network engineers.',
        prepTask: 'Prepare a brief narrative connecting application layer error tracking to cloud workflow reliability.',
      },
    ],
    companyTopicsToDiscuss: [
      'Expansion of AeroCloud telemetry webhooks for enterprise cloud developers',
    ],
    updatedAt: '2026-10-14',
  },
};

export const INITIAL_ACTIVITIES: ActivityLogItem[] = [
  {
    id: 'act-demo-1',
    opportunityId: 'opp-demo-aerocloud-1',
    timestamp: '2026-10-14T14:00:00Z',
    title: 'Demo Fit Assessment Assessed',
    description: 'Calculated 88% evidence coverage score for AeroCloud Systems (Fictional).',
    type: 'research',
    provenance: 'Demo',
    isDemo: true,
  },
  {
    id: 'act-demo-2',
    opportunityId: 'opp-demo-aerocloud-1',
    timestamp: '2026-10-14T14:15:00Z',
    title: 'Demo Application Materials Drafted',
    description: 'Generated fictional tailored resume and cover letter with review panel.',
    type: 'materials',
    provenance: 'Demo',
    isDemo: true,
  },
  {
    id: 'act-demo-3',
    opportunityId: 'opp-demo-aerocloud-1',
    timestamp: '2026-10-14T14:30:00Z',
    title: 'Demo Outreach Draft Created',
    description: 'Created fictional intro draft to Jordan Lee (VP Cloud Engineering).',
    type: 'outreach',
    provenance: 'Demo',
    isDemo: true,
  },
];
