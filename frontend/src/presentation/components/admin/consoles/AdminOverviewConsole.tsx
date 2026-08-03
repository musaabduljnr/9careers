import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import api from '../../../../infrastructure/api_client';
import { Card } from '../../Card';
import { 
  Users, Sparkles, MessageSquareCode, CreditCard, Cpu, ArrowUpRight, ArrowDownRight, Activity 
} from 'lucide-react';

export const AdminOverviewConsole: React.FC = () => {
  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats-summary'],
    queryFn: async () => (await api.get('/api/v1/admin/dashboard/stats')).data,
    refetchInterval: 15000
  });

  const { data: charts = {}, isLoading: chartsLoading } = useQuery({
    queryKey: ['admin-charts-data'],
    queryFn: async () => (await api.get('/api/v1/admin/dashboard/charts')).data
  });

  if (statsLoading || chartsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map(idx => (
          <div key={idx} className="h-32 bg-slate-900 border border-slate-800 rounded-2xl" />
        ))}
        <div className="md:col-span-3 h-80 bg-slate-900 border border-slate-800 rounded-2xl" />
        <div className="h-80 bg-slate-900 border border-slate-800 rounded-2xl" />
      </div>
    );
  }

  const kpis = [
    { 
      name: 'Total Users', 
      value: stats.total_users || 0, 
      sub: `${stats.active_users_today || 0} active today`, 
      icon: Users,
      trend: `+${stats.daily_growth_pct || 12}%`,
      trendUp: true
    },
    { 
      name: 'AI Requests', 
      value: stats.ai_requests || 0, 
      sub: `${stats.tokens_consumed?.toLocaleString() || 0} tokens`, 
      icon: Cpu,
      trend: `+${stats.monthly_growth_pct || 32}%`,
      trendUp: true
    },
    { 
      name: 'Interviews Prep', 
      value: stats.interview_sessions || 0, 
      sub: 'Mock practice runs', 
      icon: MessageSquareCode,
      trend: 'Optimal',
      trendUp: true
    },
    { 
      name: 'Estimated Revenue', 
      value: stats.formatted_revenue || '₦0 / $0', 
      sub: `${stats.paid_users || 0} premium accounts`, 
      icon: CreditCard,
      trend: 'Naija SaaS',
      trendUp: true
    }
  ];

  const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* Dynamic KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="bg-slate-900 border border-slate-800/80 p-5 flex flex-col gap-3 relative overflow-hidden group hover:border-slate-700/60 transition-all">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 group-hover:text-slate-300 transition-colors uppercase tracking-wider">{kpi.name}</span>
                <div className="p-2 bg-slate-800 rounded-xl text-indigo-400 border border-slate-700/50">
                  <Icon size={16} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white tracking-tight">{kpi.value}</span>
                <span className={`text-[10px] font-extrabold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
                  kpi.trendUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {kpi.trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {kpi.trend}
                </span>
              </div>
              <span className="text-xs text-slate-500">{kpi.sub}</span>
            </Card>
          );
        })}
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main User Growth Area Chart */}
        <Card className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Platform Utilization & Growth</h3>
            <p className="text-[11px] text-slate-500">Live active vs total registered accounts over week cycle</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.user_growth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '11px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="users" name="Registered" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="active" name="Active" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Feature Usage Pie Chart */}
        <Card className="bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Module Distribution</h3>
            <p className="text-[11px] text-slate-500">Breakdown of AI operations executed on the server</p>
          </div>
          <div className="h-64 flex flex-col items-center justify-center relative">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={charts.feature_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts.feature_distribution || []).map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '11px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-[38%] text-center">
              <span className="text-xs text-slate-500 font-bold block">Requests</span>
              <span className="text-lg font-black text-white">{stats.ai_requests || 0}</span>
            </div>
            {/* Pie Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] w-full mt-2 font-bold">
              {(charts.feature_distribution || []).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-400 truncate max-w-[80px]">{item.name}</span>
                  <span className="text-slate-200 ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* AI Usage Time-Series */}
      <Card className="bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200">AI Provider Load Balance</h3>
          <p className="text-[11px] text-slate-500">API throughput and tokens generated per provider source</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.ai_usage || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                itemStyle={{ fontSize: '11px' }}
              />
              <Bar dataKey="gemini" name="Gemini" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="groq" name="Groq" fill="#6366F1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="openrouter" name="OpenRouter" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
