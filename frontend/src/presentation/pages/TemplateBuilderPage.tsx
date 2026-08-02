import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../infrastructure/api_client';
import { Resume } from '../../domain/types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { 
  Printer, 
  Download, 
  Sparkles, 
  Layers, 
  Settings, 
  GraduationCap, 
  Briefcase, 
  Award,
  Globe,
  Mail,
  Phone,
  Link2,
  FileText,
  Type
} from 'lucide-react';

type TemplateType = 'Graduate' | 'NYSC' | 'Tech' | 'Banking' | 'Government' | 'Healthcare' | 'Engineering' | 'Remote';
type FontStyle = 'Inter' | 'Roboto' | 'Playfair' | 'Outfit';
type SpacingStyle = 'compact' | 'normal' | 'spacious';

export const TemplateBuilderPage: React.FC = () => {
  // Config states
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('Tech');
  const [selectedFont, setSelectedFont] = useState<FontStyle>('Inter');
  const [selectedSpacing, setSelectedSpacing] = useState<SpacingStyle>('normal');
  const [accentColor, setAccentColor] = useState<string>('#059669'); // default emerald

  // Profile data state (for customization)
  const [profileName, setProfileName] = useState('');
  const [profileTitle, setProfileTitle] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileLinkedin, setProfileLinkedin] = useState('');
  const [profileGithub, setProfileGithub] = useState('');
  const [profilePortfolio, setProfilePortfolio] = useState('');
  const [profileSummary, setProfileSummary] = useState('');
  const [profileSkills, setProfileSkills] = useState<string[]>([]);
  const [profileExperience, setProfileExperience] = useState<any[]>([]);
  const [profileEducation, setProfileEducation] = useState<any[]>([]);
  const [profileCertifications, setProfileCertifications] = useState<string[]>([]);

  // Fetch user's latest resume to autofill details
  const { data: resume, isLoading: isResumeLoading } = useQuery<Resume>({
    queryKey: ['latest-resume-for-template'],
    queryFn: async () => {
      const res = await api.get<Resume>('/api/v1/resumes/latest');
      return res.data;
    },
    retry: false
  });

  // Autofill fields once fetched
  useEffect(() => {
    if (resume?.parsed_json) {
      const pj = resume.parsed_json as any;
      setProfileName(pj.name || '');
      setProfileTitle(resume.tailored_text ? 'Tailored Candidate' : 'Professional Candidate');
      setProfileEmail(pj.email || '');
      setProfilePhone(pj.phone || '');
      setProfileLinkedin(pj.linkedin || '');
      setProfileGithub(pj.github || '');
      setProfilePortfolio(pj.portfolio || '');
      setProfileSummary(pj.summary || 'Detail-oriented professional with a strong track record of driving outcome-driven achievements. Eager to bring expertise to target teams.');
      setProfileSkills(pj.skills || []);
      setProfileExperience(pj.experience || []);
      setProfileEducation(pj.education || []);
      setProfileCertifications(pj.certifications || []);
    }
  }, [resume]);

  const handlePrint = () => {
    window.print();
  };

  const handleAddExperience = () => {
    setProfileExperience([
      ...profileExperience,
      { company: 'New Company', role: 'Role Name', duration: '2024 - Present', achievements: ['Accomplished task X resulting in Y metrics.'] }
    ]);
  };

  const handleAddEducation = () => {
    setProfileEducation([
      ...profileEducation,
      { school: 'New University', degree: 'Degree Name', graduation_year: '2024', grade: 'First Class' }
    ]);
  };

  const handleSkillsChange = (text: string) => {
    setProfileSkills(text.split(',').map(s => s.trim()).filter(s => s.length > 0));
  };

  // Preset Template details
  const templates: { value: TemplateType; label: string; desc: string; defaultColor: string }[] = [
    { value: 'Graduate', label: 'Graduate entry', desc: 'Highlights academics, NYSC prep, and internships.', defaultColor: '#4f46e5' },
    { value: 'NYSC', label: 'NYSC/PPA Special', desc: 'Prominently features PPA service & local credentials.', defaultColor: '#059669' },
    { value: 'Tech', label: 'Modern Developer (Tech)', desc: 'Two-column layout optimized for GitHub & projects.', defaultColor: '#0f172a' },
    { value: 'Banking', label: 'Executive (Banking)', desc: 'Serif fonts, formal layout, structured sections.', defaultColor: '#1e3a8a' },
    { value: 'Government', label: 'Government / Civil Service', desc: 'Traditional centered layout with academic honors.', defaultColor: '#047857' },
    { value: 'Healthcare', label: 'Clinical (Healthcare)', desc: 'Accentuates licenses, clinical rotations, & certs.', defaultColor: '#0891b2' },
    { value: 'Engineering', label: 'Engineering Spec', desc: 'Focuses heavily on technical projects and tool stacks.', defaultColor: '#b45309' },
    { value: 'Remote', label: 'Global Remote Jobs', desc: 'Focuses on remote work capabilities & global timezones.', defaultColor: '#7c3aed' }
  ];

  // Font families mapping
  const fontFamilies = {
    Inter: 'font-sans font-normal',
    Roboto: 'font-sans font-medium',
    Playfair: 'font-serif font-normal',
    Outfit: 'font-sans font-semibold'
  };

  // Spacing height mapping
  const lineSpacings = {
    compact: 'leading-tight py-1 gap-1.5',
    normal: 'leading-normal py-2 gap-3',
    spacious: 'leading-loose py-3 gap-4.5'
  };

  const textSizes = {
    compact: 'text-[11px]',
    normal: 'text-xs',
    spacious: 'text-sm'
  };

  return (
    <div className="flex flex-col gap-6 w-full screen-only">
      
      {/* CSS print utility stylesheet */}
      <style>{`
        @media print {
          /* Hide everything except the print-container */
          body * {
            visibility: hidden;
            background: white !important;
          }
          #print-container, #print-container * {
            visibility: visible;
          }
          #print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            min-height: 297mm;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-850 dark:text-white flex items-center gap-2">
            <Layers className="text-emerald-500 shrink-0" />
            ATS Resume Builder & Templates
          </h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Build, customize, and print pixel-perfect A4 resumes using structured, ATS-compliant formats
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="primary" onClick={handlePrint} className="text-xs py-2">
            <Printer size={14} className="mr-1.5" />
            Print / Download PDF (A4)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Customize Sidebar (Form + Layout Config) */}
        <div className="lg:col-span-5 flex flex-col gap-6 max-h-[85vh] overflow-y-auto pr-1">
          
          {/* Template Selection */}
          <Card className="border-slate-200/50 dark:border-slate-850">
            <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Settings size={14} className="text-emerald-500" />
              Template Selection
            </h3>
            
            <div className="grid grid-cols-2 gap-2.5">
              {templates.map(t => (
                <button
                  key={t.value}
                  onClick={() => { setSelectedTemplate(t.value); setAccentColor(t.defaultColor); }}
                  className={`p-3 border rounded-xl text-left hover:border-emerald-500 transition-all ${
                    selectedTemplate === t.value 
                      ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10' 
                      : 'border-slate-100 dark:border-slate-900'
                  }`}
                >
                  <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">{t.label}</span>
                  <span className="text-[9px] text-slate-400 mt-1 block leading-tight">{t.desc}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Typography and Layout settings */}
          <Card className="border-slate-200/50 dark:border-slate-850">
            <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Type size={14} className="text-emerald-500" />
              Design & Typography Styles
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Font Type</label>
                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value as FontStyle)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs"
                >
                  <option value="Inter">Inter (Sans-Serif)</option>
                  <option value="Roboto">Roboto (Clean)</option>
                  <option value="Outfit">Outfit (Modern)</option>
                  <option value="Playfair">Playfair (Serif)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Line Spacing</label>
                <select
                  value={selectedSpacing}
                  onChange={(e) => setSelectedSpacing(e.target.value as SpacingStyle)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-xl text-xs"
                >
                  <option value="compact">Compact (Tight)</option>
                  <option value="normal">Normal</option>
                  <option value="spacious">Spacious (Open)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Accent Theme Color</label>
                <div className="flex items-center gap-2 mt-1">
                  {['#059669', '#1e3a8a', '#4f46e5', '#b45309', '#0891b2', '#0f172a', '#7c3aed'].map(color => (
                    <button
                      key={color}
                      onClick={() => setAccentColor(color)}
                      className={`w-6 h-6 rounded-full border border-white dark:border-slate-850 shadow-sm transition-all ${
                        accentColor === color ? 'ring-2 ring-emerald-500 scale-110' : 'opacity-85'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-8 h-6 rounded cursor-pointer border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Edit Profile Form */}
          <Card className="border-slate-200/50 dark:border-slate-850 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-2">
              Customize CV Content
            </h3>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Full Name</span>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Professional Title</span>
                  <input
                    type="text"
                    value={profileTitle}
                    onChange={(e) => setProfileTitle(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Email</span>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Phone</span>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">LinkedIn URL</span>
                  <input
                    type="text"
                    value={profileLinkedin}
                    onChange={(e) => setProfileLinkedin(e.target.value)}
                    className="px-2.5 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-lg text-[10px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">GitHub URL</span>
                  <input
                    type="text"
                    value={profileGithub}
                    onChange={(e) => setProfileGithub(e.target.value)}
                    className="px-2.5 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-lg text-[10px]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Portfolio URL</span>
                  <input
                    type="text"
                    value={profilePortfolio}
                    onChange={(e) => setProfilePortfolio(e.target.value)}
                    className="px-2.5 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-lg text-[10px]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Professional Summary</span>
                <textarea
                  value={profileSummary}
                  onChange={(e) => setProfileSummary(e.target.value)}
                  className="w-full h-20 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Skills (Comma Separated)</span>
                <input
                  type="text"
                  value={profileSkills.join(', ')}
                  onChange={(e) => handleSkillsChange(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs"
                  placeholder="e.g. React, Node, Postgres"
                />
              </div>

              {/* Dynamic Experience and Education adders */}
              <div className="border-t border-slate-100 dark:border-slate-900/60 pt-3 flex justify-between gap-3">
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="flex-1 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-all"
                >
                  + Experience Entry
                </button>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="flex-1 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-all"
                >
                  + Education Entry
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Resume A4 Layout Live Preview */}
        <div className="lg:col-span-7 flex flex-col gap-4 items-center bg-slate-100 dark:bg-slate-950/40 p-6 rounded-3xl overflow-x-auto min-h-[90vh]">
          
          <span className="text-[10px] font-bold text-slate-400 uppercase mb-2">A4 Page Print Preview</span>
          
          {/* Printable A4 Container */}
          <div 
            id="print-container"
            className={`a4-page bg-white shadow-xl select-text border border-slate-200/60 ${fontFamilies[selectedFont]} text-slate-800`}
            style={{ 
              width: '210mm', 
              minHeight: '297mm', 
              padding: '18mm', 
              boxSizing: 'border-box',
              color: '#1e293b' // Slate-800 printable standard
            }}
          >
            {/* Template Header layout: Tech style (two-column sidebar style) */}
            {selectedTemplate === 'Tech' && (
              <div className="flex flex-col gap-6">
                
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 pb-4" style={{ borderColor: accentColor }}>
                  <div className="flex flex-col">
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: accentColor }}>{profileName || 'Your Name'}</h1>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{profileTitle || 'Developer'}</span>
                  </div>
                  <div className="flex flex-col items-end text-[10px] text-slate-500 font-bold gap-1 font-mono">
                    <span className="flex items-center gap-1"><Mail size={10} /> {profileEmail}</span>
                    <span className="flex items-center gap-1"><Phone size={10} /> {profilePhone}</span>
                    <span className="flex items-center gap-1"><Globe size={10} /> {profilePortfolio || 'portfolio.com'}</span>
                    <span className="flex items-center gap-1"><Link2 size={10} /> {profileGithub || 'github.com'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                  {/* Left column: Summary & Experience */}
                  <div className="col-span-8 flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider border-b pb-1" style={{ color: accentColor }}>Summary</h4>
                      <p className="text-[10px] leading-relaxed text-slate-650">{profileSummary}</p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider border-b pb-1" style={{ color: accentColor }}>Professional Experience</h4>
                      <div className="flex flex-col gap-4">
                        {profileExperience.map((exp, idx) => (
                          <div key={idx} className="flex flex-col gap-1">
                            <div className="flex justify-between items-start text-[11px] font-bold text-slate-800">
                              <span>{exp.role} — {exp.company}</span>
                              <span className="text-[9px] font-mono text-slate-500 font-normal">{exp.duration}</span>
                            </div>
                            <ul className="list-disc pl-4 space-y-0.5 text-[9px] leading-relaxed text-slate-600">
                              {exp.achievements?.map((ach: string, i: number) => (
                                <li key={i}>{ach}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right column: Skills & Education */}
                  <div className="col-span-4 flex flex-col gap-5 border-l pl-5 border-slate-100">
                    <div className="flex flex-col gap-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider border-b pb-1" style={{ color: accentColor }}>Core Competencies</h4>
                      <div className="flex flex-wrap gap-1">
                        {profileSkills.map((s, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-50 text-[8px] font-bold rounded border border-slate-100">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider border-b pb-1" style={{ color: accentColor }}>Education</h4>
                      <div className="flex flex-col gap-3">
                        {profileEducation.map((edu, idx) => (
                          <div key={idx} className="flex flex-col gap-0.5 text-[9px]">
                            <strong className="text-slate-800 leading-tight">{edu.school}</strong>
                            <span className="text-slate-500">{edu.degree}</span>
                            <span className="text-slate-400 font-mono text-[8px] mt-0.5">{edu.graduation_year} | {edu.grade || '2:1'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {profileCertifications.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider border-b pb-1" style={{ color: accentColor }}>Certifications</h4>
                        <div className="flex flex-col gap-1 text-[8px] font-mono text-slate-500">
                          {profileCertifications.map((c, i) => (
                            <span key={i} className="flex items-center gap-1">• {c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* Template Header layout: NYSC / PPA layout style (green banner, education and PPA featured top) */}
            {selectedTemplate === 'NYSC' && (
              <div className="flex flex-col gap-5">
                <div className="text-center pb-4 border-b-2" style={{ borderColor: accentColor }}>
                  <h1 className="text-2xl font-black tracking-tight" style={{ color: accentColor }}>{profileName || 'Your Name'}</h1>
                  <span className="text-xs font-bold text-slate-450 uppercase tracking-widest mt-1 block">National Youth Service Corps (NYSC) Candidate</span>
                  <div className="flex justify-center gap-3 text-[9px] text-slate-500 font-bold mt-2 font-mono">
                    <span>{profileEmail}</span>
                    <span>•</span>
                    <span>{profilePhone}</span>
                    <span>•</span>
                    <span>{profileLinkedin || 'linkedin.com'}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: accentColor }}>Career Summary</h4>
                  <p className="text-[10px] leading-relaxed text-slate-650">{profileSummary}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: accentColor }}>Primary Place of Assignment (PPA) / Work experience</h4>
                  <div className="flex flex-col gap-3">
                    {profileExperience.map((exp, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex justify-between items-start text-[10px] font-bold text-slate-800">
                          <span>{exp.role} (PPA Role) — {exp.company}</span>
                          <span className="text-[8px] font-mono text-slate-500 font-normal">{exp.duration}</span>
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5 text-[9px] leading-relaxed text-slate-600">
                          {exp.achievements?.map((ach: string, i: number) => (
                            <li key={i}>{ach}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: accentColor }}>Educational Qualifications</h4>
                    <div className="flex flex-col gap-2">
                      {profileEducation.map((edu, idx) => (
                        <div key={idx} className="flex flex-col gap-0.5 text-[9px]">
                          <strong className="text-slate-800">{edu.school}</strong>
                          <span className="text-slate-550">{edu.degree}</span>
                          <span className="text-slate-400 font-mono text-[8px]">{edu.graduation_year} | {edu.grade || 'Second Class Upper'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: accentColor }}>Technical & Soft Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {profileSkills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-[8px] font-bold rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Template Header layout: Graduate / Government / Banking / Healthcare / Engineering / Remote Fallback */}
            {selectedTemplate !== 'Tech' && selectedTemplate !== 'NYSC' && (
              <div className="flex flex-col gap-5">
                {/* Standard traditional header */}
                <div className="text-center pb-4 border-b-2" style={{ borderColor: accentColor }}>
                  <h1 className="text-2xl font-black tracking-tight" style={{ color: accentColor }}>{profileName || 'Your Name'}</h1>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1 block">{profileTitle || 'Professional Candidate'}</span>
                  <div className="flex justify-center gap-3 text-[9px] text-slate-500 font-bold mt-2 font-mono flex-wrap">
                    <span>Email: {profileEmail}</span>
                    <span>•</span>
                    <span>Tel: {profilePhone}</span>
                    {profileLinkedin && (
                      <>
                        <span>•</span>
                        <span>LinkedIn: {profileLinkedin}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: accentColor }}>Summary Profile</h4>
                  <p className="text-[10px] leading-relaxed text-slate-650">{profileSummary}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: accentColor }}>Employment & Work History</h4>
                  <div className="flex flex-col gap-4">
                    {profileExperience.map((exp, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex justify-between items-start text-[10px] font-bold text-slate-800">
                          <span>{exp.role} at {exp.company}</span>
                          <span className="text-[8px] font-mono text-slate-500 font-normal">{exp.duration}</span>
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5 text-[9px] leading-relaxed text-slate-600">
                          {exp.achievements?.map((ach: string, i: number) => (
                            <li key={i}>{ach}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: accentColor }}>Academics & Credentials</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {profileEducation.map((edu, idx) => (
                      <div key={idx} className="flex flex-col gap-0.5 text-[9px]">
                        <strong className="text-slate-850">{edu.school}</strong>
                        <span className="text-slate-600">{edu.degree}</span>
                        <span className="text-slate-400 font-mono text-[8px]">{edu.graduation_year} | Grade: {edu.grade || '2:1'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider border-b pb-0.5" style={{ color: accentColor }}>Core Competencies & Tool Stacks</h4>
                  <div className="flex flex-wrap gap-1">
                    {profileSkills.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-[8px] font-bold rounded">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
};
