import React from 'react';
import { useJobBoardStore } from '../../../application/stores/useJobBoardStore';
import { Card } from '../Card';
import { Button } from '../Button';
import {
  SlidersHorizontal,
  RotateCcw,
  Search,
  MapPin,
  Globe2,
  Briefcase,
  GraduationCap,
  Sparkles
} from 'lucide-react';

export const SmartFiltersSidebar: React.FC = () => {
  const { filters, setFilter, resetFilters } = useJobBoardStore();

  return (
    <Card className="p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
          Smart Filters
        </h3>
        <button
          onClick={resetFilters}
          className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* 1. Search Query */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Natural Language Search
        </label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilter('searchQuery', e.target.value)}
            placeholder="e.g. React Developer Lagos, Python Remote"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* 2. Remote Status Toggle */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-emerald-500" /> 100% Remote Jobs Only
          </span>
          <input
            type="checkbox"
            checked={filters.remoteOnly}
            onChange={(e) => setFilter('remoteOnly', e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
          />
        </label>
      </div>

      {/* 3. Experience Level */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Experience Level
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {['', 'Entry Level', 'Mid Level', 'Senior', 'Executive'].map((level) => (
            <button
              key={level}
              onClick={() => setFilter('experienceLevel', level)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-left transition-colors ${
                filters.experienceLevel === level
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {level || 'All Levels'}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Special Filters: NYSC & Visa */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-500" /> NYSC / Graduate Friendly
          </span>
          <input
            type="checkbox"
            checked={filters.nyscFriendly}
            onChange={(e) => setFilter('nyscFriendly', e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Visa Sponsorship
          </span>
          <input
            type="checkbox"
            checked={filters.visaSponsorship}
            onChange={(e) => setFilter('visaSponsorship', e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
          />
        </label>
      </div>
    </Card>
  );
};
