import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../infrastructure/api_client';
import { Resume, JobAnalysis } from '../../domain/types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CircularProgress } from '../components/CircularProgress';
import { 
  Sparkles, 
  Layers, 
  GraduationCap, 
  Briefcase, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle,
  TrendingUp,
  FileText
} from 'lucide-react';

interface MatchResult {
  overall_match_percentage: number;
  skills_match_score: number;
  experience_match_score: number;
  keyword_match_score: number;
  education_match_score: number;
  likelihood_of_interview: 'High' | 'Medium' | 'Low';
  explanations: {
    skills: string;
    experience: string;
    education: string;
  };
  missing_skills: string[];
  recommendations: string[];
}

export const JobMatchPage: React.FC = () => {
  // Select state
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [errorText, setErrorText] = useState<string | null>(null);

  // Queries
  const { data: resumes = [], isLoading: isResumesLoading } = useQuery<Resume[], any>({
    queryKey: ['resumes-list'],
    queryFn: async () => {
      const res = await api.get<Resume[]>('/api/v1/resumes');
      return res.data;
    }
  });

  const { data: jobs = [], isLoading: isJobsLoading } = useQuery<JobAnalysis[], any>({
    queryKey: ['job-analyses-list'],
    queryFn: async () => {
      const res = await api.get<JobAnalysis[]>('/api/v1/jobs/analyses');
      return res.data;
    }
  });

  // Semantic Match Mutation
  const matchMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<MatchResult>('/api/v1/jobs/match', {
        resume_id: parseInt(selectedResumeId),
        job_id: parseInt(selectedJobId)
      });
      return res.data;
    },
    onError: (err: any) => {
      setErrorText(err.response?.data?.detail || err.message || 'Semantic comparison failed.');
    }
  });

  const handleMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedResumeId && selectedJobId) {
      matchMutation.mutate();
    }
  };

  const matchData = matchMutation.data;
  const isPending = matchMutation.isPending;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-850 dark:text-white flex items-center gap-2">
          <Sparkles className="text-emerald-500 shrink-0" />
          Semantic Job Match Engine
        </h1>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          Compare your CV with target positions using neural text embeddings to identify conceptual similarities beyond keyword matches
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Panel: Select Options */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="border-slate-200/50 dark:border-slate-850">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-5">Compare Variables</h3>
            
            {errorText && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle size={16} className="shrink-0" />
                <span className="text-xs font-semibold">{errorText}</span>
              </div>
            )}

            <form onSubmit={handleMatchSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Resume</label>
                {isResumesLoading ? (
                  <div className="h-10 bg-slate-50 dark:bg-slate-950 rounded-xl animate-pulse" />
                ) : resumes.length > 0 ? (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                    required
                  >
                    <option value="">-- Choose an uploaded CV --</option>
                    {resumes.map(r => (
                      <option key={r.id} value={r.id}>{r.file_name} ({new Date(r.created_at).toLocaleDateString()})</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs text-red-500 font-bold">Please upload a resume first!</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Job Listing</label>
                {isJobsLoading ? (
                  <div className="h-10 bg-slate-50 dark:bg-slate-950 rounded-xl animate-pulse" />
                ) : jobs.length > 0 ? (
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                    required
                  >
                    <option value="">-- Choose a parsed Job listing --</option>
                    {jobs.map(j => (
                      <option key={j.id} value={j.id}>{j.job_title} at {j.company}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs text-red-500 font-bold">Please parse a job description first!</span>
                )}
              </div>

              <Button
                variant="primary"
                type="submit"
                isLoading={isPending}
                disabled={!selectedResumeId || !selectedJobId}
                className="w-full py-2.5 text-xs mt-2"
              >
                <Sparkles size={14} className="mr-2" />
                Analyze Semantic Match
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Panel: Output Analysis */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {isPending ? (
            <Card className="border-slate-200/50 dark:border-slate-850 flex flex-col items-center justify-center py-32">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent animate-spin mb-4" />
              <span className="text-sm font-bold text-slate-850 dark:text-white">Calculating Semantic Commonalities</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 mt-2 max-w-sm text-center leading-relaxed font-semibold">
                Extracting multi-dimensional neural text embeddings and running cosine similarity matrices...
              </span>
            </Card>
          ) : matchData ? (
            <div className="flex flex-col gap-6">
              
              {/* Score breakdown charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Radial gauge */}
                <Card className="border-slate-200/50 dark:border-slate-850 flex flex-col items-center justify-center py-6 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Semantic Overlap Fit</span>
                  
                  <div className="relative flex items-center justify-center w-36 h-36">
                    <svg className="transform -rotate-90" width={140} height={140}>
                      <circle className="stroke-slate-100 dark:stroke-slate-900" fill="transparent" strokeWidth={10} r={60} cx={70} cy={70} />
                      <circle 
                        className="stroke-emerald-500 transition-all duration-1000 ease-out" 
                        fill="transparent" 
                        strokeWidth={10} 
                        strokeLinecap="round"
                        r={60} 
                        cx={70} 
                        cy={70} 
                        strokeDasharray={377}
                        strokeDashoffset={377 - (matchData.overall_match_percentage / 100) * 377}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-slate-850 dark:text-white">{matchData.overall_match_percentage}%</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Match Level</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Interview Chance:</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
                      matchData.likelihood_of_interview === 'High'
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : matchData.likelihood_of_interview === 'Medium'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {matchData.likelihood_of_interview} Likelihood
                    </span>
                  </div>
                </Card>

                {/* Sub-scores */}
                <Card className="border-slate-200/50 dark:border-slate-850 flex flex-col justify-between">
                  <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4">Semantic Metric Breaks</h3>
                  <div className="flex flex-col gap-3.5">
                    {[
                      { label: 'Skills Match', val: matchData.skills_match_score, color: 'from-emerald-500 to-teal-500' },
                      { label: 'Experience Match', val: matchData.experience_match_score, color: 'from-blue-500 to-indigo-500' },
                      { label: 'Keyword Semantic Fit', val: matchData.keyword_match_score, color: 'from-amber-500 to-orange-500' },
                      { label: 'Education Match', val: matchData.education_match_score, color: 'from-purple-500 to-violet-500' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                          <span className="text-slate-800 dark:text-white">{item.val}/100</span>
                        </div>
                        <div className="w-full bg-slate-105 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-2 rounded-full bg-gradient-to-r ${item.color}`}
                            style={{ width: `${item.val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Explanations */}
              <Card className="border-slate-200/50 dark:border-slate-850 flex flex-col gap-6">
                <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider">Semantic Match Diagnostics</h3>
                
                <div className="flex flex-col gap-4">
                  <div className="flex gap-3.5 items-start">
                    <div className="bg-emerald-500/10 text-emerald-500 p-2.5 rounded-xl shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Skills Comparison</span>
                      <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 leading-relaxed font-semibold">{matchData.explanations.skills}</p>
                    </div>
                  </div>

                  <div className="flex gap-3.5 items-start border-t border-slate-100 dark:border-slate-900/60 pt-4">
                    <div className="bg-blue-500/10 text-blue-500 p-2.5 rounded-xl shrink-0">
                      <Briefcase size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Experience Alignment</span>
                      <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 leading-relaxed font-semibold">{matchData.explanations.experience}</p>
                    </div>
                  </div>

                  <div className="flex gap-3.5 items-start border-t border-slate-100 dark:border-slate-900/60 pt-4">
                    <div className="bg-purple-500/10 text-purple-500 p-2.5 rounded-xl shrink-0">
                      <GraduationCap size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Education Fit</span>
                      <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 leading-relaxed font-semibold">{matchData.explanations.education}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Missing skills */}
              {matchData.missing_skills && matchData.missing_skills.length > 0 && (
                <Card className="border-slate-200/50 dark:border-slate-850">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">Missing Skill Gaps</h3>
                  <div className="flex flex-wrap gap-2">
                    {matchData.missing_skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                        - {skill}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Recommendations */}
              <Card className="border-slate-200/50 dark:border-slate-850">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">Alignment Recommendations</h3>
                <ul className="flex flex-col gap-3">
                  {matchData.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start">
                      <span className="text-emerald-500 text-xs shrink-0">✓</span>
                      <span className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-semibold">{rec}</span>
                    </li>
                  ))}
                </ul>
              </Card>

            </div>
          ) : (
            <Card className="border-slate-200/50 dark:border-slate-850 flex flex-col items-center justify-center py-32 text-center">
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-full text-slate-400 dark:text-slate-600 mb-4 border border-slate-100 dark:border-slate-900">
                <TrendingUp size={36} />
              </div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-white">Awaiting Analysis</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm leading-relaxed">
                Choose one of your CVs and a parsed Job listing in the options panel, then click run to process semantic similarity.
              </p>
            </Card>
          )}

        </div>

      </div>
    </div>
  );
};
