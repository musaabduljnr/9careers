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
