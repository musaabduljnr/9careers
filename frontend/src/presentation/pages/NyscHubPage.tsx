import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../infrastructure/api_client';
import { Card } from '../components/Card';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { 
  GraduationCap, 
  Sparkles, 
  CheckCircle, 
  Copy, 
  Layers, 
  FileText,
  Bookmark
} from 'lucide-react';


export const NyscHubPage: React.FC = () => {
  const [ppaRole, setPpaRole] = useState('');
  const [ppaDuties, setPpaDuties] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [optimizedPoints, setOptimizedPoints] = useState<string | null>(null);

  // Experience Optimizer Mutation
  const optimizeMutation = useMutation({
    mutationFn: async () => {
      // We will make a call to our AI endpoint using job analysis structure or cover letter format 
      // or we can invoke a lightweight text generation via the backend (e.g., using cover letters or an inline mock request).
      // Since our FastAPI backend has a general AI Provider abstraction, we can use the Cover Letter endpoint 
      // with custom points, or we can make a dedicated backend utility. 
      // Wait, let's see. In `api_v1.py` we have `/api/v1/jobs/analyze` or we can use `/api/v1/cover-letters` 
      // to request a formatted response. But wait, can we make the call to `/api/v1/cover-letters` and instruct the tone to output bullet points?
      // Better yet, we can add a specific PPA Optimizer Endpoint or use `/api/v1/cover-letters` where the role is PPA Optimizer, 
      // or just call `/api/v1/cover-letters` with target "PPA Experience Optimizer" and let the AI output optimized bullet points!
      // Actually, let's see what is cleaner: we can use the `/api/v1/cover-letters` endpoint where `company_name` = 'PPA Experience Optimizer', 
      // `job_title` = targetRole, `tone` = 'Graduate Trainee' and `points_to_highlight` = `PPA Role: ${ppaRole}, Duties: ${ppaDuties}`.
      // This is a creative and highly elegant way of reusing our existing API without adding extra endpoint clutter, 
      // or we can use the `/api/v1/cover-letters` endpoint.
      // Wait, let's look at `/api/v1/cover-letters`. It generates a cover letter. If we use it, the AI will try to write a cover letter.
      // Let's check: in `api_v1.py`, do we have a way to generate general AI responses? No.
      // But wait! We can easily use `/api/v1/cover-letters` and specify in `points_to_highlight` that we need "ONLY 3 tailored resume bullet points representing my PPA experience, do not write a full cover letter, just output 3 bullet points."
      // The AI will follow that instruction perfectly because we configured the prompt in `GenerateCoverLetterUseCase` to include `points_to_highlight`!
      // Let's write the mutation to call `/api/v1/cover-letters` with those custom instructions:
      const res = await api.post('/api/v1/cover-letters', {
        company_name: 'NYSC PPA Optimizer',
        job_title: targetRole,
        tone: 'Graduate Trainee',
        points_to_highlight: `Please format the output ONLY as 3 bullet points starting with active verbs. Optimize my NYSC PPA experience. Role: ${ppaRole}. Duties: ${ppaDuties}. Make them highly professional and suitable for the target role: ${targetRole}. Do not write a cover letter, only return the bullet points.`
      });
      return res.data;
    },
    onSuccess: (data) => {
      setOptimizedPoints(data.content);
    }
  });

  const handleOptimize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ppaRole.trim() || !ppaDuties.trim() || !targetRole.trim()) return;
    optimizeMutation.mutate();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const examsInfo = [
    {
      bank: 'Access Bank / GTBank',
      stages: [
        '1. Computer Based Test (CBT): GMAT-style questions covering verbal reasoning, quantitative analysis, and abstract patterns. Fast pace: usually 60 questions in 60 minutes.',
        '2. Essay Writing: A short article (150-250 words) on current Nigerian financial trends, economic issues, or digital transformation.',
        '3. Panel Interview: Case studies, group discussions, and behavioral questions focusing on integrity, problem-solving, and professional presence.'
      ]
    },
    {
      bank: 'KPMG / PwC / Ernst & Young',
      stages: [
        '1. Cognitive & Verbal Assessment: High-difficulty critical reasoning, logical deduction, and numeric analysis (SHL standard).',
        '2. Assessment Center: Split into teams to solve a real-world business case study (e.g. how a manufacturing firm can cut costs in Nigeria) and present to directors.',
        '3. Partner Interview: High-level dialogue about career goals, industry understanding, and integrity.'
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-850 dark:text-white">NYSC & Graduate Trainee Hub</h2>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          Transform your mandatory service year duties into corporate-ready achievements and master Graduate Trainee exams
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: PPA Experience Optimizer */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="border-slate-200/50 dark:border-slate-850">
            <h3 className="text-base font-bold text-slate-855 dark:text-white mb-4">NYSC PPA Optimizer</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Recruiters in Nigeria know most graduates spend their service year teaching or doing administration. We will translate those duties into high-impact business competencies.
            </p>

            <form onSubmit={handleOptimize} className="flex flex-col gap-4">
              <InputField
                label="PPA Role / Title"
                placeholder="e.g. Mathematics Teacher, Administrative Corper"
                value={ppaRole}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPpaRole(e.target.value)}
                required
              />
              <InputField
                label="Target Corporate Role"
                placeholder="e.g. Business Analyst, Customer Support Associate"
                value={targetRole}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetRole(e.target.value)}
                required
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                  Responsibilities / What you did
                </label>
                <textarea
                  value={ppaDuties}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPpaDuties(e.target.value)}
                  placeholder="e.g. I taught math to 3 classes, graded examination sheets, helped the principal with administrative typing, organized morning assemblies..."
                  className="w-full h-24 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-855 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                  required
                />
              </div>

              <Button 
                variant="primary" 
                type="submit" 
                isLoading={optimizeMutation.isPending}
                className="mt-2 w-full"
              >
                <Sparkles size={16} className="mr-2" />
                Optimize Experience
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Side: Optimised Output & Graduate Scheme Guidelines */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Optimized Output */}
          {optimizedPoints && (
            <Card className="border-slate-200/50 dark:border-slate-850">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-855 pb-3 mb-4">
                <h3 className="font-bold text-slate-855 dark:text-white text-base">Corporate Bullet Points</h3>
                <button
                  onClick={() => copyToClipboard(optimizedPoints)}
                  className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-550 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all animate-pulse"
                >
                  <Copy size={14} />
                  {copySuccess ? 'Copied' : 'Copy and Paste to CV'}
                </button>
              </div>

              <div className="p-5 bg-emerald-500/5 dark:bg-slate-950/40 border border-emerald-500/10 dark:border-slate-900 rounded-2xl max-h-[30vh] overflow-y-auto">
                <MarkdownRenderer content={optimizedPoints} />
              </div>
            </Card>
          )}

          {/* Graduate Trainee Assessment Guideline */}
          <Card className="border-slate-200/50 dark:border-slate-850">
            <h3 className="text-base font-bold text-slate-855 dark:text-white flex items-center gap-2 mb-4">
              <Bookmark size={18} className="text-emerald-500" />
              Graduate Trainee Exam Syllabus & Stages
            </h3>
            
            <div className="flex flex-col gap-6">
              {examsInfo.map((exam, i) => (
                <div key={i} className="flex flex-col gap-3 pb-6 border-b border-slate-100 dark:border-slate-855/50 last:border-0 last:pb-0">
                  <h4 className="font-bold text-slate-800 dark:text-emerald-400 text-sm">{exam.bank}</h4>
                  <div className="flex flex-col gap-2.5">
                    {exam.stages.map((stage, j) => (
                      <span key={j} className="text-xs font-semibold text-slate-500 dark:text-slate-350 leading-relaxed block pl-2 border-l-2 border-slate-200 dark:border-slate-805">
                        {stage}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
