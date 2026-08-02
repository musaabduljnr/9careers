export interface User {
  id: number;
  email: string;
  full_name: string;
  nysc_status: 'completed' | 'exempted' | 'serving' | 'none';
  target_job_title: string;
  target_industry: string;
  is_verified?: boolean;
  provider?: 'email' | 'google' | 'github';
  avatar_url?: string | null;
  phone_number?: string | null;
  subscription_plan?: 'free' | 'pro' | 'graduate_pass' | 'enterprise';
  subscription_status?: 'active' | 'trialing' | 'cancelled' | 'past_due';
  created_at: string;
}

export interface Resume {
  id: number;
  user_id: number;
  file_name: string;
  original_text: string;
  parsed_json: {
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    nysc_mentioned?: boolean;
    education?: Array<{
      school: string;
      degree: string;
      grade: string;
      graduation_year: string;
    }>;
    experience?: Array<{
      company: string;
      role: string;
      duration: string;
      achievements: string[];
    }>;
    projects?: Array<{
      name: string;
      description: string;
      technologies: string[];
    }>;
    skills?: string[];
    certifications?: string[];
    languages?: string[];
    volunteer_work?: Array<{
      organisation: string;
      role: string;
      duration: string;
      description: string;
    }>;
  };
  tailored_text: string | null;
  ats_score: number;
  ats_feedback: {
    missing_skills: string[];
    improvements: string[];
    structure_rating: string;
    nysc_recommendation: string;
    last_tailoring_adjustments?: string[];
    score_breakdown?: {
      grammar: number;
      formatting: number;
      keyword: number;
      impact: number;
      skills: number;
    };
    detailed_analysis?: {
      readability: string;
      achievements: string[];
      action_verbs: string[];
      weak_bullet_points: Array<{
        original: string;
        issue: string;
        suggested_rewrite: string;
      }>;
      missing_keywords: string[];
      missing_skills: string[];
      red_flags: string[];
      recommendations: string[];
    };
  };
  created_at: string;
}

export interface CoverLetter {
  id: number;
  user_id: number;
  company_name: string;
  job_title: string;
  content: string;
  created_at: string;
}

export interface InterviewQuestion {
  id?: number;
  question_text: string;
  user_answer?: string;
  ai_feedback?: string;
  ai_score?: number;
  question_order: number;
}

export interface InterviewSession {
  id: string;
  user_id: number;
  job_role: string;
  industry: string;
  status: 'active' | 'completed';
  feedback_overall?: string;
  score?: number;
  questions: InterviewQuestion[];
  created_at: string;
}

export interface JobAnalysis {
  id: number;
  user_id: number;
  job_title: string;
  company: string;
  job_description: string;
  skills_required: string[];
  salary_benchmark: string;
  nysc_required: boolean;
  parsed_json?: {
    company?: string;
    job_title?: string;
    location?: string;
    experience?: string;
    required_skills?: string[];
    preferred_skills?: string[];
    responsibilities?: string[];
    education?: string;
    salary?: string;
    benefits?: string[];
    keywords?: string[];
    nysc_required?: boolean;
  };
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// --- Interview Question Generator Types ---
export interface ScoringRubric {
  key_criteria: string[];
  score_1_2: string;
  score_3: string;
  score_4_5: string;
}

export interface StarBreakdown {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface GeneratedInterviewQuestion {
  id: string;
  question_type: 'Technical' | 'Behavioral' | 'HR' | 'Situational' | 'STAR';
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  why_asked: string;
  model_answer: string;
  star_breakdown: StarBreakdown | null;
  scoring_rubric: ScoringRubric;
  follow_up_questions: string[];
  keywords_to_include: string[];
}

export interface InterviewQuestionBank {
  job_title: string;
  company_name: string;
  total_questions: number;
  questions: GeneratedInterviewQuestion[];
  preparation_tips: string[];
  company_research_notes: string;
}

// --- Enterprise AI Interview Simulator Types ---
export type InterviewModeType =
  | 'General HR'
  | 'Behavioral'
  | 'Technical'
  | 'Software Engineering'
  | 'Frontend'
  | 'Backend'
  | 'Python'
  | 'React'
  | 'AI Engineer'
  | 'Data Analyst'
  | 'Product Manager'
  | 'UI/UX Designer'
  | 'Customer Support'
  | 'Sales'
  | 'Graduate'
  | 'NYSC'
  | 'Internship'
  | 'Remote Jobs'
  | 'Custom Interview';

export type DifficultyLevel = 'junior' | 'mid' | 'senior' | 'principal';
export type InterviewStyle = 'friendly' | 'professional' | 'strict' | 'startup' | 'corporate';
export type DurationMinutes = 10 | 20 | 30 | 45;

export interface InterviewSetupConfig {
  interview_type: InterviewModeType;
  job_role: string;
  company: string;
  difficulty: DifficultyLevel;
  duration_minutes: DurationMinutes;
  interview_style: InterviewStyle;
  voice_enabled: boolean;
  language: string;
  resume_text: string;
  job_description: string;
}

export interface PrepProfile {
  candidate_summary: string;
  target_role: string;
  company: string;
  difficulty: string;
  key_strengths: string[];
  perceived_weaknesses: string[];
  missing_skills: string[];
  likely_questions: string[];
  interview_strategy: string;
  focus_areas: string[];
}

export interface ScoreBreakdown {
  communication: number;
  technical_accuracy: number;
  problem_solving: number;
  leadership: number;
  confidence: number;
  star_method: number;
  clarity: number;
  depth: number;
  relevance: number;
  professionalism: number;
}

export interface TranscriptItem {
  order: number;
  category: string;
  question: string;
  answer: string;
  feedback?: string;
  score?: number;
  scores_detail?: ScoreBreakdown;
  timestamp?: string;
}

export interface CoachAdviceData {
  what_went_well: string;
  what_needs_improvement: string;
  example_better_answers: Array<{
    question: string;
    better_answer: string;
  }>;
  action_plan: string[];
}

export interface InterviewReportData {
  session_id: string;
  job_role: string;
  company: string;
  interview_type: string;
  difficulty: string;
  overall_score: number;
  hiring_recommendation: string;
  likelihood_of_passing_percent: number;
  category_scores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  missed_opportunities: string[];
  recommended_improvements: string[];
  coach_advice: CoachAdviceData;
  transcript: TranscriptItem[];
}

// --- Enterprise AI Job Board Types ---
export interface JobMatchBreakdown {
  overall_match_score: number;
  skill_match_score: number;
  experience_match_score: number;
  education_match_score: number;
  keyword_match_score: number;
  interview_likelihood_percent: number;
  readiness_percent: number;
  missing_skills: string[];
  missing_keywords: string[];
  match_reasons: string[];
  learning_path: string[];
}

export interface Job {
  id: number;
  title: string;
  company_name: string;
  company_logo?: string | null;
  source_name: string;
  location: string;
  remote_status: 'Remote' | 'Hybrid' | 'Onsite';
  employment_type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  experience_level: 'Entry Level' | 'Mid Level' | 'Senior' | 'Executive';
  salary_formatted: string;
  skills: string[];
  tags: string[];
  date_posted: string;
  is_featured?: boolean;
  is_urgent?: boolean;
  visa_sponsorship?: boolean;
  nysc_friendly?: boolean;
  description?: string;
  responsibilities?: string[];
  qualifications?: string[];
  benefits?: string[];
  application_url?: string;
  match?: JobMatchBreakdown;
}

export interface CompanySummary {
  id: number;
  name: string;
  logo_url?: string | null;
  industry: string;
  open_positions_count: number;
  average_match_score: number;
  description?: string;
  website?: string;
  headquarters?: string;
  size?: string;
}

export interface JobFeedData {
  top_matches: Job[];
  recently_posted: Job[];
  remote_jobs: Job[];
  urgent_hiring: Job[];
  trending_companies: CompanySummary[];
  total_jobs_count: number;
}

export interface OneClickPrepPackage {
  job_id: number;
  job_title: string;
  company_name: string;
  tailored_resume_text: string;
  cover_letter_text: string;
  estimated_ats_score: number;
  expected_interview_questions: string[];
  company_research_notes: string;
  application_checklist: string[];
}

export interface JobApplicationItem {
  application_id: number;
  job_id: number;
  status: 'saved' | 'applied' | 'interview' | 'assessment' | 'offer' | 'rejected' | 'withdrawn';
  notes?: string | null;
  job_title: string;
  company_name: string;
  company_logo?: string | null;
  location: string;
  applied_at: string;
}

export interface KanbanBoardState {
  saved: JobApplicationItem[];
  applied: JobApplicationItem[];
  interview: JobApplicationItem[];
  assessment: JobApplicationItem[];
  offer: JobApplicationItem[];
  rejected: JobApplicationItem[];
}

export interface JobFilterState {
  searchQuery: string;
  role: string;
  location: string;
  remoteOnly: boolean;
  experienceLevel: string;
  employmentType: string;
  nyscFriendly: boolean;
  visaSponsorship: boolean;
}
