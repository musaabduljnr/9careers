import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../infrastructure/api_client';
import { Card } from '../../Card';
import { Button } from '../../Button';
import { 
  FileText, History, RotateCcw, Save, Code, CheckCircle, ChevronRight, AlertTriangle 
} from 'lucide-react';

export const AdminPromptStudioConsole: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedKey, setSelectedKey] = useState<string>('resume_ats');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch prompts
  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ['admin-prompts-list'],
    queryFn: async () => (await api.get('/api/v1/admin/prompts')).data
  });

  const updatePromptMutation = useMutation({
    mutationFn: async ({ promptKey, payload }: { promptKey: string; payload: any }) => {
      return (await api.put(`/api/v1/admin/prompts/${promptKey}`, payload)).data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-prompts-list'] });
      setSuccessMessage(`Successfully updated to version v${data.prompt.version}!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  });

  const restorePromptMutation = useMutation({
    mutationFn: async ({ promptKey, version }: { promptKey: string; version: number }) => {
      return (await api.post(`/api/v1/admin/prompts/${promptKey}/restore/${version}`)).data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-prompts-list'] });
      setSuccessMessage(`Successfully rolled back to version v${data.prompt.version}!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  });

  const activePrompt = prompts.find((p: any) => p.prompt_key === selectedKey) || prompts[0];

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activePrompt) return;

    const formData = new FormData(e.currentTarget);
    const system_prompt = formData.get('system_prompt') as string;
    const user_prompt_template = formData.get('user_prompt_template') as string;

    updatePromptMutation.mutate({
      promptKey: activePrompt.prompt_key,
      payload: { system_prompt, user_prompt_template }
    });
  };

  const handleRestore = (version: number) => {
    if (window.confirm(`Are you sure you want to restore prompt version v${version}? This will update the active prompt.`)) {
      restorePromptMutation.mutate({
        promptKey: activePrompt.prompt_key,
        version
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Success notification banner */}
      {successMessage && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-400">
          <CheckCircle size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Prompt Navigation List */}
        <div className="space-y-3 lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-300">Prompt Catalog</h3>
          <div className="flex flex-col gap-1.5">
            {isLoading ? (
              <div className="h-40 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
            ) : (
              prompts.map((p: any) => (
                <button
                  key={p.prompt_key}
                  onClick={() => setSelectedKey(p.prompt_key)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all ${
                    selectedKey === p.prompt_key
                      ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 font-extrabold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex flex-col gap-0.5 truncate mr-2">
                    <span className="font-bold truncate text-slate-200">{p.title || p.prompt_key}</span>
                    <span className="text-[10px] text-slate-500">Active Version: v{p.version}</span>
                  </div>
                  <ChevronRight size={14} className="shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Prompt Playground Workspace */}
        <div className="lg:col-span-3 space-y-6">
          {activePrompt ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Main Prompt Form */}
              <div className="xl:col-span-2 space-y-4">
                <Card className="bg-slate-900 border border-slate-800 p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Code size={18} className="text-indigo-400" />
                      <h3 className="text-sm font-black text-slate-200">
                        {activePrompt.title || activePrompt.prompt_key} Template (v{activePrompt.version})
                      </h3>
                    </div>
                  </div>

                  <form onSubmit={handleUpdate} className="space-y-4 text-left">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                        System Context / Instructions
                      </label>
                      <textarea
                        name="system_prompt"
                        rows={12}
                        defaultValue={activePrompt.system_prompt}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all leading-relaxed"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                        User Variables & Structure Schema
                      </label>
                      <textarea
                        name="user_prompt_template"
                        rows={6}
                        defaultValue={activePrompt.user_prompt_template}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all leading-relaxed"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 text-xs font-bold py-2.5 flex items-center justify-center gap-1.5 w-full sm:w-auto px-5"
                    >
                      <Save size={14} /> Commit Changes & Upgrade Version
                    </Button>
                  </form>
                </Card>
              </div>

              {/* Version History Sidebar */}
              <div className="xl:col-span-1">
                <Card className="bg-slate-900 border border-slate-800 p-5 h-full flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <History size={16} className="text-indigo-400" />
                    <h3 className="text-sm font-bold text-slate-200">Rollback Trail</h3>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[450px] scrollbar-thin">
                    {activePrompt.history_json && activePrompt.history_json.length > 0 ? (
                      activePrompt.history_json.map((h: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl space-y-2 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-slate-200">v{h.version}</span>
                            <button
                              onClick={() => handleRestore(h.version)}
                              className="text-[10px] font-extrabold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                            >
                              <RotateCcw size={10} /> Restore
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold leading-tight">
                            Updated {h.updated_at} by {h.updated_by}
                          </p>
                          <div className="text-[9px] font-mono text-slate-400 line-clamp-3 bg-slate-900 p-1.5 rounded border border-slate-850">
                            {h.system_prompt}
                          </div>
                        </div>
                      )).reverse() // Show newest backups first
                    ) : (
                      <div className="p-8 text-center text-slate-500 text-xs font-bold border border-slate-800 border-dashed rounded-xl">
                        No previous versions found in rollback vault.
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="bg-slate-900 border border-slate-800 p-8 flex flex-col items-center justify-center text-center text-slate-500 h-64 font-bold border-dashed">
              <FileText className="w-10 h-10 text-slate-600 mb-3" />
              <span>Select a prompt category from the sidebar catalog to edit system guidelines, user bindings, or review rollback vault backups.</span>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
