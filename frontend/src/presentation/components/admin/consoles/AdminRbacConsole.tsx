import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../infrastructure/api_client';
import { Card } from '../../Card';
import { Button } from '../../Button';
import { InputField } from '../../InputField';
import { ShieldCheck, Check, Plus, RefreshCw, Save } from 'lucide-react';

export const AdminRbacConsole: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState('super_admin');
  const [newRoleForm, setNewRoleForm] = useState({ role_key: '', name: '' });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch roles from backend
  const { data: roles = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-roles-list'],
    queryFn: async () => (await api.get('/api/v1/admin/roles')).data
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ roleKey, permissions }: { roleKey: string; permissions: string[] }) => {
      return (await api.put(`/api/v1/admin/roles/${roleKey}`, { permissions_json: permissions })).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles-list'] });
      triggerAlert("Role permissions matrix saved successfully!");
    }
  });

  const createRoleMutation = useMutation({
    mutationFn: async (payload: any) => {
      return (await api.post('/api/v1/admin/roles', payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles-list'] });
      setIsCreateOpen(false);
      setNewRoleForm({ role_key: '', name: '' });
      triggerAlert("Custom role created!");
    }
  });

  const triggerAlert = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const permissions = [
    { key: 'users:read', label: 'View Candidates Records', category: 'User Management' },
    { key: 'users:write', label: 'Modify Candidates/Usage', category: 'User Management' },
    { key: 'users:impersonate', label: 'Impersonate Session', category: 'User Management' },
    { key: 'ai:manage', label: 'Update AI Engine Parameters', category: 'AI Controls' },
    { key: 'prompts:write', label: 'Modify System Prompt guidelines', category: 'AI Controls' },
    { key: 'payments:manage', label: 'Billing & Subscriptions plans', category: 'Financial Controls' },
    { key: 'system:manage', label: 'Flush Cache & Diagnostics', category: 'System Operations' },
    { key: 'audit:read', label: 'View security Audit logs', category: 'Security' }
  ];

  const activeRoleData = roles.find((r: any) => r.role_key === selectedRole) || roles[0];
  const activePerms = activeRoleData?.permissions_json || [];

  const handleTogglePermission = (permKey: string) => {
    if (!activeRoleData) return;
    
    let nextPerms = [...activePerms];
    if (nextPerms.includes('*')) {
      nextPerms = permissions.map(p => p.key);
    }
    
    if (nextPerms.includes(permKey)) {
      nextPerms = nextPerms.filter(k => k !== permKey);
    } else {
      nextPerms.push(permKey);
    }

    updateRoleMutation.mutate({
      roleKey: activeRoleData.role_key,
      permissions: nextPerms
    });
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    createRoleMutation.mutate({
      ...newRoleForm,
      permissions_json: []
    });
  };

  return (
    <div className="space-y-6 text-left text-slate-100">
      {successMessage && (
        <Card className="p-4 bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-xs font-bold">
          {successMessage}
        </Card>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" /> Roles & Permissions Builder
          </h2>
          <p className="text-xs text-slate-400">Configure role privilege mappings and construct customized administrative RBAC matrices.</p>
        </div>

        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold py-2.5 px-4 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={14} /> Create Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Roles Selector */}
        <div className="md:col-span-1 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-450">RBAC Roles</h3>
            <button onClick={() => refetch()} className="text-[10px] text-slate-500 hover:text-white font-bold flex items-center gap-0.5">
              <RefreshCw size={10} /> Sync
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {isLoading ? (
              <div className="h-48 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
            ) : (
              roles.map((r: any) => (
                <button
                  key={r.role_key}
                  onClick={() => setSelectedRole(r.role_key)}
                  className={`p-3.5 rounded-xl border text-xs text-left transition-all ${
                    selectedRole === r.role_key
                      ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 font-extrabold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-200">{r.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Key: {r.role_key}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Permission Matrix */}
        <div className="md:col-span-2">
          {activeRoleData ? (
            <Card className="bg-slate-900 border border-slate-800 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-black text-slate-200">
                    Permissions: {activeRoleData.name}
                  </h3>
                </div>
                {activePerms.includes('*') && (
                  <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Full Access Granted (*)
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {permissions.map((p, idx) => {
                  const isGranted = activePerms.includes('*') || activePerms.includes(p.key);
                  const isRootSuper = activeRoleData.role_key === 'super_admin';
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-850">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200">{p.label}</span>
                        <span className="text-[9px] uppercase font-bold text-slate-500 mt-0.5 tracking-wider">{p.category} • {p.key}</span>
                      </div>

                      <button
                        type="button"
                        disabled={isRootSuper}
                        onClick={() => handleTogglePermission(p.key)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                          isGranted 
                            ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400' 
                            : 'bg-slate-900 border-slate-800 text-slate-700'
                        }`}
                      >
                        {isGranted && <Check size={14} className="stroke-[3]" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-slate-500 font-bold bg-slate-900 border border-slate-800 h-64 flex flex-col justify-center items-center">
              Select a role to visualize privilege map.
            </Card>
          )}
        </div>
      </div>

      {/* Modal - Create Custom Role */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" /> New Enterprise Privilege Role
            </h3>
            <form onSubmit={handleCreateRole} className="space-y-4 text-left">
              <InputField
                label="Role Title Display"
                value={newRoleForm.name}
                onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                placeholder="e.g. Content Manager"
                required
              />
              <InputField
                label="Role Key Code"
                value={newRoleForm.role_key}
                onChange={(e) => setNewRoleForm({ ...newRoleForm, role_key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                placeholder="e.g. content_manager"
                required
              />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="flex-1 text-xs border-slate-700 text-slate-350">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold">
                  Register Role
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
