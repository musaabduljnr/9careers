import React from 'react';
import { KanbanBoardState, JobApplicationItem } from '../../../domain/types';
import { Card } from '../Card';
import { Button } from '../Button';
import {
  Bookmark,
  Send,
  MessageSquareCode,
  CheckCircle2,
  Trophy,
  XCircle,
  Building2,
  MapPin,
  Clock
} from 'lucide-react';

interface ApplicationKanbanBoardProps {
  kanban: KanbanBoardState;
  onUpdateStage: (jobId: number, status: JobApplicationItem['status']) => void;
}

const STAGES: { key: keyof KanbanBoardState; label: string; icon: any; color: string }[] = [
  { key: 'saved', label: 'Saved Jobs', icon: Bookmark, color: 'text-amber-500 bg-amber-500/10' },
  { key: 'applied', label: 'Applied', icon: Send, color: 'text-indigo-500 bg-indigo-500/10' },
  { key: 'interview', label: 'Interview Scheduled', icon: MessageSquareCode, color: 'text-purple-500 bg-purple-500/10' },
  { key: 'assessment', label: 'Technical Assessment', icon: CheckCircle2, color: 'text-blue-500 bg-blue-500/10' },
  { key: 'offer', label: 'Job Offer Received', icon: Trophy, color: 'text-emerald-500 bg-emerald-500/10' },
  { key: 'rejected', label: 'Archived / Rejected', icon: XCircle, color: 'text-slate-400 bg-slate-500/10' }
];

export const ApplicationKanbanBoard: React.FC<ApplicationKanbanBoardProps> = ({
  kanban,
  onUpdateStage
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
      {STAGES.map((col) => {
        const Icon = col.icon;
        const items = kanban[col.key] || [];

        return (
          <div key={col.key} className="space-y-3 min-w-[240px]">
            {/* Column Header */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${col.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{col.label}</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                {items.length}
              </span>
            </div>

            {/* Column Cards List */}
            <div className="space-y-2.5 min-h-[300px]">
              {items.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-400">
                  No applications in this stage
                </div>
              ) : (
                items.map((app) => (
                  <Card key={app.application_id} className="p-3.5 space-y-2 hover:border-indigo-500/30 transition-colors">
                    <div className="flex items-start gap-2.5">
                      {app.company_logo ? (
                        <img src={app.company_logo} alt={app.company_name} className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 border" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs">
                          <Building2 className="w-4 h-4" />
                        </div>
                      )}
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">{app.job_title}</h5>
                        <p className="text-[11px] text-slate-500 truncate">{app.company_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {app.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(app.applied_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Stage Move Dropdown */}
                    <div className="pt-1">
                      <select
                        value={app.status}
                        onChange={(e) => onUpdateStage(app.job_id, e.target.value as any)}
                        className="w-full py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
                      >
                        <option value="saved">Move to Saved</option>
                        <option value="applied">Move to Applied</option>
                        <option value="interview">Move to Interview</option>
                        <option value="assessment">Move to Assessment</option>
                        <option value="offer">Move to Offer</option>
                        <option value="rejected">Move to Archived</option>
                      </select>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
