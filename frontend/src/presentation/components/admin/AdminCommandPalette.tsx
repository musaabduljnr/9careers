import React, { useState, useEffect } from 'react';
import { Search, Command, X, ArrowRight, ShieldCheck, Cpu, Flag, Users, CreditCard, FileText, SlidersHorizontal, Settings, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../infrastructure/api_client';

interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tabId: string) => void;
}

interface SearchResult {
  category: string;
  title: string;
  subtitle: string;
  tab: string;
  metadata?: any;
}

const quickNavItems = [
  { id: 'dashboard', label: 'Global Dashboard', icon: SlidersHorizontal, category: 'Navigation' },
  { id: 'users', label: 'User Management', icon: Users, category: 'Navigation' },
  { id: 'ai', label: 'AI Engine Controls', icon: Cpu, category: 'Navigation' },
  { id: 'features', label: 'Feature Flags', icon: Flag, category: 'Navigation' },
  { id: 'prompts', label: 'Prompt Library', icon: FileText, category: 'Navigation' },
  { id: 'plans', label: 'Subscriptions & Pricing', icon: CreditCard, category: 'Navigation' },
  { id: 'roles', label: 'Roles & RBAC', icon: ShieldCheck, category: 'Navigation' },
  { id: 'settings', label: 'App Settings & Branding', icon: Settings, category: 'Navigation' },
  { id: 'health', label: 'System Diagnostics', icon: Activity, category: 'Navigation' },
];

export const AdminCommandPalette: React.FC<AdminCommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Keyboard shortcut Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
          setResults([]);
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Live Backend Search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/api/v1/admin/search`, { params: { q: query } });
        setResults(res.data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (tab: string) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
            <Search className="w-5 h-5 text-indigo-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search users, prompts, features..."
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-medium"
            />
            {query ? (
              <button onClick={() => setQuery('')} className="p-1 text-slate-500 hover:text-slate-300">
                <X size={16} />
              </button>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 bg-slate-800 rounded-md border border-slate-700/60 text-[10px] font-bold text-slate-400">
                <Command size={10} /> K
              </div>
            )}
          </div>

          {/* Results Box */}
          <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/40">
            {isSearching ? (
              <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span>Searching platform records...</span>
              </div>
            ) : query.trim() ? (
              results.length > 0 ? (
                results.map((res, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(res.tab)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-indigo-600/10 hover:border-indigo-500/20 text-left transition-all group"
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {res.category}
                        </span>
                        <span className="text-xs font-bold text-slate-100 group-hover:text-indigo-300">
                          {res.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 pl-0.5">{res.subtitle}</span>
                    </div>
                    <ArrowRight size={14} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No matching users, prompts, or settings found for "{query}"
                </div>
              )
            ) : (
              // Default Quick Commands
              <div className="flex flex-col gap-1 p-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-3 py-1.5">
                  Quick Navigation Commands
                </span>
                {quickNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all text-xs font-semibold group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className="text-slate-400 group-hover:text-indigo-400" />
                        <span>Go to {item.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 group-hover:text-slate-400 font-mono">Jump →</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-3">
              <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">↑↓</kbd> Navigate</span>
              <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">↵</kbd> Select</span>
            </div>
            <span>Press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">ESC</kbd> to exit</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
