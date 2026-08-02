import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../application/context/AuthContext';
import { useTheme } from '../../application/context/ThemeContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CircularProgress } from '../components/CircularProgress';
import { 
  FileText, 
  FileSignature, 
  MessageSquareCode, 
  GraduationCap, 
  Sparkles, 
  TrendingUp, 
  CheckCircle,
  Briefcase,
  ChevronDown,
  Moon,
  Sun,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Accordion active index for FAQs
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleStartClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  // Stagger animation helpers
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 }
    }
  };

  const features = [
    {
      title: 'Resume Analyzer',
      desc: 'Upload your CV and instantly get a detailed breakdown of formatting issues, ATS structure compliance, and spelling metrics.',
      icon: FileText,
      badge: 'Advanced Scanners'
    },
    {
      title: 'Job Match Analysis',
      desc: 'Compare your CV directly against any job description to discover matching keyword thresholds and estimate Naira salary benchmarks.',
      icon: TrendingUp,
      badge: 'Naija Salary Estimation'
    },
    {
      title: 'Cover Letter Generator',
      desc: 'Instantly generate highly tailored cover letters set to corporate banking, startup, or graduate trainee tones standard in Nigeria.',
      icon: FileSignature,
      badge: 'Custom Copier'
    },
    {
      title: 'ATS Score Verification',
      desc: 'Automatically run keyword matching sweeps to highlight key missing skills, ensuring your profile passes automated filters.',
      icon: Zap,
      badge: 'Filter Protection'
    },
    {
      title: 'Interview Preparation',
      desc: 'Practice interactive chat mock interviews representing recruiters at top companies like Paystack, GTBank, MTN, and Unilever.',
      icon: MessageSquareCode,
      badge: 'Interactive Simulator'
    },
    {
      title: 'Career Dashboard',
      desc: 'Manage multiple versions of your resume, track cover letter histories, and review past mock interview coaching reports in one hub.',
      icon: GraduationCap,
      badge: 'Central Console'
    }
  ];

  const pricingPlans = [
    {
      name: 'Graduate Starter',
      price: '₦0',
      period: 'Forever Free',
      desc: 'Essential tools for recent graduates and Corpers starting their job search.',
      features: [
        '3 Resume ATS scans / month',
        'Basic keyword match list',
        '1 AI Cover Letter generation',
        '1 Mock Interview session',
        'Standard NYSC PPA optimizer',
        'British spelling standard verification'
      ],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Career Pro',
      price: '₦3,500',
      period: 'per month',
      desc: 'Complete optimization tools for active job seekers targeting top-tier roles.',
      features: [
        'Unlimited Resume ATS scans',
        'Full side-by-side AI Resume tailoring',
        'Unlimited targeted Cover Letters',
        'Unlimited Mock Interviews + coaching reports',
        'Advanced local salary benchmarking',
        'Priority AI response generation times'
      ],
      cta: 'Go Pro',
      popular: true
    }
  ];

  const faqs = [
    {
      q: 'How does it optimize my CV specifically for the Nigerian job market?',
      a: 'We configure our AI models to prioritize parameters crucial to local recruiters. This includes verifying if your NYSC status is visible and correctly presented, highlighting grade achievements (like a 2:1 which is required for graduate schemes), checking for local professional certifications (ICAN, COREN, etc.), and translating PPA experiences into corporate competencies.'
    },
    {
      q: 'Does it support British English spelling?',
      a: 'Yes. Most corporate firms and banks in Nigeria require British English spelling conventions. Our assistant automatically audits your resume for Americanisms and suggests standard British equivalents (e.g. converting "organization" to "organisation" and "program" to "programme").'
    },
    {
      q: 'How does the Mock Interview Simulator work?',
      a: 'The simulator acts as a strict HR Recruiter. It engages in a multi-turn chat session where it asks role-specific and behavioral questions tailored to Nigerian industries. Once completed, it reviews your replies using the STAR framework, scores them, and flags common local slang or awkward expressions to help you present yourself professionally.'
    },
    {
      q: 'Is my personal data secure?',
      a: 'Absolutely. We do not sell or distribute your CV content. All documents are stored in secure databases, and the text parsing is handled safely using encrypted connections. You can delete your uploaded files at any time.'
    }
  ];

  const testimonials = [
    {
      name: 'Tobi Alao',
      role: 'Graduate Trainee, GTBank',
      text: 'The NYSC PPA optimizer changed everything. It took my experience teaching mathematics at a village secondary school and rephrased it as student leadership and project coordination. I got invited to GTBank’s graduate assessment 2 weeks later!',
      avatar: 'T'
    },
    {
      name: 'Chinedu Okeke',
      role: 'Junior Backend Engineer, Paystack',
      text: 'I tailored my resume to a backend role at Paystack. The analyzer flagged that my CV lacked keywords like "event-driven architecture" and "database indexing" which were listed in the job description. Added them, got the interview, and got the offer!',
      avatar: 'C'
    },
    {
      name: 'Precious Aminu',
      role: 'Customer Success Specialist, MTN Nigeria',
      text: 'The interview prep simulator was incredibly realistic. It asked behavioral questions focused on high customer volumes and handling escalations, matching the MTN culture. The feedback report was direct and helped me drop local slang during the actual panel.',
      avatar: 'P'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* 1. Header (Navbar) */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-100 dark:border-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-tr from-emerald-500 to-teal-500 p-2 rounded-xl text-white shadow-md">
            <Briefcase size={18} />
          </div>
          <span className="font-extrabold text-slate-850 dark:text-white tracking-tight text-base">Naija Career AI</span>
        </div>

        {/* Navigation links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <a href="#features" className="hover:text-slate-800 dark:hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-slate-800 dark:hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-slate-800 dark:hover:text-white transition-colors">FAQs</a>
        </nav>

        {/* Auth CTA & Theme Toggle */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme} 
            className="p-2 border border-slate-100 dark:border-slate-900 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/auth')} 
            className="hidden sm:inline-flex"
          >
            Sign In
          </Button>
          
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleStartClick}
            className="shadow-sm shadow-emerald-500/10"
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-6 max-w-6xl mx-auto flex flex-col items-center justify-center text-center">
        
        {/* Background Radial Glow */}
        <div className="absolute top-[-20%] left-[25%] right-[25%] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Localized Banner Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6"
        >
          <span>Built for Nigerian Job Seekers 🇳🇬</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-850 dark:text-white leading-[1.1] max-w-4xl"
        >
          Get More Interviews <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">With Nigerian-Optimized AI</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-sm sm:text-base md:text-lg text-slate-500 dark:text-slate-400 mt-6 max-w-2xl leading-relaxed font-medium"
        >
          Analyze your CV, generate ATS-friendly cover letters, optimize your NYSC experience, and simulate mock interviews at top local companies like Paystack, GTBank, and MTN.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-3 mt-10 w-full sm:w-auto"
        >
          <Button 
            variant="primary" 
            size="lg" 
            onClick={handleStartClick}
            className="shadow-lg shadow-emerald-500/20 group px-8 py-3.5"
          >
            Analyze Resume
            <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="px-8 py-3.5"
          >
            Generate Cover Letter
          </Button>
        </motion.div>

        {/* Premium UI Mockup Demo */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative w-full max-w-4xl mt-16 border border-slate-200/60 dark:border-slate-850 p-2 sm:p-4 rounded-3xl bg-white/40 dark:bg-slate-900/30 backdrop-blur shadow-2xl dark:shadow-none overflow-hidden"
        >
          <div className="border border-slate-200/50 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 overflow-hidden flex flex-col md:flex-row gap-6 p-6 sm:p-8 text-left">
            
            {/* Animated Scorer Widget */}
            <div className="flex flex-col items-center md:border-r border-slate-100 dark:border-slate-900 pr-6 shrink-0 justify-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">ATS SCAN COMPLETED</span>
              
              {/* Circular Gauge animates on render */}
              <motion.div
                initial={{ rotate: -90, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="relative flex items-center justify-center w-36 h-36"
              >
                <svg className="transform -rotate-90" width={140} height={140}>
                  <circle className="stroke-slate-100 dark:stroke-slate-900" fill="transparent" strokeWidth={10} r={60} cx={70} cy={70} />
                  <motion.circle 
                    className="stroke-emerald-500" 
                    fill="transparent" 
                    strokeWidth={10} 
                    strokeLinecap="round"
                    r={60} 
                    cx={70} 
                    cy={70} 
                    initial={{ strokeDasharray: 377, strokeDashoffset: 377 }}
                    animate={{ strokeDashoffset: 45 }} // 88% score calculation: 377 - (88/100)*377 = 45.24
                    transition={{ duration: 1.5, delay: 0.8, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-850 dark:text-white">88</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Quality Score</span>
                </div>
              </motion.div>

              <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <CheckCircle size={12} />
                Excellent Formatting
              </div>
            </div>

            {/* Checklist recommendations appearing */}
            <div className="flex-1 flex flex-col gap-4 justify-between">
              <div className="flex flex-col gap-2">
                <h3 className="font-extrabold text-slate-850 dark:text-white text-base">Resume Audit Report</h3>
                <p className="text-xs font-semibold text-slate-400">Target Role: Graduate Trainee (Banking)</p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100/50 dark:border-slate-850">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">NYSC PPA Experience Rephrased</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Teaching duties rewritten to emphasize project management and team lead skills.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100/50 dark:border-slate-850">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">British English Spelling Enforced</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Replaced "organization" and "program" with standard British variations.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 rounded-xl text-red-600 dark:text-red-400">
                  <div className="w-5 h-5 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">+</div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">Recommended Keywords Missing</span>
                    <span className="text-[10px] mt-0.5 opacity-80">Add: Stakeholder Relations, Risk Mitigation, Financial Audit.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* 3. Feature Cards Section */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto border-t border-slate-100 dark:border-slate-900">
        <div className="flex flex-col gap-3 text-center mb-16">
          <span className="text-emerald-500 font-bold text-xs uppercase tracking-widest">Tailored Core Modules</span>
          <h2 className="text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight">Supercharge Your Job Search</h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 max-w-lg mx-auto">
            Everything you need to beat ATS filters and clear local graduate assessment stages.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feat) => (
            <motion.div key={feat.title} variants={itemVariants}>
              <Card hoverEffect className="flex flex-col justify-between h-64 border-slate-200/50 dark:border-slate-850">
                <div className="flex flex-col gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md">
                    <feat.icon size={20} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-bold text-slate-850 dark:text-white text-base">{feat.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{feat.desc}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md self-start">
                  {feat.badge}
                </span>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 4. Testimonials Section */}
      <section className="py-24 bg-slate-100/50 dark:bg-slate-900/10 border-t border-b border-slate-100 dark:border-slate-900 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-3 text-center mb-16">
            <span className="text-emerald-500 font-bold text-xs uppercase tracking-widest">Success Stories</span>
            <h2 className="text-3xl font-extrabold text-slate-850 dark:text-white tracking-tight">Approved by Nigerian Graduates</h2>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              Read how candidates land roles at top-tier banks, tech firms, and multinational corporations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <Card key={idx} className="bg-white dark:bg-slate-950 border-slate-200/40 dark:border-slate-900 flex flex-col justify-between p-6 rounded-2xl shadow-sm">
                <p className="text-xs text-slate-550 dark:text-slate-350 leading-relaxed italic font-medium">
                  "{test.text}"
                </p>
                <div className="flex items-center gap-3 mt-6 border-t border-slate-50 dark:border-slate-900 pt-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold text-sm">
                    {test.avatar}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs truncate">
                      {test.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold truncate mt-0.5">
                      {test.role}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Pricing Section */}
      <section id="pricing" className="py-24 px-6 max-w-5xl mx-auto">
        <div className="flex flex-col gap-3 text-center mb-16">
          <span className="text-emerald-500 font-bold text-xs uppercase tracking-widest">Pricing Plans</span>
          <h2 className="text-3xl font-extrabold text-slate-855 dark:text-white tracking-tight">Sleek Plans Built for Everyone</h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Start for free and upgrade as you enter active interview rounds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.name}
              className={`relative flex flex-col justify-between p-8 border rounded-3xl ${
                plan.popular 
                  ? 'border-emerald-500/80 bg-white dark:bg-slate-950 dark:shadow-none shadow-emerald-500/5 shadow-xl' 
                  : 'border-slate-200/60 dark:border-slate-855'
              }`}
            >
              {plan.popular && (
                <span className="absolute top-4 right-4 bg-emerald-500 text-white font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                  Most Popular
                </span>
              )}
              
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-extrabold text-slate-850 dark:text-white text-base">{plan.name}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">{plan.desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-850 dark:text-white tracking-tight">{plan.price}</span>
                  <span className="text-xs text-slate-400 font-semibold">{plan.period}</span>
                </div>

                <ul className="flex flex-col gap-3 border-t border-slate-50 dark:border-slate-900 pt-5">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-xs text-slate-650 dark:text-slate-350 font-semibold">
                      <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                variant={plan.popular ? 'primary' : 'outline'} 
                onClick={handleStartClick}
                className="mt-8 w-full py-2.5"
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="faq" className="py-24 bg-slate-100/50 dark:bg-slate-900/10 border-t border-slate-100 dark:border-slate-900 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col gap-3 text-center mb-16">
            <span className="text-emerald-500 font-bold text-xs uppercase tracking-widest">Got Questions?</span>
            <h2 className="text-3xl font-extrabold text-slate-855 dark:text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              Clear, transparent details about our optimizations and features.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map((faq, idx) => (
              <Card 
                key={idx}
                className="border-slate-200/50 dark:border-slate-850 p-5 rounded-2xl cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all select-none"
                onClick={() => toggleFaq(idx)}
              >
                <div className="flex justify-between items-center gap-4">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{faq.q}</h3>
                  <motion.div
                    animate={{ rotate: activeFaq === idx ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-slate-400"
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </div>
                
                <AnimatePresence initial={false}>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold border-t border-slate-50 dark:border-slate-900/60 pt-3">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 px-6 py-12 text-slate-500 dark:text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-1.5 rounded-lg text-white">
              <Briefcase size={14} />
            </div>
            <span className="font-bold text-slate-800 dark:text-white tracking-tight">Naija Career AI</span>
          </div>

          <div className="flex gap-8 font-semibold">
            <a href="#features" className="hover:text-slate-800 dark:hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-slate-800 dark:hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-slate-800 dark:hover:text-white transition-colors">FAQs</a>
          </div>

          <div className="flex flex-col items-center md:items-end gap-1 font-medium">
            <span>© 2026 Naija Career AI. All rights reserved.</span>
            <span className="text-[10px] text-slate-450 dark:text-slate-600 mt-1">Built with 💚 for Nigerian graduates.</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
