import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../infrastructure/api_client';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import {
  Globe2,
  TrendingUp,
  Award,
  DollarSign,
  Plane,
  Lightbulb,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Star,
  Briefcase,
  BookOpen,
  ArrowUpRight,
  BarChart2,
  Zap,
  Target,
  Map,
  CheckCircle2,
  AlertCircle,
  Building2
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface IndustrySummary {
  id: string;
  name: string;
  tagline: string;
  talent_demand: string;
  growth_outlook: string;
  color: string;
  top_skills_preview: string[];
}

interface Skill {
  skill: string;
  demand: 'Very High' | 'High' | 'Medium' | 'Low';
  trend: string;
  note: string;
}

interface SalaryRange {
  ngn_min: number | null;
  ngn_max: number | null;
  usd_remote: [number, number] | null;
}

interface Certification {
  name: string;
  relevance: string;
  cost_usd: number;
  provider: string;
  note: string;
}

interface VisaOpportunity {
  role: string;
  countries: string[];
  visa_types: string[];
  notes: string;
}

interface IndustryDetail {
  id: string;
  name: string;
  tagline: string;
  description: string;
  market_size: string;
  talent_demand: string;
  growth_outlook: string;
  color: string;
  in_demand_skills: Skill[];
  salary_ranges: Record<string, SalaryRange>;
  top_employers: Array<{ name: string; note: string }>;
  certifications: Certification[];
  visa_friendly_roles: VisaOpportunity[];
  job_search_tips: string[];
}

interface VisaEntry {
  industry: string;
  industry_id: string;
  industry_color: string;
  role: string;
  countries: string[];
  visa_types: string[];
  notes: string;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const COLOR_MAP: Record<string, { bg: string; text: string; border: string; pill: string; glow: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30', pill: 'bg-emerald-500', glow: 'shadow-emerald-500/20' },
  amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-500',   border: 'border-amber-500/30',   pill: 'bg-amber-500',   glow: 'shadow-amber-500/20' },
  blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-500',    border: 'border-blue-500/30',    pill: 'bg-blue-500',    glow: 'shadow-blue-500/20' },
  slate:   { bg: 'bg-slate-500/10',   text: 'text-slate-500',   border: 'border-slate-500/30',   pill: 'bg-slate-500',   glow: 'shadow-slate-500/20' },
  indigo:  { bg: 'bg-indigo-500/10',  text: 'text-indigo-500',  border: 'border-indigo-500/30',  pill: 'bg-indigo-500',  glow: 'shadow-indigo-500/20' },
  rose:    { bg: 'bg-rose-500/10',    text: 'text-rose-500',    border: 'border-rose-500/30',    pill: 'bg-rose-500',    glow: 'shadow-rose-500/20' },
  violet:  { bg: 'bg-violet-500/10',  text: 'text-violet-500',  border: 'border-violet-500/30',  pill: 'bg-violet-500',  glow: 'shadow-violet-500/20' },
};

const DEMAND_CONFIG: Record<string, { color: string; bg: string; bar: string }> = {
  'Very High': { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', bar: 'bg-emerald-500' },
  'High':      { color: 'text-blue-600 dark:text-blue-400',       bg: 'bg-blue-100 dark:bg-blue-900/30',       bar: 'bg-blue-500' },
  'Medium':    { color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-100 dark:bg-amber-900/30',     bar: 'bg-amber-500' },
  'Low':       { color: 'text-slate-500',                          bg: 'bg-slate-100 dark:bg-slate-800',        bar: 'bg-slate-400' },
};

const DEMAND_WIDTH: Record<string, string> = {
  'Very High': 'w-full',
  'High':      'w-3/4',
  'Medium':    'w-1/2',
  'Low':       'w-1/4',
};

const formatNGN = (n: number) => `₦${(n / 1_000_000).toFixed(1)}M`;
const formatUSD = (n: number) => `$${(n / 1_000).toFixed(0)}K`;

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

const DemandBar: React.FC<{ demand: string }> = ({ demand }) => {
  const cfg = DEMAND_CONFIG[demand] ?? DEMAND_CONFIG['Medium'];
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${cfg.bar} ${DEMAND_WIDTH[demand]}`} />
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} whitespace-nowrap`}>
        {demand}
      </span>
    </div>
  );
};

const SalaryCard: React.FC<{ label: string; range: SalaryRange }> = ({ label, range }) => (
  <div className="flex items-start justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0 gap-4">
    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-tight flex-1">{label}</span>
    <div className="text-right shrink-0">
      {range.usd_remote ? (
        <span className="text-sm font-black text-violet-600 dark:text-violet-400">
          {formatUSD(range.usd_remote[0])} – {formatUSD(range.usd_remote[1])} / yr
        </span>
      ) : range.ngn_min && range.ngn_max ? (
        <span className="text-sm font-black text-slate-800 dark:text-slate-100">
          {formatNGN(range.ngn_min)} – {formatNGN(range.ngn_max)} / yr
        </span>
      ) : (
        <span className="text-xs text-slate-400">—</span>
      )}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export const CareerInsightsPage: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'skills' | 'salary' | 'employers' | 'certs' | 'visa' | 'tips'>('skills');
  const [showPersonalised, setShowPersonalised] = useState(false);

  // Fetch all industry summaries
  const { data: industries = [], isLoading: industriesLoading } = useQuery<IndustrySummary[]>({
    queryKey: ['insights-industries'],
    queryFn: async () => (await api.get<IndustrySummary[]>('/api/v1/insights/industries')).data,
  });

  // Fetch selected industry detail
  const { data: detail, isLoading: detailLoading } = useQuery<IndustryDetail>({
    queryKey: ['insights-industry', selectedIndustry],
    queryFn: async () => (await api.get<IndustryDetail>(`/api/v1/insights/industries/${selectedIndustry}`)).data,
    enabled: !!selectedIndustry,
  });

  // Fetch all visa opportunities
  const { data: visaOps = [] } = useQuery<VisaEntry[]>({
    queryKey: ['insights-visa'],
    queryFn: async () => (await api.get<VisaEntry[]>('/api/v1/insights/visa-opportunities')).data,
  });

  // Personalised AI recommendations
  const recMutation = useMutation<any, Error, void>({
    mutationFn: async () =>
      (await api.post('/api/v1/insights/personalized-recommendations')).data,
    onSuccess: () => setShowPersonalised(true),
  });

  const c = selectedIndustry && detail ? COLOR_MAP[detail.color] ?? COLOR_MAP['indigo'] : null;

  const TABS: Array<{ id: typeof activeTab; label: string; icon: React.ElementType }> = [
    { id: 'skills',    label: 'Skills',       icon: BarChart2  },
    { id: 'salary',    label: 'Salaries',     icon: DollarSign },
    { id: 'employers', label: 'Employers',    icon: Building2  },
    { id: 'certs',     label: 'Certs',        icon: Award      },
    { id: 'visa',      label: 'Visa Paths',   icon: Plane      },
    { id: 'tips',      label: 'Insider Tips', icon: Lightbulb  },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-green-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
            <Globe2 size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight">
              Nigeria Career Insights
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Skills demand · Salary data · Certifications · Visa pathways · 7 industries
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => recMutation.mutate()}
          disabled={recMutation.isPending}
          className="bg-gradient-to-r from-green-600 to-emerald-500 shadow-lg shadow-emerald-500/20 py-2.5 shrink-0"
        >
          {recMutation.isPending ? (
            <><Loader2 size={15} className="mr-2 animate-spin" />Analysing Profile…</>
          ) : (
            <><Zap size={15} className="mr-2" />Get Personalised Recommendations</>
          )}
        </Button>
      </div>

      {/* ── Personalised AI Recommendations Panel ────────────────── */}
      {showPersonalised && recMutation.data && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-emerald-500" />
            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
              Your Personalised Career Roadmap
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Industry Fit */}
            {recMutation.data.recommended_industries?.slice(0, 2).map((ind: any) => (
              <Card key={ind.industry_id} className="p-4 border-slate-200/60 dark:border-slate-800 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Best Fit</span>
                  <span className="text-xs font-black text-emerald-500">{ind.fit_score}% match</span>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">{ind.industry_name}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{ind.reason}</p>
                {ind.quick_wins?.length > 0 && (
                  <ul className="flex flex-col gap-1">
                    {ind.quick_wins.slice(0, 2).map((w: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
                        <CheckCircle2 size={10} className="text-emerald-400 shrink-0 mt-0.5" />
                        {w}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}

            {/* Visa Pathway */}
            {recMutation.data.visa_pathway && (
              <Card className="p-4 border-violet-200/50 dark:border-violet-800/40 bg-violet-50/50 dark:bg-violet-900/10 flex flex-col gap-3 md:col-span-2">
                <div className="flex items-center gap-2">
                  <Plane size={14} className="text-violet-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-500">Visa Pathway</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                    {recMutation.data.visa_pathway.recommended_country} · {recMutation.data.visa_pathway.visa_type}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {recMutation.data.visa_pathway.eligibility_assessment}
                  </p>
                  <p className="text-[10px] font-bold text-violet-500 mt-2">
                    Timeline: {recMutation.data.visa_pathway.realistic_timeline}
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Top Certifications */}
          {recMutation.data.top_certifications?.length > 0 && (
            <Card className="p-5 border-amber-200/50 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-900/10">
              <div className="flex items-center gap-2 mb-4">
                <Award size={15} className="text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Recommended Certifications</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recMutation.data.top_certifications.slice(0, 3).map((cert: any, i: number) => (
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-amber-100 dark:border-amber-900/30 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        cert.priority === 'Do Now' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                        cert.priority === 'Do Next' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>{cert.priority}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{cert.certification}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{cert.impact}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Action Plan */}
          {recMutation.data.career_action_plan && (
            <Card className="p-5 border-emerald-200/50 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-900/10">
              <div className="flex items-center gap-2 mb-3">
                <Map size={15} className="text-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">12-Month Action Plan</h3>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {recMutation.data.career_action_plan}
              </p>
            </Card>
          )}
        </div>
      )}

      {/* ── Global Visa Opportunities Strip ──────────────────────── */}
      {visaOps.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Plane size={15} className="text-violet-500" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Visa-Friendly Roles Across All Industries
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {visaOps.map((opp, i) => {
              const oc = COLOR_MAP[opp.industry_color] ?? COLOR_MAP['indigo'];
              return (
                <div
                  key={i}
                  className={`shrink-0 w-72 rounded-2xl border p-4 bg-white dark:bg-slate-900 flex flex-col gap-2 ${oc.border}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${oc.bg} ${oc.text}`}>
                      {opp.industry}
                    </span>
                    <Plane size={11} className="text-violet-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{opp.role}</p>
                  <div className="flex flex-wrap gap-1">
                    {opp.countries.slice(0, 4).map((c, ci) => (
                      <span key={ci} className="text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                        🌍 {c}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{opp.notes}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Industry Grid ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Briefcase size={15} className="text-slate-500" />
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Select an Industry to Explore
          </h2>
        </div>

        {industriesLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="text-emerald-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {industries.map((ind) => {
              const ic = COLOR_MAP[ind.color] ?? COLOR_MAP['indigo'];
              const isActive = selectedIndustry === ind.id;
              return (
                <button
                  key={ind.id}
                  onClick={() => {
                    setSelectedIndustry(isActive ? null : ind.id);
                    setActiveTab('skills');
                  }}
                  className={`text-left rounded-2xl border p-5 flex flex-col gap-3 transition-all hover:shadow-lg ${
                    isActive
                      ? `${ic.bg} ${ic.border} shadow-xl ${ic.glow}`
                      : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${ic.bg} shrink-0`}>
                      <Globe2 size={16} className={ic.text} />
                    </div>
                    {isActive && <ChevronDown size={16} className={ic.text} />}
                    {!isActive && <ChevronRight size={14} className="text-slate-400" />}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-850 dark:text-white text-sm">{ind.name}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{ind.tagline}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp size={10} className={ic.text} />
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">{ind.growth_outlook}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${ic.bg} ${ic.text} self-start`}>
                      {ind.talent_demand}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ind.top_skills_preview.slice(0, 3).map((s, si) => (
                      <span key={si} className="text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full truncate max-w-[90px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Industry Detail Panel ─────────────────────────────────── */}
      {selectedIndustry && (
        <div className="flex flex-col gap-5">
          {detailLoading ? (
            <Card className="p-16 flex items-center justify-center">
              <Loader2 size={24} className="text-emerald-500 animate-spin" />
            </Card>
          ) : detail ? (
            <>
              {/* Detail Header */}
              <div className={`rounded-2xl border p-6 ${c!.bg} ${c!.border} flex flex-col md:flex-row md:items-start justify-between gap-4`}>
                <div className="flex flex-col gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${c!.text}`}>
                    {detail.talent_demand} Demand · {detail.market_size}
                  </span>
                  <h2 className="text-xl font-black text-slate-850 dark:text-white">{detail.name}</h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">{detail.description}</p>
                </div>
                <div className={`shrink-0 text-right flex flex-col items-end gap-1`}>
                  <span className={`text-sm font-black ${c!.text}`}>{detail.growth_outlook}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Market Outlook</span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl border whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? `${c!.bg} ${c!.text} ${c!.border}`
                        : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <tab.icon size={13} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ── Tab: Skills ── */}
              {activeTab === 'skills' && (
                <Card className="p-6 border-slate-200/60 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-5 flex items-center gap-2">
                    <BarChart2 size={14} />
                    In-Demand Skills for {detail.name}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {detail.in_demand_skills.map((s, i) => (
                      <div key={i} className="flex items-start gap-4 py-2 border-b border-slate-100 dark:border-slate-800/60 last:border-b-0">
                        <span className="text-[10px] font-black text-slate-400 w-5 shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{s.skill}</span>
                            <DemandBar demand={s.demand} />
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{s.note}</p>
                        </div>
                        <span className={`shrink-0 text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                          s.trend === 'rising' || s.trend === 'explosive' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                          s.trend === 'volatile' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {s.trend === 'explosive' ? '🔥 Explosive' : s.trend === 'rising' ? '↑ Rising' : s.trend === 'volatile' ? '⚡ Volatile' : '→ Stable'}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* ── Tab: Salary ── */}
              {activeTab === 'salary' && (
                <Card className="p-6 border-slate-200/60 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-5 flex items-center gap-2">
                    <DollarSign size={14} />
                    Salary Ranges — {detail.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
                    Annual gross salary estimates based on Jobberman Salary Index, PwC Nigeria Talent Survey, and LinkedIn Salary Insights (2024-2025).
                    NGN figures may be impacted by Naira fluctuations.
                  </p>
                  <div className="flex flex-col">
                    {Object.entries(detail.salary_ranges).map(([label, range], i) => (
                      <SalaryCard key={i} label={label} range={range} />
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      💡 <strong>Remote tip:</strong> With ₦1,500/USD exchange rate, a $100K remote role equals ₦150M/year — 
                      15-30x the equivalent local salary. Prioritise skill development for remote eligibility.
                    </p>
                  </div>
                </Card>
              )}

              {/* ── Tab: Employers ── */}
              {activeTab === 'employers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detail.top_employers.map((emp, i) => (
                    <Card key={i} className="p-4 border-slate-200/60 dark:border-slate-800 flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c!.bg}`}>
                        <Building2 size={16} className={c!.text} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{emp.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{emp.note}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* ── Tab: Certifications ── */}
              {activeTab === 'certs' && (
                <div className="flex flex-col gap-4">
                  {detail.certifications.map((cert, i) => (
                    <Card key={i} className="p-5 border-slate-200/60 dark:border-slate-800 flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{cert.name}</h3>
                            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{cert.provider}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              cert.relevance === 'Very High' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                              'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            }`}>
                              {cert.relevance}
                            </span>
                            <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                              ${cert.cost_usd === 0 ? 'Free' : cert.cost_usd.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">{cert.note}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* ── Tab: Visa Paths ── */}
              {activeTab === 'visa' && (
                <div className="flex flex-col gap-4">
                  {detail.visa_friendly_roles.map((opp, i) => (
                    <Card key={i} className="p-5 border-violet-200/50 dark:border-violet-800/40 bg-violet-50/30 dark:bg-violet-900/5 flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Plane size={14} className="text-violet-500" />
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{opp.role}</h3>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {opp.countries.map((country, ci) => (
                              <span key={ci} className="text-[10px] font-semibold bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800/40 px-2 py-0.5 rounded-full">
                                {country}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Visa Types</p>
                        <div className="flex flex-wrap gap-1.5">
                          {opp.visa_types.map((v, vi) => (
                            <span key={vi} className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-violet-100 dark:border-violet-900/30 pt-3">
                        {opp.notes}
                      </p>
                    </Card>
                  ))}
                </div>
              )}

              {/* ── Tab: Insider Tips ── */}
              {activeTab === 'tips' && (
                <Card className="p-6 border-slate-200/60 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-5 flex items-center gap-2">
                    <Lightbulb size={14} className="text-amber-400" />
                    Insider Job Search Tips — {detail.name}
                  </h3>
                  <div className="flex flex-col gap-4">
                    {detail.job_search_tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">{i + 1}</span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};
