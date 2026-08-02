import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../application/context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PageSkeletonLoader } from './components/Skeleton';

// Code Splitting & Lazy Loading Page Modules
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ResumeOptimizerPage = lazy(() => import('./pages/ResumeOptimizerPage').then(m => ({ default: m.ResumeOptimizerPage })));
const CoverLetterPage = lazy(() => import('./pages/CoverLetterPage').then(m => ({ default: m.CoverLetterPage })));
const InterviewPrepPage = lazy(() => import('./pages/InterviewPrepPage').then(m => ({ default: m.InterviewPrepPage })));
const InterviewQuestionsPage = lazy(() => import('./pages/InterviewQuestionsPage').then(m => ({ default: m.InterviewQuestionsPage })));
const NyscHubPage = lazy(() => import('./pages/NyscHubPage').then(m => ({ default: m.NyscHubPage })));
const JobParserPage = lazy(() => import('./pages/JobParserPage').then(m => ({ default: m.JobParserPage })));
const JobMatchPage = lazy(() => import('./pages/JobMatchPage').then(m => ({ default: m.JobMatchPage })));
const TemplateBuilderPage = lazy(() => import('./pages/TemplateBuilderPage').then(m => ({ default: m.TemplateBuilderPage })));
const CareerInsightsPage = lazy(() => import('./pages/CareerInsightsPage').then(m => ({ default: m.CareerInsightsPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const JobBoardPage = lazy(() => import('./pages/JobBoardPage').then(m => ({ default: m.JobBoardPage })));

// Protected Layout Guard
const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 max-h-screen overflow-y-auto" role="main" aria-label="Main content">
        <ErrorBoundary>
          <Suspense fallback={<PageSkeletonLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
};

// Public Route Guard (Redirects to dashboard if already logged in)
const PublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSkeletonLoader />}>
        <Outlet />
      </Suspense>
    </ErrorBoundary>
  );
};

export const AppRouter: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<PageSkeletonLoader />}>
          <Routes>
            {/* Public SaaS Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Auth Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/auth" element={<AuthPage />} />
            </Route>

            {/* Protected Hub Routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/job-board" element={<JobBoardPage />} />
              <Route path="/resume-optimizer" element={<ResumeOptimizerPage />} />
              <Route path="/cover-letter" element={<CoverLetterPage />} />
              <Route path="/job-parser" element={<JobParserPage />} />
              <Route path="/job-match" element={<JobMatchPage />} />
              <Route path="/resume-templates" element={<TemplateBuilderPage />} />
              <Route path="/nysc-hub" element={<NyscHubPage />} />
              <Route path="/interview-prep" element={<InterviewPrepPage />} />
              <Route path="/interview-questions" element={<InterviewQuestionsPage />} />
              <Route path="/career-insights" element={<CareerInsightsPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};
