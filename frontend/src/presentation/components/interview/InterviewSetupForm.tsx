import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  InterviewModeType,
  DifficultyLevel,
  InterviewStyle,
  DurationMinutes,
  InterviewSetupConfig
} from '../../../domain/types';
import { Card } from '../Card';
import { Button } from '../Button';
import { InputField } from '../InputField';
import {
  Briefcase,
  Building2,
  Clock,
  Sparkles,
  Volume2,
  FileText,
  Sliders,
  CheckCircle2,
  UserCheck
} from 'lucide-react';

interface InterviewSetupFormProps {
  onSetupSubmit: (config: InterviewSetupConfig) => void;
  isLoading?: boolean;
}

const INTERVIEW_MODES: { mode: InterviewModeType; icon: string; desc: string }[] = [
  { mode: 'Software Engineering', icon: '💻', desc: 'Full-stack, algorithms, and system design' },
  { mode: 'Frontend', icon: '🎨', desc: 'React, TypeScript, CSS & Web performance' },
  { mode: 'Backend', icon: '⚙️', desc: 'Databases, APIs, concurrency & microservices' },
  { mode: 'Python', icon: '🐍', desc: 'Python internals, async, and ecosystem' },
  { mode: 'React', icon: '⚛️', desc: 'React state, hooks, virtual DOM & architecture' },
  { mode: 'AI Engineer', icon: '🤖', desc: 'LLMs, PyTorch, RAG & MLOps' },
  { mode: 'Data Analyst', icon: '📊', desc: 'SQL, Python, data modeling & business metrics' },
  { mode: 'Product Manager', icon: '🚀', desc: 'Product strategy, metrics & stakeholder management' },
  { mode: 'UI/UX Designer', icon: '✨', desc: 'Design systems, user research & prototyping' },
  { mode: 'Behavioral', icon: '🗣️', desc: 'STAR format behavioral leadership questions' },
  { mode: 'General HR', icon: '👔', desc: 'Culture fit, career trajectory & expectations' },
  { mode: 'Customer Support', icon: '🎧', desc: 'De-escalation, SLA handling & customer empathy' },
  { mode: 'Sales', icon: '📈', desc: 'Prospecting, objection handling & closing' },
  { mode: 'Graduate', icon: '🎓', desc: 'Entry-level fundamentals & learning capability' },
  { mode: 'NYSC', icon: '🇳🇬', desc: 'Nigerian Youth Service Corp PPA placements' },
  { mode: 'Internship', icon: '🌱', desc: 'Internship technical & behavioral evaluation' },
  { mode: 'Remote Jobs', icon: '🌍', desc: 'Asynchronous communication & international remote fit' },
  { mode: 'Custom Interview', icon: '⚡', desc: 'Fully customized job role and company parameters' }
];

const STYLES: { key: InterviewStyle; label: string; desc: string }[] = [
  { key: 'friendly', label: 'Friendly', desc: 'Encouraging & supportive recruiter' },
  { key: 'professional', label: 'Professional', desc: 'Standard structured corporate interviewer' },
  { key: 'strict', label: 'Strict', desc: 'Challenging, detail-oriented hiring manager' },
  { key: 'startup', label: 'Startup', desc: 'Fast-paced, pragmatic & impact-driven' },
  { key: 'corporate', label: 'Corporate', desc: 'Formal executive panel style' }
];

const DIFFICULTIES: { key: DifficultyLevel; label: string }[] = [
  { key: 'junior', label: 'Junior (0-2 Yrs)' },
  { key: 'mid', label: 'Mid-Level (2-5 Yrs)' },
  { key: 'senior', label: 'Senior (5-8 Yrs)' },
  { key: 'principal', label: 'Principal / Lead (8+ Yrs)' }
];

const DURATIONS: { key: DurationMinutes; label: string }[] = [
  { key: 10, label: '10 Mins (Quick Screening)' },
  { key: 20, label: '20 Mins (Standard Interview)' },
  { key: 30, label: '30 Mins (In-Depth Technical)' },
  { key: 45, label: '45 Mins (Executive Panel)' }
];

export const InterviewSetupForm: React.FC<InterviewSetupFormProps> = ({
  onSetupSubmit,
  isLoading = false
}) => {
  const [selectedMode, setSelectedMode] = useState<InterviewModeType>('Software Engineering');
  const [selectedStyle, setSelectedStyle] = useState<InterviewStyle>('professional');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('senior');
  const [selectedDuration, setSelectedDuration] = useState<DurationMinutes>(20);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const { register, handleSubmit } = useForm<{
    job_role: string;
    company: string;
    resume_text: string;
    job_description: string;
  }>({
    defaultValues: {
      job_role: 'Senior Full Stack Engineer',
      company: 'Paystack / International Tech',
      resume_text: '',
      job_description: ''
    }
  });

  const onSubmit = (data: any) => {
    onSetupSubmit({
      interview_type: selectedMode,
      job_role: data.job_role || selectedMode,
      company: data.company || 'Tech Employer',
      difficulty: selectedDifficulty,
      duration_minutes: selectedDuration,
      interview_style: selectedStyle,
      voice_enabled: voiceEnabled,
      language: 'en',
      resume_text: data.resume_text || '',
      job_description: data.job_description || ''
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 border border-indigo-500/20 shadow-2xl">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Recruiter Simulator
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Configure Your Mock Interview
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl">
            Experience realistic, multi-turn AI interviews with live voice synthesis, candidate resume context, STAR response scoring, and post-interview coaching.
          </p>
        </div>
      </div>

      {/* 1. Choose Interview Mode */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            Select Interview Track
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">18 Specialized Tracks Available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
          {INTERVIEW_MODES.map((item) => {
            const isSelected = selectedMode === item.mode;
            return (
              <button
                type="button"
                key={item.mode}
                onClick={() => setSelectedMode(item.mode)}
                className={`flex items-start gap-3 p-4 rounded-xl text-left border transition-all duration-200 ${
                  isSelected
                    ? 'bg-indigo-600/10 dark:bg-indigo-500/15 border-indigo-500 dark:border-indigo-400 shadow-md ring-1 ring-indigo-500'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span className="text-2xl select-none">{item.icon}</span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {item.mode}
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400 ml-auto" />}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Target Role & Company */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-500" />
          Target Role & Employer Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Job Title
            </label>
            <input
              {...register('job_role')}
              type="text"
              placeholder="e.g. Senior Backend Engineer, Product Manager"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Company / Organization
            </label>
            <input
              {...register('company')}
              type="text"
              placeholder="e.g. Paystack, Google, Flutterwave, Remote Startup"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </Card>

      {/* 3. Difficulty, Style & Duration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Difficulty */}
        <Card className="p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-indigo-500" /> Seniority Level
          </h4>
          <div className="space-y-2">
            {DIFFICULTIES.map((d) => (
              <button
                type="button"
                key={d.key}
                onClick={() => setSelectedDifficulty(d.key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  selectedDifficulty === d.key
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Style */}
        <Card className="p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-indigo-500" /> Interviewer Persona
          </h4>
          <div className="space-y-2">
            {STYLES.map((s) => (
              <button
                type="button"
                key={s.key}
                onClick={() => setSelectedStyle(s.key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  selectedStyle === s.key
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="font-bold">{s.label}</span> — <span className="opacity-80">{s.desc}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Duration & Voice */}
        <Card className="p-5 space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-3">
              <Clock className="w-4 h-4 text-indigo-500" /> Session Duration
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {DURATIONS.map((dur) => (
                <button
                  type="button"
                  key={dur.key}
                  onClick={() => setSelectedDuration(dur.key)}
                  className={`px-2.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                    selectedDuration === dur.key
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {dur.key} Mins
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-indigo-500" /> Voice Conversation Mode
              </span>
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Enable spoken audio responses and speech-to-text recording.
            </p>
          </div>
        </Card>
      </div>

      {/* 4. Context: Resume & Job Description (Optional) */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          Candidate Context & Job Description (Recommended)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Paste Resume Summary / Core Qualifications
            </label>
            <textarea
              {...register('resume_text')}
              rows={4}
              placeholder="Paste relevant experience, technologies, or achievements..."
              className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Paste Target Job Description
            </label>
            <textarea
              {...register('job_description')}
              rows={4}
              placeholder="Paste key responsibilities or required qualifications..."
              className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </Card>

      {/* Action Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Analyze Profile & Start Interview
        </Button>
      </div>
    </form>
  );
};
