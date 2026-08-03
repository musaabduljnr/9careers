import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../infrastructure/api_client';
import { Card } from '../../Card';
import { Button } from '../../Button';
import { InputField } from '../../InputField';
import { 
  Settings, CreditCard, Mail, Sliders, Palette, Shield, Zap, RefreshCw, Save 
} from 'lucide-react';

export const AdminSettingsCenterConsole: React.FC = () => {
  const queryClient = useQueryClient();
  const [innerTab, setInnerTab] = useState<'general' | 'plans' | 'payments' | 'email' | 'dev'>('general');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 1. Fetch App Settings
  const { data: settings = {}, isLoading: settingsLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => (await api.get('/api/v1/admin/settings')).data
  });

  // 2. Fetch Subscription Plans
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['admin-plans-config'],
    queryFn: async () => (await api.get('/api/v1/admin/plans')).data
  });

  // Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: any) => (await api.put('/api/v1/admin/settings', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      triggerAlert("General settings updated dynamically!");
    }
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ key, payload }: { key: string; payload: any }) => 
      (await api.put(`/api/v1/admin/plans/${key}`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans-config'] });
      triggerAlert("Subscription plan details committed!");
    }
  });

  const flushCacheMutation = useMutation({
    mutationFn: async () => (await api.post('/api/v1/admin/developer/cache/flush')).data,
    onSuccess: () => triggerAlert("All application caches successfully invalidated!")
  });

  const triggerAlert = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleUpdateGeneral = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      ...settings,
      app_name: formData.get('app_name') as string,
      logo_url: formData.get('logo_url') as string,
      support_email: formData.get('support_email') as string,
      footer_text: formData.get('footer_text') as string,
      maintenance_mode: formData.get('maintenance_mode') === 'true'
    };
    updateSettingsMutation.mutate(payload);
  };

  const handleUpdatePlan = (key: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name') as string,
      price_ngn: parseInt(formData.get('price_ngn') as string) || 0,
      price_usd: parseInt(formData.get('price_usd') as string) || 0
    };
    updatePlanMutation.mutate({ key, payload });
  };

  return (
    <div className="space-y-6 text-left text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" /> Platform Settings Center
          </h2>
          <p className="text-xs text-slate-400">Configure branding parameters, set plan limit quotas, adjust webhook credentials, and purge server cache.</p>
        </div>
      </div>

      {successMsg && (
        <Card className="p-4 bg-emerald-500/10 border-emerald-500/30 text-emerald-405 text-xs font-bold">
          {successMsg}
        </Card>
      )}

      {/* Settings Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Links */}
        <div className="lg:col-span-1 flex flex-col gap-1.5">
          {[
            { id: 'general', label: 'General & Branding', icon: Palette },
            { id: 'plans', label: 'Subscription Plans', icon: CreditCard },
            { id: 'payments', label: 'Payment Gateways', icon: Shield },
            { id: 'email', label: 'Email & SMTP Settings', icon: Mail },
            { id: 'dev', label: 'System & Cache', icon: Sliders }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setInnerTab(item.id as any)}
                className={`w-full flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                  innerTab === item.id
                    ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Workspace Form */}
        <div className="lg:col-span-3">
          {innerTab === 'general' && (
            <Card className="bg-slate-900 border border-slate-800 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 mb-2 border-b border-slate-850 pb-2 flex items-center gap-1.5">
                <Palette size={16} className="text-indigo-400" /> Branding & General Settings
              </h3>
              {settingsLoading ? (
                <div className="p-8 text-center text-slate-400 font-semibold text-xs">Loading settings...</div>
              ) : (
                <form onSubmit={handleUpdateGeneral} className="space-y-4">
                  <InputField
                    label="Platform Display Name"
                    name="app_name"
                    defaultValue={settings.app_name}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Branding Logo Path"
                      name="logo_url"
                      defaultValue={settings.logo_url}
                    />
                    <InputField
                      label="Support Contact Email"
                      name="support_email"
                      defaultValue={settings.support_email}
                    />
                  </div>
                  <InputField
                    label="Footer Copyright Text"
                    name="footer_text"
                    defaultValue={settings.footer_text}
                  />
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block">Application Mode</label>
                    <select
                      name="maintenance_mode"
                      defaultValue={String(settings.maintenance_mode)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs font-bold text-slate-350 rounded-xl px-3 py-2.5 focus:outline-none"
                    >
                      <option value="false">Live Mode (Publicly Accessible)</option>
                      <option value="true">Maintenance Mode (Block Access)</option>
                    </select>
                  </div>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold py-2.5 px-4 flex items-center gap-1.5">
                    <Save size={14} /> Commit Settings Updates
                  </Button>
                </form>
              )}
            </Card>
          )}

          {innerTab === 'plans' && (
            <div className="space-y-4">
              {plansLoading ? (
                <Card className="p-8 text-center text-slate-400 font-semibold text-xs">Loading plans...</Card>
              ) : (
                plans.map((plan: any) => (
                  <Card key={plan.plan_key} className="bg-slate-900 border border-slate-800 p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                      <span className="font-extrabold text-sm text-indigo-400 capitalize">{plan.name} Tier</span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Plan Key: {plan.plan_key}</span>
                    </div>

                    <form onSubmit={(e) => handleUpdatePlan(plan.plan_key, e)} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                      <InputField
                        label="Plan Name Label"
                        name="name"
                        defaultValue={plan.name}
                        required
                      />
                      <InputField
                        label="Price (NGN ₦)"
                        name="price_ngn"
                        type="number"
                        defaultValue={plan.price_ngn}
                        required
                      />
                      <InputField
                        label="Price (USD $)"
                        name="price_usd"
                        type="number"
                        defaultValue={plan.price_usd}
                        required
                      />
                      <div className="sm:col-span-3 flex justify-end">
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold py-1.5 px-3.5 flex items-center gap-1.5 self-end">
                          <Save size={12} /> Save pricing
                        </Button>
                      </div>
                    </form>
                  </Card>
                ))
              )}
            </div>
          )}

          {innerTab === 'payments' && (
            <Card className="bg-slate-900 border border-slate-800 p-6 space-y-4 text-left">
              <h3 className="text-sm font-bold text-slate-205 border-b border-slate-850 pb-2 flex items-center gap-1.5">
                <Shield size={16} className="text-indigo-400" /> Integrated Payment Gateways
              </h3>
              <p className="text-xs text-slate-400">Manage payment settings, currencies, and test/live API keys for Stripe and Paystack.</p>
              
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">Paystack (NGN ₦)</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 font-mono">Status: Connected (Sandbox Active)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-extrabold uppercase">
                    ACTIVE
                  </span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">Stripe (USD $)</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 font-mono">Status: Connected (Sandbox Active)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-extrabold uppercase">
                    ACTIVE
                  </span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">Flutterwave (Multi-Currency)</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 font-mono">Status: Disabled</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] text-slate-500 font-extrabold uppercase">
                    DISABLED
                  </span>
                </div>
              </div>
            </Card>
          )}

          {innerTab === 'email' && (
            <Card className="bg-slate-900 border border-slate-800 p-6 space-y-4 text-left">
              <h3 className="text-sm font-bold text-slate-202 border-b border-slate-850 pb-2 flex items-center gap-1.5">
                <Mail size={16} className="text-indigo-400" /> Outgoing SMTP Server Configuration
              </h3>
              <p className="text-xs text-slate-400">Configure global transaction email providers like Resend, Sendgrid, or standard SMTP routing.</p>
              
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="SMTP Mail Server Host" defaultValue="smtp.gmail.com" />
                  <InputField label="SMTP Port" defaultValue="587" type="number" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="SMTP Authentication Username" defaultValue="noreply@naijacareer.ai" />
                  <InputField label="SMTP Password Credentials" type="password" placeholder="••••••••••••••••" />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-slate-500 font-bold">Standard SSL/TLS enabled</span>
                  <Button variant="outline" className="border-slate-800 text-xs px-4">
                    Send Test Email
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {innerTab === 'dev' && (
            <Card className="bg-slate-900 border border-slate-800 p-6 space-y-4 text-left">
              <h3 className="text-sm font-bold text-slate-202 border-b border-slate-850 pb-2 flex items-center gap-1.5">
                <Sliders size={16} className="text-indigo-400" /> Cache Diagnostics & Dev Tools
              </h3>
              <p className="text-xs text-slate-400">Flush internal caches, clear session databases, and monitor background queues.</p>
              
              <div className="space-y-4 pt-2 divide-y divide-slate-850">
                <div className="flex items-center justify-between pb-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">Invalidate Application Cache</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Flush Redis keys and temporary DB structures</span>
                  </div>
                  <Button 
                    onClick={() => flushCacheMutation.mutate()}
                    isLoading={flushCacheMutation.isPending}
                    className="bg-indigo-650 hover:bg-indigo-600 text-xs font-bold px-4 py-2"
                  >
                    Flush Cache Memory
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">Active WebSocket Port Connections</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Real-time simulator sessions currently streaming</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold font-mono">
                    2 Streams Open
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
