import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  nysc_status: z.enum(['completed', 'exempted', 'serving', 'none']),
  target_job_title: z.string().min(2, 'Target job title must be at least 2 characters'),
  target_industry: z.string().min(2, 'Target industry must be at least 2 characters'),
});

export const profileUpdateSchema = registerSchema;

export const coverLetterSchema = z.object({
  resume_id: z.string().min(1, 'Please select a resume'),
  company_name: z.string().min(2, 'Company name is required'),
  job_title: z.string().min(2, 'Job title is required'),
  job_description: z.string().optional(),
  tone: z.enum(['Professional', 'Confident', 'Friendly']),
  hiring_manager: z.string().optional(),
});

export const interviewStartSchema = z.object({
  job_role: z.string().min(2, 'Job role is required'),
  industry: z.string().min(2, 'Industry is required'),
});

export const jobAnalysisSchema = z.object({
  job_title: z.string().min(2, 'Job title is required'),
  company: z.string().min(2, 'Company name is required'),
  job_description: z.string().min(10, 'Job description must be at least 10 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type CoverLetterFormValues = z.infer<typeof coverLetterSchema>;
export type InterviewStartFormValues = z.infer<typeof interviewStartSchema>;
export type JobAnalysisFormValues = z.infer<typeof jobAnalysisSchema>;
export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;
