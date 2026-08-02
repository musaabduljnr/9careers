import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../infrastructure/api_client';
import { CoverLetter, Resume } from '../../domain/types';
import { coverLetterSchema, CoverLetterFormValues } from '../../domain/validation';
import { InputField } from '../components/InputField';
import { SelectField } from '../components/SelectField';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { 
  FileSignature, 
  Copy, 
  Download, 
  ArrowRight,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const CoverLetterPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedLetter, setSelectedLetter] = useState<CoverLetter | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [lastSubmittedValues, setLastSubmittedValues] = useState<CoverLetterFormValues | null>(null);

  // 1. Fetch generated cover letters
  const { data: letters = [], isLoading: isListLoading } = useQuery<CoverLetter[]>({
    queryKey: ['cover-letters'],
    queryFn: async () => {
      const res = await api.get<CoverLetter[]>('/api/v1/cover-letters');
      return res.data;
    }
  });

  // 2. Fetch user's uploaded resumes
  const { data: resumes = [], isLoading: isResumesLoading } = useQuery<Resume[]>({
    queryKey: ['resumes-list-cover-letter'],
    queryFn: async () => {
      const res = await api.get<Resume[]>('/api/v1/resumes');
      return res.data;
    }
  });

  // 3. Generate cover letter mutation
  const generateMutation = useMutation({
    mutationFn: async (values: CoverLetterFormValues) => {
      const res = await api.post<CoverLetter>('/api/v1/cover-letters', {
        resume_id: parseInt(values.resume_id),
        company_name: values.company_name,
        job_title: values.job_title,
        job_description: values.job_description,
        tone: values.tone,
        hiring_manager: values.hiring_manager
      });
      return res.data;
    },
    onSuccess: (data: CoverLetter) => {
      queryClient.setQueryData(['cover-letters'], [data, ...letters]);
      setSelectedLetter(data);
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm<CoverLetterFormValues>({
    resolver: zodResolver(coverLetterSchema),
    defaultValues: {
      resume_id: '',
      company_name: '',
      job_title: '',
      job_description: '',
      tone: 'Professional',
      hiring_manager: ''
    }
  });

  const onSubmit = (data: CoverLetterFormValues) => {
    setLastSubmittedValues(data);
    generateMutation.mutate(data);
  };

  const handleRegenerate = () => {
    const values = lastSubmittedValues || getValues();
    if (values.resume_id && values.company_name && values.job_title) {
      generateMutation.mutate(values);
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

  const toneOptions = [
    { value: 'Professional', label: 'Professional (Traditional, formal corporate style)' },
    { value: 'Confident', label: 'Confident (Bold, metrics-driven, highlights achievements)' },
    { value: 'Friendly', label: 'Friendly (Warm, values-aligned, conversational)' }
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-855 dark:text-white flex items-center gap-2">
          <FileSignature className="text-emerald-500 shrink-0" />
          AI Cover Letter Generator
        </h2>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          Generate bespoke, ATS-compliant cover letters matching your resume facts without hallucinated content
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Generator Form */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="border-slate-200/50 dark:border-slate-850">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-5">Letter Settings</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Select Resume Profile</label>
                {isResumesLoading ? (
                  <div className="h-10 bg-slate-55 dark:bg-slate-950 rounded-xl animate-pulse" />
                ) : resumes.length > 0 ? (
                  <select
                    {...register('resume_id')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-205 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                  >
                    <option value="">-- Choose an uploaded CV --</option>
                    {resumes.map(r => (
                      <option key={r.id} value={r.id.toString()}>{r.file_name}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-xs text-red-500 font-bold">Please upload a CV to source letter details.</span>
                )}
                {errors.resume_id && (
                  <span className="text-[10px] font-bold text-red-500 mt-1">{errors.resume_id.message}</span>
                )}
              </div>

              <InputField
                label="Target Company"
                placeholder="e.g. Access Bank, Paystack, Microsoft"
                error={errors.company_name?.message}
                {...register('company_name')}
              />
              
              <InputField
                label="Target Role"
                placeholder="e.g. Operations Manager, Cloud Engineer"
                error={errors.job_title?.message}
                {...register('job_title')}
              />

              <InputField
                label="Hiring Manager (Optional)"
                placeholder="e.g. Dr. Akinyemi, Ms. Smith"
                error={errors.hiring_manager?.message}
                {...register('hiring_manager')}
              />

              <SelectField
                label="Target Tone"
                options={toneOptions}
                error={errors.tone?.message}
                {...register('tone')}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Job Description (Optional)
                </label>
                <textarea
                  placeholder="Paste details to align cover letter narrative with role requirements..."
                  className="w-full h-24 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                  {...register('job_description')}
                />
              </div>

              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-2">
                <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400/80 leading-normal">
                  Anti-Hallucination Policy: The generator strictly binds writing to your selected resume. Facts will never be invented.
                </span>
              </div>

              <Button 
                variant="primary" 
                type="submit" 
                isLoading={generateMutation.isPending}
                className="mt-2 w-full text-xs py-2.5"
              >
                <FileSignature size={14} className="mr-2" />
                Generate Cover Letter
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Side: Preview & History */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {selectedLetter ? (
            /* Selected Letter Preview */
            <Card className="border-slate-200/50 dark:border-slate-850 flex flex-col justify-between min-h-[400px]">
              <div>
                <div className="flex items-center justify-between border-b border-slate-105 dark:border-slate-850 pb-3 mb-6">
                  <div className="flex flex-col">
                    <h3 className="font-extrabold text-slate-850 dark:text-white text-base">
                      {selectedLetter.job_title} at {selectedLetter.company_name}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-semibold mt-1">
                      Generated on {new Date(selectedLetter.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleRegenerate}
                      disabled={generateMutation.isPending}
                      className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-550 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <RefreshCw size={14} className={generateMutation.isPending ? 'animate-spin' : ''} />
                      Regenerate
                    </button>
                    <button
                      onClick={() => copyToClipboard(selectedLetter.content)}
                      className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-550 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Copy size={14} />
                      {copySuccess ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => downloadText(selectedLetter.content, `cover_letter_${selectedLetter.company_name}.txt`)}
                      className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-550 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Download size={14} />
                      Download
                    </button>
                  </div>
                </div>

                {generateMutation.isPending ? (
                  <div className="flex flex-col items-center justify-center py-32">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent mb-4" />
                    <span className="text-xs font-bold text-slate-400 animate-pulse">Drafting new layout content...</span>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-900/60 max-h-[50vh] overflow-y-auto font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {selectedLetter.content}
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-slate-50 dark:border-slate-900 pt-4 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-medium">Standard one-page layout matching ATS constraints.</span>
                <button 
                  onClick={() => setSelectedLetter(null)}
                  className="text-xs text-emerald-500 font-bold hover:underline flex items-center gap-1"
                >
                  View Saved History →
                </button>
              </div>
            </Card>
          ) : (
            /* History List */
            <Card className="border-slate-200/50 dark:border-slate-855 min-h-[400px] flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-855 dark:text-white uppercase tracking-wider mb-6">Saved Letters</h3>
                
                {isListLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
                  </div>
                ) : letters.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {letters.map((letter: CoverLetter) => (
                      <div 
                        key={letter.id}
                        onClick={() => setSelectedLetter(letter)}
                        className="p-4 border border-slate-100 dark:border-slate-850 hover:border-emerald-500 dark:hover:border-emerald-500/40 rounded-xl cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500">
                            <FileSignature size={18} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                              {letter.job_title} ({letter.company_name})
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                              {new Date(letter.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-slate-400" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 mb-2">
                      <FileSignature size={20} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-705 dark:text-slate-200">No cover letters generated yet</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                      Select a resume profile on the left and enter job details to draft your first letter.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
