import json
import logging
from typing import Dict, Any, List, Optional
from backend.app.domain.models import User, Resume, CoverLetter, InterviewSession, InterviewQuestion, JobAnalysis
from backend.app.domain.interfaces import (
    AIProvider, UserRepository, ResumeRepository, CoverLetterRepository, InterviewRepository, JobAnalysisRepository
)

logger = logging.getLogger(__name__)

class ScoreResumeUseCase:
    def __init__(self, ai_provider: AIProvider, resume_repo: ResumeRepository):
        self.ai_provider = ai_provider
        self.resume_repo = resume_repo

    async def execute(self, user: User, resume_text: str, file_name: str) -> Resume:
        system_instruction = (
            "You are an expert ATS (Applicant Tracking System) scanner and career coach specializing in the Nigerian job market. "
            "Your job is to analyze the candidate's resume and calculate an ATS match score (0-100), parse the resume sections, "
            "identify missing skills/keywords, and provide constructive optimization tips. "
            "Pay close attention to Nigerian job recruitment nuances: "
            "1. Highlight if NYSC (National Youth Service Corps) status is listed (completed, currently serving, or exempted) as this is critical for Nigerian roles. "
            "2. Look for grade classifications (e.g., First Class, Second Class Upper/2:1) which are highly valued in local graduate applications. "
            "3. Identify local professional certifications (e.g., ICAN, COREN, NIM, CIPM, CITN) relevant to the industry. "
            "4. Ensure British English spelling is used (e.g., 'organisation', 'programme', 'optimisation') as is standard in Nigeria."
        )

        prompt = (
            f"Candidate Name: {user.full_name}\n"
            f"Target Job Title: {user.target_job_title}\n"
            f"Target Industry: {user.target_industry}\n"
            f"NYSC Status: {user.nysc_status}\n\n"
            f"Resume Text:\n{resume_text}"
        )

        schema = {
            "ats_score": "integer (0 to 100 representing overall match quality)",
            "score_breakdown": {
                "grammar": "integer (0 to 100 grammar score)",
                "formatting": "integer (0 to 100 formatting score)",
                "keyword": "integer (0 to 100 keyword density score)",
                "impact": "integer (0 to 100 results/metrics impact score)",
                "skills": "integer (0 to 100 core skills score)"
            },
            "detailed_analysis": {
                "readability": "string (Excellent, Good, Needs Improvement)",
                "achievements": "list of strings (strong metrics-driven accomplishments found in the CV)",
                "action_verbs": "list of strings (strong verbs used, e.g. Led, Orchestrated, Designed)",
                "weak_bullet_points": "list of objects with keys: original (the weak bullet point text), issue (why it is weak), suggested_rewrite (better version with metrics and action verbs)",
                "missing_keywords": "list of strings (job description keywords that are missing)",
                "missing_skills": "list of strings (specific target skills that are missing)",
                "red_flags": "list of strings (e.g. gaps in dates, lack of metrics, bad section layout, contact info issues)",
                "recommendations": "list of strings (actionable steps to raise the score)"
            },
            "parsed_profile": {
                "name": "string (candidate full name)",
                "email": "string (candidate email address)",
                "phone": "string (candidate phone number)",
                "linkedin": "string (LinkedIn profile URL or empty)",
                "github": "string (Github profile URL or empty)",
                "portfolio": "string (Portfolio website URL or empty)",
                "nysc_mentioned": "boolean (true if NYSC status is mentioned in the text)",
                "education": "list of objects with keys: school, degree, grade (e.g. 2:1), graduation_year",
                "experience": "list of objects with keys: company, role, duration, achievements (list of strings)",
                "projects": "list of objects with keys: name, description, technologies (list of strings)",
                "skills": "list of strings",
                "certifications": "list of strings",
                "languages": "list of strings",
                "volunteer_work": "list of objects with keys: organisation, role, duration, description"
            },
            "nysc_recommendation": "string (advice on how to write or position their NYSC/PPA experience)"
        }

        # Request JSON response
        result_json = await self.ai_provider.generate_json(
            prompt=prompt,
            schema=json.dumps(schema, indent=2),
            system_instruction=system_instruction
        )

        detailed = result_json.get("detailed_analysis", {})

        # Create Resume entity
        resume = Resume(
            user_id=user.id or 0,
            file_name=file_name,
            original_text=resume_text,
            parsed_json=result_json.get("parsed_profile", {}),
            ats_score=result_json.get("ats_score", 0),
            ats_feedback={
                "score_breakdown": result_json.get("score_breakdown", {
                    "grammar": 70, "formatting": 70, "keyword": 70, "impact": 70, "skills": 70
                }),
                "detailed_analysis": {
                    "readability": detailed.get("readability", "Needs Improvement"),
                    "achievements": detailed.get("achievements", []),
                    "action_verbs": detailed.get("action_verbs", []),
                    "weak_bullet_points": detailed.get("weak_bullet_points", []),
                    "missing_keywords": detailed.get("missing_keywords", []),
                    "missing_skills": detailed.get("missing_skills", []),
                    "red_flags": detailed.get("red_flags", []),
                    "recommendations": detailed.get("recommendations", [])
                },
                "missing_skills": detailed.get("missing_skills", []),
                "improvements": detailed.get("recommendations", []),
                "structure_rating": detailed.get("readability", "Needs Improvement"),
                "nysc_recommendation": result_json.get("nysc_recommendation", "")
            }
        )

        # Save to database
        saved_resume = await self.resume_repo.create(resume)
        return saved_resume


class TailorResumeUseCase:
    def __init__(self, ai_provider: AIProvider, resume_repo: ResumeRepository):
        self.ai_provider = ai_provider
        self.resume_repo = resume_repo

    async def execute(self, resume_id: int, job_description: str, tone: str) -> Resume:
        resume = await self.resume_repo.get_by_id(resume_id)
        if not resume:
            raise ValueError(f"Resume with ID {resume_id} not found")

        system_instruction = (
            "You are a professional resume writer specializing in the Nigerian and international remote job markets. "
            "Your task is to rewrite the work experience and skills sections of the resume to align with the provided "
            "job description, using ATS-friendly keywords and active verbs. "
            "Rules:\n"
            "1. DO NOT fabricate qualifications, degrees, or companies.\n"
            "2. Adapt the phrasing of achievements to highlight skills requested in the job description using the STAR method (Situation, Task, Action, Result).\n"
            "3. Use British English (e.g., 'behaviour', 'analyse', 'modelling') which is the standard in Nigeria.\n"
            "4. Optimize tone based on request: 'Nigerian Corporate' (formal, respectful, hierarchical), 'Tech Startup' (modern, action-driven, impact-focused), or 'International Remote' (outcome-oriented, global standard, clear value proposition).\n"
            "5. If NYSC / PPA (Primary Place of Assignment) is listed, present it professionally as structural work experience."
        )

        prompt = (
            f"Original Resume Text:\n{resume.original_text}\n\n"
            f"Target Job Description:\n{job_description}\n\n"
            f"Desired Tone: {tone}\n\n"
            f"Rewrite the resume. Provide the full tailored text and a summary of key adjustments."
        )

        schema = {
            "tailored_text": "string (the complete updated resume text, formatted professionally)",
            "key_adjustments": "list of strings (summary of what was changed and why, e.g. 'Added Python and SQL keywords to match job requirements')"
        }

        result_json = await self.ai_provider.generate_json(
            prompt=prompt,
            schema=json.dumps(schema, indent=2),
            system_instruction=system_instruction
        )

        resume.tailored_text = result_json.get("tailored_text", "")
        # Add adjustments to feedback
        if not resume.ats_feedback:
            resume.ats_feedback = {}
        resume.ats_feedback["last_tailoring_adjustments"] = result_json.get("key_adjustments", [])
        
        updated_resume = await self.resume_repo.update(resume)
        return updated_resume


class GenerateCoverLetterUseCase:
    def __init__(self, ai_provider: AIProvider, cover_letter_repo: CoverLetterRepository, resume_repo: ResumeRepository):
        self.ai_provider = ai_provider
        self.cover_letter_repo = cover_letter_repo
        self.resume_repo = resume_repo

    async def execute(
        self, 
        user_id: int, 
        resume_id: int,
        company_name: str, 
        job_title: str, 
        job_description: Optional[str], 
        tone: str, 
        hiring_manager: Optional[str] = None
    ) -> CoverLetter:
        # Retrieve the resume
        resume = await self.resume_repo.get_by_id(resume_id)
        if not resume or resume.user_id != user_id:
            raise ValueError("Resume not found or access denied")
            
        resume_content = resume.original_text
        
        system_instruction = (
            "You are a premium career consultant. Write a bespoke, highly compelling, ATS-friendly one-page cover letter. "
            "IMPORTANT CONSTRAINTS:\n"
            "1. NEVER hallucinate any experience, certifications, skills, education, or projects. ONLY use verified details "
            "directly present in the provided Candidate Resume.\n"
            "2. Keep the letter concise (under 400 words) and formatted professionally.\n"
            "3. Support both Nigerian and international job application conventions: use British English spelling conventions "
            "(e.g., 'organisation', 'programme') and mention NYSC service details if present in the resume.\n"
            "4. Tone must match the selection: 'Professional' (formal, traditional, respectful), 'Confident' (bold, metrics-driven, impact-focused), or 'Friendly' (warm, values-driven, collaborative).\n"
            "5. Address the letter to the Hiring Manager if a name is provided, otherwise address it to 'Dear Hiring Manager'."
        )

        salutation = f"Dear {hiring_manager}," if hiring_manager else "Dear Hiring Manager,"

        prompt = (
            f"Candidate Name: {resume.parsed_json.get('name', 'Applicant')}\n"
            f"Candidate Contact: {resume.parsed_json.get('email', '')} | {resume.parsed_json.get('phone', '')}\n"
            f"Target Company: {company_name}\n"
            f"Target Position: {job_title}\n"
            f"Hiring Manager: {hiring_manager or 'Not specified'}\n"
            f"Salutation Style: {salutation}\n"
            f"Tone/Style Selection: {tone}\n"
            f"Job Description:\n{job_description or 'Not provided'}\n\n"
            f"Candidate Resume Details:\n{resume_content[:3000]}\n\n"
            f"Generate the full letter contents including the standard cover letter header (Date, recipient company name, address placeholder, salutation, body text, and signature sign-off)."
        )

        schema = {
            "cover_letter_content": "string (the complete formatted cover letter)"
        }

        result_json = await self.ai_provider.generate_json(
            prompt=prompt,
            schema=json.dumps(schema, indent=2),
            system_instruction=system_instruction
        )

        cl = CoverLetter(
            user_id=user_id,
            company_name=company_name,
            job_title=job_title,
            content=result_json.get("cover_letter_content", "")
        )

        saved_cl = await self.cover_letter_repo.create(cl)
        return saved_cl


class InterviewSimulatorUseCase:
    def __init__(self, ai_provider: AIProvider, interview_repo: InterviewRepository, user_repo: UserRepository):
        self.ai_provider = ai_provider
        self.interview_repo = interview_repo
        self.user_repo = user_repo

    async def start_session(self, user_id: int, job_role: str, industry: str) -> InterviewSession:
        user = await self.user_repo.get_by_id(user_id)
        user_name = user.full_name if user else "Candidate"
        
        system_instruction = (
            "You are an experienced HR Director at a leading firm in Nigeria (e.g. GTBank, Paystack, MTN, Unilever). "
            "Your goal is to conduct a mock job interview for a candidate. "
            "You ask one clear question at a time. "
            "Adopt the voice of a professional, polite, yet strict interviewer. "
            "Generate a welcoming first question appropriate for the job role and industry. "
            "Mention the company/firm context naturally (e.g., 'Welcome to GTB, we are glad to have you for this Graduate Trainee interview...')."
        )

        prompt = (
            f"Candidate Name: {user_name}\n"
            f"Job Role: {job_role}\n"
            f"Industry: {industry}\n"
            f"NYSC Status: {user.nysc_status if user else 'Completed'}\n\n"
            f"Generate the first interview question. Keep it brief and engaging."
        )

        schema = {
            "question": "string (the first interview question)"
        }

        result_json = await self.ai_provider.generate_json(
            prompt=prompt,
            schema=json.dumps(schema, indent=2),
            system_instruction=system_instruction
        )

        first_question_text = result_json.get("question", "Tell me about yourself and why you are interested in this role.")

        session = InterviewSession(
            user_id=user_id,
            job_role=job_role,
            industry=industry,
            status="active"
        )
        
        first_q = InterviewQuestion(
            question_text=first_question_text,
            question_order=1
        )
        session.questions.append(first_q)

        saved_session = await self.interview_repo.create_session(session)
        return saved_session

    async def respond_to_question(self, session_id: str, user_answer: str) -> Dict[str, Any]:
        session = await self.interview_repo.get_session_by_id(session_id)
        if not session:
            raise ValueError(f"Interview session {session_id} not found")
        if session.status == "completed":
            raise ValueError("This interview session has already ended")

        # Find the active unanswered question (the last one)
        active_q = session.questions[-1]
        active_q.user_answer = user_answer

        # Evaluate the user's answer
        eval_system_instruction = (
            "You are an expert HR Interviewer in Nigeria. Evaluate the user's response to the interview question. "
            "Score the answer from 0 to 100 based on structure (STAR method), clarity, relevance, and local business norms. "
            "Highlight if they used appropriate terminology. "
            "Point out any 'Nigerianisms' that could be optimized for a global or corporate audience (e.g. suggesting British/Standard equivalents if applicable, like 'did my internship' instead of 'ran my IT'). "
            "Be constructive and supportive."
        )

        eval_prompt = (
            f"Job Role: {session.job_role}\n"
            f"Question Asked: {active_q.question_text}\n"
            f"User Answer: {user_answer}\n"
            f"Please score the answer, provide detailed coaching tips, and give the next question or signal that this was the final question."
        )

        # Standard session length: 4 questions.
        is_final_round = len(session.questions) >= 4

        eval_schema = {
            "score": "integer (0 to 100)",
            "feedback": "string (constructive critique, pointing out pros and areas of improvement, and local corporate optimizations)",
            "next_question": "string (the next question to ask, or empty string if this was the last round)"
        }

        eval_result = await self.ai_provider.generate_json(
            prompt=eval_prompt,
            schema=json.dumps(eval_schema, indent=2),
            system_instruction=eval_system_instruction
        )

        # Update current question with feedback
        active_q.ai_score = eval_result.get("score", 70)
        active_q.ai_feedback = eval_result.get("feedback", "Good effort.")
        await self.interview_repo.update_question(active_q)

        # Determine if we should end the interview
        next_question_text = eval_result.get("next_question", "")
        
        if is_final_round or not next_question_text:
            # End session and generate overall feedback
            session.status = "completed"
            
            # Calculate average score
            total_score = sum([q.ai_score or 0 for q in session.questions[:-1]]) + active_q.ai_score
            avg_score = int(total_score / len(session.questions))
            session.score = avg_score

            # Generate overall summary
            summary_system = "You are a senior career mentor. Provide a summary review of the candidate's interview performance."
            summary_prompt = (
                f"Job Role: {session.job_role}\n"
                f"Completed Interview questions and scores:\n" + 
                "\n".join([f"Q: {q.question_text}\nA: {q.user_answer}\nScore: {q.ai_score}\nFeedback: {q.ai_feedback}" for q in session.questions]) + 
                f"\n\nAverage Score: {avg_score}/100. Write a final feedback report summarizing their strengths and top 3 growth areas."
            )
            
            summary_schema = {"report": "string (detailed feedback report with Markdown formatting)"}
            summary_result = await self.ai_provider.generate_json(summary_prompt, json.dumps(summary_schema), summary_system)
            
            session.feedback_overall = summary_result.get("report", "Excellent interview overall. Work on structuring your answers using the STAR format.")
            await self.interview_repo.update_session(session)
            
            return {
                "session_status": "completed",
                "feedback": active_q.ai_feedback,
                "score": active_q.ai_score,
                "overall_feedback": session.feedback_overall,
                "overall_score": session.score
            }
        else:
            # Add next question
            next_q = InterviewQuestion(
                question_text=next_question_text,
                question_order=len(session.questions) + 1
            )
            await self.interview_repo.add_question(session.id, next_q)
            
            return {
                "session_status": "active",
                "feedback": active_q.ai_feedback,
                "score": active_q.ai_score,
                "next_question": next_question_text,
                "question_order": next_q.question_order
            }


class AnalyzeJobDescriptionUseCase:
    def __init__(self, ai_provider: AIProvider, job_repo: JobAnalysisRepository):
        self.ai_provider = ai_provider
        self.job_repo = job_repo

    async def execute(self, user_id: int, job_title: str, company: str, job_description: str) -> JobAnalysis:
        system_instruction = (
            "You are an expert talent acquisition specialist and job analyst specializing in the Nigerian job market. "
            "Your job is to analyze the provided job description and extract structured information, "
            "converting all details into clean JSON. "
            "Pay close attention to Nigerian location standards, local salary NGN benchmarks, and NYSC requirements. "
            "If NGN salary is not specified, estimate a benchmark standard for Nigeria based on common local salary tiers "
            "(e.g. entry-level banking 150k-250k/mo, junior tech startup 300k-500k/mo, mid tech 600k-1.2m/mo). "
            "Represent the benchmark as a range string (e.g. '₦350,000 - ₦500,000 / month')."
        )

        prompt = (
            f"Default Job Title Suggestion: {job_title}\n"
            f"Default Company Suggestion: {company}\n"
            f"Job Description Text:\n{job_description}"
        )

        schema = {
            "company": "string (name of the company offering the job)",
            "job_title": "string (the official job title)",
            "location": "string (e.g. Lagos, Abuja, Remote)",
            "experience": "string (required years of experience or tier, e.g. 2-3 years, Entry Level)",
            "required_skills": "list of strings (mandatory technical or soft skills)",
            "preferred_skills": "list of strings (nice-to-have skills)",
            "responsibilities": "list of strings (key duties and tasks)",
            "education": "string (required degree or level of education, e.g. B.Sc. in Computer Science)",
            "salary": "string (salary range mentioned, or estimated benchmark NGN e.g., '₦300,000 - ₦450,000 / month')",
            "benefits": "list of strings (perks, medical cover, pension, allowances)",
            "keywords": "list of strings (critical search terms for ATS scanners representing this job)",
            "nysc_required": "boolean (true if NYSC completion is mentioned or typically required in Nigeria for this role)"
        }

        result_json = await self.ai_provider.generate_json(
            prompt=prompt,
            schema=json.dumps(schema, indent=2),
            system_instruction=system_instruction
        )

        analysis = JobAnalysis(
            user_id=user_id,
            job_title=result_json.get("job_title", job_title or "Job Title"),
            company=result_json.get("company", company or "Company"),
            job_description=job_description,
            skills_required=result_json.get("required_skills", []),
            salary_benchmark=result_json.get("salary", "₦150,000 - ₦250,000 / month"),
            nysc_required=result_json.get("nysc_required", False),
            parsed_json=result_json
        )

        saved_analysis = await self.job_repo.create(analysis)
        return saved_analysis


class SemanticJobMatchUseCase:
    def __init__(self, ai_provider: AIProvider):
        self.ai_provider = ai_provider

    async def execute(
        self, 
        resume_text: str, 
        resume_parsed_json: Dict[str, Any], 
        job_description_text: str, 
        job_parsed_json: Dict[str, Any]
    ) -> Dict[str, Any]:
        # 1. Generate overall embeddings
        emb_resume = await self.ai_provider.generate_embedding(resume_text)
        emb_job = await self.ai_provider.generate_embedding(job_description_text)
        overall_sim = self._cosine_similarity(emb_resume, emb_job)
        
        # Scale similarity metric to 0-100 score
        overall_score = int(max(0.0, min(1.0, (overall_sim - 0.5) / 0.35)) * 100)

        # 2. Section embeddings similarity checks
        # Skills match
        resume_skills = resume_parsed_json.get("skills", [])
        job_skills = job_parsed_json.get("required_skills", []) or job_parsed_json.get("skills_required", [])
        resume_skills_text = ", ".join(resume_skills) if resume_skills else ""
        job_skills_text = ", ".join(job_skills) if job_skills else ""
        
        skills_score = 50
        if resume_skills_text.strip() and job_skills_text.strip():
            emb_res_skills = await self.ai_provider.generate_embedding(resume_skills_text)
            emb_job_skills = await self.ai_provider.generate_embedding(job_skills_text)
            sim_skills = self._cosine_similarity(emb_res_skills, emb_job_skills)
            skills_score = int(max(0.0, min(1.0, (sim_skills - 0.4) / 0.5)) * 100)

        # Experience match
        exp_list = resume_parsed_json.get("experience", []) or []
        resume_exp_text = "\n".join([f"{e.get('role', '')} at {e.get('company', '')}: " + " ".join(e.get("achievements", [])) for e in exp_list])
        job_resp = job_parsed_json.get("responsibilities", []) or []
        job_exp_text = "\n".join(job_resp) if job_resp else ""
        
        exp_score = 50
        if resume_exp_text.strip() and job_exp_text.strip():
            emb_res_exp = await self.ai_provider.generate_embedding(resume_exp_text)
            emb_job_exp = await self.ai_provider.generate_embedding(job_exp_text)
            sim_exp = self._cosine_similarity(emb_res_exp, emb_job_exp)
            exp_score = int(max(0.0, min(1.0, (sim_exp - 0.5) / 0.35)) * 100)

        # Education match
        edu_list = resume_parsed_json.get("education", []) or []
        resume_edu_text = "\n".join([f"{edu.get('degree', '')} from {edu.get('school', '')}" for edu in edu_list])
        job_edu_text = job_parsed_json.get("education", "") or ""
        
        edu_score = 50
        if resume_edu_text.strip() and job_edu_text.strip():
            emb_res_edu = await self.ai_provider.generate_embedding(resume_edu_text)
            emb_job_edu = await self.ai_provider.generate_embedding(job_edu_text)
            sim_edu = self._cosine_similarity(emb_res_edu, emb_job_edu)
            edu_score = int(max(0.0, min(1.0, (sim_edu - 0.4) / 0.5)) * 100)

        # Keyword match
        job_kw = job_parsed_json.get("keywords", []) or []
        keyword_score = 50
        if resume_skills and job_kw:
            res_kw_text = " ".join(resume_skills)
            job_kw_text = " ".join(job_kw)
            emb_res_kw = await self.ai_provider.generate_embedding(res_kw_text)
            emb_job_kw = await self.ai_provider.generate_embedding(job_kw_text)
            sim_kw = self._cosine_similarity(emb_res_kw, emb_job_kw)
            keyword_score = int(max(0.0, min(1.0, (sim_kw - 0.45) / 0.45)) * 100)

        calculated_overall = int((overall_score * 0.4) + (skills_score * 0.25) + (exp_score * 0.25) + (edu_score * 0.1))

        # 3. Request explanation and coaching details
        system_instruction = (
            "You are a Senior Talent Consultant. Given the calculated semantic similarity scores between a candidate's resume and a job description, "
            "provide a detailed matching report. Assess the likelihood of an interview (High, Medium, Low), list missing skills, "
            "and provide clear, actionable recommendations."
        )

        prompt = (
            f"Candidate Resume (Text snippet):\n{resume_text[:1500]}\n\n"
            f"Job Description (Text snippet):\n{job_description_text[:1500]}\n\n"
            f"Calculated Semantic Scores:\n"
            f"- Overall Match: {calculated_overall}%\n"
            f"- Skills Match: {skills_score}%\n"
            f"- Experience Match: {exp_score}%\n"
            f"- Keyword Match: {keyword_score}%\n"
            f"- Education Match: {edu_score}%\n"
        )

        schema = {
            "likelihood_of_interview": "string (High, Medium, Low)",
            "skills_match_explanation": "string (detailed review of how skills compare semantically)",
            "experience_match_explanation": "string (how responsibilities compare to the achievements list)",
            "education_match_explanation": "string (how education credentials match requirements)",
            "missing_skills": "list of strings (crucial skills missing from the candidate's profile)",
            "recommendations": "list of strings (steps to take to align the resume closer to the job description)"
        }

        result_json = await self.ai_provider.generate_json(
            prompt=prompt,
            schema=json.dumps(schema, indent=2),
            system_instruction=system_instruction
        )

        return {
            "overall_match_percentage": calculated_overall,
            "skills_match_score": skills_score,
            "experience_match_score": exp_score,
            "keyword_match_score": keyword_score,
            "education_match_score": edu_score,
            "likelihood_of_interview": result_json.get("likelihood_of_interview", "Medium"),
            "explanations": {
                "skills": result_json.get("skills_match_explanation", ""),
                "experience": result_json.get("experience_match_explanation", ""),
                "education": result_json.get("education_match_explanation", "")
            },
            "missing_skills": result_json.get("missing_skills", []),
            "recommendations": result_json.get("recommendations", [])
        }

    def _cosine_similarity(self, v1: List[float], v2: List[float]) -> float:
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        dot_product = sum([a * b for a, b in zip(v1, v2)])
        magnitude_1 = sum([a**2 for a in v1])**0.5
        magnitude_2 = sum([b**2 for b in v2])**0.5
        if magnitude_1 == 0 or magnitude_2 == 0:
            return 0.0
        return dot_product / (magnitude_1 * magnitude_2)


class GenerateInterviewQuestionsUseCase:
    """
    Generates a comprehensive, personalised interview question bank based on the
    candidate's resume, the target job description, and the hiring company.

    For each requested question type (Technical / Behavioral / HR / Situational / STAR)
    it returns:
    - The question itself
    - Why the interviewer asks it
    - A full model answer grounded ONLY in resume facts
    - A STAR breakdown for behavioural / STAR questions
    - A 5-point scoring rubric with clear benchmarks
    - Follow-up questions the interviewer may ask
    - ATS / interview keywords to weave into the answer
    """

    def __init__(self, ai_provider: AIProvider):
        self.ai_provider = ai_provider

    async def execute(
        self,
        resume_text: str,
        job_description: str,
        company_name: str,
        job_title: str,
        question_types: List[str],
        num_per_type: int = 3,
    ) -> Dict[str, Any]:

        system_instruction = (
            "You are a world-class interview coach and Senior Talent Acquisition Specialist with deep expertise "
            "in the Nigerian job market, the tech industry, banking sector, and international remote roles. "
            "Your task is to generate a precise, personalised interview question bank for the candidate. "
            "\n\nCRITICAL CONSTRAINTS:\n"
            "1. NEVER hallucinate experience, skills, degrees, or achievements. "
            "   Model answers must ONLY reference facts explicitly present in the provided resume.\n"
            "2. Ground all Technical questions in the specific technologies listed in the resume and JD.\n"
            "3. Behavioral and STAR answers must draw from REAL projects/experience listed in the resume — "
            "   suggest appropriate placeholders like '[Describe your project at COMPANY X]' if specifics are sparse.\n"
            "4. For Nigerian-specific HR questions, address NYSC, relocation, '5-year plan' framing for Lagos corporate culture.\n"
            "5. Scoring rubrics must be concrete and measurable — not generic platitudes.\n"
            "6. Use British English spelling throughout (organisation, programme, analyse, behaviour)."
        )

        type_instructions = {
            "Technical": (
                "Generate technical questions that test depth of knowledge in the candidate's stated skills. "
                "Mix theory, practical problem-solving, and system-design level questions based on seniority implied by the resume."
            ),
            "Behavioral": (
                "Generate behavioral questions using the STAR framework (Situation, Task, Action, Result). "
                "Focus on leadership, conflict resolution, deadline management, and teamwork — common in Nigerian corporate settings."
            ),
            "HR": (
                "Generate HR questions covering salary negotiation, career goals, NYSC/relocation, culture fit, "
                "and motivation — tailored for both Nigerian firms and international remote companies."
            ),
            "Situational": (
                "Generate hypothetical scenario-based questions that test judgment, problem-solving, and role-specific decision-making. "
                "Scenarios must be realistic for the specified role and company type."
            ),
            "STAR": (
                "Generate structured STAR questions that require candidates to narrate past experiences. "
                "Each question must explicitly call for a Situation, Task, Action, and Result structure in the model answer."
            ),
        }

        requested_type_instructions = "\n".join(
            [f"- {qt}: {type_instructions.get(qt, 'Generate relevant questions.')}" 
             for qt in question_types]
        )

        prompt = (
            f"CANDIDATE RESUME:\n{resume_text[:3000]}\n\n"
            f"JOB DESCRIPTION:\n{job_description[:2000]}\n\n"
            f"COMPANY: {company_name}\n"
            f"ROLE: {job_title}\n\n"
            f"Generate EXACTLY {num_per_type} questions for EACH of these types: {', '.join(question_types)}.\n\n"
            f"Question Type Guidelines:\n{requested_type_instructions}\n\n"
            f"Return a complete JSON object matching the schema exactly."
        )

        schema = {
            "job_title": "string",
            "company_name": "string",
            "company_research_notes": (
                "string (2-3 paragraphs of research tips: what to know about this company before the interview — "
                "culture, recent news, products, Nigerian presence if applicable)"
            ),
            "preparation_tips": (
                "list of strings (5-7 high-impact interview preparation tips tailored to this specific role and company)"
            ),
            "questions": [
                {
                    "id": "string (unique e.g. 'tech_001', 'beh_002')",
                    "question_type": "string (one of: Technical, Behavioral, HR, Situational, STAR)",
                    "category": "string (sub-category e.g. 'System Design', 'Leadership', 'Salary Negotiation')",
                    "difficulty": "string (Easy, Medium, Hard)",
                    "question": "string (the full interview question)",
                    "why_asked": "string (1-2 sentences explaining what the interviewer is assessing with this question)",
                    "model_answer": (
                        "string (comprehensive model answer — 150 to 300 words — "
                        "grounded strictly in the resume. For behavioral/STAR questions, structure as STAR. "
                        "Use first-person voice.)"
                    ),
                    "star_breakdown": {
                        "situation": "string (only for Behavioral/STAR types — null otherwise)",
                        "task": "string",
                        "action": "string",
                        "result": "string (quantify with metrics where possible)"
                    },
                    "scoring_rubric": {
                        "key_criteria": "list of strings (3-5 concrete evaluation criteria)",
                        "score_1_2": "string (what a poor/unprepared answer looks like — 1-2/5)",
                        "score_3": "string (what an average answer looks like — 3/5)",
                        "score_4_5": "string (what an excellent answer looks like — 4-5/5)"
                    },
                    "follow_up_questions": "list of strings (2-3 likely follow-up questions)",
                    "keywords_to_include": "list of strings (5-8 keywords/phrases to weave into the answer for ATS and interviewer resonance)"
                }
            ]
        }

        result_json = await self.ai_provider.generate_json(
            prompt=prompt,
            schema=json.dumps(schema, indent=2),
            system_instruction=system_instruction
        )

        questions = result_json.get("questions", [])
        return {
            "job_title": result_json.get("job_title", job_title),
            "company_name": result_json.get("company_name", company_name),
            "total_questions": len(questions),
            "questions": questions,
            "preparation_tips": result_json.get("preparation_tips", []),
            "company_research_notes": result_json.get("company_research_notes", ""),
        }


class ImproveBulletPointUseCase:
    """Use case to rewrite weak bullet points using active verbs and metrics via AIProvider DI."""
    def __init__(self, ai_provider: AIProvider):
        self.ai_provider = ai_provider

    async def execute(self, bullet_point: str, tone: str = "Professional") -> Dict[str, Any]:
        system_instruction = (
            "You are an expert resume writer. Optimize the provided resume bullet point to replace passive voice with active verbs, "
            "correct grammar mistakes, maximize ATS compatibility, and frame the action around measurable outcomes/achievements. "
            "If the user did not include metrics, logically estimate or suggest a placeholder value in brackets [e.g., increased efficiency by 25%]."
        )
        prompt = f"Original Bullet: {bullet_point}\nTone: {tone}"
        schema = {
            "original": "string (the input bullet point)",
            "rewritten": "string (the optimized, high-impact rewrite)",
            "passive_words_replaced": "list of strings (phrases changed)",
            "active_verbs_used": "list of strings (action verbs introduced)",
            "suggested_metrics": "string (measurable values or placeholders suggested)"
        }
        return await self.ai_provider.generate_json(
            prompt=prompt,
            schema=json.dumps(schema, indent=2),
            system_instruction=system_instruction
        )


class GetPersonalizedRecommendationsUseCase:
    """Use case to generate AI-driven personalized career recommendations via AIProvider DI."""
    def __init__(self, ai_provider: AIProvider, resume_repo: ResumeRepository):
        self.ai_provider = ai_provider
        self.resume_repo = resume_repo

    async def execute(self, user: User) -> Dict[str, Any]:
        from backend.app.infrastructure.nigeria_insights_data import get_all_industries

        resume = await self.resume_repo.get_latest_by_user(user.id)
        if not resume:
            return {
                "has_resume": False,
                "message": "Upload your resume to receive personalised career recommendations.",
                "recommended_industries": [],
                "skill_gap_analysis": [],
                "top_certifications": [],
                "visa_pathway": None,
            }

        system_instruction = (
            "You are a Senior Career Advisor specialising in the Nigerian job market with deep knowledge of "
            "global visa pathways for Nigerian professionals. Based on the candidate's resume, provide "
            "highly specific, actionable career recommendations — not generic advice. "
            "Focus on realistic, high-impact actions the candidate can take in the next 6-12 months."
        )

        industry_summaries = json.dumps(
            [{k: v for k, v in ind.items() if k != "questions"} for ind in get_all_industries()],
            indent=2
        )

        prompt = (
            f"Candidate Profile:\n"
            f"  Name: {user.full_name}\n"
            f"  Target Role: {user.target_job_title}\n"
            f"  Target Industry: {user.target_industry}\n"
            f"  NYSC Status: {user.nysc_status}\n\n"
            f"Resume Summary (parsed):\n{json.dumps(resume.parsed_json, indent=2)[:2000]}\n\n"
            f"Available Nigeria Industries:\n{industry_summaries}\n\n"
            f"Generate personalised career recommendations for this specific candidate."
        )

        schema = {
            "recommended_industries": [
                {
                    "industry_id": "string",
                    "industry_name": "string",
                    "fit_score": "integer 0-100",
                    "reason": "string",
                    "quick_wins": "list of strings"
                }
            ],
            "skill_gap_analysis": [
                {
                    "skill": "string",
                    "demand_level": "string",
                    "learning_path": "string",
                    "time_to_learn": "string"
                }
            ],
            "top_certifications": [
                {
                    "certification": "string",
                    "why_this_one": "string",
                    "impact": "string",
                    "priority": "string"
                }
            ],
            "visa_pathway": {
                "recommended_country": "string",
                "visa_type": "string",
                "eligibility_assessment": "string",
                "steps_to_qualify": "list of strings",
                "realistic_timeline": "string"
            },
            "career_action_plan": "string"
        }

        result = await self.ai_provider.generate_json(
            prompt=prompt,
            schema=json.dumps(schema, indent=2),
            system_instruction=system_instruction
        )
        result["has_resume"] = True
        return result

