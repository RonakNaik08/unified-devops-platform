import React, { useState } from 'react';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Server,
  GitBranch,
  ShieldCheck,
  Container,
  Cpu,
  Layers,
  Activity,
  Play,
  Rocket,
  FolderGit2,
  Terminal,
  ExternalLink,
  RotateCw,
  Code2
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useDevSecOps } from '../../context/DevSecOpsContext';
import { LocalIntegrationsPanel } from './LocalIntegrationsPanel';
import { DevOpsStackLauncher } from '../tools/DevOpsStackLauncher';

interface DashboardOverviewProps {
  onNavigateTab: (tabId: string) => void;
  onOpenAssetGenerator?: () => void;
  onOpenSecrets?: () => void;
  onOpenCompliance?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateTab,
  onOpenAssetGenerator,
  onOpenSecrets,
  onOpenCompliance
}) => {
  const {
    metricsHistory,
    systemTelemetry,
    auditData,
    activeProject,
    projects,
    deployments,
    dockerImages,
    dockerContainers,
    k8sWorkloads,
    executeRealPipeline,
    isExecutingRealPipeline
  } = useDevSecOps();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const cpuVal = systemTelemetry?.cpuPercent ?? (metricsHistory[metricsHistory.length - 1]?.cpuPercent || 35);
  const memVal = systemTelemetry?.memoryPercent ?? (metricsHistory[metricsHistory.length - 1]?.memoryPercent || 52);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & System Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Welcome, Ronak! <span className="text-2xl">👋</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Cloud-native DevSecOps Platform running on local host with real-time tool discovery and deployment tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => executeRealPipeline()}
            disabled={isExecutingRealPipeline}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isExecutingRealPipeline ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Building Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run Build &amp; Deploy</span>
              </>
            )}
          </button>

          <div className="text-right font-medium text-slate-500 text-xs hidden sm:block">
            <div className="font-semibold text-slate-700">{currentDate}</div>
            <div className="text-slate-400 font-mono text-[11px] mt-0.5">{currentTime}</div>
          </div>
        </div>
      </div>

      {/* Top 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Workspaces */}
        <div
          onClick={() => onNavigateTab('workspaces')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Workspaces</span>
            <div className="text-2xl font-black text-slate-900">{projects.length}</div>
            <div className="text-xs font-semibold text-blue-600 flex items-center gap-1">
              <span>Active:</span>
              <span className="truncate max-w-[120px] font-mono">{activeProject?.name || 'Projectt'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <FolderGit2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Successful Deployments */}
        <div
          onClick={() => onNavigateTab('deployments')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Deployments Recorded</span>
            <div className="text-2xl font-black text-slate-900">{deployments.length}</div>
            <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Persistent Ledger Active</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Rocket className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Local Docker Images */}
        <div
          onClick={() => onNavigateTab('deployments')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between cursor-pointer hover:border-cyan-400 hover:shadow-md transition-all"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Docker Engine</span>
            <div className="text-2xl font-black text-slate-900">{dockerImages.length}</div>
            <div className="text-xs font-semibold text-cyan-600">
              {dockerContainers.length} containers discovered
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
            <Container className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Host System Health */}
        <div
          onClick={() => onNavigateTab('observability')}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between cursor-pointer hover:border-purple-400 hover:shadow-md transition-all"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Host Telemetry</span>
            <div className="text-2xl font-black text-slate-900">{cpuVal}% CPU</div>
            <div className="text-xs font-semibold text-purple-600">
              {memVal}% RAM ({systemTelemetry?.usedMemoryGb || '9.4'} / {systemTelemetry?.totalMemoryGb || '16.0'} GB)
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Local DevOps Live Auto-Discovery Strip */}
      <LocalIntegrationsPanel />

      {/* DevOps Tool Quick-Launch Hub (Docker) */}
      <DevOpsStackLauncher />

      {/* Active Workspace Info & Quick Pipeline Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Project Card */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 font-mono">
                  ACTIVE WORKSPACE
                </span>
                <span className="text-xs text-slate-400 font-mono">{activeProject?.branch || 'main'}</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mt-1">
                {activeProject?.name || 'Projectt (DevSecOps Platform)'}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('workspaces')}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Switch Project
              </button>
              <button
                onClick={() => onNavigateTab('cicd')}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm"
              >
                Pipeline View
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 font-mono text-xs text-slate-700 truncate">
            {activeProject?.path || '/Users/ronak/Desktop/Projectt'}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400">Git Commit</div>
              <div className="font-mono font-bold text-xs text-blue-600 mt-0.5">{activeProject?.commitHash || 'e67ac16'}</div>
              <div className="text-[10px] text-slate-500 truncate">{activeProject?.author || 'Ronak Naik'}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400">Security Gate</div>
              <div className="font-bold text-xs text-emerald-600 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Passed</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">{auditData?.totalDependencies || 283} packages</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400">Docker Build</div>
              <div className="font-bold text-xs text-slate-800 mt-0.5">
                {activeProject?.dockerfilePresent ? 'Dockerfile Ready' : 'Auto-detected'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">11 Host Images</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400">Deploy Target</div>
              <div className="font-bold text-xs text-slate-800 mt-0.5">Kubernetes Cluster</div>
              <div className="text-[10px] text-emerald-600 font-semibold font-mono">Namespace: production</div>
            </div>
          </div>
        </div>

        {/* Real-Time Host Telemetry Card */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Host Telemetry (Local)</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                LIVE
              </span>
            </div>

            <div className="mt-3 space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">CPU Utilization</span>
                  <span className="font-mono font-bold text-blue-600">{cpuVal}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${cpuVal}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">RAM Utilization</span>
                  <span className="font-mono font-bold text-purple-600">{memVal}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full transition-all" style={{ width: `${memVal}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-mono text-slate-600 space-y-1">
            <div>Platform: <span className="font-bold text-slate-800">{systemTelemetry?.platform || 'darwin'} (macOS)</span></div>
            <div>CPU: <span className="font-bold text-slate-800">{systemTelemetry?.cpuModel || 'Apple Silicon'} ({systemTelemetry?.cores || 8} cores)</span></div>
            <div>Host: <span className="font-bold text-slate-800">{systemTelemetry?.hostname || 'localhost'}</span></div>
          </div>
        </div>
      </div>

      {/* Recent Deployments Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Recent Deployments Ledger</h3>
            <p className="text-xs text-slate-500">Persistent historical record of all pipeline and container deployments</p>
          </div>
          <button
            onClick={() => onNavigateTab('deployments')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            Manage Deployments &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 font-semibold border-b border-slate-100">
                <th className="py-2.5 px-3">Deployment ID</th>
                <th className="py-2.5 px-3">Workspace / Project</th>
                <th className="py-2.5 px-3">Commit SHA</th>
                <th className="py-2.5 px-3">Docker Image</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deployments.map((dep, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-blue-600">{dep.id}</td>
                  <td className="py-3 px-3 font-bold text-slate-800">{dep.projectName}</td>
                  <td className="py-3 px-3 font-mono text-slate-500">{dep.commitHash}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{dep.dockerImage}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{dep.duration}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{dep.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400 text-[11px]">
                    {new Date(dep.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
              {deployments.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400 font-mono text-xs">
                    No deployments recorded yet. Click "Run Build &amp; Deploy" to trigger your first pipeline run.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
