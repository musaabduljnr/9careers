import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../application/context/AuthContext';
import { loginSchema, LoginFormValues } from '../../domain/validation';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminLoginPage: React.FC = () => {
  const { loginAdmin, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    clearError();
    try {
      await loginAdmin(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Header Logo & Shield */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-4 rounded-3xl text-white shadow-xl shadow-indigo-500/20">
            <ShieldCheck size={36} />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="font-black text-white text-2xl tracking-tight">Admin Portal</h1>
            <p className="text-xs text-slate-400 font-semibold">
              Restricted Area — Authenticated personnel only
            </p>
          </div>
        </div>

        <Card className="relative overflow-hidden p-8 border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-900/60 rounded-xl flex items-start gap-2.5 text-red-400">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span className="text-xs font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <InputField
              label="Admin Email"
              placeholder="admin@example.com"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <InputField
              label="Password"
              placeholder="••••••••"
              type="password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              variant="primary"
              type="submit"
              isLoading={isLoading}
              className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 text-white font-bold py-2.5"
            >
              Sign In to Admin Portal
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-center">
            <Link
              to="/auth"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium"
            >
              <ArrowLeft size={14} />
              Return to Candidate Portal
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
