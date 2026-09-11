import React, { useState } from 'react';
import { Copy, Check, FileCode } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language: string;
  fileName?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code, language, fileName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split('\n');

  return (
    <div className="rounded-xl bg-[#090d16] border border-slate-800 overflow-hidden shadow-inner">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950/80 border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <FileCode className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-200 font-semibold">{fileName || `${language} snippet`}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">{language}</span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="p-3 font-mono text-xs overflow-x-auto max-h-72 leading-relaxed select-text">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30">
                <td className="text-[11px] text-slate-600 select-none text-right pr-3 pl-1 align-top w-8">
                  {idx + 1}
                </td>
                <td className="text-slate-200 whitespace-pre">
                  <span className={
                    line.startsWith('#') || line.startsWith('//')
                      ? 'text-slate-500'
                      : line.includes('resource ') || line.includes('apiVersion:') || line.includes('kind:')
                      ? 'text-purple-400 font-semibold'
                      : line.includes('image:') || line.includes('source')
                      ? 'text-cyan-400'
                      : line.includes('http') || line.includes('name:')
                      ? 'text-emerald-400'
                      : 'text-slate-200'
                  }>
                    {line}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
