import React, { useState, useEffect } from 'react';
import { useInterviewStore } from '../../../application/stores/useInterviewStore';
import { audioEngine } from '../../../infrastructure/audio_service';
import { wsClient } from '../../../infrastructure/websocket_client';
import { InterviewTimer } from './InterviewTimer';
import { LiveTranscript } from './LiveTranscript';
import { Card } from '../Card';
import { Button } from '../Button';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Pause,
  Play,
  Square,
  Sparkles,
  MessageSquare,
  Radio,
  UserCheck,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface LiveInterviewRoomProps {
  onEndSession: () => void;
}

export const LiveInterviewRoom: React.FC<LiveInterviewRoomProps> = ({ onEndSession }) => {
  const {
    sessionId,
    config,
    currentQuestion,
    currentCategory,
    questionOrder,
    isProcessingTurn,
    voiceEnabled,
    isListening,
    isSpeaking,
    micMuted,
    audioFrequencyData,
    elapsedSeconds,
    totalDurationSeconds,
    isTimerRunning,
    transcript,
    setProcessingTurn,
    setListening,
    setSpeaking,
    setMicMuted,
    setAudioFrequencyData,
    setVoiceEnabled,
    tickTimer,
    setTimerRunning,
    updateQuestionTurn,
    addTranscriptItem,
    setReportData
  } = useInterviewStore();

  const [textAnswer, setTextAnswer] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  // 1. Timer ticker interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => tickTimer(), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, tickTimer]);

  // 2. Register Audio Engine Callbacks
  useEffect(() => {
    audioEngine.registerCallbacks({
      onListeningStart: () => setListening(true),
      onListeningEnd: () => setListening(false),
      onSpeakingStart: () => setSpeaking(true),
      onSpeakingEnd: () => setSpeaking(false),
      onFrequencyUpdate: (freqs) => setAudioFrequencyData(freqs),
      onTranscriptResult: (text, _isFinal) => {
        setTextAnswer(text);
      },
      onError: (err) => console.warn('[Audio Error]', err)
    });
  }, [setListening, setSpeaking, setAudioFrequencyData]);

  // 3. Auto-speak recruiter question when turn updates if voice is enabled
  useEffect(() => {
    if (voiceEnabled && currentQuestion) {
      audioEngine.speakText(currentQuestion);
    }
  }, [currentQuestion, voiceEnabled]);

  // 4. Connect WebSocket client
  useEffect(() => {
    if (!sessionId) return;

    wsClient.connect(sessionId).then((success) => {
      setConnectionStatus(success ? 'connected' : 'error');
    });

    const unsubscribe = wsClient.subscribe((event, data) => {
      if (event === 'turn_completed') {
        setProcessingTurn(false);
        if (data.session_status === 'completed') {
          // Trigger report fetch & view
          fetchReport();
        } else if (data.next_question) {
          updateQuestionTurn(data.next_question, data.next_category || 'Question', data.question_order);
          setTextAnswer('');
        }
      } else if (event === 'processing_turn') {
        setProcessingTurn(true);
      } else if (event === 'status_changed') {
        if (data.status === 'completed' && data.full_report) {
          setReportData(data.full_report);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [sessionId]);

  const fetchReport = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/v1/interviews/sessions/${sessionId}/report`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      if (res.ok) {
        const report = await res.json();
        setReportData(report);
      }
    } catch (e) {
      console.error('Failed to fetch report:', e);
    }
  };

  const handleToggleMic = async () => {
    if (isListening) {
      audioEngine.stopListening();
    } else {
      const success = await audioEngine.startListening();
      if (!success) {
        setVoiceEnabled(false);
      }
    }
  };

  const handleSubmitAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textAnswer.trim() || isProcessingTurn || !sessionId) return;

    audioEngine.stopListening();
    audioEngine.stopSpeaking();
    setProcessingTurn(true);

    // Append user's response to active transcript turn immediately
    addTranscriptItem({
      order: questionOrder,
      category: currentCategory,
      question: currentQuestion,
      answer: textAnswer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    // Send via WebSocket or fallback REST
    wsClient.submitAnswer(textAnswer, elapsedSeconds);
  };

  const handlePauseResume = () => {
    const nextStatus = isTimerRunning ? 'pause' : 'resume';
    setTimerRunning(!isTimerRunning);
    wsClient.sendAction(nextStatus);
  };

  const handleEndSessionEarly = () => {
    if (confirm('Are you sure you want to conclude the interview and generate your performance report?')) {
      wsClient.sendAction('end');
      audioEngine.stopListening();
      audioEngine.stopSpeaking();
      onEndSession();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar: Timer & Recruiter Persona Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recruiter Persona Badge */}
        <div className="md:col-span-2 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 border border-indigo-500/20 text-white flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/40 border border-indigo-400/30">
                <UserCheck className="w-6 h-6" />
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                  connectionStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">AI Recruiter Panel</h2>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-400/20">
                  {config.interview_style}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {config.job_role} {config.company ? `• ${config.company}` : ''} ({config.difficulty.toUpperCase()})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePauseResume}
              className="bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700"
            >
              {isTimerRunning ? <Pause className="w-4 h-4 mr-1 text-amber-400" /> : <Play className="w-4 h-4 mr-1 text-emerald-400" />}
              {isTimerRunning ? 'Pause' : 'Resume'}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleEndSessionEarly}
              className="bg-rose-600/20 text-rose-300 border-rose-500/30 hover:bg-rose-600/30"
            >
              <Square className="w-4 h-4 mr-1" /> End Interview
            </Button>
          </div>
        </div>

        {/* Timer Component */}
        <InterviewTimer
          elapsedSeconds={elapsedSeconds}
          totalDurationSeconds={totalDurationSeconds}
          questionOrder={questionOrder}
          expectedQuestionsCount={Math.max(3, config.duration_minutes / 3)}
        />
      </div>

      {/* Main Interactive Stage: Waveform Visualizer & Recruiter Card */}
      <Card className="p-8 relative overflow-hidden bg-slate-900 border-slate-800 text-white shadow-2xl space-y-6">
        {/* Visualizer Header Status Pill */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSpeaking ? 'bg-indigo-400' : isListening ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isSpeaking ? 'bg-indigo-500' : isListening ? 'bg-emerald-500' : 'bg-slate-600'}`} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isSpeaking ? 'AI Recruiter Speaking...' : isListening ? 'Listening to Candidate...' : isProcessingTurn ? 'AI Evaluating Response...' : 'Ready for Response'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isSpeaking) audioEngine.stopSpeaking();
                setVoiceEnabled(!voiceEnabled);
              }}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                voiceEnabled
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
              {voiceEnabled ? 'Voice On' : 'Muted'}
            </button>
          </div>
        </div>

        {/* Dynamic Waveform Visualizer (ChatGPT Voice / Micro1 style) */}
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-2 sm:gap-3 h-20">
            {audioFrequencyData.map((freq, idx) => {
              const height = isSpeaking || isListening ? Math.max(16, (freq / 100) * 80) : 16;
              return (
                <div
                  key={idx}
                  className={`w-2 sm:w-3 rounded-full transition-all duration-150 ${
                    isSpeaking
                      ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-lg shadow-indigo-500/50'
                      : isListening
                      ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/50'
                      : 'bg-slate-700'
                  }`}
                  style={{ height: `${height}px` }}
                />
              );
            })}
          </div>
        </div>

        {/* Current Recruiter Question Display */}
        <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Question {questionOrder} • {currentCategory}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">LIVE TURN</span>
          </div>

          <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
            {isProcessingTurn ? (
              <span className="inline-flex items-center gap-2 text-indigo-400 font-mono animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin" /> Evaluating answer & preparing next question...
              </span>
            ) : (
              currentQuestion
            )}
          </p>
        </div>

        {/* Candidate Response Form */}
        <form onSubmit={handleSubmitAnswer} className="space-y-4">
          <div className="relative">
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              disabled={isProcessingTurn}
              rows={3}
              placeholder={
                isListening
                  ? 'Listening to your speech... Speak clearly or type here...'
                  : 'Type your interview response using the STAR framework (Situation, Task, Action, Result)...'
              }
              className="w-full p-4 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />

            {/* Mic Toggle Float inside textarea */}
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleMic}
                disabled={isProcessingTurn}
                className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                  isListening
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isListening ? 'Stop Mic' : 'Speak'}
              </button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!textAnswer.trim() || isProcessingTurn}
                isLoading={isProcessingTurn}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
              >
                <Send className="w-4 h-4 mr-1.5" /> Submit Answer
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Collapsible Live Transcript Drawer */}
      <div className="space-y-2">
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors"
        >
          <span className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            Live Interview Transcript ({transcript.length} turns)
          </span>
          {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTranscript && <LiveTranscript transcript={transcript} />}
      </div>
    </div>
  );
};
