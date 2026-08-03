import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../application/context/AuthContext';
import { loginSchema, registerSchema, LoginFormValues, RegisterFormValues } from '../../domain/validation';
import { InputField } from '../components/InputField';
import { SelectField } from '../components/SelectField';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Briefcase, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register, loginOAuth, forgotPassword, error, clearError } = useAuth();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('expired') === 'true';

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);

  // Hook Forms
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLoginForm,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegisterForm,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      nysc_status: 'none',
      target_job_title: '',
      target_industry: '',
    }
  });

  const handleTabChange = (toLogin: boolean) => {
    clearError();
    setIsLogin(toLogin);
    setShowForgot(false);
    resetLoginForm();
    resetRegisterForm();
  };

  const onLogin = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await register(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await loginOAuth({
        provider: 'google',
        email: 'candidate.google@example.com',
        full_name: 'Google Candidate',
        avatar_url: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    try {
      await loginOAuth({
        provider: 'github',
        email: 'candidate.github@example.com',
        full_name: 'GitHub Candidate',
        avatar_url: 'https://avatars.githubusercontent.com/u/9919'
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      const msg = await forgotPassword(forgotEmail);
      setForgotMsg(msg);
    } catch (err: any) {
      console.error(err);
    }
  };

  const nyscOptions = [
    { value: 'none', label: 'Not Serviced / Not Applicable' },
    { value: 'completed', label: 'Completed (Discharge Certificate)' },
    { value: 'exempted', label: 'Exemption Certificate' },
    { value: 'serving', label: 'Currently Serving (Corper)' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Logo Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="bg-gradient-to-tr from-emerald-500 to-teal-500 p-4 rounded-3xl text-white shadow-xl shadow-emerald-500/20">
            <Briefcase size={32} />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="font-black text-slate-850 dark:text-white text-2xl tracking-tight">Naija Career AI</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-[280px]">
              Enterprise AI career assistant tailored for Nigerian job seekers
            </p>
          </div>
        </div>

        <Card className="relative overflow-hidden p-8 border border-slate-200/60 dark:border-slate-800 shadow-xl shadow-slate-100 dark:shadow-none">
          {/* Header tabs */}
          <div className="flex w-full border-b border-slate-100 dark:border-slate-800 pb-3 mb-6 gap-4 justify-center">
            <button
              onClick={() => handleTabChange(true)}
              className={`pb-1 text-sm font-bold transition-all relative ${
                isLogin && !showForgot ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              Sign In
              {isLogin && !showForgot && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-emerald-500 rounded-full"
                />
              )}
            </button>
            <button
              onClick={() => handleTabChange(false)}
              className={`pb-1 text-sm font-bold transition-all relative ${
                !isLogin && !showForgot ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-500'
              }`}
            >
              Register
              {!isLogin && !showForgot && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-emerald-500 rounded-full"
                />
              )}
            </button>
          </div>

          {/* Social OAuth Sign In Buttons for Candidates */}
          {!showForgot && (
            <div className="flex flex-col gap-2.5 mb-5 border-b border-slate-100 dark:border-slate-800 pb-5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={handleGitHubSignIn}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-slate-900 text-white border border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Continue with GitHub
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400">Or use email</span>
                <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
              </div>
            </div>
          )}

          {/* Info Alerts */}
          {sessionExpired && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-start gap-2.5 text-amber-700 dark:text-amber-300">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span className="text-xs font-semibold">Your session expired. Please sign in again.</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl flex items-start gap-2.5 text-red-600 dark:text-red-400">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span className="text-xs font-medium">{error}</span>
            </div>
          )}

          {/* Forgot Password View */}
          {showForgot ? (
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              <div className="text-left mb-2">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Reset Your Password</h3>
                <p className="text-xs text-slate-500 mt-1">Enter your registered email address and we'll issue a verification token.</p>
              </div>

              <InputField
                label="Email Address"
                placeholder="name@example.com"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />

              {forgotMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-start gap-2 text-emerald-600 text-xs">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                  <span>{forgotMsg}</span>
                </div>
              )}

              <div className="flex gap-2 mt-2">
                <Button type="button" variant="outline" onClick={() => setShowForgot(false)} className="flex-1 text-xs">
                  Back to Sign In
                </Button>
                <Button type="submit" variant="primary" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-xs">
                  Send Token
                </Button>
              </div>
            </form>
          ) : (
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                  onSubmit={handleLoginSubmit(onLogin)}
                  className="flex flex-col gap-4"
                >
                  <InputField
                    label="Email Address"
                    placeholder="name@example.com"
                    type="email"
                    error={loginErrors.email?.message}
                    {...loginRegister('email')}
                  />
                  <div>
                    <InputField
                      label="Password"
                      placeholder="••••••••"
                      type="password"
                      error={loginErrors.password?.message}
                      {...loginRegister('password')}
                    />
                    <div className="text-right mt-1">
                      <button
                        type="button"
                        onClick={() => setShowForgot(true)}
                        className="text-[11px] font-bold text-indigo-500 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    isLoading={isLoading} 
                    className="mt-2 w-full bg-emerald-500 hover:bg-emerald-600"
                  >
                    Sign In
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="register-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  onSubmit={handleRegisterSubmit(onRegister)}
                  className="flex flex-col gap-4 max-h-[45vh] overflow-y-auto pr-1"
                >
                  <InputField
                    label="Full Name"
                    placeholder="e.g. Musa Abubakar"
                    error={registerErrors.full_name?.message}
                    {...registerRegister('full_name')}
                  />
                  <InputField
                    label="Email Address"
                    placeholder="name@example.com"
                    type="email"
                    error={registerErrors.email?.message}
                    {...registerRegister('email')}
                  />
                  <InputField
                    label="Password"
                    placeholder="Min. 6 characters"
                    type="password"
                    error={registerErrors.password?.message}
                    {...registerRegister('password')}
                  />
                  <SelectField
                    label="NYSC Status"
                    options={nyscOptions}
                    error={registerErrors.nysc_status?.message}
                    {...registerRegister('nysc_status')}
                  />
                  <InputField
                    label="Target Job Title"
                    placeholder="e.g. Graduate Trainee, Software Engineer"
                    error={registerErrors.target_job_title?.message}
                    {...registerRegister('target_job_title')}
                  />
                  <InputField
                    label="Target Industry"
                    placeholder="e.g. Banking, Tech, Oil & Gas"
                    error={registerErrors.target_industry?.message}
                    {...registerRegister('target_industry')}
                  />
                  <Button variant="primary" type="submit" isLoading={isLoading} className="mt-2 w-full bg-emerald-500 hover:bg-emerald-600 shrink-0">
                    Register Account
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          )}
        </Card>

        {/* Feature Highlights */}
        <div className="flex justify-center gap-4 text-center mt-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
            <Sparkles size={12} className="text-emerald-500" />
            <span>ATS Formatting</span>
          </div>
          <span className="text-slate-300 dark:text-slate-800">•</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
            <Sparkles size={12} className="text-emerald-500" />
            <span>OAuth Social Login</span>
          </div>
          <span className="text-slate-300 dark:text-slate-800">•</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
            <Sparkles size={12} className="text-emerald-500" />
            <span>British English</span>
          </div>
        </div>
      </div>
    </div>
  );
};
