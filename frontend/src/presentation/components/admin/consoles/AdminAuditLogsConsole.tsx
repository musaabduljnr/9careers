import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../infrastructure/api_client';
import { Card } from '../../Card';
import { Button } from '../../Button';
import { 
  FileSpreadsheet, Download, Search, AlertCircle, RefreshCw, ChevronLeft, ChevronRight 
} from 'lucide-react';

export const AdminAuditLogsConsole: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const { data: logs = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-audit-logs-list'],
    queryFn: async () => (await api.get('/api/v1/admin/audit-logs')).data
  });

  const handleExportCSV = () => {
    window.open('/api/v1/admin/audit-logs/export', '_blank');
  };

  // Filter logs client-side
  const filteredLogs = logs.filter((log: any) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.admin_email?.toLowerCase().includes(q) ||
        log.action?.toLowerCase().includes(q) ||
        log.resource_type?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="bg-slate-900 border border-slate-800/80 p-5 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filter trail by admin email or action key..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-600 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => refetch()}
            disabled={isRefetching}
            variant="outline"
            className="text-xs border-slate-850 bg-slate-950 text-slate-400 hover:text-white"
          >
            <RefreshCw size={13} className={isRefetching ? 'animate-spin' : ''} />
          </Button>

          <Button
            onClick={handleExportCSV}
            variant="primary"
            className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 text-xs font-bold py-2 px-4 flex items-center gap-1.5"
          >
            <Download size={14} /> Export Audit Log CSV
          </Button>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-[10px] uppercase font-black text-slate-400 tracking-wider border-b border-slate-800/80">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Admin Agent</th>
                <th className="p-4">Action Token</th>
                <th className="p-4">Resource Type</th>
                <th className="p-4">Target Resource ID</th>
                <th className="p-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs font-mono text-slate-400">
              {isLoading ? (
                [1, 2, 3, 4].map(idx => (
                  <tr key={idx} className="animate-pulse">
                    <td colSpan={6} className="p-4 h-11 bg-slate-900/60" />
                  </tr>
                ))
              ) : paginatedLogs.length > 0 ? (
                paginatedLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-800/10 transition-all">
                    <td className="p-4 text-slate-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold text-slate-200">
                      {log.admin_email}
                    </td>
                    <td className="p-4 font-bold text-indigo-400">
                      {log.action}
                    </td>
                    <td className="p-4 text-slate-300">
                      {log.resource_type}
                    </td>
                    <td className="p-4 text-slate-500">
                      {log.resource_id || 'Global'}
                    </td>
                    <td className="p-4 text-right text-slate-500">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-bold font-sans">
                    No secure audit logs found matching query filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500">
            Showing Page {page} of {totalPages} ({filteredLogs.length} audit entries)
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
