import React from 'react';
import {
  Workflow,
  GitBranch,
  ShieldAlert,
  Boxes,
  Cpu,
  BarChart3,
  Flame,
  Bot,
  Globe
} from 'lucide-react';
import { useDevSecOps, MainTabType } from '../../context/DevSecOpsContext';

export const NavigationTabs: React.FC = () => {
  const { activeTab, setActiveTab, alerts, vulnerabilities } = useDevSecOps();

  const unpatchedCount = vulnerabilities.filter(v => !v.patched && (v.severity === 'CRITICAL' || v.severity === 'HIGH')).length;
  const firingAlerts = alerts.filter(a => a.status === 'Firing').length;

  const tabs: Array<{ id: MainTabType; label: string; icon: any; badge?: number | string; badgeColor?: string }> = [
    { id: 'flowchart', label: 'Architecture Flowchart', icon: Workflow },
    { id: 'cicd', label: 'CI/CD Pipelines', icon: GitBranch },
    { id: 'security', label: 'DevSecOps & Security', icon: ShieldAlert, badge: unpatchedCount > 0 ? unpatchedCount : undefined, badgeColor: 'bg-red-500' },
    { id: 'gitops', label: 'GitOps & Terraform', icon: Boxes },
    { id: 'kubernetes', label: 'AWS EKS Cluster', icon: Cpu },
    { id: 'observability', label: 'Observability & Metrics', icon: BarChart3 },
    { id: 'self-healing', label: 'Self-Healing & Chaos', icon: Flame, badge: firingAlerts > 0 ? firingAlerts : undefined, badgeColor: 'bg-amber-500' },
    { id: 'ai-copilot', label: 'AI SRE Copilot', icon: Bot },
    { id: 'live-app', label: 'Live App Sandbox', icon: Globe, badge: 'Active', badgeColor: 'bg-emerald-500' }
  ];

  return (
    <nav className="bg-[#0b101e] border-b border-slate-800 px-4">
      <div className="max-w-[1600px] mx-auto flex items-center gap-1 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold text-white ${tab.badgeColor || 'bg-slate-700'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
