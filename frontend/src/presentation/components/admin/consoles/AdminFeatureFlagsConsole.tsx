import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../infrastructure/api_client';
import { Card } from '../../Card';
import { Button } from '../../Button';
import { ToggleLeft, ToggleRight, Settings, Info, Save } from 'lucide-react';

export const AdminFeatureFlagsConsole: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch flags
  const { data: flags = [], isLoading } = useQuery({
    queryKey: ['admin-features-flags'],
    queryFn: async () => (await api.get('/api/v1/admin/features')).data
  });

  const updateFlagMutation = useMutation({
    mutationFn: async ({ featureKey, status }: { featureKey: string; status: string }) => {
      return (await api.put(`/api/v1/admin/features/${featureKey}`, { status })).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-features-flags'] });
    }
  });

  const handleToggle = (featureKey: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'disabled' : 'active';
    updateFlagMutation.mutate({
      featureKey,
      status: nextStatus
    });
  };

  return (
    <div className="space-y-6 text-left">
      <Card className="bg-slate-900 border border-slate-800 p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1 text-xs font-bold text-slate-400">
          <span>Dynamic Feature Rollout Flag Matrix</span>
          <span className="font-normal text-[11px] text-slate-500">
            Toggling these status settings instantly enables or disables access to core components in candidate user navigation layouts without requiring a backend rebuild.
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map(idx => (
            <div key={idx} className="h-24 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
          ))
        ) : flags.length > 0 ? (
          flags.map((flag: any) => {
            const isActive = flag.status === 'active';
            return (
              <Card 
                key={flag.feature_key} 
                className={`bg-slate-900 border p-5 flex items-center justify-between transition-all ${
                  isActive ? 'border-slate-800' : 'border-slate-800/40 opacity-70'
                }`}
              >
                <div className="flex flex-col text-left gap-1">
                  <span className="text-xs font-extrabold text-slate-200 capitalize">
                    {flag.feature_key?.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold leading-normal max-w-[240px]">
                    {flag.description || 'Dynamic feature flag toggle controls.'}
                  </span>
                </div>

                <button
                  onClick={() => handleToggle(flag.feature_key, flag.status)}
                  className={`text-3xl transition-all outline-none focus:outline-none ${
                    isActive ? 'text-indigo-500' : 'text-slate-600'
                  }`}
                >
                  {isActive ? (
                    <ToggleRight className="w-12 h-8" />
                  ) : (
                    <ToggleLeft className="w-12 h-8" />
                  )}
                </button>
              </Card>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs font-bold border border-slate-800 border-dashed rounded-xl col-span-2">
            No system feature flags initialized in database parameters.
          </div>
        )}
      </div>
    </div>
  );
};
