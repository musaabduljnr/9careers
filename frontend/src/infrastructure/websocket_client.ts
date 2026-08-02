export type WSEventListener = (event: string, data: any) => void;

class InterviewWebSocketClient {
  private ws: WebSocket | null = null;
  private listeners: Set<WSEventListener> = new Set();
  private pingIntervalId: any = null;
  private session_id: string | null = null;
  private isConnecting: boolean = false;

  public connect(sessionId: string, hostOverride?: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.ws && this.session_id === sessionId && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
        resolve(true);
        return;
      }

      this.disconnect();
      this.session_id = sessionId;
      this.isConnecting = true;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = hostOverride || window.location.host || 'localhost:8000';
      const url = `${protocol}//${host}/api/v1/interviews/ws/${sessionId}`;

      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          this.isConnecting = false;
          this.startHeartbeat();
          this.notifyListeners('connected', { sessionId });
          resolve(true);
        };

        this.ws.onmessage = (evt) => {
          try {
            const parsed = JSON.parse(evt.data);
            this.notifyListeners(parsed.type || 'message', parsed.data || parsed);
          } catch (e) {
            this.notifyListeners('raw_message', evt.data);
          }
        };

        this.ws.onerror = (err) => {
          this.isConnecting = false;
          this.notifyListeners('error', { error: err });
          resolve(false);
        };

        this.ws.onclose = () => {
          this.isConnecting = false;
          this.stopHeartbeat();
          this.notifyListeners('disconnected', { sessionId });
        };
      } catch (e) {
        this.isConnecting = false;
        resolve(false);
      }
    });
  }

  public disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }
    this.session_id = null;
  }

  public send(type: string, payload: any = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  public submitAnswer(answer: string, elapsedSeconds: number) {
    this.send('submit_answer', { user_answer: answer, elapsed_seconds: elapsedSeconds });
  }

  public sendAction(action: 'pause' | 'resume' | 'end') {
    this.send('action', { action });
  }

  public subscribe(listener: WSEventListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(event: string, data: any) {
    this.listeners.forEach((l) => l(event, data));
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingIntervalId = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 20000);
  }

  private stopHeartbeat() {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
  }
}

export const wsClient = new InterviewWebSocketClient();
