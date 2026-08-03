import React from 'react';
import { InterviewReportData } from '../../../domain/types';
import { Card } from '../Card';
import { Button } from '../Button';
import { CircularProgress } from '../CircularProgress';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Target,
  Sparkles,
  Printer,
  Download,
  RotateCcw,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

interface InterviewReportViewProps {
  report: InterviewReportData;
  onRestartSession: () => void;
  onOpenCoachModal?: () => void;
}

export const InterviewReportView: React.FC<InterviewReportViewProps> = ({
  report,
  onRestartSession,
  onOpenCoachModal
}) => {
  const getRecommendationBadge = (rec: string) => {
    switch (rec?.toLowerCase()) {
      case 'strong hire':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'hire':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'lean hire':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'lean reject':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto print:p-0">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-8 border border-indigo-500/20 text-white shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Executive Interview Evaluation Report
            </div>
            <h1 className="text-3xl font-black">{report.job_role}</h1>
            <p className="text-slate-300 text-sm">
              {report.company || 'Enterprise Partner'} • Track: {report.interview_type} • Level: {report.difficulty.toUpperCase()}
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            {onOpenCoachModal && (
              <Button
                variant="primary"
                onClick={onOpenCoachModal}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              >
                <BrainCircuit className="w-4 h-4 mr-2" /> AI Coach Advice
              </Button>
            )}
            <Button variant="secondary" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1.5" /> Print / Save PDF
            </Button>
            <Button variant="secondary" onClick={onRestartSession}>
              <RotateCcw className="w-4 h-4 mr-1.5" /> New Interview
            </Button>
          </div>
        </div>

        {/* Score Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-indigo-500/20">
          <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <CircularProgress value={report.overall_score || 80} size={64} strokeWidth={6} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overall Score</p>
              <p className="text-2xl font-black text-white">{report.overall_score}/100</p>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hiring Recommendation</p>
            <div className={`inline-block px-3 py-1 rounded-lg text-sm font-black border ${getRecommendationBadge(report.hiring_recommendation)}`}>
              {report.hiring_recommendation || 'Hire'}
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Likelihood of Passing</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <p className="text-2xl font-black text-emerald-400">{report.likelihood_of_passing_percent || 85}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Competency Score Breakdown */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-500" /> Competency Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(report.category_scores || {}).map(([category, score]) => (
            <div key={category} className="space-y-1.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">
                <span>{category.replace('_', ' ')}</span>
                <span className="text-indigo-600 dark:text-indigo-400">{score}/100</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, score)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Strengths & Scrutiny Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="p-6 space-y-3 border-emerald-500/20 bg-emerald-950/5 dark:bg-emerald-950/10">
          <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Key Strengths Demonstrated
          </h3>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {report.strengths?.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Weaknesses & Missed Opportunities */}
        <Card className="p-6 space-y-3 border-amber-500/20 bg-amber-950/5 dark:bg-amber-950/10">
          <h3 className="text-base font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Growth Areas & Missed Opportunities
          </h3>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {report.weaknesses?.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{w}</span>
              </li>
            ))}
            {report.missed_opportunities?.map((mo, idx) => (
              <li key={`mo-${idx}`} className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>{mo}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Recommended Improvements & Resources */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" /> Recommended Action Plan & Resources
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Action Steps</h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              {report.recommended_improvements?.map((imp, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Target className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Learning Links</h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              {report.suggested_learning_resources?.map((res: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{res}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
