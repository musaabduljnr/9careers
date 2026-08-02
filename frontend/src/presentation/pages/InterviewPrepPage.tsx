import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../infrastructure/api_client';
import { InterviewSession } from '../../domain/types';
import { interviewStartSchema, InterviewStartFormValues } from '../../domain/validation';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CircularProgress } from '../components/CircularProgress';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { 
  MessageSquareCode, 
  Send, 
  ChevronRight,
  Briefcase
} from 'lucide-react';

interface ChatMessage {
  sender: 'interviewer' | 'candidate';
  text: string;
  feedback?: string;
  score?: number;
}

export const InterviewPrepPage: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Local state
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentOrder, setCurrentOrder] = useState(1);
  const [overallReport, setOverallReport] = useState<string | null>(null);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [viewingDetailsSession, setViewingDetailsSession] = useState<InterviewSession | null>(null);

  // 1. Fetch past interview sessions
  const { data: pastSessions = [], isLoading: isSessionsLoading } = useQuery<any[]>({
    queryKey: ['interview-sessions'],
    queryFn: async () => {
      const res = await api.get<any[]>('/api/v1/interviews/sessions');
      return res.data;
    }
  });

  // 2. Start session mutation
  const startMutation = useMutation({
    mutationFn: async (values: InterviewStartFormValues) => {
      const res = await api.post('/api/v1/interviews/start', values);
      return res.data;
    },
    onSuccess: (data: any) => {
      setActiveSessionId(data.session_id);
      setCurrentOrder(data.question_order);
      setOverallReport(null);
      setOverallScore(null);
      // Initialize chat messages with the first question
      setChatMessages([
        {
          sender: 'interviewer',
          text: data.first_question
        }
      ]);
    }
  });

  // 3. Respond mutation
  const respondMutation = useMutation({
    mutationFn: async ({ sessionId, answer }: { sessionId: string; answer: string }) => {
      const res = await api.post(`/api/v1/interviews/sessions/${sessionId}/respond`, {
        user_answer: answer
      });
      return res.data;
    },
    onSuccess: (data: any) => {
      // Append evaluation of the answered question and the next question if active
      const updatedMessages = [...chatMessages];
      
      // Update the last user message with feedback if available (should match order)
      // Actually, let's just push what we received
      if (data.session_status === 'completed') {
        setOverallReport(data.overall_feedback);
        setOverallScore(data.overall_score);
        setActiveSessionId(null);
        queryClient.invalidateQueries({ queryKey: ['interview-sessions'] });
      } else {
        setCurrentOrder(data.question_order);
        setChatMessages([
          ...updatedMessages,
          {
            sender: 'interviewer',
            text: data.next_question
          }
        ]);
      }
      setCurrentAnswer('');
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<InterviewStartFormValues>({
    resolver: zodResolver(interviewStartSchema),
    defaultValues: { job_role: '', industry: '' }
  });

  const onStart = (data: InterviewStartFormValues) => {
    startMutation.mutate(data);
  };

  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSessionId || !currentAnswer.trim() || respondMutation.isPending) return;

    // Add user's answer immediately to chat log
    const updatedMessages = [
      ...chatMessages,
      {
        sender: 'candidate' as const,
        text: currentAnswer
      }
    ];
    setChatMessages(updatedMessages);

    respondMutation.mutate({
      sessionId: activeSessionId,
      answer: currentAnswer
    });
  };

  // View past session details
  const handleViewDetails = async (sessionId: string) => {
    try {
      const res = await api.get<InterviewSession>(`/api/v1/interviews/sessions/${sessionId}`);
      setViewingDetailsSession(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBackToHistory = () => {
    setViewingDetailsSession(null);
    setOverallReport(null);
    setOverallScore(null);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-850 dark:text-white">AI Mock Interview Prep</h2>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          Simulate typical interview processes for Nigerian corporate, graduate trainee, or startup environments
        </p>
      </div>

      {activeSessionId ? (
        /* Active Interview Chat Panel */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left info panel */}
          <Card className="lg:col-span-1 border-slate-200/50 dark:border-slate-850 flex flex-col justify-between p-6">
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Session Active
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-slate-800 dark:text-white text-base">
                  {startMutation.data?.job_role}
                </h3>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                  {startMutation.data?.industry} Sector
                </span>
              </div>
            </div>
            
            <div className="my-8 flex flex-col items-center justify-center gap-3">
              <CircularProgress value={Math.round(((currentOrder - 1) / 4) * 100)} size={110} strokeWidth={10} />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                Question {currentOrder} of 4
              </span>
            </div>

            <div className="p-4 bg-emerald-50/20 dark:bg-slate-900/40 border-l-4 border-l-emerald-500 rounded-r-xl">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed block">
                Answer using the STAR technique (Situation, Task, Action, Result) for higher scores.
              </span>
            </div>
          </Card>

          {/* Right chat panel */}
          <Card className="lg:col-span-3 border-slate-200/50 dark:border-slate-850 flex flex-col justify-between min-h-[500px] p-0 overflow-hidden">
            {/* Chat header */}
            <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-100 dark:border-slate-900/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                <Briefcase size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 dark:text-white leading-tight">AI HR Recruiter</span>
                <span className="text-[10px] text-emerald-500 font-semibold mt-0.5">Online</span>
              </div>
            </div>

            {/* Message window */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 max-h-[50vh]">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i}
                  className={`flex gap-3 max-w-[80%] ${
                    msg.sender === 'candidate' ? 'self-end flex-row-reverse' : 'self-start'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                    msg.sender === 'candidate' 
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-500' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350'
                  }`}>
                    {msg.sender === 'candidate' ? 'C' : 'R'}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'candidate'
                      ? 'bg-emerald-600 text-white rounded-tr-none font-medium'
                      : 'bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 text-slate-800 dark:text-slate-300 rounded-tl-none font-medium'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {respondMutation.isPending && (
                <div className="flex gap-3 self-start max-w-[80%]">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 flex items-center justify-center text-xs font-bold">
                    R
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl rounded-tl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-0" />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-150" />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-300" />
                  </div>
                </div>
              )}
            </div>

            {/* Input form */}
            <form onSubmit={handleSendResponse} className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900/60 flex gap-3 items-end">
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your response here..."
                className="flex-1 h-20 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-855 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 resize-none"
                disabled={respondMutation.isPending}
                required
              />
              <Button 
                variant="primary" 
                type="submit" 
                isLoading={respondMutation.isPending}
                disabled={!currentAnswer.trim()}
                className="px-4 py-3 shrink-0 rounded-xl"
              >
                <Send size={16} />
              </Button>
            </form>
          </Card>
        </div>
      ) : overallReport ? (
        /* Report View (Session Completed) */
        <div className="max-w-4xl mx-auto flex flex-col gap-6 w-full">
          <Card className="border-slate-200/50 dark:border-slate-850 p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-850 pb-6 mb-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Interview Finished</span>
                <h3 className="text-xl font-extrabold text-slate-855 dark:text-white">Performance Report</h3>
              </div>
              <div className="flex items-center gap-4">
                {overallScore !== null && <CircularProgress value={overallScore} size={100} />}
                <Button variant="outline" onClick={handleBackToHistory}>
                  Back to Hub
                </Button>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <MarkdownRenderer content={overallReport} />
            </div>
          </Card>
        </div>
      ) : viewingDetailsSession ? (
        /* Review Past Session Details */
        <div className="max-w-4xl mx-auto flex flex-col gap-6 w-full">
          <Card className="border-slate-200/50 dark:border-slate-850 p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-850 pb-6 mb-6">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Session Record</span>
                <h3 className="text-lg font-extrabold text-slate-855 dark:text-white">
                  {viewingDetailsSession.job_role} ({viewingDetailsSession.industry})
                </h3>
                <span className="text-[10px] text-slate-400 font-bold mt-1">
                  Completed on {new Date(viewingDetailsSession.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {viewingDetailsSession.score !== null && (
                  <CircularProgress value={viewingDetailsSession.score || 0} size={90} />
                )}
                <Button variant="outline" onClick={handleBackToHistory}>
                  Back to Hub
                </Button>
              </div>
            </div>

            {/* Overall Feedback */}
            {viewingDetailsSession.feedback_overall && (
              <div className="mb-8 p-6 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-900 rounded-2xl">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Executive Summary</h4>
                <MarkdownRenderer content={viewingDetailsSession.feedback_overall} />
              </div>
            )}

            {/* Q&A Breakdown */}
            <div className="flex flex-col gap-6">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-2">
                Question & Answer Log
              </h4>
              {viewingDetailsSession.questions.map((q, idx) => (
                <div key={q.id || idx} className="p-5 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-xs font-extrabold text-slate-450 uppercase tracking-wider">
                      Question {q.question_order}
                    </span>
                    {q.ai_score !== undefined && (
                      <span className="px-2 py-1 text-[10px] font-bold bg-slate-50 dark:bg-slate-950 text-slate-500 rounded-lg border border-slate-100 dark:border-slate-900">
                        Score: {q.ai_score}/100
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{q.question_text}</p>
                  
                  <div className="p-3.5 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-900 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Your Answer:</span>
                    {q.user_answer || '(No answer provided)'}
                  </div>

                  {q.ai_feedback && (
                    <div className="p-3.5 bg-emerald-500/5 dark:bg-emerald-500/10 border-l-4 border-l-emerald-500 rounded-r-xl text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-semibold">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block mb-1">Coaching Feedback:</span>
                      {q.ai_feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        /* Landing Hub View (Past Sessions & Parameter Selection) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Start New Session Form */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Card className="border-slate-200/50 dark:border-slate-850">
              <h3 className="text-base font-bold text-slate-855 dark:text-white mb-4">Start Interview Simulation</h3>
              
              <form onSubmit={handleSubmit(onStart)} className="flex flex-col gap-4">
                <InputField
                  label="Target Job Role"
                  placeholder="e.g. Graduate Trainee, Finance Analyst"
                  error={errors.job_role?.message}
                  {...register('job_role')}
                />
                <InputField
                  label="Target Industry"
                  placeholder="e.g. Commercial Banking, Fintech, FMCG"
                  error={errors.industry?.message}
                  {...register('industry')}
                />

                <Button 
                  variant="primary" 
                  type="submit" 
                  isLoading={startMutation.isPending}
                  className="mt-2 w-full"
                >
                  <MessageSquareCode size={16} className="mr-2" />
                  Begin Simulator
                </Button>
              </form>
            </Card>
          </div>

          {/* Past Sessions List */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="border-slate-200/50 dark:border-slate-855 min-h-[400px] flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-855 dark:text-white mb-6">Completed Mock Sessions</h3>
                
                {isSessionsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
                  </div>
                ) : pastSessions.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {pastSessions.map((session: any) => (
                      <div 
                        key={session.id}
                        onClick={() => handleViewDetails(session.id)}
                        className="p-4 border border-slate-100 dark:border-slate-850 hover:border-emerald-500 dark:hover:border-emerald-500/40 rounded-xl cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500">
                            <MessageSquareCode size={18} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                              {session.job_role} ({session.industry})
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                              {new Date(session.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {session.score !== null && (
                            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-950/30">
                              Score: {session.score}%
                            </span>
                          )}
                          <ChevronRight size={16} className="text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 mb-2">
                      <MessageSquareCode size={20} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">No mock sessions completed yet</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                      Configure the parameters on the left and start practicing to improve your score.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
