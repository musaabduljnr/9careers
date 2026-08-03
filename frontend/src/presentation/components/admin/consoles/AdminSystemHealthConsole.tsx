import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../infrastructure/api_client';
import { Card } from '../../Card';
import { 
  Activity, Cpu, HardDrive, RefreshCw, Layers, Database, ShieldCheck, Zap 
} from 'lucide-react';

export const AdminSystemHealthConsole: React.FC = () => {
  const { data: health = {}, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-health-metrics'],
    queryFn: async () => (await api.get('/api/v1/admin/system-health')).data,
    refetchInterval: 15000
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map(idx => (
          <div key={idx} className="h-44 bg-slate-900 border border-slate-800 rounded-2xl" />
        ))}
      </div>
    );
  }

  const items = [
    {
      name: 'Central Processing Unit',
      value: `${health.cpu_usage_pct || 0}%`,
      sub: 'Server utilization load',
      icon: Cpu,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
      name: 'System Random Access Memory',
      value: `${health.ram_usage_pct || 0}%`,
      sub: 'Buffer & memory paging allocation',
      icon: Layers,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      name: 'Persistent Disk Storage',
      value: `${health.disk_usage_pct || 0}%`,
      sub: 'Uploaded assets and database storage',
      icon: HardDrive,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="bg-slate-900 border border-slate-800/80 p-5 flex flex-col gap-4 relative overflow-hidden group hover:border-slate-700/60 transition-all text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.name}</span>
                <div className={`p-2 rounded-xl text-xs border ${item.color} ${item.bg}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-black text-white tracking-tight">{item.value}</span>
                <span className="text-xs text-slate-500 font-bold">{item.sub}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Database & Infrastructure Checklists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Database Diagnoses */}
        <Card className="bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4 text-left">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-200">Database Engine Diagnostics</h3>
            </div>
            <button 
              onClick={() => refetch()} 
              disabled={isRefetching}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-bold"
            >
              <RefreshCw size={12} className={isRefetching ? 'animate-spin' : ''} />
              Re-Scan
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-850">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-300">PostgreSQL Connection Status</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Database session connectivity</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                {health.database_status || 'HEALTHY'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-850">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-300">Redis Cache Connection</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Memory cache operational state</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                {health.redis_status || 'ACTIVE'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-850">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-300">Celery Background Workers</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Asynchronous task agents running</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                {health.active_background_workers || 0} Workers Online
              </span>
            </div>
          </div>
        </Card>

        {/* AI Provider Health Checklist */}
        <Card className="bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4 text-left">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Zap className="w-4.5 h-4.5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200">AI Gateway Heartbeat Checks</h3>
          </div>

          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {health.ai_providers_health ? (
              Object.entries(health.ai_providers_health).map(([provider, data]: [string, any]) => (
                <div key={provider} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-850">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200 capitalize">{provider} API Gateway</span>
                    <span className="text-[9px] text-slate-500 mt-0.5">Average ping response: {data.latency_ms || 0}ms</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                    data.status === 'operational' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}>
                    {data.status || 'degraded'}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs font-bold">
                No active gateway checks detected.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
