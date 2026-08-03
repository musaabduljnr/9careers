import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../infrastructure/api_client';
import { Card } from '../../Card';
import { Button } from '../../Button';
import { InputField } from '../../InputField';
import { 
  Building2, Search, Plus, Trash2, 
  RefreshCw 
} from 'lucide-react';

export const AdminOrganizationsConsole: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [orgForm, setOrgForm] = useState({ name: '', slug: '', billing_plan: 'free' });

  // Fetch organizations
  const { data: orgs = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-organizations'],
    queryFn: async () => (await api.get('/api/v1/admin/organizations')).data
  });

  // Mutations
  const createOrgMutation = useMutation({
    mutationFn: async (payload: any) => (await api.post('/api/v1/admin/organizations', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
      setIsCreateOpen(false);
      setOrgForm({ name: '', slug: '', billing_plan: 'free' });
    }
  });

  const updateOrgMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => 
      (await api.put(`/api/v1/admin/organizations/${id}`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
    }
  });

  const deleteOrgMutation = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/v1/admin/organizations/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-organizations'] });
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createOrgMutation.mutate(orgForm);
  };

  const handleUpdateStatus = (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    updateOrgMutation.mutate({ id, payload: { status: nextStatus } });
  };

  const handleUpdatePlan = (id: number, plan: string) => {
    updateOrgMutation.mutate({ id, payload: { billing_plan: plan } });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this organization? This is irreversible!")) {
      deleteOrgMutation.mutate(id);
    }
  };

  // Filter orgs
  const filteredOrgs = orgs.filter((org: any) => {
    const matchesSearch = org.name.toLowerCase().includes(search.toLowerCase()) || 
                          org.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? org.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" /> Organizations
          </h2>
          <p className="text-xs text-slate-400">Future-ready multi-tenant SaaS workspace and company account controls.</p>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold py-2.5 px-4 flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus size={14} /> Create Organization
        </Button>
      </div>

      {/* Filters Bar */}
      <Card className="bg-slate-900 border border-slate-800/80 p-4 flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-505" />
          <input
            type="text"
            placeholder="Search organizations by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-955 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-600 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl px-3 py-2 focus:outline-none w-full md:w-auto"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <Button variant="outline" onClick={() => refetch()} className="border-slate-850 bg-slate-950 text-slate-400 p-2 shrink-0">
            <RefreshCw size={14} />
          </Button>
        </div>
      </Card>

      {/* Grid List */}
      <Card className="bg-slate-900 border border-slate-800 overflow-hidden p-0">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 font-semibold text-xs flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading organizations...</span>
          </div>
        ) : filteredOrgs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-[10px] uppercase font-black text-slate-405 tracking-wider border-b border-slate-800/80">
                  <th className="p-4">Workspace Details</th>
                  <th className="p-4">Slug Handle</th>
                  <th className="p-4">Billing Level</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs font-semibold text-slate-300">
                {filteredOrgs.map((org: any) => (
                  <tr key={org.id} className="hover:bg-slate-800/20 transition-all">
                    <td className="p-4">
                      <span className="font-bold text-slate-100">{org.name}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-400 text-[11px]">
                      {org.slug}
                    </td>
                    <td className="p-4">
                      <select
                        value={org.billing_plan}
                        onChange={(e) => handleUpdatePlan(org.id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-[11px] font-bold text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none"
                      >
                        <option value="free">Free Tier</option>
                        <option value="pro">Pro Plan</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleUpdateStatus(org.id, org.status)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                          org.status === 'active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {org.status.toUpperCase()}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(org.id)}
                        className="p-2 bg-slate-950 border border-slate-800 hover:bg-red-500/15 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                        title="Delete organization"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 font-bold">
            No organizations registered yet.
          </div>
        )}
      </Card>

      {/* Modal - Create Org */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-205 border-b border-slate-850 pb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-405" /> New SaaS Organization Workspace
            </h3>
            <form onSubmit={handleCreate} className="space-y-4 text-left">
              <InputField
                label="Organization Name"
                value={orgForm.name}
                onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                placeholder="e.g. Acme Corporation"
                required
              />
              <InputField
                label="Subdomain / Slug Handle"
                value={orgForm.slug}
                onChange={(e) => setOrgForm({ ...orgForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="e.g. acme"
                required
              />
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block">Billing Tier</label>
                <select
                  value={orgForm.billing_plan}
                  onChange={(e) => setOrgForm({ ...orgForm, billing_plan: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-xs font-bold text-slate-350 rounded-xl px-3 py-2.5 focus:outline-none"
                >
                  <option value="free">Free Tier</option>
                  <option value="pro">Pro Plan</option>
                  <option value="enterprise">Enterprise Pass</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="flex-1 text-xs border-slate-700 text-slate-300">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold">
                  Deploy Workspace
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
