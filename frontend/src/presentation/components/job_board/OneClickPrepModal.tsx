import React, { useState } from 'react';
import { OneClickPrepPackage } from '../../../domain/types';
import { Card } from '../Card';
import { Button } from '../Button';
import {
  Zap,
  FileText,
  FileSignature,
  HelpCircle,
  CheckCircle2,
  Copy,
  Check,
  X,
  Sparkles,
  Download
} from 'lucide-react';

interface OneClickPrepModalProps {
  prepPackage: OneClickPrepPackage;
  onClose: () => void;
}

export const OneClickPrepModal: React.FC<OneClickPrepModalProps> = ({
  prepPackage,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'resume' | 'cover_letter' | 'questions' | 'checklist'>('resume');
  const [copied, setCopied] = useState(false);

  const handleCopyActiveText = () => {
    const textToCopy =
      activeTab === 'resume'
        ? prepPackage.tailored_resume_text
        : activeTab === 'cover_letter'
        ? prepPackage.cover_letter_text
        : activeTab === 'questions'
        ? prepPackage.expected_interview_questions.join('\n\n')
        : prepPackage.application_checklist.join('\n');

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-6 relative border-indigo-500/30 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 border border-indigo-500/20 text-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4 text-indigo-400" /> 1-Click Application Package
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black">
              {prepPackage.estimated_ats_score}% Estimated ATS Score
            </span>
          </div>

          <h2 className="text-2xl font-black">{prepPackage.job_title}</h2>
          <p className="text-slate-300 text-xs sm:text-sm">
            {prepPackage.company_name} • {prepPackage.company_research_notes}
          </p>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'resume'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" /> Tailored Resume
          </button>
          <button
            onClick={() => setActiveTab('cover_letter')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'cover_letter'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileSignature className="w-4 h-4" /> Cover Letter
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'questions'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> Expected Interview Questions
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'checklist'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> Application Checklist
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[250px]">
          {activeTab === 'resume' && (
            <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
              {prepPackage.tailored_resume_text}
            </pre>
          )}

          {activeTab === 'cover_letter' && (
            <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
              {prepPackage.cover_letter_text}
            </pre>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Expected Role Questions for {prepPackage.company_name}
              </h4>
              <div className="space-y-2">
                {prepPackage.expected_interview_questions.map((q, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2">
                    <span className="font-bold text-indigo-500">{idx + 1}.</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Application Action Steps
              </h4>
              <div className="space-y-2">
                {prepPackage.application_checklist.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>

          <Button variant="primary" onClick={handleCopyActiveText}>
            {copied ? <Check className="w-4 h-4 mr-1.5 text-emerald-400" /> : <Copy className="w-4 h-4 mr-1.5" />}
            {copied ? 'Copied to Clipboard' : 'Copy Content'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
