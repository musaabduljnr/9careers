import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../infrastructure/api_client';
import { JobAnalysis } from '../../domain/types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CircularProgress } from '../components/CircularProgress';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  GraduationCap, 
  Layers, 
  CheckCircle, 
  AlertCircle, 
  Globe, 
  FileText, 
  UploadCloud, 
  Plus, 
  Sparkles,
  Link2,
  ListTodo
} from 'lucide-react';

export const JobParserPage: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Selection state
  const [method, setMethod] = useState<'paste' | 'file' | 'url'>('paste');
  const [activeAnalysisId, setActiveAnalysisId] = useState<number | null>(null);

  // Form inputs
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Fetch previous job analyses
  const { data: analyses = [], isLoading: isHistoryLoading } = useQuery<JobAnalysis[], any>({
    queryKey: ['job-analyses'],
    queryFn: async () => {
      const res = await api.get<JobAnalysis[]>('/api/v1/jobs/analyses');
      return res.data;
    }
  });

  // Mutator 1: Paste-based parser
  const pasteMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<JobAnalysis>('/api/v1/jobs/analyze', {
        job_title: jobTitle || 'Pasted Position',
        company: company || 'Pasted Company',
        job_description: jobDescription
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['job-analyses'], [data, ...analyses]);
      setActiveAnalysisId(data.id);
      setErrorText(null);
      // Reset inputs
      setJobTitle('');
      setCompany('');
      setJobDescription('');
    },
    onError: (err: any) => {
      setErrorText(err.response?.data?.detail || err.message || 'Failed to parse job description.');
    }
  });

  // Mutator 2: URL-based parser
  const urlMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await api.post<JobAnalysis>('/api/v1/jobs/analyze-url', { url });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['job-analyses'], [data, ...analyses]);
      setActiveAnalysisId(data.id);
      setErrorText(null);
      setJobUrl('');
    },
    onError: (err: any) => {
      setErrorText(err.response?.data?.detail || err.message || 'Failed to extract job description from URL.');
    }
  });

  // Mutator 3: File-based parser
  const fileMutation = useMutation({
    mutationFn: async (file: File) => {
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_SIZE) {
        throw new Error('File exceeds the 10MB size limit. Please upload a smaller document.');
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      setUploadProgress(0);
      setFileError(null);

      const res = await api.post<JobAnalysis>('/api/v1/jobs/analyze-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percent);
        }
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['job-analyses'], [data, ...analyses]);
      setActiveAnalysisId(data.id);
      setFileError(null);
      setUploadProgress(null);
      setErrorText(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail || err.message || 'Failed to parse file.';
      setFileError(msg);
      setUploadProgress(null);
    }
  });

  // Event handlers
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobUrl.trim()) {
      urlMutation.mutate(jobUrl);
    }
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobDescription.trim()) {
      pasteMutation.mutate();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      fileMutation.mutate(file);
    }
  };

  const selectedAnalysis = analyses.find(a => a.id === activeAnalysisId) || analyses[0];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf' || ext === 'docx') {
        fileMutation.mutate(file);
      } else {
        setFileError('Invalid file type. Only PDF and DOCX documents are accepted.');
      }
    }
  };

  const isPending = pasteMutation.isPending || urlMutation.isPending || fileMutation.isPending;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-850 dark:text-white">AI Job Description Parser</h1>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          Extract location, skills, education, and salary details from any Nigerian job listing using AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Submission Panel & History */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="border-slate-200/50 dark:border-slate-850">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4">Submission Method</h3>
            
            {/* Tab switchers */}
            <div className="flex bg-slate-50 dark:bg-slate-950 p-1 border border-slate-100 dark:border-slate-900 rounded-xl mb-6 gap-1">
              {(['paste', 'file', 'url'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => { setMethod(mode); setErrorText(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all ${
                    method === mode 
                      ? 'bg-white dark:bg-slate-900 text-emerald-500 shadow-sm border border-slate-100/50 dark:border-slate-850' 
                      : 'text-slate-400 hover:text-slate-550'
                  }`}
                >
                  {mode === 'paste' ? 'Paste' : mode === 'file' ? 'PDF/Word' : 'URL Link'}
                </button>
              ))}
            </div>

            {/* Error notifications */}
            {errorText && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl flex items-center gap-2 text-red-650 dark:text-red-400">
                <AlertCircle size={16} className="shrink-0" />
                <span className="text-xs font-semibold">{errorText}</span>
              </div>
            )}

            {/* Method forms */}
            {method === 'paste' && (
              <form onSubmit={handlePasteSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Position Title (Optional)</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Graduate Trainee"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company Name (Optional)</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Access Bank"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Description Text</label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste full job advertisement details here..."
                    className="w-full h-44 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                    required
                  />
                </div>
                <Button variant="primary" type="submit" isLoading={pasteMutation.isPending} className="w-full py-2.5 text-xs">
                  Parse Job Description
                </Button>
              </form>
            )}

            {method === 'file' && (
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="flex flex-col items-center justify-center py-10 px-4 border-2 border-dashed border-slate-250 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-950/20 hover:border-emerald-500 transition-all cursor-pointer relative"
                onClick={() => document.getElementById('job-file-input')?.click()}
              >
                <input 
                  type="file" 
                  id="job-file-input" 
                  accept=".pdf,.docx" 
                  className="hidden" 
                  onChange={handleFileChange} 
                />
                <div className="bg-emerald-500/10 p-3 rounded-full text-emerald-500 mb-3 animate-bounce">
                  <UploadCloud size={24} />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Upload Job PDF or DOCX</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-1 max-w-[200px]">Drag & drop or click. Limit 10MB.</span>

                {uploadProgress !== null && (
                  <div className="w-full max-w-[180px] flex flex-col gap-1.5 mt-4 bg-white dark:bg-slate-950 p-3 border border-slate-100/50 dark:border-slate-850 rounded-xl" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                {fileError && (
                  <div className="mt-3 p-2 border border-red-100 dark:border-red-950/20 bg-red-50 dark:bg-red-950/10 rounded-xl text-red-500 text-[10px] font-bold max-w-xs" onClick={(e) => e.stopPropagation()}>
                    {fileError}
                  </div>
                )}
              </div>
            )}

            {method === 'url' && (
              <form onSubmit={handleUrlSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Board link (URL)</label>
                  <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://company.recruitee.com/jobs/..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                    required
                  />
                </div>
                <Button variant="primary" type="submit" isLoading={urlMutation.isPending} className="w-full py-2.5 text-xs">
                  Fetch & Parse URL
                </Button>
              </form>
            )}
          </Card>

          {/* History */}
          <Card className="border-slate-200/50 dark:border-slate-850">
            <h3 className="text-sm font-bold text-slate-855 dark:text-white uppercase tracking-wider mb-4">Past Listings</h3>
            {isHistoryLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent" />
              </div>
            ) : analyses.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto pr-1">
                {analyses.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => setActiveAnalysisId(a.id)}
                    className={`p-3 border rounded-xl cursor-pointer hover:bg-slate-55 dark:hover:bg-slate-950/20 transition-all flex flex-col gap-1 ${
                      selectedAnalysis?.id === a.id 
                        ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10' 
                        : 'border-slate-100 dark:border-slate-900'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{a.job_title}</span>
                    <div className="flex justify-between text-[10px] text-slate-450 font-bold mt-0.5">
                      <span>{a.company}</span>
                      <span>{new Date(a.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-400">No past parsed jobs.</span>
            )}
          </Card>
        </div>

        {/* Right Side: Parsing Output Summary */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {isPending ? (
            <Card className="border-slate-200/50 dark:border-slate-850 flex flex-col items-center justify-center py-32">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
              <span className="text-sm font-bold text-slate-400 dark:text-slate-500 mt-4 animate-pulse">AI extracting job variables...</span>
            </Card>
          ) : selectedAnalysis ? (
            <div className="flex flex-col gap-6">
              
              {/* Header metrics card */}
              <Card className="border-slate-200/50 dark:border-slate-850 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-2xl">
                    <Briefcase size={22} />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-lg font-black text-slate-850 dark:text-white">{selectedAnalysis.job_title}</h2>
                    <span className="text-xs text-slate-450 font-bold">{selectedAnalysis.company}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 dark:border-slate-850 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Location</span>
                    <span className="text-xs text-slate-700 dark:text-slate-250 font-bold mt-1 flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      {selectedAnalysis.parsed_json?.location || 'Lagos, Nigeria'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Experience</span>
                    <span className="text-xs text-slate-700 dark:text-slate-250 font-bold mt-1 flex items-center gap-1">
                      <Layers size={12} className="text-slate-400 shrink-0" />
                      {selectedAnalysis.parsed_json?.experience || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Salary Benchmark</span>
                    <span className="text-xs text-slate-700 dark:text-slate-250 font-bold mt-1 flex items-center gap-1">
                      <DollarSign size={12} className="text-slate-400 shrink-0" />
                      {selectedAnalysis.salary_benchmark || '₦150k - ₦250k / mo'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">NYSC Requirement</span>
                    <span className={`text-xs font-bold mt-1 self-start px-2 py-0.5 rounded-lg ${
                      selectedAnalysis.nysc_required 
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      {selectedAnalysis.nysc_required ? 'Required Completion' : 'Exempted / Not Critical'}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Skills breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-slate-200/50 dark:border-slate-850">
                  <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-emerald-500" />
                    Required Technical Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnalysis.parsed_json?.required_skills && selectedAnalysis.parsed_json.required_skills.length > 0 ? (
                      selectedAnalysis.parsed_json.required_skills.map((skill: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-250">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">None specified.</span>
                    )}
                  </div>
                </Card>

                <Card className="border-slate-200/50 dark:border-slate-850">
                  <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    Preferred/Soft Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnalysis.parsed_json?.preferred_skills && selectedAnalysis.parsed_json.preferred_skills.length > 0 ? (
                      selectedAnalysis.parsed_json.preferred_skills.map((skill: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-250">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">None specified.</span>
                    )}
                  </div>
                </Card>
              </div>

              {/* Responsibilities list */}
              {selectedAnalysis.parsed_json?.responsibilities && selectedAnalysis.parsed_json.responsibilities.length > 0 && (
                <Card className="border-slate-200/50 dark:border-slate-850">
                  <h3 className="text-xs font-bold text-slate-855 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <ListTodo size={14} className="text-blue-500" />
                    Key Responsibilities
                  </h3>
                  <ul className="flex flex-col gap-3">
                    {selectedAnalysis.parsed_json.responsibilities.map((resp: string, i: number) => (
                      <li key={i} className="flex gap-2.5 items-start">
                        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <span className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-semibold">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Education, Benefits, Keywords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-slate-200/50 dark:border-slate-850 flex flex-col gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <GraduationCap size={14} className="text-purple-500" />
                      Education Requirement
                    </h3>
                    <span className="text-xs text-slate-600 dark:text-slate-350 font-semibold">
                      {selectedAnalysis.parsed_json?.education || 'B.Sc. / HND in related discipline.'}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-850 pt-4">
                    <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-2">
                      Allowances & Benefits
                    </h3>
                    <ul className="list-disc pl-4 space-y-1">
                      {selectedAnalysis.parsed_json?.benefits && selectedAnalysis.parsed_json.benefits.length > 0 ? (
                        selectedAnalysis.parsed_json.benefits.map((b: string, i: number) => (
                          <li key={i} className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{b}</li>
                        ))
                      ) : (
                        <li className="text-xs text-slate-400 italic">None mentioned. Standard pension applicable.</li>
                      )}
                    </ul>
                  </div>
                </Card>

                <Card className="border-slate-200/50 dark:border-slate-850">
                  <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-teal-500" />
                    Target ATS Keywords
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAnalysis.parsed_json?.keywords && selectedAnalysis.parsed_json.keywords.length > 0 ? (
                      selectedAnalysis.parsed_json.keywords.map((k: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-teal-500/10 text-teal-650 dark:text-teal-400 text-[10px] font-bold rounded-lg border border-teal-500/20">
                          {k}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">None extracted.</span>
                    )}
                  </div>
                </Card>
              </div>

            </div>
          ) : (
            <Card className="border-slate-200/50 dark:border-slate-850 flex flex-col items-center justify-center py-32 text-center">
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-full text-slate-400 dark:text-slate-600 mb-4 border border-slate-100 dark:border-slate-900">
                <Layers size={36} />
              </div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-white">Ready to Parse</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm leading-relaxed">
                Paste text details, upload a job PDF, or enter the link above to extract structured job variables.
              </p>
            </Card>
          )}

        </div>

      </div>
    </div>
  );
};
