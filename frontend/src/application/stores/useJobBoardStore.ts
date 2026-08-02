import { create } from './zustand';
import {
  Job,
  JobFilterState,
  OneClickPrepPackage,
  KanbanBoardState,
  JobApplicationItem
} from '../../domain/types';

export type JobBoardTab = 'feed' | 'search' | 'kanban' | 'saved';

interface JobBoardStoreState {
  activeTab: JobBoardTab;
  setActiveTab: (tab: JobBoardTab) => void;

  // Filters
  filters: JobFilterState;
  setFilter: (key: keyof JobFilterState, value: any) => void;
  resetFilters: () => void;

  // Selected Job Drawer / Modal
  selectedJob: Job | null;
  setSelectedJob: (job: Job | null) => void;

  // 1-Click Application Package
  prepPackage: OneClickPrepPackage | null;
  setPrepPackage: (pkg: OneClickPrepPackage | null) => void;

  // Bookmarks
  bookmarkedJobIds: Set<number>;
  toggleBookmark: (jobId: number) => void;

  // Kanban Tracker
  kanban: KanbanBoardState;
  setKanban: (kanban: KanbanBoardState) => void;
  updateApplicationStage: (jobId: number, status: JobApplicationItem['status']) => void;
}

const defaultFilters: JobFilterState = {
  searchQuery: '',
  role: '',
  location: '',
  remoteOnly: false,
  experienceLevel: '',
  employmentType: '',
  nyscFriendly: false,
  visaSponsorship: false
};

const defaultKanban: KanbanBoardState = {
  saved: [],
  applied: [],
  interview: [],
  assessment: [],
  offer: [],
  rejected: []
};

export const useJobBoardStore = create<JobBoardStoreState>((set) => ({
  activeTab: 'feed',
  setActiveTab: (activeTab) => set({ activeTab }),

  filters: defaultFilters,
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value }
    })),
  resetFilters: () => set({ filters: defaultFilters }),

  selectedJob: null,
  setSelectedJob: (selectedJob) => set({ selectedJob }),

  prepPackage: null,
  setPrepPackage: (prepPackage) => set({ prepPackage }),

  bookmarkedJobIds: new Set(),
  toggleBookmark: (jobId) =>
    set((state) => {
      const nextSet = new Set(state.bookmarkedJobIds);
      if (nextSet.has(jobId)) {
        nextSet.delete(jobId);
      } else {
        nextSet.add(jobId);
      }
      return { bookmarkedJobIds: nextSet };
    }),

  kanban: defaultKanban,
  setKanban: (kanban) => set({ kanban }),
  updateApplicationStage: (jobId, status) =>
    set((state) => {
      // Move application to new column
      const allApps: JobApplicationItem[] = Object.values(state.kanban).flat();
      const existing = allApps.find((a) => a.job_id === jobId);

      const nextKanban: KanbanBoardState = {
        saved: state.kanban.saved.filter((a) => a.job_id !== jobId),
        applied: state.kanban.applied.filter((a) => a.job_id !== jobId),
        interview: state.kanban.interview.filter((a) => a.job_id !== jobId),
        assessment: state.kanban.assessment.filter((a) => a.job_id !== jobId),
        offer: state.kanban.offer.filter((a) => a.job_id !== jobId),
        rejected: state.kanban.rejected.filter((a) => a.job_id !== jobId)
      };

      if (existing) {
        const updatedApp = { ...existing, status };
        if (nextKanban[status]) {
          nextKanban[status].push(updatedApp);
        }
      }
      return { kanban: nextKanban };
    })
}));
