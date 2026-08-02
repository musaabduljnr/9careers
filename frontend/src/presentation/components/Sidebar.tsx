import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../application/context/AuthContext';
import { useTheme } from '../../application/context/ThemeContext';
import { 
  LayoutDashboard, 
  FileText, 
  FileSignature, 
  GraduationCap, 
  MessageSquareCode, 
  LogOut, 
  Sun, 
  Moon,
  Menu,
  X,
  Briefcase,
  Sparkles,
  Layers,
  BrainCircuit,
  Globe2,
  ShieldCheck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Job Discovery', path: '/job-board', icon: Sparkles },
    { name: 'ATS Optimizer', path: '/resume-optimizer', icon: FileText },
    { name: 'CV Templates', path: '/resume-templates', icon: Layers },
    { name: 'Cover Letters', path: '/cover-letter', icon: FileSignature },
    { name: 'Job Parser', path: '/job-parser', icon: Briefcase },
    { name: 'Job Matcher', path: '/job-match', icon: Sparkles },
    { name: 'NYSC Graduate Hub', path: '/nysc-hub', icon: GraduationCap },
    { name: 'Mock Interviews', path: '/interview-prep', icon: MessageSquareCode },
    { name: 'Interview Questions', path: '/interview-questions', icon: BrainCircuit },
    { name: 'Career Insights', path: '/career-insights', icon: Globe2 },
    { name: 'Admin Dashboard', path: '/admin', icon: ShieldCheck },
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden w-full h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 px-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-md">
            <Briefcase size={20} />
          </div>
          <span className="font-extrabold text-slate-800 dark:text-white tracking-tight">Naija Career AI</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/80 flex flex-col justify-between py-6 px-4 z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } shrink-0`}
      >
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-500 p-2.5 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
              <Briefcase size={24} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-850 dark:text-white text-lg tracking-tight leading-none">Naija Career AI</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Enterprise Assistant</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1.5">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-l-4 border-emerald-500'
                      : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <item.icon size={18} />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="flex flex-col gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* User profile brief */}
          {user && (
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-base shadow">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate leading-tight">
                  {user.full_name}
                </span>
                <span className="text-xs text-slate-400 truncate mt-0.5">
                  {user.email}
                </span>
              </div>
            </div>
          )}

          {/* Theme & Logout Buttons */}
          <div className="flex items-center justify-between gap-2 px-1">
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
            >
              {theme === 'light' ? (
                <>
                  <Moon size={14} />
                  Dark
                </>
              ) : (
                <>
                  <Sun size={14} />
                  Light
                </>
              )}
            </button>
            <button
              onClick={logout}
              className="flex items-center justify-center p-2.5 rounded-xl border border-red-100 dark:border-red-950/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      
      {/* Background Overlay for mobile menu */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
        />
      )}
    </>
  );
};
