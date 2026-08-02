import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../infrastructure/api_client';
import { Resume, GeneratedInterviewQuestion, InterviewQuestionBank } from '../../domain/types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

import {
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  Star,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Building2,
  Zap,
  Filter,
  ClipboardList,
  MessageSquare,
  Tag,
  Eye,
  EyeOff,
  Loader2,
  Users,
  Code2,
  HelpCircle,
  Cpu,
  FlaskConical
} from 'lucide-react';

// -------------- Helpers ------------------
const TYPE_CONFIG: Record<string, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  Technical:   { color: 'text-blue-500',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   icon: Code2 },
  Behavioral:  { color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: Users },
  HR:          { color: 'text-emerald-500',bg: 'bg-emerald-500/10',border: 'border-emerald-500/30',icon: HelpCircle },
  Situational: { color: 'text-amber-500',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  icon: FlaskConical },
  STAR:        { color: 'text-rose-500',   bg: 'bg-rose-500/10',   border: 'border-rose-500/30',   icon: Star },
};

const DIFFICULTY_CONFIG: Record<string, { color: string; bg: string }> = {
  Easy:   { color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  Medium: { color: 'text-amber-600',   bg: 'bg-amber-100 dark:bg-amber-900/30' },
  Hard:   { color: 'text-red-600',     bg: 'bg-red-100 dark:bg-red-900/30' },
};

const ALL_TYPES = ['Technical', 'Behavioral', 'HR', 'Situational', 'STAR'];

// -------------- Sub-components -----------

const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG['Technical'];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
      <Icon size={10} />
      {type}
    </span>
  );
};

const DifficultyBadge: React.FC<{ diff: string }> = ({ diff }) => {
  const cfg = DIFFICULTY_CONFIG[diff] ?? DIFFICULTY_CONFIG['Medium'];
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
      {diff}
    </span>
  );
};

interface QuestionCardProps {
  q: GeneratedInterviewQuestion;
  index: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ q, index }) => {
  const [expanded, setExpanded]           = useState(false);
  const [showModel, setShowModel]         = useState(false);
  const [showRubric, setShowRubric]       = useState(false);
  const [showFollowUp, setShowFollowUp]   = useState(false);
  const cfg = TYPE_CONFIG[q.question_type] ?? TYPE_CONFIG['Technical'];

  return (
    <div className={`rounded-2xl border bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-shadow hover:shadow-md ${cfg.border}`}>
      {/* Card Header */}
      <div
        className="flex items-start gap-4 p-5 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Number */}
        <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${cfg.bg} ${cfg.color}`}>
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-2">
            <TypeBadge type={q.question_type} />
            <DifficultyBadge diff={q.difficulty} />
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
              {q.category}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
            {q.question}
          </p>
        </div>

        <div className={`shrink-0 mt-0.5 ${cfg.color}`}>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {/* Expanded Body */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-5 pb-5 pt-4 flex flex-col gap-5">

          {/* Why Asked */}
          <div className="flex gap-3">
            <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Why Interviewers Ask This</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{q.why_asked}</p>
            </div>
          </div>

          {/* Keywords */}
          {q.keywords_to_include?.length > 0 && (
            <div className="flex gap-3">
              <Tag size={16} className="text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Keywords to Weave In</p>
                <div className="flex flex-wrap gap-1.5">
                  {q.keywords_to_include.map((kw, i) => (
                    <span key={i} className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STAR Breakdown (Behavioral / STAR types) */}
          {q.star_breakdown && (q.question_type === 'Behavioral' || q.question_type === 'STAR') && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/40 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500 mb-3">
                <Star size={10} className="inline mr-1" />
                STAR Structure Guide
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(['situation', 'task', 'action', 'result'] as const).map((key) => (
                  <div key={key} className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-rose-100 dark:border-rose-900/40">
                    <p className="text-[10px] font-black uppercase tracking-wider text-rose-400 mb-1">{key}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {q.star_breakdown![key]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Model Answer Toggle */}
          <div>
            <button
              onClick={() => setShowModel(!showModel)}
              className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
            >
              {showModel ? <EyeOff size={14} /> : <Eye size={14} />}
              {showModel ? 'Hide Model Answer' : 'Reveal Model Answer'}
            </button>

            {showModel && (
              <div className="mt-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/40 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-2">
                  <CheckCircle2 size={10} className="inline mr-1" />
                  Model Answer
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {q.model_answer}
                </p>
              </div>
            )}
          </div>

          {/* Scoring Rubric Toggle */}
          <div>
            <button
              onClick={() => setShowRubric(!showRubric)}
              className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-500 transition-colors"
            >
              <Target size={14} />
              {showRubric ? 'Hide Scoring Rubric' : 'View Scoring Rubric (1–5)'}
            </button>

            {showRubric && (
              <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Key Criteria */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Key Evaluation Criteria</p>
                  <div className="flex flex-wrap gap-1.5">
                    {q.scoring_rubric.key_criteria.map((c, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Score Tiers */}
                {[
                  { label: '★☆☆☆☆  1–2  /  5', desc: q.scoring_rubric.score_1_2, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10' },
                  { label: '★★★☆☆  3  /  5',   desc: q.scoring_rubric.score_3,   color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
                  { label: '★★★★★  4–5  /  5', desc: q.scoring_rubric.score_4_5, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
                ].map((tier, i) => (
                  <div key={i} className={`p-3 border-b last:border-b-0 border-slate-200 dark:border-slate-800 ${tier.bg}`}>
                    <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${tier.color}`}>{tier.label}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{tier.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Follow-up Questions Toggle */}
          {q.follow_up_questions?.length > 0 && (
            <div>
              <button
                onClick={() => setShowFollowUp(!showFollowUp)}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <MessageSquare size={14} />
                {showFollowUp ? 'Hide Follow-Up Questions' : `${q.follow_up_questions.length} Likely Follow-Up Questions`}
              </button>

              {showFollowUp && (
                <ul className="mt-2 flex flex-col gap-1.5">
                  {q.follow_up_questions.map((fu, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <span className="text-slate-400 font-bold shrink-0">↳</span>
                      {fu}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// -------------- Main Page ----------------
export const InterviewQuestionsPage: React.FC = () => {
  // Form state
  const [resumeText, setResumeText]           = useState('');
  const [jobDescription, setJobDescription]   = useState('');
  const [companyName, setCompanyName]         = useState('');
  const [jobTitle, setJobTitle]               = useState('');
  const [selectedTypes, setSelectedTypes]     = useState<string[]>([...ALL_TYPES]);
  const [numPerType, setNumPerType]           = useState(3);
  const [activeFilter, setActiveFilter]       = useState<string>('All');
  const [showResearch, setShowResearch]       = useState(false);

  // Fetch latest resume to pre-fill resume text
  const { data: latestResume } = useQuery<Resume>({
    queryKey: ['latest-resume'],
    queryFn: async () => {
      const res = await api.get<Resume>('/api/v1/resumes/latest');
      return res.data;
    },
    retry: false,
  });

  // Generate mutation
  const generateMutation = useMutation<InterviewQuestionBank, Error, void>({
    mutationFn: async () => {
      const payload = {
        resume_text: resumeText || latestResume?.original_text || '',
        job_description: jobDescription,
        company_name: companyName,
        job_title: jobTitle,
        question_types: selectedTypes,
        num_questions_per_type: numPerType,
      };
      const res = await api.post<InterviewQuestionBank>('/api/v1/interviews/generate-questions', payload);
      return res.data;
    },
  });

  const bank = generateMutation.data;

  // Filtered questions based on type tab
  const filteredQuestions = bank
    ? activeFilter === 'All'
      ? bank.questions
      : bank.questions.filter((q) => q.question_type === activeFilter)
    : [];

  const typeCounts = bank
    ? ALL_TYPES.reduce((acc, t) => {
        acc[t] = bank.questions.filter((q) => q.question_type === t).length;
        return acc;
      }, {} as Record<string, number>)
    : {};

  const toggleType = (t: string) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const canGenerate =
    (resumeText.trim().length >= 50 || (latestResume?.original_text?.length ?? 0) >= 50) &&
    jobDescription.trim().length >= 50 &&
    companyName.trim() &&
    jobTitle.trim() &&
    selectedTypes.length > 0;

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
            <BrainCircuit size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">
              Interview Question Generator
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              AI-powered, personalised questions with model answers & scoring rubrics
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ---- LEFT: Input Form ---- */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Company & Role */}
          <Card className="p-5 border-slate-200/60 dark:border-slate-800 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 size={15} className="text-indigo-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Company & Role</h3>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Company Name *</label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Paystack, GTBank, Flutterwave"
                className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Job Title *</label>
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
              />
            </div>
          </Card>

          {/* Resume Text */}
          <Card className="p-5 border-slate-200/60 dark:border-slate-800 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <ClipboardList size={15} className="text-indigo-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Resume</h3>
              </div>
              {latestResume && (
                <button
                  onClick={() => setResumeText(latestResume.original_text)}
                  className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 uppercase tracking-wider transition-colors"
                >
                  ↑ Load Latest CV
                </button>
              )}
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={8}
              placeholder={latestResume
                ? `Your latest resume (${latestResume.file_name}) will be used automatically. You can paste a different one here.`
                : 'Paste your full resume/CV text here...'}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 resize-none font-mono leading-relaxed"
            />
            {latestResume && !resumeText && (
              <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                <CheckCircle2 size={10} />
                Using "{latestResume.file_name}" automatically
              </p>
            )}
          </Card>

          {/* Job Description */}
          <Card className="p-5 border-slate-200/60 dark:border-slate-800 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={15} className="text-indigo-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Job Description *</h3>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
              placeholder="Paste the full job description here..."
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 resize-none font-mono leading-relaxed"
            />
          </Card>

          {/* Question Type Selector */}
          <Card className="p-5 border-slate-200/60 dark:border-slate-800 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <Filter size={15} className="text-indigo-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Question Types</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_TYPES.map((t) => {
                const cfg = TYPE_CONFIG[t];
                const Icon = cfg.icon;
                const active = selectedTypes.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleType(t)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                      active
                        ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <Icon size={12} />
                    {t}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Questions per type: <span className="text-indigo-500">{numPerType}</span>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={numPerType}
                onChange={(e) => setNumPerType(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
              </div>
            </div>
          </Card>

          {/* Generate Button */}
          <Button
            variant="primary"
            onClick={() => generateMutation.mutate()}
            disabled={!canGenerate || generateMutation.isPending}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Generating {selectedTypes.length * numPerType} Questions…
              </>
            ) : (
              <>
                <Zap size={16} className="mr-2" />
                Generate Question Bank
              </>
            )}
          </Button>

          {!canGenerate && !generateMutation.isPending && (
            <p className="text-[10px] text-slate-400 text-center">
              Fill in Company, Job Title, Job Description, and at least one question type to generate.
            </p>
          )}

          {generateMutation.isError && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
              <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 dark:text-red-400">
                {generateMutation.error.message || 'Generation failed. Please try again.'}
              </p>
            </div>
          )}
        </div>

        {/* ---- RIGHT: Results Panel ---- */}
        <div className="lg:col-span-3 flex flex-col gap-6">

          {/* Generating state */}
          {generateMutation.isPending && (
            <Card className="p-8 flex flex-col items-center justify-center gap-4 border-dashed border-indigo-300 dark:border-indigo-700 min-h-[400px]">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <BrainCircuit size={28} className="text-indigo-500 animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-800 dark:text-white">Crafting Your Question Bank</p>
                <p className="text-xs text-slate-500 mt-1">
                  Analysing resume, job description &amp; company profile…
                </p>
              </div>
            </Card>
          )}

          {/* Empty state */}
          {!generateMutation.isPending && !bank && (
            <Card className="p-10 flex flex-col items-center justify-center gap-4 border-dashed border-slate-300 dark:border-slate-700 min-h-[400px] text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <BrainCircuit size={28} className="text-slate-400" />
              </div>
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300">No Questions Yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Fill in your resume, job description, and company details on the left — then click Generate.
                </p>
              </div>
            </Card>
          )}

          {/* Results */}
          {bank && !generateMutation.isPending && (
            <>
              {/* Summary Banner */}
              <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1">Interview Preparation Kit</p>
                  <h2 className="text-lg font-black">{bank.job_title} · {bank.company_name}</h2>
                  <p className="text-xs text-indigo-200 mt-0.5">{bank.total_questions} questions across {selectedTypes.length} categories</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <div className="text-center bg-white/10 rounded-xl px-4 py-2">
                    <div className="text-2xl font-black">{bank.total_questions}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Questions</div>
                  </div>
                </div>
              </div>

              {/* Preparation Tips */}
              {bank.preparation_tips?.length > 0 && (
                <Card className="p-5 border-amber-200/50 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-900/10 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb size={15} className="text-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Interview Preparation Tips
                    </h3>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {bank.preparation_tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <span className="text-amber-400 font-bold shrink-0">{i + 1}.</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Company Research Notes Toggle */}
              {bank.company_research_notes && (
                <Card className="p-5 border-slate-200/60 dark:border-slate-800 flex flex-col gap-3">
                  <button
                    onClick={() => setShowResearch(!showResearch)}
                    className="flex items-center justify-between w-full"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 size={15} className="text-indigo-500" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Company Research Notes
                      </h3>
                    </div>
                    {showResearch ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </button>
                  {showResearch && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line pt-2 border-t border-slate-100 dark:border-slate-800">
                      {bank.company_research_notes}
                    </div>
                  )}
                </Card>
              )}

              {/* Type Filter Tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter size={14} className="text-slate-400 shrink-0" />
                {['All', ...ALL_TYPES.filter((t) => (typeCounts[t] ?? 0) > 0)].map((t) => {
                  const cfg = TYPE_CONFIG[t];
                  const count = t === 'All' ? bank.total_questions : typeCounts[t];
                  const isActive = activeFilter === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setActiveFilter(t)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                        isActive
                          ? cfg
                            ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                            : 'bg-slate-800 text-white border-slate-700'
                          : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {t === 'All' ? <Cpu size={12} /> : React.createElement(TYPE_CONFIG[t].icon, { size: 12 })}
                      {t}
                      <span className={`text-[10px] font-black ml-0.5 ${isActive ? '' : 'text-slate-400'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Question Cards */}
              <div className="flex flex-col gap-4">
                {filteredQuestions.map((q, i) => (
                  <QuestionCard key={q.id} q={q} index={i} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
