'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Globe,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Sparkles,
  UserCheck,
  Info,
  Layers,
} from 'lucide-react';
import { ProvenanceLabel } from '@/lib/types';

interface ProvenanceBadgeProps {
  label: ProvenanceLabel;
  sourceUrl?: string;
  provider?: string;
  checkedDate?: string;
  note?: string;
  className?: string;
  showDetailsOnHover?: boolean;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  label,
  sourceUrl,
  provider,
  checkedDate,
  note,
  className = '',
  showDetailsOnHover = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  let badgeBg = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
  let Icon = Info;

  switch (label) {
    case 'Demo':
      badgeBg = 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      Icon = Layers;
      break;
    case 'User confirmed':
      badgeBg = 'bg-[#15803D]/10 text-[#15803D] dark:bg-[#15803D]/20 dark:text-[#4ADE80] border-[#15803D]/20';
      Icon = UserCheck;
      break;
    case 'Public source':
      badgeBg = 'bg-[#009B87]/10 text-[#009B87] dark:bg-[#009B87]/20 dark:text-[#2DD4BF] border-[#009B87]/20';
      Icon = Globe;
      break;
    case 'Provider verified':
      badgeBg = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      Icon = CheckCircle2;
      break;
    case 'AI generated — needs review':
      badgeBg = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      Icon = Sparkles;
      break;
    case 'Imported — needs review':
    case 'Unverified':
      badgeBg = 'bg-[#B45309]/10 text-[#B45309] dark:bg-[#B45309]/20 dark:text-[#FBBF24] border-[#B45309]/20';
      Icon = HelpCircle;
      break;
    case 'Retrieval failed':
      badgeBg = 'bg-[#DC2626]/10 text-[#DC2626] dark:bg-[#DC2626]/20 dark:text-[#F87171] border-[#DC2626]/20';
      Icon = AlertCircle;
      break;
    case 'Integration unavailable':
      badgeBg = 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-300 dark:border-gray-700';
      Icon = Info;
      break;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold inline-flex items-center space-x-1 cursor-pointer transition-opacity hover:opacity-80 ${badgeBg}`}
        title="Click to view provenance & verification source details"
      >
        <Icon className="w-3 h-3 shrink-0" />
        <span>{label}</span>
      </button>

      {/* Provenance Details Drawer Tooltip */}
      {isOpen && (
        <div className="absolute left-0 mt-1 z-40 w-64 p-3 bg-white dark:bg-[#1B2230] border border-[#E5E9E7] dark:border-[#2A3447] rounded-xl shadow-xl text-xs space-y-1.5 text-[#171D27] dark:text-[#F3F4F6]">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#EEF1EF] dark:border-[#232C3D] font-bold text-[11px] text-[#009B87] dark:text-[#2DD4BF]">
            <span>Provenance & Source Audit</span>
            <button onClick={() => setIsOpen(false)} className="text-[#89919B] hover:text-[#171D27]">✕</button>
          </div>
          <div>
            <strong className="text-[#626B78] dark:text-[#9CA3AF]">Status:</strong> {label}
          </div>
          {provider && (
            <div>
              <strong className="text-[#626B78] dark:text-[#9CA3AF]">Provider:</strong> {provider}
            </div>
          )}
          {checkedDate && (
            <div>
              <strong className="text-[#626B78] dark:text-[#9CA3AF]">Date Checked:</strong> {checkedDate}
            </div>
          )}
          {sourceUrl && (
            <div className="pt-1">
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#009B87] hover:underline flex items-center space-x-1 font-semibold truncate"
              >
                <Globe className="w-3 h-3 shrink-0" />
                <span className="truncate">{sourceUrl}</span>
                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
              </a>
            </div>
          )}
          {note && (
            <div className="text-[10px] text-[#89919B] italic pt-1 border-t border-[#EEF1EF] dark:border-[#232C3D]">
              {note}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
