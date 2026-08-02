import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import api from '../../infrastructure/api_client';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { Modal } from '../components/Modal';
import {
  LayoutDashboard, Settings, Cpu, Flag, CreditCard, FileText, Users,
  ShieldCheck, DollarSign, Mail, Activity, FileSpreadsheet, Download,
  Check, RefreshCw, Zap, AlertTriangle, UserCheck, Play, Lock, Eye, RotateCcw
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'settings' | 'ai' | 'features' | 'plans' | 'prompts' | 'users' | 'roles' | 'payments' | 'health' | 'audit'
  >('dashboard');

  const [selectedPromptKey, setSelectedPromptKey] = useState<string>('resume_ats');
  const [testConnMessage, setTestConnMessage] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');

  // 1. Fetch Global Dashboard Stats
  const { data: stats = {} } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get('/api/v1/admin/dashboard/stats')).data,
    refetchInterval: 10000
  });

  // 2. Fetch Charts Data
  const { data: charts = {} } = useQuery({
    queryKey: ['admin-charts'],
    queryFn: async () => (await api.get('/api/v1/admin/dashboard/charts')).data,
  });

  // 3. Fetch App Settings
  const { data: appSettings = {} } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => (await api.get('/api/v1/admin/settings')).data,
  });

  // 4. Fetch AI Engine Configs
  const { data: aiConfigs = [] } = useQuery({
    queryKey: ['admin-ai-configs'],
    queryFn: async () => (await api.get('/api/v1/admin/ai-configs')).data,
  });

  // 5. Fetch Feature Flags
  const { data: featureFlags = [] } = useQuery({
    queryKey: ['admin-features'],
    queryFn: async () => (await api.get('/api/v1/admin/features')).data,
  });

  // 6. Fetch Subscription Plans
  const { data: plansData = [] } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: async () => (await api.get('/api/v1/admin/plans')).data,
  });

  // 7. Fetch Prompts Library
  const { data: promptsData = [] } = useQuery({
    queryKey: ['admin-prompts'],
    queryFn: async () => (await api.get('/api/v1/admin/prompts')).data,
  });

  // 8. Fetch Users
  const { data: usersData = [] } = useQuery({
    queryKey: ['admin-users', userSearchQuery],
    queryFn: async () => (await api.get('/api/v1/admin/users', { params: { query: userSearchQuery } })).data,
  });

  // 9. Fetch Audit Logs
  const { data: auditLogs = [] } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => (await api.get('/api/v1/admin/audit-logs')).data,
  });

  // 10. Fetch System Health
  const { data: healthData = {} } = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: async () => (await api.get('/api/v1/admin/system-health')).data,
    refetchInterval: 15000
  });

  // Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: any) => await api.put('/api/v1/admin/settings', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
  });

  const updateAIConfigMutation = useMutation({
    mutationFn: async ({ providerKey, payload }: { providerKey: string; payload: any }) =>
      await api.put(`/api/v1/admin/ai-configs/${providerKey}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-ai-configs'] })
  });

  const testAIConnMutation = useMutation({
    mutationFn: async (providerKey: string) => (await api.post('/api/v1/admin/ai-configs/test-connection', { provider_key: providerKey })).data,
    onSuccess: (data) => setTestConnMessage(`Connected to ${data.provider_key}! Latency: ${data.latency_ms}ms`)
  });

  const updateFeatureMutation = useMutation({
    mutationFn: async ({ featureKey, status }: { featureKey: string; status: string }) =>
      await api.put(`/api/v1/admin/features/${featureKey}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-features'] })
  });

  const updatePromptMutation = useMutation({
    mutationFn: async ({ promptKey, payload }: { promptKey: string; payload: any }) =>
      await api.put(`/api/v1/admin/prompts/${promptKey}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-prompts'] })
  });

  const restorePromptMutation = useMutation({
    mutationFn: async ({ promptKey, version }: { promptKey: string; version: number }) =>
      await api.post(`/api/v1/admin/prompts/${promptKey}/restore/${version}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-prompts'] })
  });

  const impersonateUserMutation = useMutation({
    mutationFn: async (userId: number) => (await api.post(`/api/v1/admin/users/${userId}/impersonate`)).data,
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token);
      window.location.href = '/dashboard';
    }
  });

  const exportAuditCSV = () => {
    window.open('/api/v1/admin/audit-logs/export', '_blank');
  };

  const navItems = [
    { id: 'dashboard', label: 'Global Dashboard', icon: LayoutDashboard },
    { id: 'settings', label: 'App Settings & Branding', icon: Settings },
    { id: 'ai', label: 'AI Engine Controls', icon: Cpu },
    { id: 'features', label: 'Feature Flags', icon: Flag },
    { id: 'plans', label: 'Subscriptions & Limits', icon: CreditCard },
    { id: 'prompts', label: 'Prompt Library', icon: FileText },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'roles', label: 'Roles & RBAC', icon: ShieldCheck },
    { id: 'payments', label: 'Payment Gateways', icon: DollarSign },
    { id: 'health', label: 'System Diagnostics', icon: Activity },
    { id: 'audit', label: 'Audit Trail', icon: FileSpreadsheet },
  ];

  const currentPrompt = promptsData.find((p: any) => p.prompt_key === selectedPromptKey) || promptsData[0];
  const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EC4899'];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-900 dark:text-white">
      {/* Top Header Banner & Sub-Nav Tabs */}
      <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-emerald-500 to-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
              <Cpu size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-850 dark:text-white tracking-tight">Enterprise Control Center</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Business Operating System & Real-Time AI Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Server Uptime:</span>
            <span className="text-xs font-extrabold text-emerald-500 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              99.98% Operational
            </span>
          </div>
        </div>

        {/* Scrollable Sub-Nav Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Control Panel Content */}
      <div className="w-full">
        {/* ---------------- 1. GLOBAL DASHBOARD ---------------- */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-black">Platform Operating Metrics</h1>
                <p className="text-xs text-slate-400">Real-time database analytics and AI infrastructure monitoring</p>
              </div>
              <Button variant="outline" className="text-xs border-slate-700 text-slate-300">
                <RefreshCw size={14} className="mr-1.5" /> Refresh Realtime
              </Button>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 bg-slate-950 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Candidate Users</div>
                <div className="text-2xl font-black text-white mt-1">{stats.total_users || 0}</div>
                <div className="text-[10px] text-emerald-400 font-bold mt-1">+{stats.daily_growth_pct}% growth today</div>
              </Card>
              <Card className="p-4 bg-slate-950 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">ATS Resume Analyses</div>
                <div className="text-2xl font-black text-white mt-1">{stats.resume_analyses || 0}</div>
                <div className="text-[10px] text-indigo-400 font-bold mt-1">Real-time scanned</div>
              </Card>
              <Card className="p-4 bg-slate-950 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">AI Tokens Consumed</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{(stats.tokens_consumed || 0).toLocaleString()}</div>
                <div className="text-[10px] text-slate-400 mt-1">Across 4 providers</div>
              </Card>
              <Card className="p-4 bg-slate-950 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Subscription Revenue</div>
                <div className="text-xl font-black text-white mt-1">{stats.formatted_revenue || '₦0 / $0'}</div>
                <div className="text-[10px] text-emerald-400 font-bold mt-1">{stats.paid_users || 0} Active Subscribers</div>
              </Card>
            </div>

            {/* Recharts Data Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-5 bg-slate-950 border border-slate-800">
                <h3 className="font-bold text-sm mb-4">User Growth & Active Candidates</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts.user_growth || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155' }} />
                      <Area type="monotone" dataKey="users" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="active" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-5 bg-slate-950 border border-slate-800">
                <h3 className="font-bold text-sm mb-4">AI Provider Requests Load</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.ai_usage || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155' }} />
                      <Bar dataKey="gemini" fill="#10B981" />
                      <Bar dataKey="groq" fill="#6366F1" />
                      <Bar dataKey="openrouter" fill="#F59E0B" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ---------------- 2. APP SETTINGS & BRANDING ---------------- */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-6 max-w-3xl">
            <div>
              <h1 className="text-xl font-black">Application Settings & Branding</h1>
              <p className="text-xs text-slate-400">Configure global branding, colors, maintenance mode, and security rules</p>
            </div>

            <Card className="p-6 bg-slate-950 border border-slate-800 flex flex-col gap-4">
              <InputField
                label="Application Name"
                value={appSettings.app_name || 'Naija Career AI'}
                onChange={(e) => updateSettingsMutation.mutate({ ...appSettings, app_name: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Logo URL"
                  value={appSettings.logo_url || '/logo.svg'}
                  onChange={(e) => updateSettingsMutation.mutate({ ...appSettings, logo_url: e.target.value })}
                />
                <InputField
                  label="Support Email"
                  value={appSettings.support_email || 'support@naijacareer.ai'}
                  onChange={(e) => updateSettingsMutation.mutate({ ...appSettings, support_email: e.target.value })}
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs block">Maintenance Mode</span>
                    <span className="text-[11px] text-slate-400">Block candidate access while upgrading backend systems</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={appSettings.maintenance_mode || false}
                    onChange={(e) => updateSettingsMutation.mutate({ ...appSettings, maintenance_mode: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs block">Registration Enabled</span>
                    <span className="text-[11px] text-slate-400">Allow new candidates to register accounts</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={appSettings.registration_enabled !== false}
                    onChange={(e) => updateSettingsMutation.mutate({ ...appSettings, registration_enabled: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ---------------- 3. AI ENGINE CONTROLS ---------------- */}
        {activeTab === 'ai' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-black">AI Engine Configuration Panel</h1>
                <p className="text-xs text-slate-400">Manage AI model providers, temperature, budgets, and priority fallback chains</p>
              </div>
              {testConnMessage && (
                <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-lg">
                  {testConnMessage}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiConfigs.map((config: any) => (
                <Card key={config.provider_key} className="p-5 bg-slate-950 border border-slate-800 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base uppercase">{config.provider_key}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          config.is_enabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {config.is_enabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">Priority: #{config.priority_order}</span>
                    </div>

                    <div className="flex flex-col gap-3 mt-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400">Active Model</label>
                        <input
                          type="text"
                          value={config.model_name}
                          onChange={(e) => updateAIConfigMutation.mutate({ providerKey: config.provider_key, payload: { model_name: e.target.value } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400">Temperature ({config.temperature})</label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={config.temperature}
                            onChange={(e) => updateAIConfigMutation.mutate({ providerKey: config.provider_key, payload: { temperature: parseFloat(e.target.value) } })}
                            className="w-full mt-1 accent-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400">Max Tokens</label>
                          <input
                            type="number"
                            value={config.max_tokens}
                            onChange={(e) => updateAIConfigMutation.mutate({ providerKey: config.provider_key, payload: { max_tokens: parseInt(e.target.value) } })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                    <span className="text-xs text-slate-400">Latency: <strong className="text-emerald-400">{config.latency_ms}ms</strong></span>
                    <Button
                      variant="outline"
                      onClick={() => testAIConnMutation.mutate(config.provider_key)}
                      isLoading={testAIConnMutation.isPending && testAIConnMutation.variables === config.provider_key}
                      className="text-xs py-1 px-3 border-slate-700 text-slate-200"
                    >
                      <Zap size={12} className="mr-1" /> Test Connection
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- 4. FEATURE FLAGS ---------------- */}
        {activeTab === 'features' && (
          <div className="flex flex-col gap-6 max-w-4xl">
            <div>
              <h1 className="text-xl font-black">Feature Management & Rollout Toggles</h1>
              <p className="text-xs text-slate-400">Enable, disable, or set features to Beta / Premium Only in real time</p>
            </div>

            <div className="flex flex-col gap-3">
              {featureFlags.map((flag: any) => (
                <Card key={flag.feature_key} className="p-4 bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm">{flag.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">{flag.feature_key} • {flag.category}</span>
                  </div>

                  <select
                    value={flag.status}
                    onChange={(e) => updateFeatureMutation.mutate({ featureKey: flag.feature_key, status: e.target.value })}
                    className="bg-slate-900 border border-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 text-white"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="beta">Beta</option>
                    <option value="premium_only">Premium Only</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- 5. PROMPT LIBRARY & VERSIONING ---------------- */}
        {activeTab === 'prompts' && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-xl font-black">Prompt Library & Version History</h1>
              <p className="text-xs text-slate-400">Edit AI system prompts, test prompt variations, and restore past versions</p>
            </div>

            <div className="flex gap-2">
              {promptsData.map((p: any) => (
                <button
                  key={p.prompt_key}
                  onClick={() => setSelectedPromptKey(p.prompt_key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedPromptKey === p.prompt_key
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  {p.title} (v{p.version})
                </button>
              ))}
            </div>

            {currentPrompt && (
              <Card className="p-6 bg-slate-950 border border-slate-800 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-base">{currentPrompt.title}</h3>
                  <span className="text-xs text-emerald-400 font-mono">Current Version: v{currentPrompt.version}</span>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">System Prompt</label>
                  <textarea
                    rows={5}
                    value={currentPrompt.system_prompt}
                    onChange={(e) => updatePromptMutation.mutate({
                      promptKey: currentPrompt.prompt_key,
                      payload: { system_prompt: e.target.value }
                    })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200"
                  />
                </div>

                {/* Version History & Rollback */}
                {currentPrompt.history_json && currentPrompt.history_json.length > 0 && (
                  <div className="pt-4 border-t border-slate-800">
                    <span className="text-xs font-bold text-slate-400 block mb-2">Version History</span>
                    <div className="flex flex-col gap-2">
                      {currentPrompt.history_json.map((hist: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                          <div>
                            <span className="font-bold text-white mr-2">Version {hist.version}</span>
                            <span className="text-[11px] text-slate-400">{hist.updated_at} by {hist.updated_by}</span>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => restorePromptMutation.mutate({ promptKey: currentPrompt.prompt_key, version: hist.version })}
                            className="text-[11px] py-1 px-2.5 border-slate-700 text-slate-300"
                          >
                            <RotateCcw size={12} className="mr-1" /> Restore v{hist.version}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* ---------------- 6. USER MANAGEMENT & IMPERSONATION ---------------- */}
        {activeTab === 'users' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-black">User Directory & Impersonation</h1>
                <p className="text-xs text-slate-400">Search candidates, upgrade plans, suspend accounts, or login as user</p>
              </div>
              <input
                type="text"
                placeholder="Search candidates by name or email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white w-64"
              />
            </div>

            <Card className="p-0 bg-slate-950 border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Candidate</th>
                    <th className="p-4">NYSC Status</th>
                    <th className="p-4">Target Role</th>
                    <th className="p-4">Subscription Plan</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {usersData.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-900/50">
                      <td className="p-4 font-bold text-white">
                        <div>{u.full_name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{u.email}</div>
                      </td>
                      <td className="p-4 uppercase font-semibold text-[11px]">{u.nysc_status}</td>
                      <td className="p-4 text-slate-300">{u.target_job_title || 'N/A'}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {u.subscription_plan || 'free'}
                        </span>
                      </td>
                      <td className="p-4 flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => impersonateUserMutation.mutate(u.id)}
                          className="text-[11px] py-1 px-2.5 border-emerald-800 text-emerald-400 hover:bg-emerald-950"
                        >
                          <UserCheck size={12} className="mr-1" /> Login As User
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* ---------------- 7. AUDIT TRAIL ---------------- */}
        {activeTab === 'audit' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-black">Audit Trail & Action Logs</h1>
                <p className="text-xs text-slate-400">Complete immutable record of all administrator changes</p>
              </div>
              <Button variant="outline" onClick={exportAuditCSV} className="text-xs border-slate-700 text-slate-200">
                <Download size={14} className="mr-1.5" /> Export Audit CSV
              </Button>
            </div>

            <Card className="p-0 bg-slate-950 border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Admin Email</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Resource</th>
                    <th className="p-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                  {auditLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-900/50">
                      <td className="p-4 text-slate-400">{log.created_at}</td>
                      <td className="p-4 text-white font-bold">{log.admin_email}</td>
                      <td className="p-4 text-emerald-400 font-bold">{log.action}</td>
                      <td className="p-4 text-indigo-400">{log.resource_type}:{log.resource_id || ''}</td>
                      <td className="p-4 text-slate-400">{log.ip_address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
