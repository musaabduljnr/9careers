import React from 'react';
import { PrepProfile } from '../../../domain/types';
import { Button } from '../Button';
import { Card } from '../Card';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Target,
  HelpCircle,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface PrepAnalysisModalProps {
  prepProfile: PrepProfile;
  onProceedToLive: () => void;
  onBackToSetup: () => void;
  isStarting?: boolean;
}

export const PrepAnalysisModal: React.FC<PrepAnalysisModalProps> = ({
  prepProfile,
  onProceedToLive,
  onBackToSetup,
  isStarting = false
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 border border-indigo-500/20 text-white space-y-2 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-indigo-400" /> AI Preparation Engine Report
        </div>
        <h2 className="text-2xl font-black">Candidate Strategy & Focus Profile</h2>
        <p className="text-slate-300 text-xs sm:text-sm">
          {prepProfile.candidate_summary || `Preparing for ${prepProfile.target_role} at ${prepProfile.company}`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Key Strengths */}
        <Card className="p-5 space-y-3 border-emerald-500/20 bg-emerald-950/5 dark:bg-emerald-950/10">
          <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Position Strengths
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            {prepProfile.key_strengths?.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Perceived Weaknesses */}
        <Card className="p-5 space-y-3 border-amber-500/20 bg-amber-950/5 dark:bg-amber-950/10">
          <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Potential Scrutiny Areas
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            {prepProfile.perceived_weaknesses?.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Focus Areas & Strategy */}
      <Card className="p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-indigo-500" /> Strategic Interview Direction
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 font-medium">
            {prepProfile.interview_strategy || 'Adopt a structured STAR method approach focusing on measurable project impact and system architecture decisions.'}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
            <UserCheck className="w-4 h-4 text-indigo-500" /> Primary Focus Areas
          </h3>
          <div className="flex flex-wrap gap-2">
            {prepProfile.focus_areas?.map((fa, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-semibold"
              >
                {fa}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Likely Questions Preview */}
      <Card className="p-6 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-500" /> Likely Question Topics
        </h3>
        <div className="space-y-2">
          {prepProfile.likely_questions?.slice(0, 4).map((q, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-start gap-2"
            >
              <span className="font-bold text-indigo-500">{idx + 1}.</span>
              <span>{q}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="secondary" onClick={onBackToSetup} disabled={isStarting}>
          Adjust Settings
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onProceedToLive}
          isLoading={isStarting}
          className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30"
        >
          Enter Live Interview Room <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
