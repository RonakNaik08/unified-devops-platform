import React, { useState } from 'react';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Server,
  GitBranch,
  ShieldCheck,
  Container,
  UploadCloud,
  FileEdit,
  Workflow,
  Cpu,
  Layers,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  RotateCw,
  ExternalLink,
  Code2,
  Radio,
  Clock,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip
} from 'recharts';
import { useDevSecOps } from '../../context/DevSecOpsContext';
import { LocalIntegrationsPanel } from './LocalIntegrationsPanel';

interface DashboardOverviewProps {
  onNavigateTab: (tabId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigateTab }) => {
  const {
    metricsHistory,
    stageStatuses,
    isRunningPipeline,
    runScenario,
    pods,
    alerts,
    vulnerabilities
  } = useDevSecOps();

  const [timeRange, setTimeRange] = useState('Last 1 hour');

  const latestMetric = metricsHistory[metricsHistory.length - 1] || {
    rps: 240,
    latencyMs: 38,
    errorRatePercent: 0.02,
    cpuPercent: 42,
    memoryPercent: 58,
    activePods: 5
  };

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

  // Recent deployments dataset matching the screenshot
  const recentDeployments = [
    { name: 'frontend', version: 'v1.4.2', status: 'Deployed', time: '5 mins ago', icon: Code2, color: 'text-cyan-500' },
    { name: 'backend', version: 'v2.1.0', status: 'Deployed', time: '12 mins ago', icon: Server, color: 'text-emerald-500' },
    { name: 'auth-service', version: 'v1.0.5', status: 'Deployed', time: '1 hour ago', icon: ShieldCheck, color: 'text-purple-500' },
    { name: 'payment-service', version: 'v1.3.1', status: 'Failed', time: '2 hours ago', icon: Layers, color: 'text-red-500' },
    { name: 'notification-service', version: 'v1.2.0', status: 'Deployed', time: '3 hours ago', icon: Radio, color: 'text-blue-500' }
  ];

  // Cluster nodes dataset matching the screenshot
  const clusterNodes = [
    { name: 'ip-10-0-1-12', status: 'Ready', cpu: '32%', memory: '45%' },
    { name: 'ip-10-0-2-18', status: 'Ready', cpu: '41%', memory: '62%' },
    { name: 'ip-10-0-3-25', status: 'Ready', cpu: '28%', memory: '38%' }
  ];

  // Pipeline flow items matching the screenshot
  const pipelineSteps = [
    { id: 'step-1', name: 'Code Push', icon: GitBranch, stageId: 'github' },
    { id: 'step-2', name: 'Build & Test', icon: RotateCw, stageId: 'ci-tests' },
    { id: 'step-3', name: 'Security Scan', icon: ShieldCheck, stageId: 'ci-sonarqube' },
    { id: 'step-4', name: 'Build Image', icon: Container, stageId: 'docker-build' },
    { id: 'step-5', name: 'Push to Registry', icon: UploadCloud, stageId: 'ecr-push' },
    { id: 'step-6', name: 'Update Manifests', icon: FileEdit, stageId: 'update-config' },
    { id: 'step-7', name: 'Deploy (Argo CD)', icon: Workflow, stageId: 'argocd' }
  ];

  const recentAlertsList = [
    { title: 'High error rate (5xx)', severity: 'Critical', time: '10 mins ago', type: 'error' },
    { title: 'Pod restart detected', severity: 'Warning', time: '25 mins ago', type: 'warn' },
    { title: 'High memory usage', severity: 'Warning', time: '1 hour ago', type: 'warn' },
    { title: 'Deployment failed', severity: 'Critical', time: '2 hours ago', type: 'error' },
    { title: 'CPU usage high', severity: 'Warning', time: '3 hours ago', type: 'warn' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back, Ronak! <span className="text-2xl">👋</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Your DevOps platform is running smoothly. Here's an overview of your infrastructure and deployments.
          </p>
        </div>

        <div className="text-right font-medium text-slate-500 text-xs">
          <div className="font-semibold text-slate-700">{currentDate}</div>
          <div className="text-slate-400 font-mono text-[11px] mt-0.5">{currentTime}</div>
        </div>
      </div>

      {/* Top 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Applications */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Applications</span>
            <div className="text-2xl font-black text-slate-900">5</div>
            <div className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <span>&uarr;</span> <span>2 active</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Successful Deployments */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Successful Deployments</span>
            <div className="text-2xl font-black text-slate-900">18</div>
            <div className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <span>&uarr;</span> <span>12% this week</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Open Alerts */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Open Alerts</span>
            <div className="text-2xl font-black text-slate-900">2</div>
            <div className="text-xs font-bold text-red-500 flex items-center gap-0.5">
              <span>&darr;</span> <span>3 from last week</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Cluster Health */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Cluster Health</span>
            <div className="text-2xl font-black text-slate-900">98%</div>
            <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>All systems running</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Server className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Local DevOps Live Auto-Discovery Strip */}
      <LocalIntegrationsPanel />

      {/* Middle Row: CI/CD Pipeline Flow + System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CI/CD Pipeline Card */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">CI/CD Pipeline</h3>
                <p className="text-xs text-slate-400 mt-0.5">Track the progress of your latest deployment</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Pipeline Successful</span>
                </span>

                <button
                  onClick={() => onNavigateTab('cicd')}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>

            {/* Horizontal Flowchart Pipeline */}
            <div className="py-6 overflow-x-auto">
              <div className="flex items-center justify-between min-w-[620px] px-2">
                {pipelineSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = true;
                  return (
                    <React.Fragment key={step.id}>
                      <div className="flex flex-col items-center text-center group cursor-pointer" onClick={() => onNavigateTab('flowchart')}>
                        <div className="relative mb-2">
                          <div className="w-12 h-12 rounded-full bg-slate-50 border-2 border-slate-200 group-hover:border-blue-500 group-hover:bg-blue-50/50 flex items-center justify-center text-slate-700 transition-all shadow-xs">
                            <Icon className="w-5 h-5 text-slate-700 group-hover:text-blue-600" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                            ✓
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-800">{step.name}</span>
                      </div>

                      {idx < pipelineSteps.length - 1 && (
                        <div className="flex-1 flex items-center justify-center px-1">
                          <div className="h-[2px] w-full bg-slate-200 relative">
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 text-xs">&rarr;</span>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Pipeline Metadata Strip */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Repository</div>
              <div className="font-mono font-bold text-slate-800 mt-0.5">devops-platform</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Branch</div>
              <div className="font-mono font-bold text-slate-800 mt-0.5">main</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Commit</div>
              <div className="font-mono font-bold text-blue-600 mt-0.5">a1b2c3d</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Triggered by</div>
              <div className="font-bold text-slate-800 mt-0.5">Ronak Naik</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Duration</div>
              <div className="font-bold text-slate-800 mt-0.5">6m 24s</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Completed at</div>
              <div className="font-medium text-slate-600 mt-0.5">{currentDate}, 09:35 AM</div>
            </div>
          </div>
        </div>

        {/* System Metrics Card */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">System Metrics</h3>
            <button className="flex items-center gap-1 text-xs font-semibold text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50">
              <span>{timeRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* 4 Sparkline Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* CPU */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-semibold text-slate-400">CPU Usage</span>
              </div>
              <div className="text-xl font-black text-slate-900">{latestMetric.cpuPercent}%</div>
              <div className="h-9 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metricsHistory.slice(-8)}>
                    <Area type="monotone" dataKey="cpuPercent" stroke="#2563eb" strokeWidth={2} fill="#3b82f6" fillOpacity={0.15} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Memory */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <Server className="w-4 h-4 text-purple-600" />
                <span className="text-[10px] font-semibold text-slate-400">Memory Usage</span>
              </div>
              <div className="text-xl font-black text-slate-900">{latestMetric.memoryPercent}%</div>
              <div className="h-9 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metricsHistory.slice(-8)}>
                    <Area type="monotone" dataKey="memoryPercent" stroke="#9333ea" strokeWidth={2} fill="#a855f7" fillOpacity={0.15} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Network In */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <ArrowDown className="w-4 h-4 text-cyan-600" />
                <span className="text-[10px] font-semibold text-slate-400">Network In</span>
              </div>
              <div className="text-xl font-black text-slate-900">120 MB/s</div>
              <div className="h-9 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metricsHistory.slice(-8)}>
                    <Area type="monotone" dataKey="rps" stroke="#06b6d4" strokeWidth={2} fill="#06b6d4" fillOpacity={0.15} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Network Out */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <ArrowUp className="w-4 h-4 text-amber-600" />
                <span className="text-[10px] font-semibold text-slate-400">Network Out</span>
              </div>
              <div className="text-xl font-black text-slate-900">95 MB/s</div>
              <div className="h-9 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metricsHistory.slice(-8)}>
                    <Area type="monotone" dataKey="latencyMs" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.15} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Deployments + Kubernetes Cluster Status + Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Recent Deployments */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Recent Deployments</h3>
            <button onClick={() => onNavigateTab('deployments')} className="text-xs font-bold text-blue-600 hover:text-blue-700">
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-semibold border-b border-slate-100">
                  <th className="py-2 px-1">Application</th>
                  <th className="py-2 px-1">Version</th>
                  <th className="py-2 px-1">Status</th>
                  <th className="py-2 px-1 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentDeployments.map((dep, i) => {
                  const Icon = dep.icon;
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Icon className={`w-3.5 h-3.5 ${dep.color}`} />
                          <span>{dep.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-1 font-mono text-slate-500 text-[11px]">{dep.version}</td>
                      <td className="py-2.5 px-1">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          dep.status === 'Deployed' ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dep.status === 'Deployed' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          <span>{dep.status}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-1 text-right text-slate-400 text-[11px]">{dep.time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 2: Kubernetes Cluster Status */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Kubernetes Cluster Status</h3>
            <button onClick={() => onNavigateTab('infrastructure')} className="text-xs font-bold text-blue-600 hover:text-blue-700">
              View Cluster
            </button>
          </div>

          {/* 3 mini stat pills */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-base font-black text-slate-900">3</div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Nodes</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-base font-black text-slate-900">{pods.length}</div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Pods</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-base font-black text-emerald-600">98%</div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Healthy</div>
            </div>
          </div>

          {/* Nodes Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-semibold border-b border-slate-100">
                  <th className="py-2 px-1">Node</th>
                  <th className="py-2 px-1">Status</th>
                  <th className="py-2 px-1">CPU</th>
                  <th className="py-2 px-1 text-right">Memory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clusterNodes.map((n, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-1 font-mono font-bold text-slate-800 text-[11px]">{n.name}</td>
                    <td className="py-2.5 px-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{n.status}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-1 font-mono text-slate-700">{n.cpu}</td>
                    <td className="py-2.5 px-1 text-right font-mono text-slate-700">{n.memory}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 3: Recent Alerts */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Recent Alerts</h3>
            <button onClick={() => onNavigateTab('alerts')} className="text-xs font-bold text-blue-600 hover:text-blue-700">
              View All
            </button>
          </div>

          <div className="space-y-2">
            {recentAlertsList.map((alt, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs hover:bg-slate-100/70 transition-colors">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${alt.type === 'error' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                  <span className="font-bold text-slate-800">{alt.title}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    alt.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {alt.severity}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">{alt.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
