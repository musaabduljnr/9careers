import React from 'react';
import { Job } from '../../../domain/types';
import { Card } from '../Card';
import { Button } from '../Button';
import {
  Building2,
  MapPin,
  Globe2,
  DollarSign,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Zap,
  GraduationCap
} from 'lucide-react';

interface JobDetailsModalProps {
  job: Job;
  onClose: () => void;
  onOneClickPrep: (job: Job) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  job,
  onClose,
  onOneClickPrep
}) => {
  const match = job.match;

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

        {/* Company & Role Header */}
        <div className="flex items-start gap-4">
          {job.company_logo ? (
            <img src={job.company_logo} alt={job.company_name} className="w-16 h-16 rounded-2xl object-contain bg-white p-2 border border-slate-200 dark:border-slate-800 shadow-md" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              <Building2 className="w-8 h-8" />
            </div>
          )}

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{job.title}</h2>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              {job.company_name} • <span className="text-indigo-500 font-bold">{job.source_name}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <MapPin className="w-3.5 h-3.5 inline mr-1 text-indigo-500" /> {job.location}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Globe2 className="w-3.5 h-3.5 inline mr-1 text-emerald-500" /> {job.remote_status}
              </span>
              {job.salary_formatted && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
                  <DollarSign className="w-3.5 h-3.5 inline mr-1" /> {job.salary_formatted}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* AI Match Overview Gauge Section */}
        {match && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2 text-indigo-300">
                <Sparkles className="w-4 h-4 text-indigo-400" /> AI Resume Compatibility Analysis
              </h3>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black">
                {match.overall_match_score}% Overall Match
              </span>
            </div>

            {/* Competency Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-slate-400">Technical Skills</span>
                <p className="font-extrabold text-base text-emerald-400">{match.skill_match_score}%</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-slate-400">Experience</span>
                <p className="font-extrabold text-base text-indigo-400">{match.experience_match_score}%</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-slate-400">Interview Likelihood</span>
                <p className="font-extrabold text-base text-purple-400">{match.interview_likelihood_percent}%</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-slate-400">ATS Readiness</span>
                <p className="font-extrabold text-base text-teal-400">{match.readiness_percent}%</p>
              </div>
            </div>

            {/* Why Recommended Reasons */}
            <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
              <strong className="text-indigo-300 uppercase tracking-wider text-[10px]">Why Recommended for You:</strong>
              {match.match_reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>

            {/* Missing Skills Highlight */}
            {match.missing_skills.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
                <strong className="text-amber-400 uppercase tracking-wider text-[10px]">Missing Skills to Add:</strong>
                <div className="flex flex-wrap gap-1.5">
                  {match.missing_skills.map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                      + {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Job Responsibilities & Qualifications */}
        <div className="space-y-4 text-xs text-slate-800 dark:text-slate-200">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">Job Description</h4>
            <p className="whitespace-pre-wrap text-slate-600 dark:text-slate-300 leading-relaxed">
              {job.description || "No full description provided."}
            </p>
          </div>

          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">Key Responsibilities</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                {job.responsibilities.map((res, idx) => (
                  <li key={idx}>{res}</li>
                ))}
              </ul>
            </div>
          )}

          {job.qualifications && job.qualifications.length > 0 && (
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">Requirements & Qualifications</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                {job.qualifications.map((qual, idx) => (
                  <li key={idx}>{qual}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              onClick={() => onOneClickPrep(job)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
            >
              <Zap className="w-4 h-4 mr-1.5 text-amber-400" /> 1-Click Prep Package
            </Button>

            {job.application_url && (
              <a
                href={job.application_url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                Apply Directly <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
