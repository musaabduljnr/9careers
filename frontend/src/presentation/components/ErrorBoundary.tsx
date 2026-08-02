import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/10">
              <AlertTriangle size={32} />
            </div>

            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-black text-slate-850 dark:text-white tracking-tight">
                Something went wrong
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                An unexpected application error occurred. Don't worry, your data is safe.
              </p>
            </div>

            {this.state.error && (
              <div className="w-full bg-slate-950 text-red-400 font-mono text-[11px] p-3.5 rounded-xl text-left overflow-x-auto border border-slate-800 max-h-36 scrollbar-hide">
                <span className="font-bold uppercase text-[9px] text-slate-500 block mb-1">Error Trace</span>
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center gap-3 w-full mt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                aria-label="Reload application"
              >
                <RefreshCw size={14} />
                Reload Application
              </button>
              <button
                onClick={this.handleGoHome}
                className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-slate-400 focus:outline-none"
                aria-label="Return to dashboard"
              >
                <Home size={14} />
                Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
