import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../infrastructure/api_client';
import { useAuth } from '../../application/context/AuthContext';
import { Resume } from '../../domain/types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CircularProgress } from '../components/CircularProgress';
import { 
  FileText, 
  FileSignature, 
  MessageSquareCode, 
  Briefcase,
  Bookmark,
  Layers,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle,
  Activity
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Query to fetch the latest resume (for dynamic ATS score)
  const { data: resume, isLoading } = useQuery<Resume, any>({
    queryKey: ['latest-resume'],
    queryFn: async () => {
      const res = await api.get<Resume>('/api/v1/resumes/latest');
      return res.data;
    },
    retry: false
  });

  // Mock data for charts
  const appData = [
    { name: 'Jan', apps: 4 },
    { name: 'Feb', apps: 7 },
    { name: 'Mar', apps: 5 },
    { name: 'Apr', apps: 12 },
    { name: 'May', apps: 8 },
    { name: 'Jun', apps: 15 },
  ];

  const atsTrendData = [
    { name: 'V1 (Original)', score: 45 },
    { name: 'V2 (Tailored)', score: 65 },
    { name: 'V3 (Optimized)', score: 78 },
    { name: 'V4 (Current)', score: resume?.ats_score || 85 },
  ];

  const interviewRateData = [
    { name: 'Interviews Landed', value: 8 },
    { name: 'Pending Responses', value: 24 },
    { name: 'Rejections', value: 14 }
  ];
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const recentActivities = [
    { title: 'Resume Optimized', desc: 'ATS Score increased to 85%', time: '2 hours ago', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Cover Letter Generated', desc: 'For Paystack Frontend Role', time: '1 day ago', icon: FileSignature, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Job Application', desc: 'Applied to GTBank Graduate Trainee', time: '3 days ago', icon: Briefcase, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Mock Interview', desc: 'Scored 92% on Behavioral Interview', time: '1 week ago', icon: MessageSquareCode, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  // Dashboard Stats
  const stats = [
    { label: 'ATS Score', value: resume ? `${resume.ats_score}%` : 'N/A', icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'Total Applications', value: '46', icon: Briefcase, color: 'text-blue-500' },
    { label: 'Saved Jobs', value: '12', icon: Bookmark, color: 'text-amber-500' },
    { label: 'Cover Letters', value: '8', icon: FileSignature, color: 'text-purple-500' },
    { label: 'Resume Versions', value: '4', icon: Layers, color: 'text-indigo-500' },
    { label: 'Interview Readiness', value: '88%', icon: CheckCircle, color: 'text-rose-500' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 dark:bg-slate-950 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="flex flex-col gap-2 relative z-10">
          <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Dashboard Overview</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome back, {user?.full_name}!</h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
            Your career trajectory is looking strong. You have <strong className="text-white">3 pending applications</strong> and your ATS score is currently above average.
          </p>
        </div>
        <div className="flex gap-2 relative z-10">
          <Button 
            variant="primary" 
            onClick={() => navigate('/resume-optimizer')}
            className="shadow-md shadow-emerald-900/30 py-2.5"
          >
            <Sparkles size={16} className="mr-2" />
            Optimize New CV
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-4 border-slate-200/50 dark:border-slate-850 flex flex-col justify-between h-[100px]">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
              <stat.icon size={14} className={stat.color} />
            </div>
            <div className="text-2xl font-black text-slate-850 dark:text-white">
              {stat.value}
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Applications Chart */}
        <Card className="lg:col-span-2 border-slate-200/50 dark:border-slate-850 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">Application Trend (Last 6 Months)</h3>
            <Activity size={16} className="text-slate-400" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={appData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="apps" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Interview Rate Pie Chart */}
        <Card className="lg:col-span-1 border-slate-200/50 dark:border-slate-850 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">Application Funnel</h3>
          </div>
          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={interviewRateData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {interviewRateData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-850 dark:text-white">46</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            {interviewRateData.map((entry, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{entry.name}</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{entry.value}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ATS Score Improvement Trend */}
        <Card className="border-slate-200/50 dark:border-slate-850 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">CV Improvement Trend</h3>
            <TrendingUp size={16} className="text-slate-400" />
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={atsTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50}>
                  {
                    atsTrendData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === atsTrendData.length - 1 ? '#10b981' : '#3b82f6'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="border-slate-200/50 dark:border-slate-850 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">Recent Activity</h3>
            <Clock size={16} className="text-slate-400" />
          </div>
          
          <div className="flex flex-col gap-5">
            {recentActivities.map((act, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className={`p-2.5 rounded-xl ${act.bg} ${act.color} shrink-0 mt-0.5`}>
                  <act.icon size={16} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{act.title}</span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-450">{act.desc}</span>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="outline" className="w-full mt-6 py-2 text-xs">
            View All Activity
          </Button>
        </Card>

      </div>
    </div>
  );
};
