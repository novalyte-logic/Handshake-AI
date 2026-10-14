'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Upload,
  FileText,
  ShieldCheck,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
  Link as LinkIcon,
  Briefcase,
  GraduationCap,
  Award,
  Layers,
  Edit3,
} from 'lucide-react';
import { AppStateData, saveAppState, logEvent } from '@/lib/store';
import { CandidateProfile, EvidenceItem, EvidenceStatus } from '@/lib/types';
import mammoth from 'mammoth';

interface ProfileViewProps {
  appState: AppStateData;
  setAppState: React.Dispatch<React.SetStateAction<AppStateData>>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ appState, setAppState }) => {
  const [profile, setProfile] = useState<CandidateProfile>(appState.profile);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'evidence'>('profile');

  // Evidence editing modal/inline state
  const [newClaimText, setNewClaimText] = useState('');
  const [newClaimContext, setNewClaimContext] = useState('');
  const [newClaimSource, setNewClaimSource] = useState('');

  const handleSaveProfile = (updatedProfile: CandidateProfile) => {
    setProfile(updatedProfile);
    const updatedState = { ...appState, profile: updatedProfile };
    setAppState(updatedState);
    saveAppState({ profile: updatedProfile });
  };

  // Resume Upload Handler (DOCX via mammoth, TXT via reader, PDF fallback)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setParseError(null);

    let extractedText = '';

    try {
      if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } else if (file.name.endsWith('.txt') || file.type.startsWith('text/')) {
        extractedText = await file.text();
      } else if (file.name.endsWith('.pdf')) {
        // PDF parsing attempt
        try {
          extractedText = await file.text();
          if (!extractedText || extractedText.length < 50) {
            throw new Error('PDF formatting requires copy-pasting raw text.');
          }
        } catch {
          setParseError(
            `Unable to parse text from binary PDF "${file.name}". Please paste your resume text directly into the text box below.`
          );
          setIsParsing(false);
          return;
        }
      } else {
        setParseError(`Unsupported file format. Please upload a .docx, .txt, or paste your resume text.`);
        setIsParsing(false);
        return;
      }

      if (!extractedText || extractedText.trim().length < 30) {
        setParseError(`Could not extract readable text from "${file.name}". Please paste your resume text directly.`);
        setIsParsing(false);
        return;
      }

      await parseTextWithAI(extractedText, file.name);
    } catch (err: any) {
      setParseError(`Error processing file: ${err?.message || 'Unknown parsing failure'}. Please use text paste.`);
      setIsParsing(false);
    }
  };

  const parseTextWithAI = async (textContent: string, sourceName: string) => {
    try {
      const res = await fetch('/api/profile/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textContent, filename: sourceName }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || 'Failed to parse resume text with AI.');
      }

      const data = json.data;

      // Construct new evidence claims from AI parser
      const newEvidenceItems: EvidenceItem[] = (data.evidenceClaims || []).map((ec: any, idx: number) => ({
        id: `ev-${Date.now()}-${idx}`,
        claim: ec.claim,
        supportingContext: ec.supportingContext || 'Imported from resume',
        sourceDocOrLink: sourceName,
        status: 'imported/unreviewed',
        provenance: 'Imported — needs review',
        updatedAt: new Date().toISOString().split('T')[0],
      }));

      const updatedProfile: CandidateProfile = {
        ...profile,
        name: data.name || profile.name,
        email: data.email || profile.email,
        phone: data.phone || profile.phone,
        location: data.location || profile.location,
        linkedin: data.linkedin || profile.linkedin,
        github: data.github || profile.github,
        website: data.website || profile.website,
        summary: data.summary || profile.summary,
        employment: data.employment?.length
          ? data.employment.map((emp: any, i: number) => ({
              id: `emp-${Date.now()}-${i}`,
              company: emp.company,
              role: emp.role,
              location: emp.location || '',
              startDate: emp.startDate || '',
              endDate: emp.endDate || '',
              current: Boolean(emp.current),
              highlights: emp.highlights || [],
            }))
          : profile.employment,
        education: data.education?.length
          ? data.education.map((edu: any, i: number) => ({
              id: `edu-${Date.now()}-${i}`,
              institution: edu.institution,
              degree: edu.degree,
              field: edu.field || '',
              graduationYear: edu.graduationYear || '',
            }))
          : profile.education,
        skills: data.skills?.length ? data.skills : profile.skills,
        accomplishments: data.accomplishments?.length
          ? data.accomplishments.map((acc: any, i: number) => ({
              id: `acc-${Date.now()}-${i}`,
              title: acc.title,
              description: acc.description,
              metric: acc.metric,
              date: acc.date,
            }))
          : profile.accomplishments,
        preferences: data.preferences
          ? {
              targetRoles: data.preferences.targetRoles || profile.preferences.targetRoles,
              preferredLocations: data.preferences.preferredLocations || profile.preferences.preferredLocations,
              workArrangement: data.preferences.workArrangement || profile.preferences.workArrangement,
              salaryExpectation: data.preferences.salaryExpectation || profile.preferences.salaryExpectation,
              seniority: data.preferences.seniority || profile.preferences.seniority,
              workAuthorization: data.preferences.workAuthorization || profile.preferences.workAuthorization,
            }
          : profile.preferences,
        evidenceLibrary: [...newEvidenceItems, ...profile.evidenceLibrary],
        isApproved: false, // User must review & confirm
        updatedAt: new Date().toISOString().split('T')[0],
      };

      let stateAfterSave = { ...appState, profile: updatedProfile };
      stateAfterSave = logEvent(stateAfterSave, {
        title: 'Resume Parsed & Facts Extracted',
        description: `Parsed resume facts and extracted ${newEvidenceItems.length} evidence claims from "${sourceName}".`,
        type: 'profile',
      });
      setAppState(stateAfterSave);
      setProfile(updatedProfile);
      setPasteText('');
      alert('Resume parsed successfully! Please review the extracted profile and confirm evidence claims below.');
    } catch (err: any) {
      setParseError(err.message || 'Parsing failed.');
    } finally {
      setIsParsing(false);
    }
  };

  // Evidence Status Toggle
  const handleUpdateEvidenceStatus = (id: string, newStatus: EvidenceStatus) => {
    const claimItem = profile.evidenceLibrary.find((e) => e.id === id);
    const updatedLib = profile.evidenceLibrary.map((item) =>
      item.id === id ? { ...item, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] } : item
    );
    const updatedProfile = { ...profile, evidenceLibrary: updatedLib };
    setProfile(updatedProfile);

    let stateAfterSave = { ...appState, profile: updatedProfile };
    saveAppState({ profile: updatedProfile });

    if (newStatus === 'user-confirmed' && claimItem) {
      stateAfterSave = logEvent(stateAfterSave, {
        title: 'Evidence Claim Verified',
        description: `Confirmed claim: "${claimItem.claim.slice(0, 60)}..."`,
        type: 'profile',
      });
    }
    setAppState(stateAfterSave);
  };

  // Add Manual Evidence Claim
  const handleAddEvidenceClaim = () => {
    if (!newClaimText.trim()) return;
    const item: EvidenceItem = {
      id: `ev-${Date.now()}`,
      claim: newClaimText.trim(),
      supportingContext: newClaimContext.trim() || 'User added claim',
      sourceDocOrLink: newClaimSource.trim() || 'User confirmed provenance',
      status: 'user-confirmed',
      provenance: 'User confirmed',
      updatedAt: new Date().toISOString().split('T')[0],
    };
    const updatedProfile = { ...profile, evidenceLibrary: [item, ...profile.evidenceLibrary] };
    setProfile(updatedProfile);

    let stateAfterSave = { ...appState, profile: updatedProfile };
    saveAppState({ profile: updatedProfile });

    stateAfterSave = logEvent(stateAfterSave, {
      title: 'Evidence Claim Added',
      description: `Added verified claim: "${newClaimText.trim().slice(0, 60)}..."`,
      type: 'profile',
    });
    setAppState(stateAfterSave);

    setNewClaimText('');
    setNewClaimContext('');
    setNewClaimSource('');
  };

  const handleDeleteEvidence = (id: string) => {
    handleSaveProfile({
      ...profile,
      evidenceLibrary: profile.evidenceLibrary.filter((e) => e.id !== id),
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E5E9E7]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171D27] tracking-tight">
            Candidate Master Profile & Evidence
          </h1>
          <p className="text-sm text-[#626B78] mt-1">
            Maintain your master career facts, upload résumés, and audit verified evidence library claims.
          </p>
        </div>

        {/* Confirmation Status Badge */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              const updatedProfile = { ...profile, isApproved: true };
              handleSaveProfile(updatedProfile);
              const stateAfter = logEvent(appState, {
                title: 'Master Profile Approved',
                description: 'User confirmed master candidate background and evidence claims.',
                type: 'profile',
              });
              setAppState(stateAfter);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-colors ${
              profile.isApproved
                ? 'bg-[#15803D] text-white'
                : 'bg-[#009B87] hover:bg-[#007F73] text-white shadow-xs'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{profile.isApproved ? 'Profile Confirmed & Active' : 'Confirm & Approve Master Profile'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#E5E9E7] space-x-6">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeSubTab === 'profile'
              ? 'border-[#009B87] text-[#009B87]'
              : 'border-transparent text-[#626B78] hover:text-[#171D27]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>1. Profile Details & Upload</span>
        </button>
        <button
          onClick={() => setActiveSubTab('evidence')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeSubTab === 'evidence'
              ? 'border-[#009B87] text-[#009B87]'
              : 'border-transparent text-[#626B78] hover:text-[#171D27]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>2. Evidence Library ({profile.evidenceLibrary.length})</span>
        </button>
      </div>

      {activeSubTab === 'profile' ? (
        <div className="space-y-8">
          {/* Resume Import Card */}
          <div className="bg-white border border-[#E5E9E7] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#EEF1EF] pb-3">
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4 text-[#009B87]" />
                <h2 className="text-base font-semibold text-[#171D27]">Import / Upload Résumé</h2>
              </div>
              <span className="text-xs text-[#626B78]">Supports DOCX, TXT, PDF, or Direct Paste</span>
            </div>

            {parseError && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-xs text-[#DC2626] flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* File Upload Box */}
              <div className="p-6 border-2 border-dashed border-[#E5E9E7] hover:border-[#009B87] rounded-xl bg-[#FAF9F6] text-center flex flex-col items-center justify-center space-y-3 transition-colors">
                <FileText className="w-8 h-8 text-[#009B87]" />
                <div>
                  <div className="text-sm font-semibold text-[#171D27]">Upload Résumé File</div>
                  <div className="text-xs text-[#626B78]">Click to select .docx, .txt, or .pdf</div>
                </div>
                <label className="cursor-pointer px-4 py-2 bg-white border border-[#E5E9E7] hover:bg-[#F3FCF8] text-[#009B87] text-xs font-semibold rounded-lg shadow-xs transition-colors">
                  Choose File
                  <input
                    type="file"
                    accept=".docx,.txt,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isParsing}
                  />
                </label>
              </div>

              {/* Text Paste Box */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#171D27]">Or Paste Résumé Text Directly:</label>
                <textarea
                  rows={4}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste work experience, education, skills, and accomplishments..."
                  className="w-full p-3 border border-[#E5E9E7] rounded-lg text-xs bg-white focus:outline-none focus:border-[#009B87]"
                />
                <button
                  onClick={() => parseTextWithAI(pasteText, 'Pasted Resume Text')}
                  disabled={isParsing || !pasteText.trim()}
                  className="w-full py-2 bg-[#009B87] hover:bg-[#007F73] disabled:bg-[#E5E9E7] text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isParsing ? 'Extracting Facts with AI...' : 'Parse Pasted Resume'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Editable Master Profile Form */}
          <div className="bg-white border border-[#E5E9E7] rounded-xl p-6 shadow-xs space-y-6">
            <h2 className="text-base font-semibold text-[#171D27] pb-3 border-b border-[#EEF1EF] flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-[#009B87]" />
              <span>Contact & General Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#171D27] mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleSaveProfile({ ...profile, name: e.target.value })}
                  className="w-full p-2.5 border border-[#E5E9E7] rounded-lg text-xs focus:border-[#009B87]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171D27] mb-1">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleSaveProfile({ ...profile, email: e.target.value })}
                  className="w-full p-2.5 border border-[#E5E9E7] rounded-lg text-xs focus:border-[#009B87]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171D27] mb-1">Phone Number</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => handleSaveProfile({ ...profile, phone: e.target.value })}
                  className="w-full p-2.5 border border-[#E5E9E7] rounded-lg text-xs focus:border-[#009B87]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171D27] mb-1">Current Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => handleSaveProfile({ ...profile, location: e.target.value })}
                  className="w-full p-2.5 border border-[#E5E9E7] rounded-lg text-xs focus:border-[#009B87]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171D27] mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={profile.linkedin}
                  onChange={(e) => handleSaveProfile({ ...profile, linkedin: e.target.value })}
                  className="w-full p-2.5 border border-[#E5E9E7] rounded-lg text-xs focus:border-[#009B87]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171D27] mb-1">GitHub / Website</label>
                <input
                  type="text"
                  value={profile.github}
                  onChange={(e) => handleSaveProfile({ ...profile, github: e.target.value })}
                  className="w-full p-2.5 border border-[#E5E9E7] rounded-lg text-xs focus:border-[#009B87]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171D27] mb-1">Executive Summary</label>
              <textarea
                rows={3}
                value={profile.summary}
                onChange={(e) => handleSaveProfile({ ...profile, summary: e.target.value })}
                className="w-full p-2.5 border border-[#E5E9E7] rounded-lg text-xs focus:border-[#009B87]"
              />
            </div>

            {/* Employment History Section */}
            <div className="pt-4 border-t border-[#EEF1EF] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-[#171D27] flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-[#009B87]" />
                  <span>Employment History ({profile.employment.length})</span>
                </h3>
              </div>

              <div className="space-y-4">
                {profile.employment.map((emp, idx) => (
                  <div key={emp.id} className="p-4 border border-[#E5E9E7] rounded-xl space-y-3 bg-[#FAF9F6]">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#626B78]">Company</label>
                        <input
                          type="text"
                          value={emp.company}
                          onChange={(e) => {
                            const updated = [...profile.employment];
                            updated[idx].company = e.target.value;
                            handleSaveProfile({ ...profile, employment: updated });
                          }}
                          className="w-full p-2 border border-[#E5E9E7] rounded-md text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#626B78]">Role Title</label>
                        <input
                          type="text"
                          value={emp.role}
                          onChange={(e) => {
                            const updated = [...profile.employment];
                            updated[idx].role = e.target.value;
                            handleSaveProfile({ ...profile, employment: updated });
                          }}
                          className="w-full p-2 border border-[#E5E9E7] rounded-md text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#626B78]">Dates</label>
                        <input
                          type="text"
                          value={`${emp.startDate} - ${emp.current ? 'Present' : emp.endDate}`}
                          onChange={(e) => {
                            const updated = [...profile.employment];
                            updated[idx].startDate = e.target.value;
                            handleSaveProfile({ ...profile, employment: updated });
                          }}
                          className="w-full p-2 border border-[#E5E9E7] rounded-md text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#626B78] mb-1">Key Highlights</label>
                      {emp.highlights.map((hl, hIdx) => (
                        <input
                          key={hIdx}
                          type="text"
                          value={hl}
                          onChange={(e) => {
                            const updated = [...profile.employment];
                            updated[idx].highlights[hIdx] = e.target.value;
                            handleSaveProfile({ ...profile, employment: updated });
                          }}
                          className="w-full p-2 mb-1.5 border border-[#E5E9E7] rounded-md text-xs bg-white"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Preferences Section */}
            <div className="pt-4 border-t border-[#EEF1EF] space-y-4">
              <h3 className="font-semibold text-sm text-[#171D27] flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#009B87]" />
                <span>Career Preferences & Work Authorization</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#171D27] mb-1">Target Roles</label>
                  <input
                    type="text"
                    value={profile.preferences.targetRoles.join(', ')}
                    onChange={(e) =>
                      handleSaveProfile({
                        ...profile,
                        preferences: {
                          ...profile.preferences,
                          targetRoles: e.target.value.split(',').map((s) => s.trim()),
                        },
                      })
                    }
                    className="w-full p-2.5 border border-[#E5E9E7] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171D27] mb-1">Target Locations</label>
                  <input
                    type="text"
                    value={profile.preferences.preferredLocations.join(', ')}
                    onChange={(e) =>
                      handleSaveProfile({
                        ...profile,
                        preferences: {
                          ...profile.preferences,
                          preferredLocations: e.target.value.split(',').map((s) => s.trim()),
                        },
                      })
                    }
                    className="w-full p-2.5 border border-[#E5E9E7] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171D27] mb-1">Salary Expectations</label>
                  <input
                    type="text"
                    value={profile.preferences.salaryExpectation}
                    onChange={(e) =>
                      handleSaveProfile({
                        ...profile,
                        preferences: { ...profile.preferences, salaryExpectation: e.target.value },
                      })
                    }
                    className="w-full p-2.5 border border-[#E5E9E7] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171D27] mb-1">Seniority Preference</label>
                  <input
                    type="text"
                    value={profile.preferences.seniority}
                    onChange={(e) =>
                      handleSaveProfile({
                        ...profile,
                        preferences: { ...profile.preferences, seniority: e.target.value },
                      })
                    }
                    className="w-full p-2.5 border border-[#E5E9E7] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#171D27] mb-1">Work Authorization</label>
                  <input
                    type="text"
                    value={profile.preferences.workAuthorization}
                    onChange={(e) =>
                      handleSaveProfile({
                        ...profile,
                        preferences: { ...profile.preferences, workAuthorization: e.target.value },
                      })
                    }
                    className="w-full p-2.5 border border-[#E5E9E7] rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Evidence Library Tab */
        <div className="space-y-6">
          <div className="bg-[#F3FCF8] border border-[#2DD4BF]/30 rounded-xl p-4 flex items-start space-x-3 text-xs text-[#005F58]">
            <ShieldCheck className="w-5 h-5 text-[#009B87] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-sm text-[#171D27] mb-0.5">
                Evidence Provenance & Anti-Hallucination Policy
              </div>
              <p className="text-[#626B78]">
                ProofReach strictly enforces factual grounding. Tailored résumés, cover letters, and outreach drafts
                can ONLY draw from confirmed claims in this evidence library. User confirmation serves as valid provenance.
              </p>
            </div>
          </div>

          {/* Add Claim Form */}
          <div className="bg-white border border-[#E5E9E7] rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="font-semibold text-sm text-[#171D27] flex items-center space-x-2">
              <Plus className="w-4 h-4 text-[#009B87]" />
              <span>Add Verified Accomplishment or Fact Claim</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={newClaimText}
                  onChange={(e) => setNewClaimText(e.target.value)}
                  placeholder="Fact claim (e.g., Reduced database query latency from 4.2s to 380ms)..."
                  className="w-full p-2.5 border border-[#E5E9E7] rounded-lg text-xs focus:border-[#009B87]"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newClaimSource}
                  onChange={(e) => setNewClaimSource(e.target.value)}
                  placeholder="Source link or doc (e.g., Q3 Performance Report)..."
                  className="w-full p-2.5 border border-[#E5E9E7] rounded-lg text-xs focus:border-[#009B87]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <input
                type="text"
                value={newClaimContext}
                onChange={(e) => setNewClaimContext(e.target.value)}
                placeholder="Supporting context or metrics..."
                className="w-full max-w-lg p-2 border border-[#E5E9E7] rounded-lg text-xs"
              />
              <button
                onClick={handleAddEvidenceClaim}
                disabled={!newClaimText.trim()}
                className="px-4 py-2 bg-[#009B87] hover:bg-[#007F73] disabled:bg-[#E5E9E7] text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Add Claim
              </button>
            </div>
          </div>

          {/* Evidence Table */}
          <div className="bg-white border border-[#E5E9E7] rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 bg-[#FAF9F6] border-b border-[#E5E9E7] flex items-center justify-between">
              <div className="font-semibold text-xs text-[#171D27] uppercase tracking-wider">
                Confirmed & Imported Evidence Claims ({profile.evidenceLibrary.length})
              </div>
              <span className="text-[11px] text-[#626B78]">
                Status Legend: Green = User Confirmed, Yellow = Needs Review
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F6] text-[#89919B] border-b border-[#E5E9E7] font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Claim</th>
                    <th className="p-3">Supporting Context</th>
                    <th className="p-3">Source / Provenance</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF1EF]">
                  {profile.evidenceLibrary.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-[#89919B] italic">
                        No evidence claims recorded yet. Upload a resume or add a claim above.
                      </td>
                    </tr>
                  ) : (
                    profile.evidenceLibrary.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F7FAF8] transition-colors">
                        <td className="p-3 font-semibold text-[#171D27] max-w-xs">{item.claim}</td>
                        <td className="p-3 text-[#626B78] max-w-xs">{item.supportingContext}</td>
                        <td className="p-3 text-[#626B78]">{item.sourceDocOrLink}</td>
                        <td className="p-3">
                          {item.status === 'user-confirmed' ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#15803D]/10 text-[#15803D] font-semibold text-[11px]">
                              User Confirmed
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-[#B45309]/10 text-[#B45309] font-semibold text-[11px]">
                              Imported / Unreviewed
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          {item.status !== 'user-confirmed' && (
                            <button
                              onClick={() => handleUpdateEvidenceStatus(item.id, 'user-confirmed')}
                              className="px-2 py-1 bg-[#15803D] hover:bg-[#166534] text-white rounded text-[11px] font-semibold"
                            >
                              Confirm
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteEvidence(item.id)}
                            className="p-1 text-[#DC2626] hover:bg-[#FEF2F2] rounded"
                            title="Delete claim"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
