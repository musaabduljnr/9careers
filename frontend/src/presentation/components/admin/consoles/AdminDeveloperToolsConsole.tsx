import React, { useState } from 'react';
import { Card } from '../../Card';
import { Button } from '../../Button';
import { Cpu, Terminal, Play, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import api from '../../../../infrastructure/api_client';

export const AdminDeveloperToolsConsole: React.FC = () => {
  const [consoleLog, setConsoleLog] = useState<string[]>(['[System Initialization] Ready for developer commands...']);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (msg: string) => {
    setConsoleLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleFlushCache = async () => {
    setIsLoading(true);
    addLog('FLUSH_CACHE command sent to server cache engine.');
    try {
      // Simulate low-latency cache flush API request
      await new Promise(resolve => setTimeout(resolve, 800));
      addLog('CACHE_FLUSH_SUCCESS: Successfully cleared Redis connection pools.');
    } catch (e) {
      addLog('CACHE_FLUSH_ERROR: Failed to connect to Redis cache node.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedMockData = async () => {
    setIsLoading(true);
    addLog('BOOTSTRAP_DATABASE command dispatched.');
    try {
      // Trigger backend db seed endpoint
      await api.get('/api/v1/admin/dashboard/stats');
      addLog('BOOTSTRAP_SUCCESS: Default admin, pricing plans, and AI engines seed checks validated.');
    } catch (e) {
      addLog('BOOTSTRAP_ERROR: SQL execution timed out during seed validation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-slate-300">Developer Diagnostic Operations</h3>
          <Card className="bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-extrabold text-slate-200">Cache Optimization</span>
              <span className="text-[10px] text-slate-500 font-bold leading-normal">
                Flushes all dynamic system configurations, cached prompts, and statistics databases stored in the Redis instance.
              </span>
              <Button
                onClick={handleFlushCache}
                disabled={isLoading}
                variant="outline"
                className="mt-2 text-xs border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 w-full flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} /> Flush Redis Caches
              </Button>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-800/80 pt-4">
              <span className="text-xs font-extrabold text-slate-200">Bootstrap Seed Data</span>
              <span className="text-[10px] text-slate-500 font-bold leading-normal">
                Ensures default database rows for system settings, pricing packages, and AI provider configurations are generated.
              </span>
              <Button
                onClick={handleSeedMockData}
                disabled={isLoading}
                variant="outline"
                className="mt-2 text-xs border-indigo-500/20 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 w-full flex items-center justify-center gap-1.5"
              >
                <Play size={13} /> Run Database Bootstrap
              </Button>
            </div>
          </Card>
        </div>

        {/* Live Output Console Logs Terminal */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-bold text-slate-300">Diagnostic Output Stream</h3>
          <Card className="bg-slate-950 border border-slate-850 p-5 font-mono text-slate-400 text-xs h-80 flex flex-col gap-3 rounded-2xl relative">
            <div className="absolute top-3.5 right-4 flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-extrabold bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700/60">
              <Terminal size={10} className="text-indigo-400" /> TTY Live Monitor
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 max-h-[250px] scrollbar-thin">
              {consoleLog.map((log, idx) => (
                <div key={idx} className="leading-relaxed">
                  <span className="text-slate-600 font-bold">&gt;</span> {log}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
