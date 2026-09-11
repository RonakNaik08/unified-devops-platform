import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  GitBranch,
  Rocket,
  Server,
  Activity,
  Terminal,
  Bell,
  ShieldCheck,
  Settings,
  ChevronRight,
  Cloud,
  Workflow,
  Sparkles,
  Globe
} from 'lucide-react';
import { useDevSecOps, MainTabType } from '../../context/DevSecOpsContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { alerts, vulnerabilities } = useDevSecOps();

  const unpatchedCount = vulnerabilities.filter(v => !v.patched && (v.severity === 'CRITICAL' || v.severity === 'HIGH')).length;
  const firingAlertsCount = alerts.filter(a => a.status === 'Firing').length;

  const menuItems: Array<{ id: string; label: string; icon: any; hasSubmenu?: boolean; badge?: number | string; badgeColor?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'flowchart', label: 'Architecture Flow', icon: Workflow },
    { id: 'applications', label: 'Applications', icon: Boxes, hasSubmenu: true },
    { id: 'cicd', label: 'CI/CD Pipelines', icon: GitBranch },
    { id: 'deployments', label: 'Deployments', icon: Rocket, hasSubmenu: true },
    { id: 'infrastructure', label: 'Infrastructure', icon: Server, hasSubmenu: true },
    { id: 'monitoring', label: 'Monitoring', icon: Activity, hasSubmenu: true },
    { id: 'logs', label: 'Logs', icon: Terminal },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: firingAlertsCount > 0 ? firingAlertsCount : undefined, badgeColor: 'bg-red-500' },
    { id: 'security', label: 'Security', icon: ShieldCheck, badge: unpatchedCount > 0 ? unpatchedCount : undefined, badgeColor: 'bg-amber-500' },
    { id: 'ai-sre', label: 'AI SRE Copilot', icon: Sparkles },
    { id: 'live-app', label: 'Live App Sandbox', icon: Globe, badge: 'Live', badgeColor: 'bg-emerald-500' },
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

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold text-white ${item.badgeColor || 'bg-slate-700'}`}>
                      {item.badge}
                    </span>
                  )}
                  {item.hasSubmenu && (
                    <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promotional Card */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-slate-900 to-[#13203b] border border-slate-800/90 text-xs shadow-inner">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white text-xs">Automated Platform</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Code to Cloud with Confidence</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
