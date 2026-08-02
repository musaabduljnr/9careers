import React, { useState } from 'react';
import { TranscriptItem } from '../../../domain/types';
import { Card } from '../Card';
import { Button } from '../Button';
import {
  FileText,
  Search,
  Download,
  Copy,
  Check,
  Bot,
  User,
  Star
} from 'lucide-react';

interface LiveTranscriptProps {
  transcript: TranscriptItem[];
  interviewerName?: string;
  candidateName?: string;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  transcript,
  interviewerName = 'Recruiter (AI)',
  candidateName = 'Candidate (You)'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredTranscript = transcript.filter((t) =>
    t.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyText = () => {
    const text = transcript
      .map(
        (t) =>
          `[Q${t.order} - ${t.category}] ${interviewerName}:\n${t.question}\n\n${candidateName}:\n${t.answer || '(No answer provided)'}\n\nEvaluation Score: ${t.score || 'N/A'}/100\nFeedback: ${t.feedback || 'N/A'}\n------------------------------------------`
      )
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transcript, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `interview_transcript_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <Card className="p-5 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Live Interview Transcript
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
            {transcript.length} turns
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transcript..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <Button variant="secondary" size="sm" onClick={handleCopyText}>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>

          <Button variant="secondary" size="sm" onClick={handleDownloadJSON}>
            <Download className="w-3.5 h-3.5 mr-1" /> Export JSON
          </Button>
        </div>
      </div>

      {/* Transcript Log List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
        {filteredTranscript.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-500">No matching turns in transcript.</p>
        ) : (
          filteredTranscript.map((t, idx) => (
            <div key={idx} className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
              {/* Question Turn */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {interviewerName} <span className="font-normal opacity-70">({t.category})</span>
                    </span>
                    <span className="text-[10px] text-slate-400">{t.timestamp || `Turn ${t.order}`}</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {t.question}
                  </p>
                </div>
              </div>

              {/* Candidate Turn */}
              {t.answer && (
                <div className="flex items-start gap-3 pl-4 border-l-2 border-slate-200 dark:border-slate-800">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{candidateName}</span>
                      {t.score !== undefined && t.score !== null && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-bold text-[10px] flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Score: {t.score}/100
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {t.answer}
                    </p>

                    {/* Feedback if available */}
                    {t.feedback && (
                      <div className="mt-2 p-2.5 rounded-lg bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 text-[11px] text-indigo-700 dark:text-indigo-300">
                        <span className="font-bold">Evaluation Feedback: </span>
                        {t.feedback}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
