import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  CornerDownLeft,
  Play,
  Copy,
  Check,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';

export const InteractiveTerminalDrawer: React.FC = () => {
  const {
    isTerminalOpen,
    setIsTerminalOpen,
    activeProject,
    executeTerminalCommand
  } = useDevSecOps();

  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<Array<{ command: string; stdout: string; stderr: string; exitCode: number; timestamp: string; cwd: string }>>([
    {
      command: 'system:init',
      stdout: `DevOpsHub Interactive Host Terminal v1.0.0\nTarget Workspace: ${activeProject?.path || '/Users/ronak/Desktop/Projectt'}\nType any bash command or select a quick action chip below.`,
      stderr: '',
      exitCode: 0,
      timestamp: new Date().toLocaleTimeString(),
      cwd: activeProject?.path || '/Users/ronak/Desktop/Projectt'
    }
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [pastCommands, setPastCommands] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isTerminalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTerminalOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isExecuting]);

  if (!isTerminalOpen) return null;

  const handleRunCommand = async (cmdToRun?: string) => {
    const targetCmd = (cmdToRun || command).trim();
    if (!targetCmd || isExecuting) return;

    setIsExecuting(true);
    setPastCommands(prev => [targetCmd, ...prev.filter(c => c !== targetCmd)]);
    setHistoryIndex(-1);
    setCommand('');

    try {
      const res = await executeTerminalCommand(targetCmd);
      setHistory(prev => [
        ...prev,
        {
          command: targetCmd,
          stdout: res.stdout || '',
          stderr: res.stderr || '',
          exitCode: res.exitCode ?? 0,
          timestamp: new Date().toLocaleTimeString(),
          cwd: res.cwd || activeProject?.path || ''
        }
      ]);
    } catch (err: any) {
      setHistory(prev => [
        ...prev,
        {
          command: targetCmd,
          stdout: '',
          stderr: err.message || 'Execution failed',
          exitCode: 1,
          timestamp: new Date().toLocaleTimeString(),
          cwd: activeProject?.path || ''
        }
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRunCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (pastCommands.length > 0 && historyIndex < pastCommands.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setCommand(pastCommands[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setCommand(pastCommands[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  const quickChips = [
    { label: 'git status', cmd: 'git status' },
    { label: 'npm test', cmd: 'npm test' },
    { label: 'npm run build', cmd: 'npm run build' },
    { label: 'docker ps', cmd: 'docker ps' },
    { label: 'docker images', cmd: 'docker images' },
    { label: 'kubectl get all', cmd: 'kubectl get all' },
    { label: 'npm audit', cmd: 'npm audit' }
  ];

  const handleCopyLogs = () => {
    const text = history.map(h => `$ ${h.command}\n${h.stdout || h.stderr}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-[#090d16] text-slate-200 border-t border-slate-800 shadow-2xl transition-all duration-200 flex flex-col ${
        isExpanded ? 'h-[75vh]' : 'h-[360px]'
      }`}
    >
      {/* Terminal Title Bar */}
      <div className="bg-[#0e1422] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white tracking-wide">Host Workspace Terminal</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-400 truncate max-w-xs">
            {activeProject?.path || '/Users/ronak/Desktop/Projectt'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLogs}
            title="Copy Terminal Logs"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setHistory([])}
            title="Clear Console"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Restore size' : 'Expand window'}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsTerminalOpen(false)}
            title="Close Terminal (Ctrl + `)"
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Action Chips Bar */}
      <div className="bg-[#0b101c] px-4 py-1.5 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider shrink-0 mr-1">Quick Run:</span>
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleRunCommand(chip.cmd)}
            disabled={isExecuting}
            className="px-2 py-0.5 rounded-md bg-slate-800/70 hover:bg-blue-600/30 hover:text-blue-300 border border-slate-700/60 font-mono text-[10px] text-slate-300 transition-all shrink-0 active:scale-95"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Output Console Log Area */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-3 select-text bg-[#070a12]">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-1">
            {item.command !== 'system:init' && (
              <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                <span className="text-slate-500 text-[10px]">{item.timestamp}</span>
                <span className="text-blue-400">$</span>
                <span>{item.command}</span>
                {item.exitCode === 0 ? (
                  <span className="text-[10px] px-1 rounded bg-emerald-500/20 text-emerald-400">exit: 0</span>
                ) : (
                  <span className="text-[10px] px-1 rounded bg-red-500/20 text-red-400">exit: {item.exitCode}</span>
                )}
              </div>
            )}

            {item.stdout && (
              <pre className="text-slate-300 whitespace-pre-wrap pl-4 leading-relaxed bg-black/20 p-2 rounded-lg border border-slate-800/50">
                {item.stdout}
              </pre>
            )}

            {item.stderr && (
              <pre className="text-red-400 whitespace-pre-wrap pl-4 leading-relaxed bg-red-950/20 p-2 rounded-lg border border-red-900/40">
                {item.stderr}
              </pre>
            )}
          </div>
        ))}

        {isExecuting && (
          <div className="flex items-center gap-2 text-cyan-400 animate-pulse pl-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>Executing command on host machine...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Command Input Prompt */}
      <div className="bg-[#0b101c] p-2.5 border-t border-slate-800 flex items-center gap-2">
        <span className="text-cyan-400 font-mono font-bold pl-2 flex items-center gap-1">
          <span>❯</span>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={e => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type shell command (e.g. ls -la, git branch, docker ps, npm test) or use Up/Down for history..."
          disabled={isExecuting}
          className="flex-1 bg-transparent border-none text-white font-mono text-xs focus:outline-none placeholder:text-slate-600"
        />
        <button
          onClick={() => handleRunCommand()}
          disabled={isExecuting || !command.trim()}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-30"
        >
          <span>Run</span>
          <CornerDownLeft className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
