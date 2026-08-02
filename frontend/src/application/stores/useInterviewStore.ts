import { create } from 'zustand';
import {
  InterviewSetupConfig,
  PrepProfile,
  TranscriptItem,
  InterviewReportData,
  DifficultyLevel,
  InterviewModeType
} from '../../domain/types';

export type SimulatorStage = 'setup' | 'prep' | 'live' | 'report';

interface InterviewState {
  // Stage management
  stage: SimulatorStage;
  setStage: (stage: SimulatorStage) => void;

  // Setup configuration
  config: InterviewSetupConfig;
  setConfig: (config: Partial<InterviewSetupConfig>) => void;

  // Active Session State
  sessionId: string | null;
  sessionStatus: 'setup' | 'active' | 'paused' | 'completed';
  prepProfile: PrepProfile | null;
  
  // Current Turn State
  currentQuestion: string;
  currentCategory: string;
  questionOrder: number;
  isProcessingTurn: boolean;
  
  // Transcript
  transcript: TranscriptItem[];
  
  // Audio & Waveform UI State
  voiceEnabled: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  micMuted: boolean;
  audioFrequencyData: number[];
  
  // Timer State
  elapsedSeconds: number;
  totalDurationSeconds: number;
  isTimerRunning: boolean;

  // Final Report & Coach
  reportData: InterviewReportData | null;

  // Actions
  initSession: (data: {
    sessionId: string;
    config: InterviewSetupConfig;
    firstQuestion: string;
    category: string;
    prepProfile: PrepProfile;
  }) => void;

  updateQuestionTurn: (question: string, category: string, order: number) => void;
  addTranscriptItem: (item: TranscriptItem) => void;
  setProcessingTurn: (isProcessing: boolean) => void;
  setListening: (listening: boolean) => void;
  setSpeaking: (speaking: boolean) => void;
  setMicMuted: (muted: boolean) => void;
  setAudioFrequencyData: (freq: number[]) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  tickTimer: () => void;
  setTimerRunning: (running: boolean) => void;
  setReportData: (report: InterviewReportData) => void;
  resetSession: () => void;
}

const defaultConfig: InterviewSetupConfig = {
  interview_type: 'Software Engineering',
  job_role: 'Senior Software Engineer',
  company: 'Tech Firm',
  difficulty: 'senior',
  duration_minutes: 20,
  interview_style: 'professional',
  voice_enabled: true,
  language: 'en',
  resume_text: '',
  job_description: ''
};

export const useInterviewStore = create<InterviewState>((set, get) => ({
  stage: 'setup',
  setStage: (stage) => set({ stage }),

  config: defaultConfig,
  setConfig: (newConfig) =>
    set((state) => ({
      config: { ...state.config, ...newConfig }
    })),

  sessionId: null,
  sessionStatus: 'setup',
  prepProfile: null,

  currentQuestion: '',
  currentCategory: 'Introduction',
  questionOrder: 1,
  isProcessingTurn: false,

  transcript: [],

  voiceEnabled: true,
  isListening: false,
  isSpeaking: false,
  micMuted: false,
  audioFrequencyData: [10, 25, 45, 80, 60, 30, 15],

  elapsedSeconds: 0,
  totalDurationSeconds: 20 * 60,
  isTimerRunning: false,

  reportData: null,

  initSession: ({ sessionId, config, firstQuestion, category, prepProfile }) => {
    set({
      sessionId,
      config,
      prepProfile,
      currentQuestion: firstQuestion,
      currentCategory: category,
      questionOrder: 1,
      sessionStatus: 'active',
      elapsedSeconds: 0,
      totalDurationSeconds: config.duration_minutes * 60,
      isTimerRunning: true,
      stage: 'live',
      transcript: [
        {
          order: 1,
          category: category,
          question: firstQuestion,
          answer: '',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    });
  },

  updateQuestionTurn: (question, category, order) => {
    set((state) => ({
      currentQuestion: question,
      currentCategory: category,
      questionOrder: order,
      transcript: [
        ...state.transcript,
        {
          order,
          category,
          question,
          answer: '',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    }));
  },

  addTranscriptItem: (item) => {
    set((state) => {
      const updated = state.transcript.map((t) =>
        t.order === item.order ? { ...t, ...item } : t
      );
      const exists = state.transcript.some((t) => t.order === item.order);
      return {
        transcript: exists ? updated : [...state.transcript, item]
      };
    });
  },

  setProcessingTurn: (isProcessingTurn) => set({ isProcessingTurn }),
  setListening: (isListening) => set({ isListening }),
  setSpeaking: (isSpeaking) => set({ isSpeaking }),
  setMicMuted: (micMuted) => set({ micMuted }),
  setAudioFrequencyData: (audioFrequencyData) => set({ audioFrequencyData }),
  setVoiceEnabled: (voiceEnabled) => set({ voiceEnabled }),

  tickTimer: () => {
    const { elapsedSeconds, totalDurationSeconds, isTimerRunning } = get();
    if (!isTimerRunning) return;
    if (elapsedSeconds >= totalDurationSeconds) {
      set({ isTimerRunning: false });
    } else {
      set({ elapsedSeconds: elapsedSeconds + 1 });
    }
  },

  setTimerRunning: (isTimerRunning) => set({ isTimerRunning }),

  setReportData: (reportData) =>
    set({
      reportData,
      stage: 'report',
      sessionStatus: 'completed',
      isTimerRunning: false
    }),

  resetSession: () =>
    set({
      stage: 'setup',
      sessionId: null,
      sessionStatus: 'setup',
      prepProfile: null,
      currentQuestion: '',
      currentCategory: 'Introduction',
      questionOrder: 1,
      transcript: [],
      elapsedSeconds: 0,
      isTimerRunning: false,
      reportData: null
    })
}));
