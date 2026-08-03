import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../infrastructure/api_client';
import { Card } from '../../Card';
import { Button } from '../../Button';
import { 
  FileSignature, Search, Trash2, RefreshCw 
} from 'lucide-react';

export const AdminApplicationsConsole: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch applications
  const { data: apps = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-applications-list'],
    queryFn: async () => (await api.get('/api/v1/admin/applications')).data
  });

  const deleteAppMutation = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/v1/admin/applications/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-applications-list'] })
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this application tracking record?")) {
      deleteAppMutation.mutate(id);
    }
  };

  const filteredApps = apps.filter((app: any) => {
    const matchesSearch = app.user_email.toLowerCase().includes(search.toLowerCase()) || 
                          app.job_title.toLowerCase().includes(search.toLowerCase()) ||
                          app.company_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? app.status.toLowerCase() === statusFilter.toLowerCase() : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left text-slate-100">
      <div>
        <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
          <FileSignature className="w-5 h-5 text-indigo-400" /> Platform Job Applications
        </h2>
        <p className="text-xs text-slate-400">Track and monitor candidate job application pipelines and resumes tailor logs.</p>
      </div>

      <Card className="bg-slate-900 border border-slate-800 p-4 flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by candidate, role, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-955 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-600 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs font-bold text-slate-350 rounded-xl px-3 py-2 focus:outline-none w-full md:w-auto"
          >
            <option value="">All Stages</option>
            <option value="applied">Applied</option>
            <option value="saved">Saved</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button variant="outline" onClick={() => refetch()} className="border-slate-800 bg-slate-950 text-slate-400 p-2 shrink-0">
            <RefreshCw size={14} />
          </Button>
        </div>
      </Card>

      <Card className="bg-slate-900 border border-slate-800 overflow-hidden p-0">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 font-semibold text-xs">
            Loading application records...
          </div>
        ) : filteredApps.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-[10px] uppercase font-black text-slate-400 tracking-wider border-b border-slate-800/80">
                  <th className="p-4">Candidate Details</th>
                  <th className="p-4">Target Position</th>
                  <th className="p-4">Employer Name</th>
                  <th className="p-4">Kanban Stage</th>
                  <th className="p-4">Applied Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs font-semibold text-slate-305">
                {filteredApps.map((app: any) => (
                  <tr key={app.id} className="hover:bg-slate-800/20 transition-all">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-100">{app.user_name}</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">{app.user_email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-200 font-bold">{app.job_title}</td>
                    <td className="p-4 text-slate-400">{app.company_name}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold border ${
                        app.status === 'offer' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        app.status === 'rejected' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                        app.status === 'interview' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                        'bg-slate-950 border-slate-800 text-slate-400'
                      }`}>
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-[11px]">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="p-2 bg-slate-950 border border-slate-800 hover:bg-red-500/15 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                        title="Delete application record"
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
            No application tracking logs registered yet.
          </div>
        )}
      </Card>
    </div>
  );
};
