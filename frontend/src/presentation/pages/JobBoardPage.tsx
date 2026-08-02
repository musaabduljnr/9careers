import React, { useEffect, useState } from 'react';
import { useJobBoardStore } from '../../application/stores/useJobBoardStore';
import { JobFeedData, Job, OneClickPrepPackage } from '../../domain/types';
import { Card } from '../components/Card';
import { Button } from '../Button';
import { JobCard } from '../components/job_board/JobCard';
import { SmartFiltersSidebar } from '../components/job_board/SmartFiltersSidebar';
import { OneClickPrepModal } from '../components/job_board/OneClickPrepModal';
import { JobDetailsModal } from '../components/job_board/JobDetailsModal';
import { ApplicationKanbanBoard } from '../components/job_board/ApplicationKanbanBoard';
import {
  Sparkles,
  Briefcase,
  Search,
  Kanban,
  Bookmark,
  Zap,
  Flame,
  Globe2,
  Building2,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2
} from 'lucide-react';

export const JobBoardPage: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    filters,
    selectedJob,
    setSelectedJob,
    prepPackage,
    setPrepPackage,
    bookmarkedJobIds,
    toggleBookmark,
    kanban,
    setKanban,
    updateApplicationStage
  } = useJobBoardStore();

  const [feedData, setFeedData] = useState<JobFeedData | null>(null);
  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [prepLoading, setPrepLoading] = useState<boolean>(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);

  const token = localStorage.getItem('token');

  // Fetch Personalized Home Feed
  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/jobs/feed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFeedData(data);
      }
    } catch (e) {
      console.error('Failed to load feed:', e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Kanban Tracker Applications
  const fetchKanban = async () => {
    try {
      const res = await fetch('/api/v1/jobs/applications/tracker', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setKanban(data);
      }
    } catch (e) {
      console.error('Failed to load kanban:', e);
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchKanban();
  }, []);

  // Perform Smart Search when filters change
  useEffect(() => {
    if (filters.searchQuery || filters.remoteOnly || filters.experienceLevel || filters.nyscFriendly) {
      const doSearch = async () => {
        setLoading(true);
        try {
          const res = await fetch('/api/v1/jobs/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              query: filters.searchQuery || 'Software Engineer',
              remote_only: filters.remoteOnly,
              experience_level: filters.experienceLevel || undefined,
              nysc_friendly: filters.nyscFriendly
            })
          });
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data);
          }
        } catch (e) {
          console.error('Search error:', e);
        } finally {
          setLoading(false);
        }
      };
      doSearch();
    }
  }, [filters]);

  // Handle 1-Click Prep Package Generation
  const handleOneClickPrep = async (job: Job) => {
    setPrepLoading(true);
    try {
      const res = await fetch(`/api/v1/jobs/${job.id}/prepare`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const pkg: OneClickPrepPackage = await res.json();
        setPrepPackage(pkg);
      }
    } catch (e) {
      console.error('Prep package failed:', e);
    } finally {
      setPrepLoading(false);
    }
  };

  const handleUpdateStage = async (jobId: number, status: any) => {
    updateApplicationStage(jobId, status);
    try {
      await fetch('/api/v1/jobs/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ job_id: jobId, status })
      });
    } catch (e) {
      console.error('Failed to sync stage:', e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 border border-indigo-500/20 text-white space-y-4 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-400" /> AI Resume-Powered Job Discovery
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              AI Job Discovery & Application Hub
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Stop searching manually. Our AI engine compares your resume against multi-provider job listings (LinkedIn, RemoteOK, Jobberman) to surface top-fit opportunities with 1-Click application packages.
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={fetchFeed}
            className="self-start md:self-auto bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Opportunities
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 pt-4 border-t border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'feed'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Top AI Matches Feed
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'search'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Search className="w-4 h-4" /> Smart Search & Filters
          </button>

          <button
            onClick={() => setActiveTab('kanban')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'kanban'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Kanban className="w-4 h-4" /> Application Tracker Board
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="lg:hidden w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-between"
          >
            <span className="flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Filter Jobs</span>
            <span>{showFiltersMobile ? 'Hide' : 'Show'}</span>
          </button>

          <div className={`${showFiltersMobile ? 'block' : 'hidden lg:block'}`}>
            <SmartFiltersSidebar />
          </div>
        </div>

        {/* Right Tab Panel Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* TAB 1: AI PERSONALIZED FEED */}
          {activeTab === 'feed' && (
            <div className="space-y-8">
              {/* Section 1: Top AI Resume Matches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-500" /> Top AI Resume Matches (85%+ Match)
                  </h2>
                  <span className="text-xs font-semibold text-slate-500">
                    {feedData?.top_matches.length || 0} Recommended Jobs
                  </span>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800/60 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {feedData?.top_matches.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        isBookmarked={bookmarkedJobIds.has(job.id)}
                        onSelectJob={setSelectedJob}
                        onToggleBookmark={toggleBookmark}
                        onOneClickPrep={handleOneClickPrep}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: Remote Opportunities */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe2 className="w-5 h-5 text-indigo-500" /> 100% Global Remote Opportunities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {feedData?.remote_jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isBookmarked={bookmarkedJobIds.has(job.id)}
                      onSelectJob={setSelectedJob}
                      onToggleBookmark={toggleBookmark}
                      onOneClickPrep={handleOneClickPrep}
                    />
                  ))}
                </div>
              </div>

              {/* Section 3: Urgent Hiring */}
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" /> Urgent Hiring & Featured
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {feedData?.urgent_hiring.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isBookmarked={bookmarkedJobIds.has(job.id)}
                      onSelectJob={setSelectedJob}
                      onToggleBookmark={toggleBookmark}
                      onOneClickPrep={handleOneClickPrep}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SMART SEARCH */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Search Results ({searchResults.length} opportunities found)
              </h2>
              {searchResults.length === 0 ? (
                <Card className="p-8 text-center text-slate-500 text-sm">
                  No matching jobs found for your search query. Try adjusting your filters.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isBookmarked={bookmarkedJobIds.has(job.id)}
                      onSelectJob={setSelectedJob}
                      onToggleBookmark={toggleBookmark}
                      onOneClickPrep={handleOneClickPrep}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: APPLICATION KANBAN TRACKER */}
          {activeTab === 'kanban' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Kanban className="w-5 h-5 text-indigo-500" /> My Application Lifecycle Tracker
                </h2>
                <span className="text-xs text-slate-500 font-semibold">
                  Track from Saved to Offer
                </span>
              </div>
              <ApplicationKanbanBoard kanban={kanban} onUpdateStage={handleUpdateStage} />
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: 1-Click Application Prep Package */}
      {prepPackage && (
        <OneClickPrepModal
          prepPackage={prepPackage}
          onClose={() => setPrepPackage(null)}
        />
      )}

      {/* MODAL 2: Job Details Drawer */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onOneClickPrep={handleOneClickPrep}
        />
      )}
    </div>
  );
};
