import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../infrastructure/api_client';
import { useInterviewStore } from '../../application/stores/useInterviewStore';
import { InterviewSetupConfig, PrepProfile, InterviewReportData } from '../../domain/types';
import { InterviewSetupForm } from '../components/interview/InterviewSetupForm';
import { PrepAnalysisModal } from '../components/interview/PrepAnalysisModal';
import { LiveInterviewRoom } from '../components/interview/LiveInterviewRoom';
import { InterviewReportView } from '../components/interview/InterviewReportView';
import { AiCoachModal } from '../components/interview/AiCoachModal';
import { Card } from '../components/Card';
import { Button } from '../Button';
import {
  Sparkles,
  History,
  Award,
  Clock,
  Play,
  FileText,
  PlusCircle,
  BarChart3,
  Bot
} from 'lucide-react';

export const InterviewPrepPage: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    stage,
    setStage,
    config,
    setConfig,
    prepProfile,
    reportData,
    initSession,
    setReportData,
    resetSession
  } = useInterviewStore();

  const [pendingConfig, setPendingConfig] = useState<InterviewSetupConfig | null>(null);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'simulator' | 'history'>('simulator');

  // 1. Fetch past sessions
  const { data: pastSessions = [], isLoading: isSessionsLoading } = useQuery<any[]>({
    queryKey: ['interview-sessions'],
    queryFn: async () => {
      const res = await api.get<any[]>('/api/v1/interviews/sessions');
      return res.data;
    }
  });

  // 2. Prep analysis mutation
  const prepMutation = useMutation({
    mutationFn: async (cfg: InterviewSetupConfig) => {
      const res = await api.post<PrepProfile>('/api/v1/interviews/setup', cfg);
      return res.data;
    },
    onSuccess: (profile: PrepProfile, cfg: InterviewSetupConfig) => {
      setPendingConfig(cfg);
      useInterviewStore.setState({ prepProfile: profile });
      setStage('prep');
    }
  });

  // 3. Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: async (cfg: InterviewSetupConfig) => {
      const res = await api.post('/api/v1/interviews/start', cfg);
      return res.data;
    },
    onSuccess: (data: any) => {
      if (pendingConfig && prepProfile) {
        initSession({
          sessionId: data.session_id,
          config: pendingConfig,
          firstQuestion: data.first_question,
          category: data.question_category || 'Introduction',
          prepProfile: prepProfile
        });
      }
      queryClient.invalidateQueries({ queryKey: ['interview-sessions'] });
    }
  });

  // 4. View report for past session
  const viewPastReportMutation = useMutation({
    mutationFn: async (sessionId: str) => {
      const res = await api.get<InterviewReportData>(`/api/v1/interviews/sessions/${sessionId}/report`);
      return res.data;
    },
    onSuccess: (report: InterviewReportData) => {
      setReportData(report);
      setStage('report');
      setSelectedTab('simulator');
    }
  });

  const handleSetupSubmit = (cfg: InterviewSetupConfig) => {
    setConfig(cfg);
    prepMutation.mutate(cfg);
  };

  const handleProceedToLive = () => {
    if (pendingConfig) {
      startSessionMutation.mutate(pendingConfig);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Navigation Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Enterprise AI Interview Simulator
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive recruiter mock interviews, live STAR scoring & evaluation reports
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedTab('simulator');
              if (stage === 'completed' || stage === 'report') resetSession();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedTab === 'simulator'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" /> Live Simulator
          </button>
          <button
            onClick={() => setSelectedTab('history')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <History className="w-4 h-4" /> Session History ({pastSessions.length})
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {selectedTab === 'history' ? (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-500" /> Past Interview History
            </h3>
            <span className="text-xs text-slate-500">{pastSessions.length} Completed Sessions</span>
          </div>

          {isSessionsLoading ? (
            <div className="py-12 text-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-indigo-500 border-t-transparent mx-auto" />
              <p className="text-xs text-slate-500">Loading your interview sessions...</p>
            </div>
          ) : pastSessions.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <BarChart3 className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No mock interviews completed yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Start your first AI mock interview to practice STAR method answers and get instant feedback.
              </p>
              <Button variant="primary" onClick={() => setSelectedTab('simulator')}>
                Start First Mock Session
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {pastSessions.map((sess: any) => (
                <div key={sess.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{sess.job_role}</h4>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                        {sess.interview_type || 'Software Engineering'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {sess.company || 'Employer'} • {sess.difficulty || 'Mid'} Level • {new Date(sess.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {sess.score !== null && sess.score !== undefined && (
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</p>
                        <p className="text-base font-black text-indigo-600 dark:text-indigo-400">{sess.score}/100</p>
                      </div>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => viewPastReportMutation.mutate(sess.id)}
                      isLoading={viewPastReportMutation.isPending}
                    >
                      <FileText className="w-3.5 h-3.5 mr-1" /> View Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : (
        <>
          {stage === 'setup' && (
            <InterviewSetupForm
              onSetupSubmit={handleSetupSubmit}
              isLoading={prepMutation.isPending}
            />
          )}

          {stage === 'prep' && prepProfile && (
            <PrepAnalysisModal
              prepProfile={prepProfile}
              onProceedToLive={handleProceedToLive}
              onBackToSetup={() => setStage('setup')}
              isStarting={startSessionMutation.isPending}
            />
          )}

          {stage === 'live' && (
            <LiveInterviewRoom onEndSession={() => setStage('report')} />
          )}

          {stage === 'report' && reportData && (
            <>
              <InterviewReportView
                report={reportData}
                onRestartSession={resetSession}
                onOpenCoachModal={() => setShowCoachModal(true)}
              />

              {showCoachModal && reportData.coach_advice && (
                <AiCoachModal
                  coachAdvice={reportData.coach_advice}
                  onClose={() => setShowCoachModal(false)}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
