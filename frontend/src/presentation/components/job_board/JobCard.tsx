import React from 'react';
import { Job } from '../../../domain/types';
import { Card } from '../Card';
import { Button } from '../Button';
import {
  Building2,
  MapPin,
  DollarSign,
  Sparkles,
  Bookmark,
  ExternalLink,
  Zap,
  Globe2,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';

interface JobCardProps {
  job: Job;
  isBookmarked?: boolean;
  onSelectJob: (job: Job) => void;
  onToggleBookmark: (jobId: number) => void;
  onOneClickPrep?: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isBookmarked = false,
  onSelectJob,
  onToggleBookmark,
  onOneClickPrep
}) => {
  const matchScore = job.match?.overall_match_score || 85;

  const getMatchBadgeClass = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    if (score >= 70) return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
  };

  return (
    <Card className="p-5 relative overflow-hidden transition-all duration-200 hover:shadow-xl hover:border-indigo-500/30 dark:hover:border-indigo-400/30 group flex flex-col justify-between space-y-4">
      {/* Top Header: Logo, Title, Match Score & Quick Bookmark */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {job.company_logo ? (
              <img
                src={job.company_logo}
                alt={job.company_name}
                className="w-11 h-11 rounded-xl object-contain bg-white p-1 border border-slate-200 dark:border-slate-800 shadow-sm"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-md">
                <Building2 className="w-5 h-5" />
              </div>
            )}

            <div>
              <h3
                onClick={() => onSelectJob(job)}
                className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer line-clamp-1"
              >
                {job.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {job.company_name} • <span className="opacity-80">{job.source_name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* AI Match Score Badge */}
            <div className={`px-2.5 py-1 rounded-full text-xs font-black border flex items-center gap-1 shadow-sm ${getMatchBadgeClass(matchScore)}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{matchScore}% Match</span>
            </div>

            {/* Bookmark */}
            <button
              onClick={() => onToggleBookmark(job.id)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isBookmarked
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                  : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Location, Salary, Employment Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {job.location}
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-medium">
            <Globe2 className="w-3.5 h-3.5 text-emerald-500" /> {job.remote_status}
          </span>

          {job.salary_formatted && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
              <DollarSign className="w-3.5 h-3.5" /> {job.salary_formatted}
            </span>
          )}

          {job.nysc_friendly && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-wider border border-indigo-500/20">
              <GraduationCap className="w-3 h-3" /> NYSC Friendly
            </span>
          )}
        </div>

        {/* AI Match Reason Highlight */}
        {job.match?.match_reasons && job.match.match_reasons.length > 0 && (
          <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-indigo-500/5 dark:bg-indigo-500/10 p-2.5 rounded-lg border border-indigo-500/10 flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              <strong className="text-indigo-600 dark:text-indigo-400">Why Recommended: </strong>
              {job.match.match_reasons[0]}
            </span>
          </p>
        )}

        {/* Required Skills Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {job.skills?.slice(0, 5).map((skill, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium"
            >
              {skill}
            </span>
          ))}
          {job.skills && job.skills.length > 5 && (
            <span className="text-[11px] text-slate-400 font-medium self-center">
              +{job.skills.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800/80">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onSelectJob(job)}
          className="text-xs font-semibold"
        >
          View Details
        </Button>

        {onOneClickPrep && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onOneClickPrep(job)}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
          >
            <Zap className="w-3.5 h-3.5 mr-1" /> 1-Click Prep Package
          </Button>
        )}
      </div>
    </Card>
  );
};
