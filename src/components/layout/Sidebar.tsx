import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  GitBranch,
  Rocket,
  ShieldCheck,
  Activity,
  Settings,
  Cloud,
  Container,
  Layers,
  HeartPulse,
  Gauge,
  Package,
  FileCode,
  Network,
  Shield
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { auditData, dockerImages, projects } = useDevSecOps();

  const criticalHighCount = (auditData?.critical || 0) + (auditData?.high || 0);

  const menuItems: Array<{
    id: string;
    label: string;
    icon: any;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workspaces', label: 'Workspaces & Projects', icon: FolderGit2, badge: projects.length, badgeColor: 'bg-slate-700' },
    { id: 'cicd', label: 'CI/CD Pipelines', icon: GitBranch },
    { id: 'gitops', label: 'GitOps & Diffs', icon: GitBranch, badge: 'Git', badgeColor: 'bg-orange-600' },
    { id: 'docker', label: 'Docker & Containers', icon: Container, badge: 'Live', badgeColor: 'bg-cyan-600' },
    { id: 'kubernetes', label: 'Kubernetes Cluster', icon: Layers, badge: 'Cluster', badgeColor: 'bg-blue-600' },
    { id: 'helm', label: 'Helm Marketplace', icon: Package, badge: 'Charts', badgeColor: 'bg-blue-500' },
    { id: 'terraform', label: 'Terraform IaC', icon: FileCode },
    { id: 'selfhealing', label: 'Self-Healing & SRE', icon: HeartPulse, badge: 'Watchdog', badgeColor: 'bg-emerald-600' },
    { id: 'tracing', label: 'Distributed Tracing', icon: Network },
    { id: 'traffic', label: 'API & Load Tester', icon: Gauge },
    { id: 'rbac', label: 'Team RBAC & Audit', icon: Shield, badge: 'SOC2', badgeColor: 'bg-amber-600' },
    { id: 'deployments', label: 'Deployments & Tools', icon: Rocket, badge: dockerImages.length > 0 ? `${dockerImages.length} img` : undefined, badgeColor: 'bg-purple-600' },
    { id: 'security', label: 'Security & Quality', icon: ShieldCheck, badge: criticalHighCount > 0 ? criticalHighCount : undefined, badgeColor: 'bg-amber-500' },
    { id: 'observability', label: 'Observability & Logs', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0d1627] text-slate-300 flex flex-col justify-between shrink-0 min-h-screen border-r border-slate-800 select-none">
      {/* Top Branding */}
      <div>
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white">
            <Cloud className="w-6 h-6 fill-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
              DevOpsHub
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
              Build &bull; Deploy &bull; Monitor &bull; Scale
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#2563eb] text-white shadow-md shadow-blue-600/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold text-white ${item.badgeColor || 'bg-slate-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Card */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-slate-900 to-[#13203b] border border-slate-800/90 text-xs shadow-inner">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white text-xs">Production Platform</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Real System &amp; DevOps Data</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
