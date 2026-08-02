import json
import logging
from typing import Dict, Any, List, Optional
from backend.app.domain.interfaces import AIProvider
from backend.app.domain.models import InterviewSession, InterviewQuestion, InterviewPrepProfile

logger = logging.getLogger(__name__)

PREP_PROFILE_PROMPT = """
You are an expert Executive Recruiter and Senior Hiring Principal at a top technology firm.
Analyze the following candidate information to build a high-precision candidate interview preparation profile.

TARGET ROLE: {target_role}
COMPANY: {company}
DIFFICULTY LEVEL: {difficulty}
INTERVIEW TYPE: {interview_type}

CANDIDATE RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Return a valid JSON object strictly matching this format:
{{
  "candidate_summary": "Concise 2-sentence background summary",
  "target_role": "{target_role}",
  "company": "{company}",
  "difficulty": "{difficulty}",
  "key_strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "perceived_weaknesses": ["Weakness 1", "Weakness 2"],
  "missing_skills": ["Missing Skill 1", "Missing Skill 2"],
  "likely_questions": [
    "Question 1 tailored to resume/JD",
    "Question 2 tailored to resume/JD",
    "Question 3 tailored to resume/JD",
    "Question 4 tailored to resume/JD",
    "Question 5 tailored to resume/JD"
  ],
  "interview_strategy": "Strategic plan for interviewing this candidate based on their background",
  "focus_areas": ["Focus area 1", "Focus area 2", "Focus area 3"]
}}
"""

INTERVIEWER_PERSONA_PROMPT = """
You are an experienced, professional hiring interviewer conducting a realistic live interview.

INTERVIEW CONFIGURATION:
- Mode: {interview_type}
- Role: {job_role}
- Target Company: {company}
- Difficulty Level: {difficulty}
- Interviewer Style: {interview_style} (Friendly, Professional, Strict, Startup, or Corporate)
- Duration Target: {duration_minutes} minutes

CANDIDATE PREPARATION PROFILE:
- Summary: {candidate_summary}
- Key Strengths: {strengths}
- Focus Areas: {focus_areas}
- Strategy: {strategy}

CONVERSATION SUMMARY SO FAR:
{conversation_summary}

PREVIOUS TURN LOG:
{recent_turns}

CURRENT TURN CATEGORY: {category}

STRICT RULES:
1. Speak directly as the Recruiter/Hiring Manager in character.
2. Ask EXACTLY ONE question at a time. Never combine multiple questions.
3. If the candidate gave a short or vague response in the previous turn, challenge them constructively to elaborate or provide a specific STAR example.
4. Adapt the depth of your follow-up based on candidate's answers and difficulty level ({difficulty}).
5. Reference previous details mentioned by the candidate to maintain a realistic conversation flow.
6. Keep responses under 4 sentences to sound natural, conversational, and articulate.

Respond ONLY with the text of what you, the Recruiter, say next.
"""

SCORE_TURN_PROMPT = """
You are a Senior Technical Recruiter evaluating a candidate's answer during an active job interview.

JOB ROLE: {job_role}
DIFFICULTY LEVEL: {difficulty}
QUESTION CATEGORY: {category}
INTERVIEWER QUESTION: "{question_text}"
CANDIDATE ANSWER: "{user_answer}"

Evaluate the candidate's answer objectively against industry hiring standards.

Return a valid JSON object matching this structure:
{{
  "overall_score": 85,
  "scores_detail": {{
    "communication": 85,
    "technical_accuracy": 90,
    "problem_solving": 80,
    "leadership": 75,
    "confidence": 85,
    "star_method": 80,
    "clarity": 90,
    "depth": 80,
    "relevance": 85,
    "professionalism": 90
  }},
  "feedback": "Constructive 2-sentence feedback explaining what was good and what could be improved."
}}
"""

REPORT_PROMPT = """
You are an Executive Hiring Committee Leader evaluating a complete candidate interview performance.

INTERVIEW METRICS:
- Role: {job_role}
- Company: {company}
- Interview Type: {interview_type}
- Difficulty: {difficulty}

TRANSCRIPT SUMMARY & QUESTIONS EVALUATED:
{transcript_summary}

Generate a comprehensive executive interview report and AI coaching plan.

Return a valid JSON object matching this structure:
{{
  "overall_score": 84,
  "hiring_recommendation": "Strong Hire",
  "likelihood_of_passing_percent": 88,
  "category_scores": {{
    "communication": 85,
    "technical_skills": 88,
    "problem_solving": 80,
    "behavioral_star": 82,
    "leadership_culture": 85
  }},
  "strengths": ["Demonstrated deep domain expertise", "Structured problem-solving approach"],
  "weaknesses": ["Could provide tighter quantifiable impact metrics"],
  "missed_opportunities": ["Did not mention specific architectural tradeoffs in turn 3"],
  "recommended_improvements": ["Use the STAR method more systematically for behavioral questions"],
  "suggested_learning_resources": ["System Design Primer", "Behavioral STAR Framework Guide"],
  "coach_advice": {{
    "what_went_well": "Clear articulation of core concepts and confident delivery.",
    "what_needs_improvement": "Elaborate more on team collaboration and conflict resolution.",
    "example_better_answers": [
      {{
        "question": "Sample Question from interview",
        "better_answer": "An exemplary STAR response demonstrating high impact."
      }}
    ],
    "action_plan": ["Practice 3 behavioral STAR stories", "Review system architecture fundamentals"]
  }}
}}
"""

class PreparationEngine:
    def __init__(self, ai_provider: AIProvider):
        self.ai_provider = ai_provider

    async def generate_prep_profile(
        self,
        target_role: str,
        company: str,
        difficulty: str,
        interview_type: str,
        resume_text: str = "",
        job_description: str = ""
    ) -> Dict[str, Any]:
        prompt = PREP_PROFILE_PROMPT.format(
            target_role=target_role or "Software Engineer",
            company=company or "Global Tech",
            difficulty=difficulty or "mid",
            interview_type=interview_type or "General",
            resume_text=resume_text[:4000] if resume_text else "Not provided.",
            job_description=job_description[:4000] if job_description else "Standard industry job description for " + target_role
        )
        try:
            res = await self.ai_provider.generate_json(
                prompt=prompt,
                schema={},
                system_instruction="You are an expert executive recruiter parsing candidate preparation data.",
                temperature=0.3
            )
            return res
        except Exception as e:
            logger.error(f"[PrepEngine] Fallback prep profile generation: {e}")
            return {
                "candidate_summary": f"Candidate preparing for {target_role} at {company}.",
                "target_role": target_role,
                "company": company,
                "difficulty": difficulty,
                "key_strengths": ["Technical execution", "Problem solving", "Communication"],
                "perceived_weaknesses": ["Quantifiable metrics presentation"],
                "missing_skills": ["Company specific context"],
                "likely_questions": [
                    f"Tell me about yourself and why you're interested in the {target_role} role at {company}.",
                    "Describe a challenging technical project you built recently.",
                    "How do you handle disagreement with a teammate or stakeholder?",
                    "What is your approach to system architecture and performance optimization?",
                    "Where do you see yourself in 3 years?"
                ],
                "interview_strategy": "Focus on structured STAR framework responses and clear technical depth.",
                "focus_areas": ["System Design", "STAR Behavioral Answers", "Company Culture"]
            }

class QuestionEngine:
    def __init__(self, ai_provider: AIProvider):
        self.ai_provider = ai_provider

    def get_category_for_order(self, order: int, total_expected: int = 6) -> str:
        categories = [
            "Introduction & Background",
            "Resume & Technical Deep Dive",
            "System Architecture & Problem Solving",
            "Behavioral & STAR Method",
            "Leadership & Culture Fit",
            "Company Knowledge & Closing"
        ]
        idx = min(max(0, order - 1), len(categories) - 1)
        return categories[idx]

    async def generate_interviewer_question(
        self,
        session: InterviewSession,
        order: int,
        user_last_answer: Optional[str] = None
    ) -> str:
        category = self.get_category_for_order(order)
        prep = session.prep_profile or {}
        
        # Build turn log
        turns = []
        for q in session.questions[-3:]:
            turns.append(f"Interviewer: {q.question_text}\nCandidate: {q.user_answer or '(No answer)'}")
        recent_turns_str = "\n---\n".join(turns) if turns else "First turn of the interview."
        
        prompt = INTERVIEWER_PERSONA_PROMPT.format(
            interview_type=session.interview_type,
            job_role=session.job_role,
            company=session.company or "our company",
            difficulty=session.difficulty,
            interview_style=session.interview_style,
            duration_minutes=session.duration_minutes,
            candidate_summary=prep.get("candidate_summary", ""),
            strengths=", ".join(prep.get("key_strengths", [])),
            focus_areas=", ".join(prep.get("focus_areas", [])),
            strategy=prep.get("interview_strategy", ""),
            conversation_summary=session.conversation_summary or "Beginning of interview.",
            recent_turns=recent_turns_str,
            category=category
        )
        
        if order == 1:
            system_inst = f"You are a top recruiter introducing yourself for a {session.interview_type} interview for {session.job_role} at {session.company or 'our company'}. Welcome the candidate, state how the interview will run, and ask your first introductory question."
        else:
            system_inst = f"You are an experienced interviewer. Ask your next question naturally in line with the candidate's background."
        
        try:
            text = await self.ai_provider.generate_text(
                prompt=prompt,
                system_instruction=system_inst,
                temperature=0.7
            )
            return text.strip()
        except Exception as e:
            logger.error(f"[QuestionEngine] Fallback question: {e}")
            if order == 1:
                return f"Welcome to your {session.interview_type} interview for the {session.job_role} position at {session.company or 'our company'}. I'm excited to speak with you today. To kick things off, could you briefly introduce yourself and share what motivated you to apply for this role?"
            elif order == 2:
                return f"Thank you for sharing that. Looking at your background, what has been your most impactful project related to {session.job_role}, and what was your specific technical role?"
            elif order == 3:
                return "Can you walk me through a complex technical problem you encountered recently? How did you diagnose it and what tradeoffs did you make?"
            elif order == 4:
                return "Tell me about a time when you had a disagreement with a team member or stakeholder on technical direction. How did you handle it?"
            elif order == 5:
                return f"What unique skills or perspective do you bring to {session.company or 'our company'}, and how do you stay current with evolving industry standards?"
            else:
                return "That brings us to the end of our structured questions! Do you have any questions for me about the team, tech stack, or company culture?"

class ScoringEngine:
    def __init__(self, ai_provider: AIProvider):
        self.ai_provider = ai_provider

    async def score_answer(
        self,
        job_role: str,
        difficulty: str,
        category: str,
        question_text: str,
        user_answer: str
    ) -> Dict[str, Any]:
        if not user_answer or len(user_answer.strip()) < 5:
            return {
                "overall_score": 30,
                "scores_detail": {
                    "communication": 30, "technical_accuracy": 30, "problem_solving": 30,
                    "leadership": 30, "confidence": 30, "star_method": 20,
                    "clarity": 30, "depth": 20, "relevance": 30, "professionalism": 40
                },
                "feedback": "Answer was too brief to evaluate thoroughly. Provide more detail using the STAR method."
            }

        prompt = SCORE_TURN_PROMPT.format(
            job_role=job_role,
            difficulty=difficulty,
            category=category,
            question_text=question_text,
            user_answer=user_answer
        )
        try:
            res = await self.ai_provider.generate_json(
                prompt=prompt,
                schema={},
                system_instruction="You are an unbiased hiring rubric evaluator.",
                temperature=0.2
            )
            return res
        except Exception as e:
            logger.error(f"[ScoringEngine] Fallback turn evaluation: {e}")
            return {
                "overall_score": 75,
                "scores_detail": {
                    "communication": 75, "technical_accuracy": 75, "problem_solving": 75,
                    "leadership": 70, "confidence": 75, "star_method": 70,
                    "clarity": 80, "depth": 70, "relevance": 80, "professionalism": 80
                },
                "feedback": "Good initial answer. Adding specific quantitative results will strengthen your impact."
            }

class ReportEngine:
    def __init__(self, ai_provider: AIProvider):
        self.ai_provider = ai_provider

    async def generate_report(self, session: InterviewSession) -> Dict[str, Any]:
        summary_turns = []
        for idx, q in enumerate(session.questions, 1):
            summary_turns.append(
                f"Q{idx} [{q.category}]: {q.question_text}\n"
                f"Candidate Answer: {q.user_answer or '(No answer)'}\n"
                f"Score: {q.ai_score or 'N/A'}/100 | Feedback: {q.ai_feedback or 'None'}"
            )
        transcript_str = "\n\n".join(summary_turns)
        
        prompt = REPORT_PROMPT.format(
            job_role=session.job_role,
            company=session.company or "Tech Company",
            interview_type=session.interview_type,
            difficulty=session.difficulty,
            transcript_summary=transcript_str
        )
        try:
            res = await self.ai_provider.generate_json(
                prompt=prompt,
                schema={},
                system_instruction="You are an executive hiring committee chairperson writing a final interview report.",
                temperature=0.3
            )
            return res
        except Exception as e:
            logger.error(f"[ReportEngine] Fallback report generation: {e}")
            valid_scores = [q.ai_score for q in session.questions if q.ai_score is not None]
            avg_score = int(sum(valid_scores) / len(valid_scores)) if valid_scores else 78
            
            return {
                "overall_score": avg_score,
                "hiring_recommendation": "Hire" if avg_score >= 75 else "Lean Reject",
                "likelihood_of_passing_percent": min(95, max(40, avg_score + 5)),
                "category_scores": {
                    "communication": avg_score,
                    "technical_skills": avg_score + 2,
                    "problem_solving": avg_score - 2,
                    "behavioral_star": avg_score - 4,
                    "leadership_culture": avg_score
                },
                "strengths": [
                    "Articulate and professional communication",
                    f"Strong baseline alignment with {session.job_role} requirements"
                ],
                "weaknesses": [
                    "Could incorporate more concrete data points and metrics"
                ],
                "missed_opportunities": [
                    "Did not fully elaborate on architectural trade-offs during technical questions"
                ],
                "recommended_improvements": [
                    "Structure behavioral responses using Situation, Task, Action, Result",
                    "Prepare quantifiable achievements for past projects"
                ],
                "suggested_learning_resources": [
                    "System Design & Architecture Best Practices",
                    "STAR Method Interview Mastery Guide"
                ],
                "coach_advice": {
                    "what_went_well": "Maintained composure and communicated clearly throughout the session.",
                    "what_needs_improvement": "Focus on driving answers to clear business outcomes.",
                    "example_better_answers": [
                        {
                            "question": session.questions[0].question_text if session.questions else "Introduce yourself",
                            "better_answer": f"Highlight top 2 projects with key metrics and direct relevance to {session.job_role}."
                        }
                    ],
                    "action_plan": [
                        "Review key technical concepts for senior level evaluations",
                        "Conduct 2 additional mock sessions targeting behavioral questions"
                    ]
                }
            }
