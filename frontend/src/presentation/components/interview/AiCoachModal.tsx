import React from 'react';
import { CoachAdviceData } from '../../../domain/types';
import { Card } from '../Card';
import { Button } from '../Button';
import {
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  X,
  Target
} from 'lucide-react';

interface AiCoachModalProps {
  coachAdvice: CoachAdviceData;
  onClose: () => void;
}

export const AiCoachModal: React.FC<AiCoachModalProps> = ({ coachAdvice, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6 relative border-indigo-500/30 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Post-Interview Coach</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Personalized feedback and model STAR answer recommendations</p>
          </div>
        </div>

        {/* What Went Well & What Needs Improvement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
            <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> What Went Well
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {coachAdvice.what_went_well}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
            <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Key Improvement Opportunity
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {coachAdvice.what_needs_improvement}
            </p>
          </div>
        </div>

        {/* Exemplary Answer Suggestions */}
        {coachAdvice.example_better_answers && coachAdvice.example_better_answers.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" /> Model Answer Benchmark (STAR Method)
            </h3>
            <div className="space-y-3">
              {coachAdvice.example_better_answers.map((ex, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Q: {ex.question}</p>
                  <div className="p-3 rounded-lg bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 text-xs text-slate-700 dark:text-slate-300 italic">
                    "{ex.better_answer}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Plan */}
        {coachAdvice.action_plan && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" /> Recommended Action Plan
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              {coachAdvice.action_plan.map((ap, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-bold text-indigo-500">•</span>
                  <span>{ap}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={onClose}>
            Got it, thanks!
          </Button>
        </div>
      </Card>
    </div>
  );
};
