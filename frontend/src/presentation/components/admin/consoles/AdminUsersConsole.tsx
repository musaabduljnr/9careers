import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../infrastructure/api_client';
import { Card } from '../../Card';
import { Button } from '../../Button';
import { InputField } from '../../InputField';
import { 
  Search, ShieldAlert, UserCheck, Eye, KeyRound, RefreshCw, Download, 
  Trash2, SlidersHorizontal, ChevronLeft, ChevronRight, Ban, Settings 
} from 'lucide-react';

export const AdminUsersConsole: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch users from server using query/plan filters
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users-list', search, planFilter],
    queryFn: async () => {
      const res = await api.get('/api/v1/admin/users', {
        params: { query: search || undefined, plan: planFilter || undefined }
      });
      return res.data;
    }
  });

  // User Actions mutations
  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, payload }: { userId: number; payload: any }) => {
      return (await api.put(`/api/v1/admin/users/${userId}/status`, payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return (await api.delete(`/api/v1/admin/users/${userId}`)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
    }
  });

  const impersonateMutation = useMutation({
    mutationFn: async (userId: number) => {
      return (await api.post(`/api/v1/admin/users/${userId}/impersonate`)).data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token);
      window.location.href = '/dashboard';
    }
  });

  const handleTogglePlan = (userId: number, currentPlan: string) => {
    const nextPlan = currentPlan === 'free' ? 'pro' : currentPlan === 'pro' ? 'enterprise' : 'free';
    updateStatusMutation.mutate({
      userId,
      payload: { subscription_plan: nextPlan }
    });
  };

  const handleToggleVerification = (userId: number, currentVerified: boolean) => {
    updateStatusMutation.mutate({
      userId,
      payload: { is_verified: !currentVerified }
    });
  };

  const handleImpersonate = (userId: number) => {
    if (window.confirm("Are you sure you want to impersonate this user? This will set your authentication context to their session.")) {
      impersonateMutation.mutate(userId);
    }
  };

  const handleDelete = (userId: number) => {
    if (window.confirm("CRITICAL: Are you sure you want to completely delete this user? This action is irreversible!")) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Filtering & Sorting Logic client-side to keep performance snappy
  const filteredUsers = users
    .filter((u: any) => {
      if (roleFilter && u.role !== roleFilter) return false;
      return true;
    })
    .sort((a: any, b: any) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

  // Pagination bounds
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const exportCSV = () => {
    const headers = 'ID,Full Name,Email,Role,Plan,Verified,NYSC Status\n';
    const csvContent = filteredUsers.map((u: any) => 
      `"${u.id}","${u.full_name}","${u.email}","${u.role || 'user'}","${u.subscription_plan || 'free'}","${u.is_verified}","${u.nysc_status}"`
    ).join('\n');
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'users_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <Card className="bg-slate-900 border border-slate-800/80 p-5 flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search users by name, email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-600 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
            className="bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="">All Subscription Plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <Button
            onClick={exportCSV}
            variant="outline"
            className="text-xs border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-1.5"
          >
            <Download size={14} /> Export CSV
          </Button>
        </div>
      </Card>

      {/* User Records Table */}
      <Card className="bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-[10px] uppercase font-black text-slate-400 tracking-wider border-b border-slate-800/80">
                <th className="p-4">User Details</th>
                <th className="p-4">Role</th>
                <th className="p-4">Billing Plan</th>
                <th className="p-4">Status</th>
                <th className="p-4">NYSC Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs font-semibold text-slate-300">
              {isLoading ? (
                [1, 2, 3, 4].map(idx => (
                  <tr key={idx} className="animate-pulse">
                    <td colSpan={6} className="p-4 h-12 bg-slate-900/60" />
                  </tr>
                ))
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-800/20 transition-all">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center font-bold text-sm border border-slate-700/50">
                          {u.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-slate-200">{u.full_name}</span>
                          <span className="text-[10px] text-slate-500">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                        u.role === 'admin' 
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleTogglePlan(u.id, u.subscription_plan || 'free')}
                        className="hover:underline flex items-center gap-1 text-slate-200 hover:text-indigo-400 font-bold"
                      >
                        <span className="capitalize">{u.subscription_plan || 'free'}</span>
                      </button>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleVerification(u.id, u.is_verified)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                          u.is_verified 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {u.is_verified ? 'VERIFIED' : 'PENDING'}
                      </button>
                    </td>
                    <td className="p-4 capitalize text-slate-400">
                      {u.nysc_status || 'none'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleImpersonate(u.id)}
                          title="Impersonate User Session"
                          className="p-2 hover:bg-indigo-600/15 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors border border-transparent hover:border-indigo-500/10"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          title="Delete User Record"
                          className="p-2 hover:bg-red-500/15 rounded-lg text-slate-400 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/10"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">
                    No matching candidate users found in database settings
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500">
            Showing Page {page} of {totalPages} ({filteredUsers.length} total users)
          </span>
          <div className="flex items-center gap-2">
            <Button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="p-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
