import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../infrastructure/api_client';
import { Card } from '../../Card';
import { Button } from '../../Button';
import { InputField } from '../../InputField';
import { 
  Bot, ShieldCheck, Activity, Zap, Play, Settings, RefreshCw, AlertCircle, Save 
} from 'lucide-react';

export const AdminAiEngineConsole: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testingKey, setTestingKey] = useState<string | null>(null);

  // Fetch AI engine configurations
  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['admin-ai-configs-list'],
    queryFn: async () => (await api.get('/api/v1/admin/ai-configs')).data
  });

  const updateAIConfigMutation = useMutation({
    mutationFn: async ({ providerKey, payload }: { providerKey: string; payload: any }) => {
      return (await api.put(`/api/v1/admin/ai-configs/${providerKey}`, payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ai-configs-list'] });
      setSelectedProvider(null);
    }
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (providerKey: string) => {
      setTestingKey(providerKey);
      return (await api.post('/api/v1/admin/ai-configs/test-connection', { provider_key: providerKey })).data;
    },
    onSuccess: (data) => {
      setTestResult(`Successfully pinged ${data.provider_key}! Live Latency: ${data.latency_ms}ms.`);
      setTestingKey(null);
      queryClient.invalidateQueries({ queryKey: ['admin-ai-configs-list'] });
    },
    onError: () => {
      setTestResult('Heartbeat ping failed. Verify API endpoint and key settings.');
      setTestingKey(null);
    }
  });

  const handleToggleActive = (providerKey: string, currentActive: boolean) => {
    updateAIConfigMutation.mutate({
      providerKey,
      payload: { is_active: !currentActive }
    });
  };

  const handleUpdateConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProvider) return;

    const formData = new FormData(e.currentTarget);
    const payload = {
      default_model: formData.get('default_model') as string,
      base_url: formData.get('base_url') as string,
      priority_order: parseInt(formData.get('priority_order') as string) || 1,
      temperature: parseFloat(formData.get('temperature') as string) || 0.7,
      max_tokens: parseInt(formData.get('max_tokens') as string) || 2048,
      api_key: formData.get('api_key') as string || undefined
    };

    updateAIConfigMutation.mutate({
      providerKey: selectedProvider.provider_key,
      payload
    });
  };

  return (
    <div className="space-y-6">
      {/* Test Feedback Bar */}
      {testResult && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs font-bold text-indigo-400">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>{testResult}</span>
          </div>
          <button onClick={() => setTestResult(null)} className="text-[10px] uppercase text-slate-500 hover:text-slate-300">
            Dismiss
          </button>
        </div>
      )}

      {/* Grid of Providers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Providers List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300">AI Provider Load Balance</h3>
          {isLoading ? (
            <div className="h-32 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
          ) : (
            configs.map((cfg: any) => (
              <Card 
                key={cfg.provider_key} 
                className={`bg-slate-900 border p-5 flex flex-col gap-4 hover:border-slate-700/60 transition-all ${
                  selectedProvider?.provider_key === cfg.provider_key ? 'border-indigo-600/80 shadow-lg shadow-indigo-600/10' : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-800 rounded-xl text-indigo-400 border border-slate-700/50">
                      <Bot size={20} />
                    </div>
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-200 capitalize">{cfg.provider_key}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                          cfg.is_active 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-slate-800 text-slate-500 border-slate-750'
                        }`}>
                          {cfg.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-0.5">Model: {cfg.default_model}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => testConnectionMutation.mutate(cfg.provider_key)}
                      disabled={testingKey === cfg.provider_key}
                      className="p-2 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-750 text-xs font-bold disabled:opacity-40 transition-colors"
                      title="Test Connection Latency"
                    >
                      {testingKey === cfg.provider_key ? (
                        <RefreshCw size={14} className="animate-spin text-indigo-400" />
                      ) : (
                        <Zap size={14} />
                      )}
                    </button>

                    <button
                      onClick={() => setSelectedProvider(cfg)}
                      className="p-2 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-750 text-xs font-bold transition-colors"
                      title="Edit Provider Settings"
                    >
                      <Settings size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-3 text-[10px] font-bold text-slate-500">
                  <div className="flex flex-col text-left">
                    <span>Priority</span>
                    <span className="text-slate-300 font-extrabold mt-0.5">Rank #{cfg.priority_order}</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span>Avg Latency</span>
                    <span className="text-slate-300 font-extrabold mt-0.5">{cfg.latency_ms ? `${cfg.latency_ms}ms` : 'Untested'}</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span>Operational</span>
                    <span className={`capitalize mt-0.5 ${cfg.health_status === 'operational' ? 'text-emerald-400' : 'text-amber-500'}`}>
                      {cfg.health_status || 'unknown'}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Right: Selected Provider Settings Panel */}
        <div>
          {selectedProvider ? (
            <Card className="bg-slate-900 border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-black text-slate-200 capitalize">
                    {selectedProvider.provider_key} Settings
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedProvider(null)} 
                  className="text-xs font-bold text-slate-500 hover:text-slate-300"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleUpdateConfig} className="space-y-4">
                <InputField
                  label="Default Model Route"
                  name="default_model"
                  defaultValue={selectedProvider.default_model}
                  placeholder="e.g. gemini-1.5-flash"
                />

                <InputField
                  label="API Endpoint URL"
                  name="base_url"
                  defaultValue={selectedProvider.base_url || ''}
                  placeholder="Leave blank for default vendor URL"
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Priority Rank"
                    name="priority_order"
                    type="number"
                    defaultValue={selectedProvider.priority_order}
                  />

                  <InputField
                    label="Temperature"
                    name="temperature"
                    type="number"
                    step="0.1"
                    defaultValue={selectedProvider.temperature}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Max Response Tokens"
                    name="max_tokens"
                    type="number"
                    defaultValue={selectedProvider.max_tokens}
                  />

                  <div className="flex flex-col text-left">
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                      Operational Status
                    </label>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(selectedProvider.provider_key, selectedProvider.is_active)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                        selectedProvider.is_active
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                      }`}
                    >
                      {selectedProvider.is_active ? 'Disable Provider' : 'Enable Provider'}
                    </button>
                  </div>
                </div>

                <InputField
                  label="Override API Private Key"
                  name="api_key"
                  type="password"
                  placeholder="••••••••••••••••"
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 text-xs font-bold py-2.5 flex items-center justify-center gap-1.5"
                >
                  <Save size={14} /> Update Provider Config
                </Button>
              </form>
            </Card>
          ) : (
            <Card className="bg-slate-900 border border-slate-800 p-8 flex flex-col items-center justify-center text-center text-slate-500 h-64 font-bold border-dashed">
              <Bot className="w-10 h-10 text-slate-600 mb-3" />
              <span>Select an AI Provider config to edit parameter parameters, routing weights, or API endpoint targets.</span>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
