import React, { useState } from 'react';
import { useAuth } from '../../application/context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ShieldCheck, Cpu, FileText, ToggleLeft, 
  CreditCard, Settings, Activity, FileSpreadsheet, Command, LogOut, 
  ExternalLink, SlidersHorizontal, Briefcase, FileSignature, 
  Building2, Database, Sliders
} from 'lucide-react';

import { AdminCommandPalette } from '../components/admin/AdminCommandPalette';
import { AdminOverviewConsole } from '../components/admin/consoles/AdminOverviewConsole';
import { AdminUsersConsole } from '../components/admin/consoles/AdminUsersConsole';
import { AdminOrganizationsConsole } from '../components/admin/consoles/AdminOrganizationsConsole';
import { AdminJobBoardConsole } from '../components/admin/consoles/AdminJobBoardConsole';
import { AdminApplicationsConsole } from '../components/admin/consoles/AdminApplicationsConsole';
import { AdminAiEngineConsole } from '../components/admin/consoles/AdminAiEngineConsole';
import { AdminPromptStudioConsole } from '../components/admin/consoles/AdminPromptStudioConsole';
import { AdminSystemHealthConsole } from '../components/admin/consoles/AdminSystemHealthConsole';
import { AdminAuditLogsConsole } from '../components/admin/consoles/AdminAuditLogsConsole';
import { AdminRbacConsole } from '../components/admin/consoles/AdminRbacConsole';
import { AdminDatabaseConsole } from '../components/admin/consoles/AdminDatabaseConsole';
import { AdminSettingsCenterConsole } from '../components/admin/consoles/AdminSettingsCenterConsole';
import { DynamicConfigManager } from '../components/admin/DynamicConfigManager';

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const sidebarGroups = [
    {
      title: 'Analytics & Audits',
      items: [
        { id: 'dashboard', label: 'Overview Console', icon: LayoutDashboard },
        { id: 'health', label: 'System Health', icon: Activity },
        { id: 'audit', label: 'Audit Trail Logs', icon: FileSpreadsheet },
        { id: 'database', label: 'Database Explorer', icon: Database },
      ]
    },
    {
      title: 'Candidates & Operations',
      items: [
        { id: 'users', label: 'User Directory', icon: Users },
        { id: 'organizations', label: 'Organizations', icon: Building2 },
        { id: 'jobs', label: 'AI Job Board', icon: Briefcase },
        { id: 'applications', label: 'Applications Log', icon: FileSignature },
      ]
    },
    {
      title: 'AI Engine Controls',
      items: [
        { id: 'ai', label: 'Provider Toggles', icon: Cpu },
        { id: 'prompts', label: 'Prompt Studio', icon: FileText },
        { id: 'roles', label: 'RBAC Permissions', icon: ShieldCheck },
      ]
    },
    {
      title: 'Platform Config',
      items: [
        { id: 'settings', label: 'Settings Center', icon: Settings },
        { id: 'dynamic_config', label: 'Dynamic Raw Settings', icon: Sliders },
      ]
    }
  ];

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Banner Status & Profile Bar */}
      <header className="w-full bg-slate-900/80 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-35 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <ShieldCheck size={22} className="stroke-[2.5]" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-sm tracking-tight">Naija Career AI</span>
              <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                SaaS OS
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Control Center Operations</p>
          </div>
        </div>

        {/* Global Action items */}
        <div className="flex items-center gap-4">
          {/* Cmd+K trigger button */}
          <button
            onClick={() => setIsPaletteOpen(true)}
            className="hidden md:flex items-center gap-2.5 bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-500 hover:text-slate-300 px-3.5 py-1.5 rounded-xl transition-all text-xs font-semibold"
          >
            <Command size={13} className="text-indigo-400" />
            <span>Search Command Palette...</span>
            <kbd className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono">⌘K</kbd>
          </button>

          {/* Admin User Badge */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-slate-950/50 rounded-xl border border-slate-850">
            <div className="w-6.5 h-6.5 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-[11px] shadow-inner">
              {user?.full_name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-slate-205 leading-tight">{user?.full_name || 'System Admin'}</span>
              <span className="text-[9px] text-slate-500 font-bold truncate max-w-[130px]">{user?.email || 'admin@naijacareer.ai'}</span>
            </div>
          </div>

          {/* Candidate View shortcut */}
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-305 hover:text-white bg-slate-955 border border-slate-850 hover:bg-slate-800 px-3.5 py-2 rounded-xl transition-all"
          >
            <ExternalLink size={13} className="text-emerald-500" />
            <span>App View</span>
          </Link>

          {/* Logout button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-red-400 hover:text-red-300 bg-red-955/15 hover:bg-red-955/30 border border-red-900/20 px-3.5 py-2 rounded-xl transition-all"
          >
            <LogOut size={13} />
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* Workspace Sidebar + Main Board */}
      <div className="flex-1 flex flex-col lg:flex-row max-h-[calc(100vh-68px)] overflow-hidden">
        {/* Left collapsable sidebar navigation */}
        <aside className="w-full lg:w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col p-4 overflow-y-auto max-h-[30vh] lg:max-h-full scrollbar-none gap-5">
          {sidebarGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="flex flex-col gap-1.5 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 mb-1">
                {group.title}
              </span>
              <div className="flex flex-col gap-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-indigo-400 border-l-4 border-indigo-500 font-extrabold'
                          : 'text-slate-400 hover:bg-slate-850/60 hover:text-slate-200'
                      }`}
                    >
                      <Icon size={16} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* Main Work Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin">
          <div className="max-w-7xl mx-auto w-full">
            {activeTab === 'dashboard' && <AdminOverviewConsole />}
            {activeTab === 'health' && <AdminSystemHealthConsole />}
            {activeTab === 'audit' && <AdminAuditLogsConsole />}
            {activeTab === 'database' && <AdminDatabaseConsole />}
            {activeTab === 'users' && <AdminUsersConsole />}
            {activeTab === 'organizations' && <AdminOrganizationsConsole />}
            {activeTab === 'jobs' && <AdminJobBoardConsole />}
            {activeTab === 'applications' && <AdminApplicationsConsole />}
            {activeTab === 'ai' && <AdminAiEngineConsole />}
            {activeTab === 'prompts' && <AdminPromptStudioConsole />}
            {activeTab === 'roles' && <AdminRbacConsole />}
            {activeTab === 'settings' && <AdminSettingsCenterConsole />}
            {activeTab === 'dynamic_config' && <DynamicConfigManager />}
          </div>
        </main>
      </div>

      {/* Global Interactive Command Palette overlay */}
      <AdminCommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onSelectTab={(tabId) => setActiveTab(tabId)}
      />
    </div>
  );
};
