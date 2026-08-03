import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../infrastructure/api_client';
import { Card } from '../../Card';
import { Button } from '../../Button';
import { InputField } from '../../InputField';
import { Save, Settings, ShieldAlert, Palette, HardDrive, RefreshCw } from 'lucide-react';

export const AdminSettingsConsole: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ['admin-app-settings'],
    queryFn: async () => (await api.get('/api/v1/admin/settings')).data
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: any) => {
      return (await api.put('/api/v1/admin/settings', payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-app-settings'] });
      alert('Application settings updated successfully!');
    }
  });

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Construct updated settings payload
    const payload = {
      ...settings,
      app_name: formData.get('app_name') as string,
      logo_url: formData.get('logo_url') as string,
      primary_color: formData.get('primary_color') as string,
      max_upload_size_mb: parseInt(formData.get('max_upload_size_mb') as string) || 5,
      maintenance_mode: formData.get('maintenance_mode') === 'true',
      support_email: formData.get('support_email') as string
    };

    updateSettingsMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      <div className="lg:col-span-2">
        <Card className="bg-slate-900 border border-slate-800 p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-black text-slate-200">System Brand & Controls</h3>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Application Name"
                name="app_name"
                defaultValue={settings.app_name || 'Naija Career AI'}
              />

              <InputField
                label="Support Contact Email"
                name="support_email"
                defaultValue={settings.support_email || 'support@naijacareer.ai'}
              />
            </div>

            <InputField
              label="Branded Logo URL"
              name="logo_url"
              defaultValue={settings.logo_url || ''}
              placeholder="https://..."
            />

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Branding Accent Color"
                name="primary_color"
                defaultValue={settings.primary_color || '#10B981'}
                placeholder="HEX color e.g. #10B981"
              />

              <InputField
                label="File Size Limit (MB)"
                name="max_upload_size_mb"
                type="number"
                defaultValue={settings.max_upload_size_mb || 5}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5">
                Maintenance Offline Mode
              </label>
              <select
                name="maintenance_mode"
                defaultValue={settings.maintenance_mode ? 'true' : 'false'}
                className="bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none"
              >
                <option value="false">Online (Public registrations open)</option>
                <option value="true">Maintenance Mode (Platform locked)</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 text-xs font-bold py-2.5 flex items-center justify-center gap-1.5 w-full sm:w-auto px-6"
            >
              <Save size={14} /> Save System Configuration
            </Button>
          </form>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldAlert className="w-4.5 h-4.5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200">Operational Notices</h3>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl space-y-2 text-xs text-slate-400 font-bold leading-relaxed">
            <p>
              Changes applied here take effect immediately across all client user interface sessions.
            </p>
            <p>
              Activating <span className="text-amber-400">Maintenance Mode</span> will lock non-admin accounts and direct them to a temporary offline status view.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
