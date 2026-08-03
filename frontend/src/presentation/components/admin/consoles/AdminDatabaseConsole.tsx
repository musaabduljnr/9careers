import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../infrastructure/api_client';
import { Card } from '../../Card';
import { Button } from '../../Button';
import { 
  Database, RefreshCw, HardDrive, Download, Play, TableProperties 
} from 'lucide-react';

export const AdminDatabaseConsole: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  // Fetch DB tables schema info
  const { data: tables = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-db-tables'],
    queryFn: async () => (await api.get('/api/v1/admin/database/tables')).data
  });

  // Backup mutation
  const backupMutation = useMutation({
    mutationFn: async () => (await api.post('/api/v1/admin/database/backup')).data,
    onSuccess: (data) => {
      setBackupMessage(data.message);
      setTimeout(() => setBackupMessage(null), 5000);
    }
  });

  const handleBackup = () => {
    backupMutation.mutate();
  };

  return (
    <div className="space-y-6 text-left text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" /> Database Explorer & Vaults
          </h2>
          <p className="text-xs text-slate-400">Inspect table structures, row metrics, view active index keys, and trigger database snapshots.</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button 
            onClick={handleBackup} 
            isLoading={backupMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold py-2 px-4 flex items-center gap-1.5"
          >
            <Download size={13} /> Trigger SQLite Backup
          </Button>
        </div>
      </div>

      {backupMessage && (
        <Card className="p-4 bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-xs font-bold">
          {backupMessage}
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Table List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Schema Tables</h3>
            <button 
              onClick={() => refetch()} 
              disabled={isRefetching}
              className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1 font-bold"
            >
              <RefreshCw size={10} className={isRefetching ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            {isLoading ? (
              <div className="h-48 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
            ) : (
              tables.map((t: any) => (
                <button
                  key={t.name}
                  onClick={() => setSelectedTable(t)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-xs transition-all ${
                    selectedTable?.name === t.name
                      ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 font-extrabold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 mr-2">
                    <TableProperties size={15} className="text-indigo-400 shrink-0" />
                    <span className="font-mono truncate text-slate-200">{t.name}</span>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-md bg-slate-950 text-[10px] text-slate-450 border border-slate-850 font-bold">
                    {t.rows} rows
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Table Schema Details */}
        <div className="lg:col-span-2">
          {selectedTable ? (
            <Card className="bg-slate-900 border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
                <div className="flex items-center gap-2">
                  <TableProperties className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-black text-slate-200 font-mono">
                    Table Schema: {selectedTable.name}
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {selectedTable.columns.length} columns defined
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-550 uppercase tracking-wider font-black text-[9px]">
                    <tr>
                      <th className="p-3">Column Name</th>
                      <th className="p-3">Data Type</th>
                      <th className="p-3">Nullable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 font-mono text-[11px] text-slate-300">
                    {selectedTable.columns.map((col: any) => (
                      <tr key={col.name} className="hover:bg-slate-800/20">
                        <td className="p-3 font-bold text-indigo-400">{col.name}</td>
                        <td className="p-3 text-slate-400">{col.type}</td>
                        <td className="p-3">
                          <span className={`text-[10px] ${col.nullable ? 'text-slate-500' : 'text-amber-500 font-bold'}`}>
                            {col.nullable ? 'YES' : 'NO'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="bg-slate-900 border border-slate-800 p-8 flex flex-col items-center justify-center text-center text-slate-500 h-64 font-bold border-dashed">
              <Database className="w-10 h-10 text-slate-600 mb-3" />
              <span>Select a database table from the sidebar list to inspect column schemas, data types, index keys, and row counts.</span>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
