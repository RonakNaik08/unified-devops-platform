import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  LayoutDashboard,
  FolderGit2,
  GitBranch,
  Rocket,
  ShieldCheck,
  Activity,
  Terminal,
  FileCode,
  Lock,
  FileText,
  Play,
  RotateCw,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  Bot
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tabId: string) => void;
  onOpenTerminal: () => void;
  onOpenAssetGenerator: () => void;
  onOpenSecrets: () => void;
  onOpenCompliance: () => void;
}

interface ActionItem {
  id: string;
  title: string;
  category: string;
  icon: any;
  badge?: string;
  action: () => void | Promise<any>;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenTerminal,
  onOpenAssetGenerator,
  onOpenSecrets,
  onOpenCompliance
}) => {
  const {
    projects,
    activeProjectId,
    switchProject,
    executeRealPipeline,
    runSecurityRemediation
  } = useDevSecOps();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const allActions: ActionItem[] = [
    // Navigation
    { id: 'nav-dash', title: 'Go to Dashboard', category: 'Navigation', icon: LayoutDashboard, action: () => onNavigateTab('dashboard') },
    { id: 'nav-work', title: 'Go to Workspaces & Projects', category: 'Navigation', icon: FolderGit2, action: () => onNavigateTab('workspaces') },
    { id: 'nav-cicd', title: 'Go to CI/CD Pipelines', category: 'Navigation', icon: GitBranch, action: () => onNavigateTab('cicd') },
    { id: 'nav-git', title: 'Go to GitOps Commit Graph & Diffs', category: 'Navigation', icon: GitBranch, action: () => onNavigateTab('gitops') },
    { id: 'nav-doc', title: 'Go to Docker Engine & Containers', category: 'Navigation', icon: Layers, action: () => onNavigateTab('docker') },
    { id: 'nav-k8s', title: 'Go to Kubernetes Cluster Explorer', category: 'Navigation', icon: Layers, action: () => onNavigateTab('kubernetes') },
    { id: 'nav-helm', title: 'Go to Helm Chart Marketplace', category: 'Navigation', icon: Rocket, action: () => onNavigateTab('helm') },
    { id: 'nav-tf', title: 'Go to Terraform / OpenTofu IaC Studio', category: 'Navigation', icon: FileCode, action: () => onNavigateTab('terraform') },
    { id: 'nav-heal', title: 'Go to Automated SRE Self-Healing Engine', category: 'Navigation', icon: ShieldCheck, action: () => onNavigateTab('selfhealing') },
    { id: 'nav-trace', title: 'Go to OpenTelemetry Distributed Tracing', category: 'Navigation', icon: Activity, action: () => onNavigateTab('tracing') },
    { id: 'nav-traf', title: 'Go to API Client & Traffic Load Benchmarker', category: 'Navigation', icon: Activity, action: () => onNavigateTab('traffic') },
    { id: 'nav-rbac', title: 'Go to Team RBAC & Audit Ledger', category: 'Navigation', icon: ShieldCheck, action: () => onNavigateTab('rbac') },
    { id: 'nav-dep', title: 'Go to Deployments & Tools', category: 'Navigation', icon: Rocket, action: () => onNavigateTab('deployments') },
    { id: 'nav-sec', title: 'Go to Security & Quality', category: 'Navigation', icon: ShieldCheck, action: () => onNavigateTab('security') },
    { id: 'nav-obs', title: 'Go to Observability & Logs', category: 'Navigation', icon: Activity, action: () => onNavigateTab('observability') },

    // Quick Actions
    { id: 'act-ai', title: 'Ask AI DevOps & SRE Copilot Robot', category: 'Actions', icon: Bot, action: () => { window.dispatchEvent(new CustomEvent('open-ai-chat')); } },
    { id: 'act-run', title: 'Run Build & Deploy Pipeline', category: 'Actions', icon: Play, action: () => executeRealPipeline() },
    { id: 'act-term', title: 'Open Interactive Host Terminal', category: 'Actions', icon: Terminal, action: onOpenTerminal },
    { id: 'act-gen', title: 'Generate Dockerfile & K8s Manifests', category: 'Actions', icon: Sparkles, action: onOpenAssetGenerator },
    { id: 'act-sec', title: 'Manage .env & Kubernetes Secrets', category: 'Actions', icon: Lock, action: onOpenSecrets },
    { id: 'act-comp', title: 'Export DevSecOps Compliance Report', category: 'Actions', icon: FileText, action: onOpenCompliance },
    { id: 'act-rem', title: 'Run 1-Click Security Auto-Remediation (npm audit fix)', category: 'Actions', icon: RotateCw, action: () => runSecurityRemediation() },

    // Workspaces
    ...projects.map(p => ({
      id: `proj-${p.id}`,
      title: `Switch Workspace: ${p.name}`,
      category: 'Workspaces',
      icon: FolderGit2,
      badge: p.id === activeProjectId ? 'ACTIVE' : undefined,
      action: () => switchProject(p.id)
    }))
  ];

  const filtered = allActions.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search (e.g. Run Build, Terminal, Dockerfile, Switch)..."
            className="flex-1 bg-transparent border-none text-sm font-semibold text-slate-800 focus:outline-none placeholder:text-slate-400"
          />
          <kbd className="px-2 py-0.5 rounded-lg bg-slate-100 text-[10px] font-mono font-bold text-slate-500 border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs transition-all text-left ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{item.title}</div>
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-white text-blue-600' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400 font-mono">
              No matching commands found for "{query}"
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span>Use <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px]">↓</kbd> to navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px]">ENTER</kbd> to select</span>
          </div>
          <span>DevOpsHub Global Control</span>
        </div>
      </div>
    </div>
  );
};
