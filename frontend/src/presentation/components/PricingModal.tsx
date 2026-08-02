import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../infrastructure/api_client';
import { Modal } from './Modal';
import { Button } from './Button';
import { Card } from './Card';
import { Check, Zap, CreditCard, ShieldCheck, Sparkles, Globe } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const [gateway, setGateway] = useState<'paystack' | 'stripe'>('paystack');

  // Fetch subscription plans
  const { data: plans = {} } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => (await api.get('/api/v1/subscriptions/plans')).data,
    enabled: isOpen,
  });

  // Fetch current candidate usage
  const { data: usageData = {} } = useQuery({
    queryKey: ['my-usage'],
    queryFn: async () => (await api.get('/api/v1/subscriptions/my-usage')).data,
    enabled: isOpen,
  });

  // Initialize Checkout Mutation
  const checkoutMutation = useMutation({
    mutationFn: async (planKey: string) => {
      const res = await api.post('/api/v1/payments/initialize-checkout', {
        gateway,
        plan_key: planKey,
        callback_url: window.location.href
      });
      return res.data;
    },
    onSuccess: (data: any) => {
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    }
  });

  const currentPlan = usageData.subscription_plan || 'free';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose Your Career Accelerator Plan" size="xl">
      <div className="flex flex-col gap-6 py-2">
        {/* Gateway Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-white block">Currency & Payment Gateway</span>
            <span className="text-[11px] text-slate-500">Paystack for Nigerian Cards/Bank/USSD or Stripe for USD Cards.</span>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setGateway('paystack')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                gateway === 'paystack'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <CreditCard size={14} />
              Paystack (NGN ₦)
            </button>
            <button
              onClick={() => setGateway('stripe')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                gateway === 'stripe'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Globe size={14} />
              Stripe (USD $)
            </button>
          </div>
        </div>

        {/* Current Usage Banner */}
        {usageData.usage && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-xs">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Resume Scans</div>
              <div className="font-extrabold text-slate-800 dark:text-white mt-0.5">
                {usageData.usage.resume_analyses?.used} / {usageData.usage.resume_analyses?.limit > 9999 ? '∞' : usageData.usage.resume_analyses?.limit}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Cover Letters</div>
              <div className="font-extrabold text-slate-800 dark:text-white mt-0.5">
                {usageData.usage.cover_letters?.used} / {usageData.usage.cover_letters?.limit > 9999 ? '∞' : usageData.usage.cover_letters?.limit}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Job Matches</div>
              <div className="font-extrabold text-slate-800 dark:text-white mt-0.5">
                {usageData.usage.job_matches?.used} / {usageData.usage.job_matches?.limit > 9999 ? '∞' : usageData.usage.job_matches?.limit}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Mock Interviews</div>
              <div className="font-extrabold text-slate-800 dark:text-white mt-0.5">
                {usageData.usage.interview_practice?.used} / {usageData.usage.interview_practice?.limit > 9999 ? '∞' : usageData.usage.interview_practice?.limit}
              </div>
            </div>
          </div>
        )}

        {/* Subscription Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(plans).map(([key, plan]: [string, any]) => {
            const isCurrent = currentPlan === key;
            const isPopular = plan.popular;
            const price = gateway === 'paystack' ? plan.formatted_price_ngn : plan.formatted_price_usd;

            return (
              <Card
                key={key}
                className={`p-5 flex flex-col justify-between relative transition-all border ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-lg'
                    : isPopular
                    ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-extrabold text-slate-850 dark:text-white text-base">{plan.name}</h3>
                    {isCurrent && (
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-black text-slate-850 dark:text-white mt-1">{price}</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 min-h-[32px] leading-snug">
                    {plan.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                    {plan.features?.map((feat: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {key === 'free' ? (
                    <Button variant="outline" disabled className="w-full text-xs py-2">
                      Included Default
                    </Button>
                  ) : (
                    <Button
                      variant={isPopular ? 'primary' : 'outline'}
                      onClick={() => checkoutMutation.mutate(key)}
                      disabled={isCurrent || checkoutMutation.isPending}
                      isLoading={checkoutMutation.isPending && checkoutMutation.variables === key}
                      className={`w-full text-xs py-2 ${
                        isPopular ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500' : ''
                      }`}
                    >
                      {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
