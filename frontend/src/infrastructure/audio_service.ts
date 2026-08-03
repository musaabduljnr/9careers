// Audio Engine for Web Speech STT, SpeechSynthesis TTS, and Web Audio API Visualizer

export interface AudioCallbacks {
  onTranscriptResult?: (text: string, isFinal: boolean) => void;
  onListeningStart?: () => void;
  onListeningEnd?: () => void;
  onSpeakingStart?: () => void;
  onSpeakingEnd?: () => void;
  onFrequencyUpdate?: (frequencies: number[]) => void;
  onError?: (err: string) => void;
}

class InterviewAudioEngine {
  private recognition: any = null;
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private animFrameId: number | null = null;
  private callbacks: AudioCallbacks = {};

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
    }
  }

  public registerCallbacks(callbacks: AudioCallbacks) {
    this.callbacks = callbacks;
  }

  public isSpeechRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  public async startListening(): Promise<boolean> {
    if (!this.recognition) {
      if (this.callbacks.onError) {
        this.callbacks.onError('Web Speech API is not supported in this browser.');
      }
      return false;
    }

    try {
      // Setup Web Audio API analyser for live waveform visualizer
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 32;
        const source = this.audioCtx.createMediaStreamSource(this.micStream);
        source.connect(this.analyser);
        this.startFrequencyAnimation();
      }

      this.recognition.onstart = () => {
        if (this.callbacks.onListeningStart) this.callbacks.onListeningStart();
      };

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const text = final || interim;
        if (this.callbacks.onTranscriptResult && text) {
          this.callbacks.onTranscriptResult(text, !!final);
        }
      };

      this.recognition.onerror = (event: any) => {
        logger_warn('Speech recognition error:', event.error);
        if (this.callbacks.onError) this.callbacks.onError(`Microphone error: ${event.error}`);
      };

      this.recognition.onend = () => {
        if (this.callbacks.onListeningEnd) this.callbacks.onListeningEnd();
      };

      this.recognition.start();
      return true;
    } catch (e: any) {
      if (this.callbacks.onError) this.callbacks.onError(`Failed to access microphone: ${e.message}`);
      return false;
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.stopFrequencyAnimation();
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
  }

  public speakText(text: string) {
    if (!this.synth) return;
    this.synth.cancel();

    const cleanText = text.replace(/[*_#`~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = this.synth.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel'))
    ) || voices.find((v) => v.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      if (this.callbacks.onSpeakingStart) this.callbacks.onSpeakingStart();
    };

    utterance.onend = () => {
      if (this.callbacks.onSpeakingEnd) this.callbacks.onSpeakingEnd();
    };

    utterance.onerror = () => {
      if (this.callbacks.onSpeakingEnd) this.callbacks.onSpeakingEnd();
    };

    this.synth.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      if (this.callbacks.onSpeakingEnd) this.callbacks.onSpeakingEnd();
    }
  }

  private startFrequencyAnimation() {
    if (!this.analyser) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const update = () => {
      if (!this.analyser) return;
      this.analyser.getByteFrequencyData(dataArray);
      
      // Select 7 key frequencies for the visualizer
      const freqs = Array.from(dataArray.slice(0, 7)).map((v) => Math.max(10, Math.min(100, Math.round((v / 255) * 100))));
      if (this.callbacks.onFrequencyUpdate) {
        this.callbacks.onFrequencyUpdate(freqs);
      }
      this.animFrameId = requestAnimationFrame(update);
    };

    update();
  }

  private stopFrequencyAnimation() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.analyser = null;
  }
}

function logger_warn(...args: any[]) {
  if (import.meta.env?.DEV) {
    console.warn('[AudioEngine]', ...args);
  }
}

export const audioEngine = new InterviewAudioEngine();
