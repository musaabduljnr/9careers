import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../infrastructure/api_client';
import { Card } from '../../Card';
import { Button } from '../../Button';
import { InputField } from '../../InputField';
import { CreditCard, Save, Gift, FileText, CheckCircle, RefreshCw } from 'lucide-react';

export const AdminPaymentsConsole: React.FC = () => {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch plans
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['admin-billing-plans'],
    queryFn: async () => (await api.get('/api/v1/admin/plans')).data
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ planKey, payload }: { planKey: string; payload: any }) => {
      return (await api.put(`/api/v1/admin/plans/${planKey}`, payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-billing-plans'] });
      setSuccessMsg('Subscription pricing plan updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  });

  const handleUpdatePlan = (e: React.FormEvent<HTMLFormElement>, planKey: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      price_ngn: parseInt(formData.get('price_ngn') as string) || 0,
      price_usd: parseInt(formData.get('price_usd') as string) || 0
    };

    updatePlanMutation.mutate({
      planKey,
      payload
    });
  };

  return (
    <div className="space-y-6 text-left">
      {successMsg && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-400">
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gateway settings card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-900 border border-slate-800 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-2">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-black text-slate-200">Payment Gateway Integrations</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex flex-col gap-2">
                <span className="text-xs font-extrabold text-slate-200">Paystack Nigeria API</span>
                <span className="text-[10px] text-slate-500 font-medium">Direct billing support in Nigerian Naira (NGN)</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-extrabold text-emerald-400">Operational Gateway</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex flex-col gap-2">
                <span className="text-xs font-extrabold text-slate-200">Stripe Global API</span>
                <span className="text-[10px] text-slate-500 font-medium">International billing support in USD & multi-currency</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-extrabold text-emerald-400">Operational Gateway</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Dynamic Subscription Pricing Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900 border border-slate-800 p-6">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <Gift className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-black text-slate-200">SaaS Plan Tiers & Quotas</h3>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="h-32 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
              ) : (
                plans.map((p: any) => (
                  <form 
                    key={p.plan_key}
                    onSubmit={(e) => handleUpdatePlan(e, p.plan_key)}
                    className="p-4 bg-slate-950/70 border border-slate-850 rounded-xl grid grid-cols-1 md:grid-cols-4 items-center gap-4 text-xs font-bold"
                  >
                    <div className="flex flex-col text-left col-span-1">
                      <span className="text-slate-200 capitalize font-extrabold text-sm">{p.name}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">Key: {p.plan_key}</span>
                    </div>

                    <InputField
                      label="Price (NGN)"
                      name="price_ngn"
                      type="number"
                      defaultValue={p.price_ngn}
                    />

                    <InputField
                      label="Price (USD)"
                      name="price_usd"
                      type="number"
                      defaultValue={p.price_usd}
                    />

                    <Button
                      type="submit"
                      variant="outline"
                      className="mt-4 md:mt-0 text-xs border-indigo-500/20 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 w-full"
                    >
                      <Save size={13} className="mr-1.5" /> Save Plan
                    </Button>
                  </form>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
