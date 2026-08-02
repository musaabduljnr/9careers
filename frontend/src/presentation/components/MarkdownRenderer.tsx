import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  // Simple custom Markdown parser that handles:
  // - Headers (###, ##, #)
  // - Bold (**text**)
  // - Bullet points (- or *)
  // - Line breaks & Paragraphs
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Headers
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-base font-bold text-slate-800 dark:text-slate-100 mt-4 mb-2">
            {formatBold(trimmed.substring(4))}
          </h4>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-5 mb-3 border-b border-slate-100 dark:border-slate-800 pb-1">
            {formatBold(trimmed.substring(3))}
          </h3>
        );
      }
      if (trimmed.startsWith('# ')) {
        return (
          <h2 key={idx} className="text-xl font-black text-slate-900 dark:text-white mt-6 mb-4">
            {formatBold(trimmed.substring(2))}
          </h2>
        );
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={idx} className="text-sm text-slate-600 dark:text-slate-350 ml-4 list-disc mb-1.5 leading-relaxed">
            {formatBold(trimmed.substring(2))}
          </li>
        );
      }

      // Empty lines
      if (trimmed === '') {
        return <div key={idx} className="h-2" />;
      }

      // Regular paragraphs
      return (
        <p key={idx} className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed mb-2.5">
          {formatBold(line)}
        </p>
      );
    });
  };

  // Helper to format bold elements: **text**
  const formatBold = (text: string): React.ReactNode => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    if (parts.length === 1) return text;
    
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-semibold text-slate-900 dark:text-white">{part}</strong>;
      }
      return part;
    });
  };

  return <div className="space-y-1">{parseMarkdown(content)}</div>;
};
