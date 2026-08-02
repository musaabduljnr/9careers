import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../infrastructure/api_client';
import { Resume } from '../../domain/types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CircularProgress } from '../components/CircularProgress';
import { 
  UploadCloud, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  Copy,
  Download,
  RefreshCw,
  Layers,
  Briefcase,
  GraduationCap,
  ArrowRight,
  AlertTriangle,
  PenTool,
  Check,
  Zap
} from 'lucide-react';

interface CustomRewriteResult {
  original: string;
  rewritten: string;
  passive_words_replaced: string[];
  active_verbs_used: string[];
  suggested_metrics: string;
}

export const ResumeOptimizerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States
  const [jobDescription, setJobDescription] = useState('');
  const [tailorTone, setTailorTone] = useState('Nigerian Corporate');
  const [activeTab, setActiveTab] = useState<'scan' | 'improvements' | 'extracted' | 'tailor'>('scan');
  const [extractedView, setExtractedView] = useState<'visual' | 'json'>('visual');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Custom Bullet Improver States
  const [customBullet, setCustomBullet] = useState('');
  const [bulletTone, setBulletTone] = useState('Professional');
  const [customRewrite, setCustomRewrite] = useState<CustomRewriteResult | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);

  // 1. Fetch latest resume
  const { data: resume, isLoading: isResumeLoading } = useQuery<Resume, any>({
    queryKey: ['latest-resume'],
    queryFn: async () => {
      const res = await api.get<Resume>('/api/v1/resumes/latest');
      return res.data;
    },
    retry: false
  });

  // 2. Upload resume mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_SIZE) {
        throw new Error('File size exceeds the 10MB limit. Please upload a smaller file.');
      }

      const formData = new FormData();
      formData.append('file', file);
      
      setUploadProgress(0);
      setUploadError(null);

      const res = await api.post<Resume>('/api/v1/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percent);
        }
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['latest-resume'], data);
      setUploadError(null);
      setUploadProgress(null);
      setCustomRewrite(null);
    },
    onError: (err: any) => {
      const message = err.response?.data?.detail || err.message || 'Failed to upload resume. Please check file format (PDF/DOCX).';
      setUploadError(message);
      setUploadProgress(null);
    }
  });

  // 3. Tailor resume mutation
  const tailorMutation = useMutation({
    mutationFn: async ({ resumeId, jobDescription, tone }: { resumeId: number; jobDescription: string; tone: string }) => {
      const res = await api.post<Resume>(`/api/v1/resumes/${resumeId}/tailor`, {
        job_description: jobDescription,
        tone: tone
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['latest-resume'], data);
      setActiveTab('tailor');
    }
  });

  // 4. Custom bullet improver mutation
  const customBulletMutation = useMutation({
    mutationFn: async () => {
      setCustomError(null);
      const res = await api.post<CustomRewriteResult>('/api/v1/resumes/improve-bullet', {
        bullet_point: customBullet,
        tone: bulletTone
      });
      return res.data;
    },
    onSuccess: (data) => {
      setCustomRewrite(data);
    },
    onError: (err: any) => {
      setCustomError(err.response?.data?.detail || err.message || 'Failed to improve bullet point.');
    }
  });

  // Event handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const name = file.name.toLowerCase();
      if (name.endsWith('.pdf') || name.endsWith('.docx')) {
        uploadMutation.mutate(file);
      } else {
        setUploadError('Unsupported file type. Please upload a PDF or DOCX file.');
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleTailorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume || !jobDescription.trim()) return;
    tailorMutation.mutate({
      resumeId: resume.id,
      jobDescription,
      tone: tailorTone
    });
  };

  const handleCustomBulletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customBullet.trim()) {
      customBulletMutation.mutate();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const downloadText = (text: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleReset = () => {
    queryClient.removeQueries({ queryKey: ['latest-resume'] });
    setJobDescription('');
    setCustomBullet('');
    setCustomRewrite(null);
    setActiveTab('scan');
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-850 dark:text-white">ATS Resume Optimizer</h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Check your CV readiness, analyze weak bullet points, and rewrite them for maximum ATS impact
          </p>
        </div>
        {resume && (
          <Button variant="outline" size="sm" onClick={handleReset} className="self-start">
            <RefreshCw size={14} className="mr-2" />
            Upload New CV
          </Button>
        )}
      </div>

      {/* Main Content Area */}
      {isResumeLoading ? (
        <Card className="flex flex-col items-center justify-center py-20 border-slate-200/50 dark:border-slate-850">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
          <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-4">Loading resume data...</span>
        </Card>
      ) : !resume ? (
        /* Upload State */
        <div className="max-w-2xl mx-auto w-full">
          <Card 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500/80 transition-all duration-300 rounded-3xl"
            onClick={handleUploadClick}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf,.docx" 
              className="hidden" 
            />
            
            <div className="bg-emerald-500/10 dark:bg-emerald-500/5 p-5 rounded-full text-emerald-500 mb-4 animate-bounce">
              <UploadCloud size={36} />
            </div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Upload your Resume</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center max-w-sm mt-1 mb-6 leading-relaxed">
              Drag and drop your PDF or Word document here, or click to browse. Max size 10MB.
            </p>

            {uploadProgress === null ? (
              <Button variant="primary" isLoading={uploadMutation.isPending} onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}>
                Select File
              </Button>
            ) : (
              <div className="w-full max-w-xs flex flex-col gap-2 bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-855 rounded-2xl">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-105 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                {uploadProgress === 100 && (
                  <span className="text-[10px] text-slate-400 font-semibold animate-pulse text-center mt-1">
                    Extracting CV details using AI... Please hold on.
                  </span>
                )}
              </div>
            )}
            
            {uploadError && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl flex items-center gap-2 text-red-650 dark:text-red-400 max-w-md" onClick={(e) => e.stopPropagation()}>
                <AlertCircle size={16} className="shrink-0" />
                <span className="text-xs font-semibold">{uploadError}</span>
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* Result State */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Score card */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            <Card className="flex flex-col items-center text-center p-8 border-slate-200/50 dark:border-slate-850">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-6">ATS Match Quality</span>
              <CircularProgress value={resume.ats_score} size={150} strokeWidth={12} />
              
              <div className="mt-6 flex flex-col gap-1.5 w-full">
                <div className="flex justify-between text-xs font-bold px-1 text-slate-500">
                  <span>File Name</span>
                  <span className="text-slate-800 dark:text-slate-205 max-w-[120px] truncate font-semibold">{resume.file_name}</span>
                </div>
                <div className="flex justify-between text-xs font-bold px-1 text-slate-500 border-t border-slate-50 dark:border-slate-900 pt-2 mt-1">
                  <span>Structure Rating</span>
                  <span className="text-emerald-500 flex items-center gap-1 font-bold">
                    <CheckCircle size={12} />
                    {resume.ats_feedback?.structure_rating || 'Good'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Recommended Keywords */}
            <Card className="border-slate-200/50 dark:border-slate-850">
              <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4">
                ATS Keyword Gaps
              </h3>
              {resume.ats_feedback?.missing_skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {resume.ats_feedback.missing_skills.map((skill: string, idx: number) => (
                    <span 
                      key={idx}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/20"
                    >
                      + {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs font-semibold text-slate-400">All key competencies found. Good job!</span>
              )}
            </Card>

            {/* NYSC specific card */}
            {resume.ats_feedback?.nysc_recommendation && (
              <Card className="border-slate-200/50 dark:border-slate-850 bg-emerald-50/20 dark:bg-slate-900/40 border-l-4 border-l-emerald-500">
                <h3 className="text-sm font-bold text-slate-850 dark:text-emerald-450 flex items-center gap-2 mb-2">
                  <Sparkles size={16} />
                  Naija NYSC Guidance
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                  {resume.ats_feedback.nysc_recommendation}
                </p>
              </Card>
            )}
          </div>

          {/* Right panel: Tab views */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Tabs */}
            <div className="flex bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 p-1.5 rounded-2xl gap-2">
              {(['scan', 'improvements', 'extracted', 'tailor'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-2 rounded-xl text-xs font-bold transition-all capitalize ${
                    activeTab === tab
                      ? 'bg-slate-50 dark:bg-slate-950 text-emerald-500 border border-slate-100 dark:border-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-500'
                  }`}
                >
                  {tab === 'scan' ? 'Diagnostics' : tab === 'improvements' ? 'AI Resume Improver' : tab === 'extracted' ? 'Extracted CV' : 'AI Tailor'}
                </button>
              ))}
            </div>

            {/* Tab content 1: Scan & Diagnostics */}
            {activeTab === 'scan' && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-slate-200/50 dark:border-slate-850 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4">ATS Attribute Scores</h3>
                      <div className="flex flex-col gap-4">
                        {[
                          { label: 'Grammar & Spelling', val: resume.ats_feedback.score_breakdown?.grammar || 75, color: 'from-emerald-500 to-teal-500' },
                          { label: 'Formatting & Structure', val: resume.ats_feedback.score_breakdown?.formatting || 70, color: 'from-blue-500 to-indigo-500' },
                          { label: 'Keyword Alignment', val: resume.ats_feedback.score_breakdown?.keyword || 65, color: 'from-amber-500 to-orange-500' },
                          { label: 'Metrics & Achievements', val: resume.ats_feedback.score_breakdown?.impact || 60, color: 'from-pink-500 to-rose-500' },
                          { label: 'Core Skills Density', val: resume.ats_feedback.score_breakdown?.skills || 80, color: 'from-purple-500 to-violet-500' }
                        ].map((item, idx) => (
                          <div key={idx} className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-650 dark:text-slate-400">{item.label}</span>
                              <span className="text-slate-850 dark:text-white">{item.val}/100</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-2 rounded-full bg-gradient-to-r ${item.color}`}
                                style={{ width: `${item.val}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  <Card className="border-slate-200/50 dark:border-slate-850 flex flex-col justify-between">
                    <div className="flex flex-col gap-4">
                      <div>
                        <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-1">Readability Index</h3>
                        <div className="text-2xl font-black text-slate-850 dark:text-white mt-2">
                          {resume.ats_feedback.detailed_analysis?.readability || resume.ats_feedback.structure_rating || 'Good'}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                          Analyzes layout structure, paragraph lengths, and section hierarchies.
                        </p>
                      </div>

                      <div className="border-t border-slate-105 dark:border-slate-850 pt-4">
                        <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-3">Action Verbs Found</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {resume.ats_feedback.detailed_analysis?.action_verbs && resume.ats_feedback.detailed_analysis.action_verbs.length > 0 ? (
                            resume.ats_feedback.detailed_analysis.action_verbs.map((verb: string, idx: number) => (
                              <span key={idx} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-500/20">
                                {verb}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">None found. Add strong verbs (e.g., Led, Orchestrated).</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Red Flags */}
                {resume.ats_feedback.detailed_analysis?.red_flags && resume.ats_feedback.detailed_analysis.red_flags.length > 0 && (
                  <div className="p-4 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl">
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertTriangle size={14} />
                      Critical Diagnostics
                    </h4>
                    <ul className="list-disc pl-4 space-y-1">
                      {resume.ats_feedback.detailed_analysis.red_flags.map((flag: string, idx: number) => (
                        <li key={idx} className="text-xs font-semibold leading-relaxed">{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Tab content 2: AI Resume Improver [NEW] */}
            {activeTab === 'improvements' && (
              <div className="flex flex-col gap-6">
                
                {/* Custom single-bullet improver tool */}
                <Card className="border-slate-200/50 dark:border-slate-850">
                  <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <PenTool size={14} className="text-emerald-500" />
                    Interactive Bullet Re-writer
                  </h3>
                  <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
                    Type or paste a weak bullet point to convert passive phrasings into metrics-driven achievements instantly.
                  </p>

                  {customError && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl text-red-500 text-xs font-bold">
                      {customError}
                    </div>
                  )}

                  <form onSubmit={handleCustomBulletSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <textarea
                        value={customBullet}
                        onChange={(e) => setCustomBullet(e.target.value)}
                        placeholder="e.g. I was responsible for writing code and talking to customers..."
                        className="w-full h-20 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                        required
                      />
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                      <div className="flex items-center gap-2 self-start md:self-auto">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rewrite Tone:</label>
                        <select
                          value={bulletTone}
                          onChange={(e) => setBulletTone(e.target.value)}
                          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                        >
                          <option value="Professional">Professional (Corporate)</option>
                          <option value="Confident">Confident (Bold/Startup)</option>
                          <option value="Friendly">Friendly (Warm)</option>
                        </select>
                      </div>
                      
                      <Button
                        variant="primary"
                        type="submit"
                        isLoading={customBulletMutation.isPending}
                        className="w-full md:w-auto py-2 text-xs"
                      >
                        <Zap size={12} className="mr-1.5" />
                        Optimize Bullet
                      </Button>
                    </div>
                  </form>

                  {/* Single bullet before/after preview */}
                  {customRewrite && (
                    <div className="mt-5 border-t border-slate-100 dark:border-slate-850 pt-5 flex flex-col gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-red-500/5 dark:bg-red-950/10 border border-red-500/10 rounded-xl">
                          <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider block mb-1">Before (Passive/Weak)</span>
                          <span className="text-xs text-slate-650 dark:text-slate-400 italic">"{customRewrite.original}"</span>
                        </div>
                        <div className="p-3 bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/10 rounded-xl relative">
                          <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider block mb-1">After (High-Impact Suggestion)</span>
                          <span className="text-xs text-slate-850 dark:text-white font-bold block pr-14 leading-relaxed">"{customRewrite.rewritten}"</span>
                          <button
                            onClick={() => copyToClipboard(customRewrite.rewritten)}
                            className="absolute top-3 right-3 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded text-[9px] font-bold flex items-center gap-1"
                          >
                            <Copy size={10} />
                            Copy
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-slate-50 dark:border-slate-900/60 pt-3">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Verbs Introduced</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {customRewrite.active_verbs_used.map((v, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 text-[9px] font-bold rounded">{v}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Passive Changed</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {customRewrite.passive_words_replaced.map((w, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-red-500/5 text-red-650 dark:text-red-400/80 text-[9px] font-bold rounded">{w}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Suggested Metrics</span>
                          <span className="text-[10px] text-slate-650 dark:text-slate-350 font-bold mt-1.5">{customRewrite.suggested_metrics || 'Add percentages or NGN numbers'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Scanned CV Weak Bullets list */}
                {resume.ats_feedback.detailed_analysis?.weak_bullet_points && resume.ats_feedback.detailed_analysis.weak_bullet_points.length > 0 && (
                  <Card className="border-slate-200/50 dark:border-slate-850">
                    <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Zap size={14} className="text-amber-500" />
                      Weak Bullets Detected in CV
                    </h3>
                    <p className="text-[10px] text-slate-400 mb-6">Review weak bullet points and suggested rewrites from your scanned CV.</p>
                    
                    <div className="flex flex-col gap-4">
                      {resume.ats_feedback.detailed_analysis.weak_bullet_points.map((pt: any, idx: number) => (
                        <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-900 rounded-2xl flex flex-col gap-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Before (Original)</span>
                            <span className="text-xs text-slate-600 dark:text-slate-400 italic">"{pt.original}"</span>
                          </div>
                          
                          <div className="flex flex-col gap-1 border-t border-slate-100 dark:border-slate-900/60 pt-2.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Diagnosis</span>
                            <span className="text-xs text-slate-650 dark:text-slate-350 font-medium">{pt.issue}</span>
                          </div>

                          <div className="flex flex-col gap-1 border-t border-slate-105 dark:border-slate-900/65 pt-2.5 bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/10 relative">
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-450 uppercase tracking-wider">After (AI Optimized)</span>
                            <div className="flex justify-between items-start gap-4 mt-1">
                              <span className="text-xs text-slate-850 dark:text-white font-bold leading-relaxed pr-12">"{pt.suggested_rewrite}"</span>
                              <button 
                                onClick={() => copyToClipboard(pt.suggested_rewrite)}
                                className="absolute top-3 right-3 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-[9px] font-bold hover:bg-slate-50 transition-all shrink-0 flex items-center gap-1"
                              >
                                <Copy size={10} />
                                Copy
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Highlight Missing Sections */}
                <Card className="border-slate-200/50 dark:border-slate-850">
                  <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-500" />
                    Missing CV Blocks & Sections
                  </h3>
                  
                  <div className="flex flex-col gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                      <span>Certifications Block</span>
                      {resume.parsed_json.certifications && resume.parsed_json.certifications.length > 0 ? (
                        <span className="text-emerald-500 flex items-center gap-1"><Check size={14} /> Found</span>
                      ) : (
                        <span className="text-amber-500 flex items-center gap-1"><AlertTriangle size={14} /> Missing</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                      <span>Volunteer Work Block</span>
                      {resume.parsed_json.volunteer_work && resume.parsed_json.volunteer_work.length > 0 ? (
                        <span className="text-emerald-500 flex items-center gap-1"><Check size={14} /> Found</span>
                      ) : (
                        <span className="text-amber-500 flex items-center gap-1"><AlertTriangle size={14} /> Missing</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                      <span>Portfolio Link</span>
                      {resume.parsed_json.portfolio ? (
                        <span className="text-emerald-500 flex items-center gap-1"><Check size={14} /> Found</span>
                      ) : (
                        <span className="text-amber-500 flex items-center gap-1"><AlertTriangle size={14} /> Missing</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                      <span>GitHub Profile Link</span>
                      {resume.parsed_json.github ? (
                        <span className="text-emerald-500 flex items-center gap-1"><Check size={14} /> Found</span>
                      ) : (
                        <span className="text-amber-500 flex items-center gap-1"><AlertTriangle size={14} /> Missing (Recommended for Tech)</span>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Tab content 3: Extracted CV Profile */}
            {activeTab === 'extracted' && (
              <Card className="border-slate-200/50 dark:border-slate-850 flex flex-col gap-6">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center gap-3">
                  <CheckCircle size={18} className="shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">Extraction Success</span>
                    <span className="text-[10px] opacity-90 font-medium">All CV details successfully extracted and securely saved in PostgreSQL.</span>
                  </div>
                </div>

                <div className="flex border-b border-slate-100 dark:border-slate-850 pb-2 mb-2 gap-4">
                  <button 
                    onClick={() => setExtractedView('visual')} 
                    className={`pb-1 text-xs font-bold transition-all relative ${
                      extractedView === 'visual' ? 'text-emerald-500' : 'text-slate-450'
                    }`}
                  >
                    Visual Summary
                  </button>
                  <button 
                    onClick={() => setExtractedView('json')} 
                    className={`pb-1 text-xs font-bold transition-all relative ${
                      extractedView === 'json' ? 'text-emerald-500' : 'text-slate-455'
                    }`}
                  >
                    Structured JSON
                  </button>
                </div>

                {extractedView === 'visual' ? (
                  <div className="flex flex-col gap-6 max-h-[60vh] overflow-y-auto pr-1">
                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Personal Info</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
                        <div><strong className="text-slate-405">Name:</strong> <span className="text-slate-850 dark:text-white font-semibold">{resume.parsed_json.name || 'Not found'}</span></div>
                        <div><strong className="text-slate-405">Email:</strong> <span className="text-slate-850 dark:text-white font-semibold">{resume.parsed_json.email || 'Not found'}</span></div>
                        <div><strong className="text-slate-405">Phone:</strong> <span className="text-slate-850 dark:text-white font-semibold">{resume.parsed_json.phone || 'Not found'}</span></div>
                        <div><strong className="text-slate-405">LinkedIn:</strong> <span className="text-slate-850 dark:text-white font-semibold truncate">{resume.parsed_json.linkedin ? <a href={resume.parsed_json.linkedin} target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline">{resume.parsed_json.linkedin}</a> : 'Not found'}</span></div>
                        <div><strong className="text-slate-405">Github:</strong> <span className="text-slate-850 dark:text-white font-semibold truncate">{resume.parsed_json.github ? <a href={resume.parsed_json.github} target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline">{resume.parsed_json.github}</a> : 'Not found'}</span></div>
                        <div><strong className="text-slate-405">Portfolio:</strong> <span className="text-slate-850 dark:text-white font-semibold truncate">{resume.parsed_json.portfolio ? <a href={resume.parsed_json.portfolio} target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline">{resume.parsed_json.portfolio}</a> : 'Not found'}</span></div>
                      </div>
                    </div>
                    
                    {resume.parsed_json.skills && resume.parsed_json.skills.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Skills</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {resume.parsed_json.skills.map((s, i) => (
                            <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 text-[10px] font-bold rounded-lg">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {resume.parsed_json.education && resume.parsed_json.education.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Education</h4>
                        <div className="flex flex-col gap-2">
                          {resume.parsed_json.education.map((edu, i) => (
                            <div key={i} className="p-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-900 rounded-xl flex flex-col gap-1">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-800 dark:text-slate-200">{edu.school}</span>
                                <span className="text-slate-400">{edu.graduation_year}</span>
                              </div>
                              <span className="text-xs text-slate-500">{edu.degree} {edu.grade ? `(${edu.grade})` : ''}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {resume.parsed_json.experience && resume.parsed_json.experience.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Work Experience</h4>
                        <div className="flex flex-col gap-2">
                          {resume.parsed_json.experience.map((exp, i) => (
                            <div key={i} className="p-3 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-900 rounded-xl flex flex-col gap-1">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-800 dark:text-slate-200">{exp.role}</span>
                                <span className="text-slate-400">{exp.duration}</span>
                              </div>
                              <span className="text-xs text-slate-500 font-semibold">{exp.company}</span>
                              <ul className="list-disc pl-4 mt-2 space-y-1">
                                {exp.achievements.map((ach, j) => (
                                  <li key={j} className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-semibold">{ach}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 overflow-x-auto max-h-[60vh]">
                    <pre className="text-xs text-emerald-400 font-mono leading-relaxed">
                      {JSON.stringify(resume.parsed_json, null, 2)}
                    </pre>
                  </div>
                )}
              </Card>
            )}

            {/* Tab content 4: AI Tailor Engine */}
            {activeTab === 'tailor' && (
              <div className="flex flex-col gap-6">
                <Card className="border-slate-200/50 dark:border-slate-850">
                  <form onSubmit={handleTailorSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Job Description
                      </label>
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste target job specifications here..."
                        className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Tone
                        </label>
                        <select
                          value={tailorTone}
                          onChange={(e) => setTailorTone(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                        >
                          <option value="Nigerian Corporate">Nigerian Corporate</option>
                          <option value="Tech Startup">Tech Startup</option>
                          <option value="International Remote">International Remote</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <Button 
                          variant="primary" 
                          type="submit" 
                          isLoading={tailorMutation.isPending}
                          className="w-full py-2.5"
                        >
                          <Sparkles size={16} className="mr-2" />
                          Optimize Resume Text
                        </Button>
                      </div>
                    </div>
                  </form>
                </Card>

                {resume.tailored_text && (
                  <Card className="border-slate-200/50 dark:border-slate-850">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                      <h3 className="font-bold text-slate-855 dark:text-white text-base">Tailored Output</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(resume.tailored_text || '')}
                          className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-550 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <Copy size={14} />
                          {copySuccess ? 'Copied' : 'Copy'}
                        </button>
                        <button
                          onClick={() => downloadText(resume.tailored_text || '', 'tailored_resume.txt')}
                          className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-550 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <Download size={14} />
                          Download
                        </button>
                      </div>
                    </div>

                    {resume.ats_feedback?.last_tailoring_adjustments && (
                      <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Adjustments Made</h4>
                        <ul className="list-disc pl-4 space-y-1">
                          {resume.ats_feedback.last_tailoring_adjustments.map((adj: string, i: number) => (
                            <li key={i} className="text-xs font-medium text-slate-650 dark:text-slate-405 leading-relaxed">
                              {adj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="max-h-[40vh] overflow-y-auto border border-slate-100 dark:border-slate-855 p-4 bg-slate-50/50 dark:bg-slate-955/40 rounded-2xl">
                      <pre className="text-xs text-slate-655 dark:text-slate-350 whitespace-pre-wrap font-mono leading-relaxed">
                        {resume.tailored_text}
                      </pre>
                    </div>
                  </Card>
                )}
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
};
