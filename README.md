# Nigerian AI Career Assistant (Naija Career AI)

An enterprise-grade, clean-architecture career acceleration platform tailored specifically for Nigerian job seekers. It features ATS resume scoring, AI resume tailoring, automated cover letter generation, specialized NYSC primary service optimization, and a interactive mock interview simulator customized for major Nigerian corporate sectors (Fintech, Banking, Telecoms, FMCG).

---

## 🌟 Key Features

1. **ATS Resume Optimizer & Parser**:
   * Extracts details from PDF and DOCX CVs.
   * Calculates an ATS match score (0-100) based on target roles.
   * Highlights missing keywords/skills and formatting flaws.
   * Enforces British English spelling standards (standard in Nigeria).
2. **AI Resume Tailoring Engine**:
   * Rewrites CV experience statements using the STAR method to align with target job descriptions.
   * Supports specific optimization modes: **Nigerian Corporate** (respectful, formal, structured), **Tech Startup** (modern, impact-driven), and **International Remote** (outcome-focused, global standard).
3. **Naija NYSC Graduate Hub**:
   * Special optimizer to frame National Youth Service Corps (NYSC) Primary Place of Assignment (PPA) duties into high-impact professional bullets (e.g., teaching or admin service translated into leadership, project management, and communications skills).
   * Detailed exam outlines and stages for popular Nigerian graduate schemes (GTBank, Access Bank, KPMG, PwC).
4. **Mock Interview Simulator**:
   * Chat-based interactive recruiter simulator asking domain-specific and behavioral questions.
   * Configured for Nigerian corporate contexts (e.g., GTBank Graduate Trainee openings, Paystack software engineering recruitment, FMCG sales roles).
   * Returns question-by-question scoring and a comprehensive coaching report outlining strengths, growth areas, and correction of local terms ("Nigerianisms") to standard professional English.
5. **Cover Letter Generator**:
   * Tailor letters for banking, FMCG, tech startups, or graduate Trainee roles.
   * Adjusts tone to fit recruitment expectations in Nigeria.

---

## 🛠️ Tech Stack & Architecture

The project is built on **Clean Architecture** principles, maintaining strict isolation of business logic from frameworks and external services.

### Backend: FastAPI
* **Domain Layer**: Clean entities and interfaces (`domain/models.py`, `domain/interfaces.py`) containing zero framework imports.
* **Application Layer**: Use cases (`application/use_cases.py`) orchestrating business rules.
* **Infrastructure Layer**: Framework implementations like SQLAlchemy repositories (`infrastructure/repositories.py`), document parsing (`infrastructure/doc_parser.py`), and the **AI Provider Abstraction** (`infrastructure/ai_providers.py`).
* **Presentation Layer**: FastAPI controllers, route handlers (`presentation/api_v1.py`), and Pydantic validators (`presentation/schemas.py`).

### Frontend: React + TypeScript
* Scaffolded with **Vite** and configured with **Tailwind CSS v4.0** (CSS-first engine).
* **Framer Motion** for premium interactive micro-animations.
* **React Hook Form** + **Zod** for robust client-side validation.
* **TanStack React Query** for client-side caching, automated loading states, and retry behaviors.

---

## 🔌 AI Provider Abstraction

The application implements a decoupled `AIProvider` factory. You can toggle between different models by setting environment variables in `backend/.env` without modifying any business logic:

* **Gemini**: Sets `AI_PROVIDER=gemini` (uses `gemini-2.5-flash` via HTTP client).
* **Groq**: Sets `AI_PROVIDER=groq` (uses `llama-3.3-70b-versatile` or other configured LLMs).
* **OpenRouter**: Sets `AI_PROVIDER=openrouter` (gives access to open-source or free model tiers).
* **Vertex AI**: Sets `AI_PROVIDER=vertex` (handles GCP ADC authentication and calls Vertex endpoint).
* **Mock Fallback**: If no keys are set, it defaults to a built-in `MockAIProvider` to allow local front-end testing without API charges.

---

## 🚀 Setup & Execution

### Prerequisites
* Python 3.12+
* Node.js v18+

### 1. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend/` directory:
   ```env
   DATABASE_URL=sqlite:///./career_assistant.db # Fallback local database
   AI_PROVIDER=gemini # Toggle: gemini, groq, openrouter, vertex
   GEMINI_API_KEY=your_gemini_api_key_here
   JWT_SECRET=super-secret-key-change-in-production
   ```
5. Launch the FastAPI server:
   ```bash
   python run.py
   ```
   The API will start on `http://127.0.0.1:8000`. You can inspect the interactive docs at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` directory (optional, defaults to local API):
   ```env
   VITE_API_URL=http://127.0.0.1:8000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

---

## 🧪 Running Tests

A comprehensive Pytest suite is provided to validate database repository CRUD operations, AI routing, and use-case calculations.

Run tests using the activated backend virtual environment:
```bash
cd backend
pytest tests/ -v
```
