import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';

interface InterviewTimerProps {
  elapsedSeconds: number;
  totalDurationSeconds: number;
  questionOrder: number;
  expectedQuestionsCount?: number;
}

export const InterviewTimer: React.FC<InterviewTimerProps> = ({
  elapsedSeconds,
  totalDurationSeconds,
  questionOrder,
  expectedQuestionsCount = 6
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds);
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / totalDurationSeconds) * 100));

  return (
    <div className="bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Clock className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Elapsed / Remaining</p>
            <p className="text-sm font-mono font-bold text-white">
              {formatTime(elapsedSeconds)} <span className="text-slate-500">/</span>{' '}
              <span className="text-indigo-400">{formatTime(remainingSeconds)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-right">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Turn Progress</p>
            <p className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Question {questionOrder} of ~{expectedQuestionsCount}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
