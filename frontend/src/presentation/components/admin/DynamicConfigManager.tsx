import React, { useEffect, useState } from 'react';
import { Card } from '../Card';
import { Button } from '../Button';
import {
  SlidersHorizontal,
  Bot,
  FileCode,
  ToggleLeft,
  CreditCard,
  Mail,
  Palette,
  History,
  Eye,
  EyeOff,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  Download,
  Copy,
  Check
} from 'lucide-react';

interface AppSettingItem {
  id: number;
  category: string;
  key: string;
  value: any;
  data_type: string;
  description: string;
  is_encrypted: boolean;
  is_editable: boolean;
  version: number;
  updated_at: string;
}

interface AuditLogItem {
  id: number;
  setting_key: string;
  old_value: string;
  new_value: string;
  changed_by: str;
  created_at: string;
}

export const DynamicConfigManager: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('ai_providers');
  const [settings, setSettings] = useState<AppSettingItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  const categories = [
    { id: 'ai_providers', label: 'AI Providers & Models', icon: Bot },
    { id: 'prompts', label: 'System Prompts', icon: FileCode },
    { id: 'feature_flags', label: 'Feature Flags', icon: ToggleLeft },
    { id: 'payments', label: 'Payment Gateways', icon: CreditCard },
    { id: 'email', label: 'Email & SMTP', icon: Mail },
    { id: 'branding', label: 'Branding & Limits', icon: Palette },
    { id: 'audit_logs', label: 'Audit Trail', icon: History }
  ];

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/config/settings?category=${activeCategory}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/v1/admin/config/audit-logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    }
  };

  useEffect(() => {
    if (activeCategory === 'audit_logs') {
      fetchAuditLogs();
    } else {
      fetchSettings();
    }
  }, [activeCategory]);

  const handleUpdateSetting = async (key: string, newValue: any) => {
    setSavingKey(key);
    try {
      const res = await fetch(`/api/v1/admin/config/settings/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ value: newValue })
      });
      if (res.ok) {
        setToastMessage(`Setting '${key}' updated dynamically!`);
        setTimeout(() => setToastMessage(null), 3000);
        fetchSettings();
      }
    } catch (e) {
      console.error('Failed to update setting:', e);
    } finally {
      setSavingKey(null);
    }
  };

  const handleRevealSecret = async (key: string) => {
    if (revealedSecrets[key]) {
      const next = { ...revealedSecrets };
      delete next[key];
      setRevealedSecrets(next);
      return;
    }

    try {
      const res = await fetch('/api/v1/admin/config/reveal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ key })
      });
      if (res.ok) {
        const data = await res.json();
        setRevealedSecrets({ ...revealedSecrets, [key]: data.unmasked_value });
      }
    } catch (e) {
      console.error('Failed to reveal secret:', e);
    }
  };

  const handleTestAI = async (provider: string, apiKey: string) => {
    setTestResult({ loading: true, provider });
    try {
      const res = await fetch('/api/v1/admin/config/test-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ provider_name: provider, api_key: apiKey })
      });
      if (res.ok) {
        const data = await res.json();
        setTestResult(data);
      }
    } catch (e) {
      setTestResult({ success: false, message: `Test failed: ${e}` });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {toastMessage}
          </span>
          <button onClick={() => setToastMessage(null)} className="text-xs hover:underline">Dismiss</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 text-white space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" /> Self-Configuring SaaS Architecture
        </div>
        <h2 className="text-2xl font-black">Dynamic SaaS Configuration Manager</h2>
        <p className="text-slate-300 text-xs sm:text-sm max-w-3xl">
          Manage AI providers, API keys, prompts, payment gateways, SMTP settings, feature flags, and system limits entirely from the database without editing .env or redeploying code.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" /> {cat.label}
            </button>
          );
        })}
      </div>

      {/* AUDIT TRAIL TAB */}
      {activeCategory === 'audit_logs' ? (
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-500" /> Settings Modification Audit Log Trail
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3">Setting Key</th>
                  <th className="p-3">Old Value</th>
                  <th className="p-3">New Value</th>
                  <th className="p-3">Updated By</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{log.setting_key}</td>
                    <td className="p-3 font-mono text-slate-400 max-w-[150px] truncate">{log.old_value || 'N/A'}</td>
                    <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold max-w-[150px] truncate">{log.new_value}</td>
                    <td className="p-3 font-medium text-slate-600 dark:text-slate-300">{log.changed_by}</td>
                    <td className="p-3 text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* SETTINGS FORM LIST */
        <div className="space-y-4">
          {loading ? (
            <div className="p-8 text-center text-slate-400 font-semibold text-xs">
              Loading dynamic configurations...
            </div>
          ) : (
            settings.map((item) => (
              <Card key={item.key} className="p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                      {item.category} • v{item.version}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono">{item.key}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                  </div>

                  {item.is_encrypted && (
                    <button
                      onClick={() => handleRevealSecret(item.key)}
                      className="self-start sm:self-auto text-xs text-indigo-500 font-bold hover:underline flex items-center gap-1"
                    >
                      {revealedSecrets[item.key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {revealedSecrets[item.key] ? 'Hide Secret' : 'Reveal Secret'}
                    </button>
                  )}
                </div>

                {/* Input Controls according to Data Type */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  {item.data_type === 'boolean' ? (
                    <select
                      value={String(item.value)}
                      onChange={(e) => handleUpdateSetting(item.key, e.target.value === 'true')}
                      className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="true">Enabled (True)</option>
                      <option value="false">Disabled (False)</option>
                    </select>
                  ) : item.category === 'prompts' ? (
                    <textarea
                      defaultValue={item.value}
                      rows={4}
                      onBlur={(e) => handleUpdateSetting(item.key, e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                    />
                  ) : (
                    <input
                      type={item.is_encrypted && !revealedSecrets[item.key] ? 'password' : 'text'}
                      value={revealedSecrets[item.key] || item.value}
                      onChange={(e) => {
                        if (revealedSecrets[item.key]) {
                          setRevealedSecrets({ ...revealedSecrets, [item.key]: e.target.value });
                        } else {
                          const copy = [...settings];
                          const target = copy.find((s) => s.key === item.key);
                          if (target) target.value = e.target.value;
                          setSettings(copy);
                        }
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                    />
                  )}

                  {item.data_type !== 'boolean' && item.category !== 'prompts' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateSetting(item.key, revealedSecrets[item.key] || item.value)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0"
                    >
                      <Save className="w-3.5 h-3.5 mr-1" /> Save
                    </Button>
                  )}

                  {item.is_encrypted && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleTestAI(item.key.includes('gemini') ? 'gemini' : 'groq', revealedSecrets[item.key] || item.value)}
                      className="text-xs shrink-0"
                    >
                      <Zap className="w-3.5 h-3.5 mr-1 text-amber-500" /> Test Connection
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Connection Test Diagnostics Result Box */}
      {testResult && (
        <Card className={`p-4 ${testResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'} text-xs space-y-1`}>
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {testResult.provider} Diagnostic Result
            </span>
            <button onClick={() => setTestResult(null)} className="hover:underline">Close</button>
          </div>
          <p className="font-mono">{testResult.message}</p>
        </Card>
      )}
    </div>
  );
};
