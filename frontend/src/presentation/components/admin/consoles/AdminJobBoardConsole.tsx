import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../infrastructure/api_client';
import { Card } from '../../Card';
import { Button } from '../../Button';
import { InputField } from '../../InputField';
import { 
  Briefcase, Search, Plus, Trash2, 
  RefreshCw, CheckCircle, HelpCircle, Layers, Building2, Zap 
} from 'lucide-react';

export const AdminJobBoardConsole: React.FC = () => {
  const queryClient = useQueryClient();
  const [subTab, setSubTab] = useState<'jobs' | 'sources' | 'companies'>('jobs');
  const [search, setSearch] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');

  // 1. Fetch Job Postings
  const { data: jobs = [], isLoading: jobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ['admin-jobs-list'],
    queryFn: async () => (await api.get('/api/v1/admin/jobs')).data
  });

  // 2. Fetch Job Sources (Providers)
  const { data: sources = [], isLoading: sourcesLoading, refetch: refetchSources } = useQuery({
    queryKey: ['admin-job-sources'],
    queryFn: async () => (await api.get('/api/v1/admin/job-sources')).data
  });

  // 3. Fetch Companies
  const { data: companies = [], isLoading: companiesLoading, refetch: refetchCompanies } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: async () => (await api.get('/api/v1/admin/companies')).data
  });

  // Mutations
  const updateJobMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => 
      (await api.put(`/api/v1/admin/jobs/${id}`, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-jobs-list'] })
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/v1/admin/jobs/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-jobs-list'] })
  });

  const updateSourceMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) => 
      (await api.put(`/api/v1/admin/job-sources/${id}`, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-job-sources'] })
  });

  const ingestJobsMutation = useMutation({
    mutationFn: async () => (await api.post('/api/v1/jobs/admin/ingest')).data,
    onSuccess: (data) => alert(data.message)
  });

  const handleToggleFeatured = (id: number, currentVal: boolean) => {
    updateJobMutation.mutate({ id, payload: { is_featured: !currentVal } });
  };

  const handleToggleUrgent = (id: number, currentVal: boolean) => {
    updateJobMutation.mutate({ id, payload: { is_urgent: !currentVal } });
  };

  const handleToggleNysc = (id: number, currentVal: boolean) => {
    updateJobMutation.mutate({ id, payload: { nysc_friendly: !currentVal } });
  };

  const handleToggleSourceActive = (id: number, currentVal: boolean) => {
    updateSourceMutation.mutate({ id, payload: { is_active: !currentVal } });
  };

  const handleDeleteJob = (id: number) => {
    if (window.confirm("Delete this job posting permanently?")) {
      deleteJobMutation.mutate(id);
    }
  };

  const handleIngest = () => {
    ingestJobsMutation.mutate();
  };

  const filteredJobs = jobs.filter((job: any) => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) || 
                          job.company_name.toLowerCase().includes(search.toLowerCase());
    const matchesFeatured = featuredFilter === 'featured' ? job.is_featured :
                            featuredFilter === 'nysc' ? job.nysc_friendly : true;
    return matchesSearch && matchesFeatured;
  });

  return (
    <div className="space-y-6 text-left text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" /> AI Job Board Manager
          </h2>
          <p className="text-xs text-slate-400">Configure recommendation weights, approve live postings, toggle scrapers, and manage companies.</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button 
            onClick={handleIngest} 
            isLoading={ingestJobsMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-500 text-xs font-bold py-2 px-4 flex items-center gap-1.5"
          >
            <Zap size={13} /> Ingest Scraper Jobs
          </Button>
        </div>
      </div>

      {/* Inner Sub-Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSubTab('jobs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            subTab === 'jobs' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-850 hover:bg-slate-800'
          }`}
        >
          <Layers size={14} /> Job Postings ({jobs.length})
        </button>
        <button
          onClick={() => setSubTab('sources')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            subTab === 'sources' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-850 hover:bg-slate-800'
          }`}
        >
          <Zap size={14} /> Sync Scrapers ({sources.length})
        </button>
        <button
          onClick={() => setSubTab('companies')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            subTab === 'companies' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-850 hover:bg-slate-800'
          }`}
        >
          <Building2 size={14} /> Employer Registry ({companies.length})
        </button>
      </div>

      {/* RENDER ACTIVE SUBTAB */}
      {subTab === 'jobs' && (
        <div className="space-y-4">
          <Card className="bg-slate-900 border border-slate-800 p-4 flex flex-col md:flex-row items-center gap-3 justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search job postings by title, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-955 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-600 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs font-bold text-slate-350 rounded-xl px-3 py-2 focus:outline-none w-full md:w-auto"
              >
                <option value="">All Postings</option>
                <option value="featured">Featured Slots</option>
                <option value="nysc">NYSC Friendly</option>
              </select>
              <Button variant="outline" onClick={() => refetchJobs()} className="border-slate-800 bg-slate-950 text-slate-400 p-2 shrink-0">
                <RefreshCw size={14} />
              </Button>
            </div>
          </Card>

          <Card className="bg-slate-900 border border-slate-800 overflow-hidden p-0">
            {jobsLoading ? (
              <div className="p-8 text-center text-slate-400 font-semibold text-xs">
                Loading jobs postings...
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-[10px] uppercase font-black text-slate-400 tracking-wider border-b border-slate-800/80">
                      <th className="p-4">Role Title</th>
                      <th className="p-4">Company Name</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Toggles</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-xs font-semibold text-slate-300">
                    {filteredJobs.map((job: any) => (
                      <tr key={job.id} className="hover:bg-slate-800/20 transition-all">
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-100">{job.title}</span>
                            <span className="text-[10px] text-slate-500 mt-0.5">{job.employment_type} • {job.experience_level}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-305">{job.company_name}</td>
                        <td className="p-4 font-mono text-[11px] text-slate-400">{job.location}</td>
                        <td className="p-4 space-x-1.5">
                          <button
                            onClick={() => handleToggleFeatured(job.id, job.is_featured)}
                            className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold border ${
                              job.is_featured ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-500'
                            }`}
                          >
                            FEATURED
                          </button>
                          <button
                            onClick={() => handleToggleUrgent(job.id, job.is_urgent)}
                            className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold border ${
                              job.is_urgent ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' : 'bg-slate-950 border-slate-800 text-slate-500'
                            }`}
                          >
                            URGENT
                          </button>
                          <button
                            onClick={() => handleToggleNysc(job.id, job.nysc_friendly)}
                            className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold border ${
                              job.nysc_friendly ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500'
                            }`}
                          >
                            NYSC
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-2 bg-slate-950 border border-slate-800 hover:bg-red-500/15 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                            title="Delete job posting"
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
              <div className="p-8 text-center text-slate-505 font-bold">
                No matching postings found.
              </div>
            )}
          </Card>
        </div>
      )}

      {subTab === 'sources' && (
        <Card className="bg-slate-900 border border-slate-800 overflow-hidden p-0">
          {sourcesLoading ? (
            <div className="p-8 text-center text-slate-400 font-semibold text-xs">
              Loading sources registry...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-[10px] uppercase font-black text-slate-400 tracking-wider border-b border-slate-800/80">
                    <th className="p-4">Source Provider</th>
                    <th className="p-4">Slug Identifier</th>
                    <th className="p-4">Ingestion Connector</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-xs font-semibold text-slate-300">
                  {sources.map((src: any) => (
                    <tr key={src.id} className="hover:bg-slate-800/20 transition-all">
                      <td className="p-4 font-bold text-slate-100">{src.name}</td>
                      <td className="p-4 font-mono text-[11px] text-slate-450">{src.slug}</td>
                      <td className="p-4 text-slate-400">{src.provider_type}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleSourceActive(src.id, src.is_active)}
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${
                            src.is_active 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {src.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {subTab === 'companies' && (
        <Card className="bg-slate-900 border border-slate-800 overflow-hidden p-0">
          {companiesLoading ? (
            <div className="p-8 text-center text-slate-400 font-semibold text-xs">
              Loading company records...
            </div>
          ) : companies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-[10px] uppercase font-black text-slate-400 tracking-wider border-b border-slate-800/80">
                    <th className="p-4">Company Name</th>
                    <th className="p-4">Industry Sectors</th>
                    <th className="p-4">Headquarters</th>
                    <th className="p-4">Company Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-xs font-semibold text-slate-300">
                  {companies.map((comp: any) => (
                    <tr key={comp.id} className="hover:bg-slate-800/20 transition-all">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="text-indigo-400" />
                          <span className="font-bold text-slate-100">{comp.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-350">{comp.industry}</td>
                      <td className="p-4 text-slate-400">{comp.headquarters}</td>
                      <td className="p-4 font-mono text-[11px] text-slate-450">{comp.size} Employees</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 font-bold">
              No registered employers yet.
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
