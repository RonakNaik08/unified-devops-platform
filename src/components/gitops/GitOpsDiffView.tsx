import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  Clock,
  User,
  FileCode,
  Plus,
  Send,
  RefreshCw,
  Terminal,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';

export const GitOpsDiffView: React.FC = () => {
  const { activeProject, gitInfo } = useDevSecOps();
  const [commits, setCommits] = useState<any[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<string>('HEAD');
  const [diffContent, setDiffContent] = useState<string>('');
  const [isLoadingDiff, setIsLoadingDiff] = useState(false);

  // Commit & Push Studio
  const [commitMessage, setCommitMessage] = useState('feat: update microservice logic');
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitLogs, setCommitLogs] = useState<string[]>([]);

  const fetchDiff = async (hash: string) => {
    setIsLoadingDiff(true);
    try {
      const res = await fetch(`http://localhost:5001/api/v1/git/diff?commitHash=${hash}`);
      const data = await res.json();
      setDiffContent(data.diff || 'No diff available');
    } catch (err) {
      setDiffContent('Failed to load git diff');
    } finally {
      setIsLoadingDiff(false);
    }
  };

  useEffect(() => {
    if (gitInfo?.commits) {
      setCommits(gitInfo.commits);
    }
    fetchDiff(selectedCommit);
  }, [gitInfo, selectedCommit]);

  const handleCommitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;
    setIsCommitting(true);
    setCommitLogs([`[${new Date().toLocaleTimeString()}] Executing git add . && git commit...`]);

    try {
      const res = await fetch('http://localhost:5001/api/v1/git/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: commitMessage.trim() })
      });
      const data = await res.json();
      if (data.logs) setCommitLogs(data.logs);
      setCommitMessage('');
      fetchDiff('HEAD');
    } catch (err: any) {
      setCommitLogs(prev => [...prev, `Error: ${err.message}`]);
    } finally {
      setIsCommitting(false);
    }
  };

  const diffLines = diffContent.split('\n');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              GitOps &amp; Visual Commit Diff Studio
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono font-bold border border-slate-200">
                {gitInfo?.branch || 'main'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect branch commit timeline, line-by-line file diffs, and execute repository commits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200">
            HEAD: {gitInfo?.commitHash || 'HEAD'}
          </span>
        </div>
      </div>

      {/* Main Grid: Commits on Left, Diff on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Commits Timeline & Commit Studio */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1-Click Commit Studio */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-3">
            <div className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-orange-600" />
              <span>Git Commit &amp; Sync Studio</span>
            </div>

            <form onSubmit={handleCommitSubmit} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Commit message (e.g. feat: add payment retry)"
                value={commitMessage}
                onChange={e => setCommitMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500"
              />

              <button
                type="submit"
                disabled={isCommitting || !commitMessage.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isCommitting ? 'Committing...' : 'Commit & Stage Changes'}</span>
              </button>
            </form>

            {commitLogs.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] space-y-1">
                {commitLogs.map((l, i) => (
                  <div key={i}>{l}</div>
                ))}
              </div>
            )}
          </div>

          {/* Commit History Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider text-slate-400">
              Recent Repository Commits
            </h3>

            <div className="space-y-2">
              {(commits.length > 0 ? commits : [
                { hash: 'HEAD', author: 'Ronak Naik', date: 'just now', message: 'feat: add Docker and K8s integrations' },
                { hash: 'a8b1c2d', author: 'Ronak Naik', date: '2 hours ago', message: 'feat: add AI SRE Copilot Robot' },
                { hash: 'e4f5g6h', author: 'Ronak Naik', date: '4 hours ago', message: 'chore: initial workspace setup' }
              ]).map((c: any) => {
                const isSelected = selectedCommit === c.hash;
                return (
                  <button
                    key={c.hash}
                    onClick={() => {
                      setSelectedCommit(c.hash);
                      fetchDiff(c.hash);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all border ${
                      isSelected
                        ? 'bg-orange-50/70 border-orange-200 text-orange-950 font-semibold'
                        : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200/80 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono font-bold text-orange-600">{c.hash.slice(0, 7)}</span>
                      <span className="text-slate-400">{c.date}</span>
                    </div>
                    <div className="text-xs text-slate-900 line-clamp-1">{c.message}</div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{c.author}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Diff Viewer */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl p-6 text-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold font-mono">
                Diff Viewer: Commit {selectedCommit}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {diffLines.length} lines inspected
            </span>
          </div>

          <div className="p-4 rounded-xl bg-black border border-slate-900 font-mono text-xs overflow-x-auto max-h-[600px] overflow-y-auto space-y-0.5">
            {isLoadingDiff ? (
              <div className="text-center py-12 text-slate-500">Loading git diff...</div>
            ) : (
              diffLines.map((line, i) => {
                let colorClass = 'text-slate-400';
                let bgClass = '';

                if (line.startsWith('+') && !line.startsWith('+++')) {
                  colorClass = 'text-emerald-400';
                  bgClass = 'bg-emerald-500/10';
                } else if (line.startsWith('-') && !line.startsWith('---')) {
                  colorClass = 'text-red-400';
                  bgClass = 'bg-red-500/10';
                } else if (line.startsWith('@@')) {
                  colorClass = 'text-cyan-400 font-bold';
                  bgClass = 'bg-cyan-500/10';
                } else if (line.startsWith('diff --git')) {
                  colorClass = 'text-amber-300 font-bold';
                }

                return (
                  <div key={i} className={`px-2 py-0.5 rounded leading-relaxed whitespace-pre font-mono ${colorClass} ${bgClass}`}>
                    {line}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
