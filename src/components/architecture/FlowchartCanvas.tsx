import React from 'react';
import {
  User,
  GitBranch,
  FileCode,
  CheckCircle,
  Search,
  Shield,
  Layers,
  Container,
  AlertOctagon,
  Check,
  UploadCloud,
  FileEdit,
  GitCommit,
  Workflow,
  Server,
  Code2,
  Database,
  FileSpreadsheet,
  Key,
  Network,
  RotateCw,
  GitCompare,
  RotateCcw,
  Globe,
  Flame,
  LineChart,
  Terminal,
  Activity,
  Bell,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Cpu,
  RefreshCw,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';
import { PipelineStageId, StageStatus } from '../../types/devsecops';
import { soundFx } from '../../utils/soundFx';

export const FlowchartCanvas: React.FC = () => {
  const { selectedNode, setSelectedNode, stageStatuses, isRunningPipeline, soundEnabled } = useDevSecOps();

  const handleNodeClick = (id: PipelineStageId) => {
    if (soundEnabled) soundFx.playClick();
    setSelectedNode(id);
  };

  const getNodeStatusClass = (id: PipelineStageId) => {
    const status = stageStatuses[id] || 'idle';
    const isSelected = selectedNode === id;
    
    let base = 'transition-all duration-200 cursor-pointer rounded-xl border relative ';
    
    if (isSelected) {
      base += 'ring-2 ring-cyan-400 border-cyan-400 ';
    }

    switch (status) {
      case 'running':
        return base + 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/30';
      case 'success':
        return base + 'bg-emerald-950/50 border-emerald-500/70 text-emerald-200';
      case 'failed':
        return base + 'bg-red-950/70 border-red-500 text-red-200 shadow-md shadow-red-500/40 animate-pulse';
      case 'warning':
        return base + 'bg-amber-950/60 border-amber-500/70 text-amber-200';
      case 'remediating':
        return base + 'bg-purple-950/70 border-purple-400 text-purple-200';
      default:
        return base + 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850';
    }
  };

  const renderBadge = (id: PipelineStageId) => {
    const status = stageStatuses[id] || 'idle';
    if (status === 'idle') return null;

    const badges: Record<StageStatus, { label: string; color: string }> = {
      running: { label: 'RUNNING', color: 'bg-cyan-400 text-black' },
      success: { label: 'PASSED', color: 'bg-emerald-400 text-black' },
      failed: { label: 'FAILED', color: 'bg-red-500 text-white' },
      warning: { label: 'ALERT', color: 'bg-amber-400 text-black' },
      remediating: { label: 'HEALING', color: 'bg-purple-400 text-black' },
      idle: { label: '', color: '' }
    };

    const b = badges[status];
    return (
      <span className={`absolute -top-2 -right-2 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded shadow ${b.color}`}>
        {b.label}
      </span>
    );
  };

  return (
    <div className="w-full space-y-4 select-none">
      {/* Platform Title Banner */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white shadow-sm">
          <Workflow className="w-4 h-4 text-cyan-400" />
          <span>Automated DevSecOps Platform</span>
          <span className="text-slate-400 font-normal text-xs hidden sm:inline">(Code to Cloud with Monitoring &amp; Self-Healing)</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Click any component below to view configuration manifests, live logs, security reports, and metrics.
        </p>
      </div>

      {/* STAGE 1: Developer -> GitHub -> CI Pipeline */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>1. Source Code &amp; CI Pipeline (GitHub Actions)</span>
          <span className="text-[10px] font-mono text-cyan-400">Automated Testing &amp; Security Gates</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* Developer */}
          <div
            onClick={() => handleNodeClick('developer')}
            className={`lg:col-span-2 p-3 ${getNodeStatusClass('developer')}`}
          >
            {renderBadge('developer')}
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Developer</div>
                <div className="text-[10px] text-slate-400">Write / Update Code</div>
              </div>
            </div>
            <div className="mt-2 text-[10px] font-mono text-cyan-400 flex items-center justify-between border-t border-slate-800 pt-1">
              <span>1. Push Code</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* GitHub */}
          <div
            onClick={() => handleNodeClick('github')}
            className={`lg:col-span-2 p-3 ${getNodeStatusClass('github')}`}
          >
            {renderBadge('github')}
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <GitBranch className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">GitHub</div>
                <div className="text-[10px] text-slate-400">Source Repository</div>
              </div>
            </div>
            <div className="mt-2 text-[10px] font-mono text-indigo-400 flex items-center justify-between border-t border-slate-800 pt-1">
              <span>2. Trigger CI</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* CI Pipeline Stages (5 steps) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div onClick={() => handleNodeClick('ci-checkout')} className={`p-2.5 text-center ${getNodeStatusClass('ci-checkout')}`}>
              {renderBadge('ci-checkout')}
              <FileCode className="w-4 h-4 mx-auto text-cyan-400 mb-1" />
              <div className="text-[11px] font-bold">Checkout Code</div>
              <div className="text-[9px] text-slate-500 font-mono">actions/checkout</div>
            </div>

            <div onClick={() => handleNodeClick('ci-tests')} className={`p-2.5 text-center ${getNodeStatusClass('ci-tests')}`}>
              {renderBadge('ci-tests')}
              <CheckCircle className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
              <div className="text-[11px] font-bold">Run Unit Tests</div>
              <div className="text-[9px] text-emerald-400 font-mono">84/84 Passed</div>
            </div>

            <div onClick={() => handleNodeClick('ci-sonarqube')} className={`p-2.5 text-center ${getNodeStatusClass('ci-sonarqube')}`}>
              {renderBadge('ci-sonarqube')}
              <Search className="w-4 h-4 mx-auto text-blue-400 mb-1" />
              <div className="text-[11px] font-bold">Code Quality</div>
              <div className="text-[9px] text-blue-400 font-mono">SonarQube (Grade A)</div>
            </div>

            <div onClick={() => handleNodeClick('ci-sast')} className={`p-2.5 text-center ${getNodeStatusClass('ci-sast')}`}>
              {renderBadge('ci-sast')}
              <Shield className="w-4 h-4 mx-auto text-purple-400 mb-1" />
              <div className="text-[11px] font-bold">Security Scan</div>
              <div className="text-[9px] text-purple-400 font-mono">SAST / CodeQL</div>
            </div>

            <div onClick={() => handleNodeClick('ci-dependency')} className={`p-2.5 text-center col-span-2 sm:col-span-1 ${getNodeStatusClass('ci-dependency')}`}>
              {renderBadge('ci-dependency')}
              <Layers className="w-4 h-4 mx-auto text-amber-400 mb-1" />
              <div className="text-[11px] font-bold">Dependency Scan</div>
              <div className="text-[9px] text-amber-400 font-mono">Snyk / OWASP</div>
            </div>
          </div>
        </div>
      </div>

      {/* STAGE 2: Build & Scan -> Update Config -> GitOps Repo -> Argo CD */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>2. Build, Container Security Scan &amp; GitOps Delivery</span>
          <span className="text-[10px] font-mono text-cyan-400">Trivy Policy Gate &bull; Declarative ArgoCD</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* Build & Scan Box */}
          <div className="lg:col-span-5 grid grid-cols-4 gap-2 text-center">
            <div onClick={() => handleNodeClick('docker-build')} className={`p-2.5 ${getNodeStatusClass('docker-build')}`}>
              {renderBadge('docker-build')}
              <Container className="w-4 h-4 mx-auto text-blue-400 mb-1" />
              <div className="text-[10px] font-bold">Build Docker</div>
              <div className="text-[9px] text-slate-500 font-mono">Image v1.2.0</div>
            </div>

            <div onClick={() => handleNodeClick('trivy-scan')} className={`p-2.5 ${getNodeStatusClass('trivy-scan')}`} title="Click to view Trivy security scan">
              {renderBadge('trivy-scan')}
              <Shield className="w-4 h-4 mx-auto text-cyan-400 mb-1" />
              <div className="text-[10px] font-bold">Scan (Trivy)</div>
              <div className="text-[9px] text-cyan-400 font-mono">CVE Check</div>
            </div>

            <div onClick={() => handleNodeClick('vuln-gate')} className={`p-2.5 rounded-xl border text-center ${
              stageStatuses['vuln-gate'] === 'failed'
                ? 'bg-red-950/80 border-red-500 text-red-300'
                : stageStatuses['vuln-gate'] === 'success'
                ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}>
              {renderBadge('vuln-gate')}
              <div className="text-[9px] font-mono font-bold">Vulns Found?</div>
              <div className="flex items-center justify-center gap-1 mt-1 text-[8px] font-bold">
                <span className="text-red-400">Yes &rarr; Fail</span>
                <span className="text-slate-600">|</span>
                <span className="text-emerald-400">No &rarr; Pass</span>
              </div>
            </div>

            <div onClick={() => handleNodeClick('ecr-push')} className={`p-2.5 ${getNodeStatusClass('ecr-push')}`}>
              {renderBadge('ecr-push')}
              <UploadCloud className="w-4 h-4 mx-auto text-indigo-400 mb-1" />
              <div className="text-[10px] font-bold">Push to ECR</div>
              <div className="text-[9px] text-slate-500 font-mono">AWS Registry</div>
            </div>
          </div>

          {/* Update Deployment Config */}
          <div onClick={() => handleNodeClick('update-config')} className={`lg:col-span-3 p-3 ${getNodeStatusClass('update-config')}`}>
            {renderBadge('update-config')}
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <FileEdit className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Update Deployment Config</div>
                <div className="text-[10px] text-slate-400">Update tag in Helm/Kustomize</div>
              </div>
            </div>
            <div className="mt-2 text-[10px] font-mono text-emerald-400 flex items-center justify-between border-t border-slate-800 pt-1">
              <span>Commit Changes</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* GitOps Repository */}
          <div onClick={() => handleNodeClick('gitops-repo')} className={`lg:col-span-2 p-3 ${getNodeStatusClass('gitops-repo')}`}>
            {renderBadge('gitops-repo')}
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
                <GitCommit className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">GitOps Repo</div>
                <div className="text-[10px] text-slate-400">Helm Manifests</div>
              </div>
            </div>
            <div className="mt-2 text-[10px] font-mono text-red-400 flex items-center justify-between border-t border-slate-800 pt-1">
              <span>Detect Changes</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* Argo CD */}
          <div onClick={() => handleNodeClick('argocd')} className={`lg:col-span-2 p-3 ${getNodeStatusClass('argocd')}`}>
            {renderBadge('argocd')}
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <Workflow className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Argo CD</div>
                <div className="text-[10px] text-slate-400">Auto Deployment</div>
              </div>
            </div>
            <div className="mt-2 text-[10px] font-mono text-purple-400 flex items-center justify-between border-t border-slate-800 pt-1">
              <span>GitOps Sync</span>
              <span>&rarr;</span>
            </div>
          </div>
        </div>
      </div>

      {/* STAGE 3: Infrastructure (Terraform) & AWS EKS Cluster -> Strategy -> Live App */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>3. Infrastructure (Terraform) &amp; AWS EKS Kubernetes Cluster</span>
          <span className="text-[10px] font-mono text-emerald-400">3-Tier Cloud-Native Architecture</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          {/* Terraform IaC */}
          <div onClick={() => handleNodeClick('terraform-iac')} className={`lg:col-span-3 p-3.5 space-y-2 ${getNodeStatusClass('terraform-iac')}`}>
            {renderBadge('terraform-iac')}
            <div className="flex items-center gap-2 pb-1 border-b border-slate-800 text-xs font-bold text-purple-400">
              <Server className="w-4 h-4" />
              <span>Infrastructure as Code (Terraform)</span>
            </div>
            <div className="space-y-1 text-[11px] font-mono text-slate-300">
              <div className="flex items-center gap-1.5 py-0.5"><Network className="w-3 h-3 text-purple-400" /> VPC / Networking</div>
              <div className="flex items-center gap-1.5 py-0.5"><Cpu className="w-3 h-3 text-indigo-400" /> EKS Kubernetes Cluster</div>
              <div className="flex items-center gap-1.5 py-0.5"><Activity className="w-3 h-3 text-blue-400" /> Load Balancer (ALB)</div>
              <div className="flex items-center gap-1.5 py-0.5"><Shield className="w-3 h-3 text-emerald-400" /> Security Groups / IAM</div>
              <div className="flex items-center gap-1.5 py-0.5"><UploadCloud className="w-3 h-3 text-cyan-400" /> ECR Registry</div>
            </div>
            <div className="text-[10px] font-mono text-purple-300 text-center border-t border-slate-800 pt-1 font-bold">
              Provision Infrastructure &rarr;
            </div>
          </div>

          {/* AWS EKS Workload Box */}
          <div className="lg:col-span-5 p-3.5 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs font-bold text-cyan-400">
              <div className="flex items-center gap-1.5">
                <Server className="w-4 h-4 text-amber-400" />
                <span>Deployment on Kubernetes (AWS EKS)</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">v1.30</span>
            </div>

            {/* 3-Tier Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div onClick={() => handleNodeClick('k8s-frontend')} className={`p-2 ${getNodeStatusClass('k8s-frontend')}`}>
                {renderBadge('k8s-frontend')}
                <Code2 className="w-4 h-4 mx-auto text-cyan-400 mb-0.5" />
                <div className="text-[10px] font-bold text-white">Frontend</div>
                <div className="text-[9px] text-cyan-400 font-mono">React Pods</div>
              </div>

              <div onClick={() => handleNodeClick('k8s-backend')} className={`p-2 ${getNodeStatusClass('k8s-backend')}`}>
                {renderBadge('k8s-backend')}
                <Cpu className="w-4 h-4 mx-auto text-emerald-400 mb-0.5" />
                <div className="text-[10px] font-bold text-white">Backend</div>
                <div className="text-[9px] text-emerald-400 font-mono">Node.js Pods</div>
              </div>

              <div onClick={() => handleNodeClick('k8s-database')} className={`p-2 ${getNodeStatusClass('k8s-database')}`}>
                {renderBadge('k8s-database')}
                <Database className="w-4 h-4 mx-auto text-indigo-400 mb-0.5" />
                <div className="text-[10px] font-bold text-white">Database</div>
                <div className="text-[9px] text-indigo-400 font-mono">StatefulSet</div>
              </div>
            </div>

            {/* Sub resources */}
            <div className="grid grid-cols-5 gap-1 text-center text-[9px] font-mono">
              <div onClick={() => handleNodeClick('k8s-configmaps')} className={`p-1 ${getNodeStatusClass('k8s-configmaps')}`}>ConfigMaps</div>
              <div onClick={() => handleNodeClick('k8s-secrets')} className={`p-1 ${getNodeStatusClass('k8s-secrets')}`}>Vault Secrets</div>
              <div onClick={() => handleNodeClick('k8s-ingress')} className={`p-1 ${getNodeStatusClass('k8s-ingress')}`}>Ingress</div>
              <div onClick={() => handleNodeClick('k8s-helm')} className={`p-1 ${getNodeStatusClass('k8s-helm')}`}>Helm</div>
              <div onClick={() => handleNodeClick('k8s-hpa')} className={`p-1 ${getNodeStatusClass('k8s-hpa')}`}>HPA Scale</div>
            </div>
          </div>

          {/* Deployment Strategy */}
          <div onClick={() => handleNodeClick('deploy-strategy')} className={`lg:col-span-2 p-3.5 space-y-1.5 ${getNodeStatusClass('deploy-strategy')}`}>
            {renderBadge('deploy-strategy')}
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-800 text-xs font-bold text-amber-400">
              <GitCompare className="w-4 h-4" />
              <span>Strategy</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300"><RotateCw className="w-3 h-3 text-cyan-400" /> Rolling</div>
              <div className="flex items-center gap-1.5 text-slate-300"><GitCompare className="w-3 h-3 text-amber-400" /> Canary (Split)</div>
              <div className="flex items-center gap-1.5 text-slate-300"><RotateCcw className="w-3 h-3 text-red-400" /> Auto Rollback</div>
            </div>
          </div>

          {/* Application Live */}
          <div onClick={() => handleNodeClick('app-live')} className={`lg:col-span-2 p-3.5 flex flex-col justify-between ${getNodeStatusClass('app-live')}`}>
            {renderBadge('app-live')}
            <div>
              <div className="flex items-center gap-1.5 pb-1 border-b border-emerald-800/40 text-xs font-bold text-emerald-400">
                <Globe className="w-4 h-4" />
                <span>Application Live</span>
              </div>
              <div className="p-2 text-center rounded-lg bg-slate-950/80 border border-emerald-500/30 mt-2">
                <Globe className="w-5 h-5 mx-auto text-emerald-400 animate-pulse mb-0.5" />
                <div className="text-xs font-bold text-white">Live to Users</div>
                <div className="text-[9px] text-emerald-300 font-mono">(AWS ALB Ingress)</div>
              </div>
            </div>
            <div className="text-[10px] font-mono text-emerald-400 text-center mt-1 font-bold">
              99.99% Uptime
            </div>
          </div>
        </div>
      </div>

      {/* STAGE 4: Observability, Alerts, Self-Healing & AI Continuous Improvement */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>4. Observability Stack, Automated Self-Healing &amp; Continuous Improvement</span>
          <span className="text-[10px] font-mono text-purple-400">Closed-Loop Auto-Remediation</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          {/* Observability */}
          <div className="lg:col-span-4 p-3 rounded-xl bg-slate-900 border border-pink-500/30 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs font-bold text-pink-400">
              <div className="flex items-center gap-1.5"><Activity className="w-4 h-4" /> Observability Stack</div>
              <span className="text-[9px] font-mono text-slate-400">Telemetry</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-center">
              <div onClick={() => handleNodeClick('obs-prometheus')} className={`p-2 ${getNodeStatusClass('obs-prometheus')}`}>
                <Flame className="w-3.5 h-3.5 mx-auto text-red-400 mb-0.5" />
                <div className="text-[10px] font-bold">Prometheus</div>
                <div className="text-[8px] text-slate-400 font-mono">Metrics</div>
              </div>
              <div onClick={() => handleNodeClick('obs-grafana')} className={`p-2 ${getNodeStatusClass('obs-grafana')}`}>
                <LineChart className="w-3.5 h-3.5 mx-auto text-amber-400 mb-0.5" />
                <div className="text-[10px] font-bold">Grafana</div>
                <div className="text-[8px] text-slate-400 font-mono">Dashboards</div>
              </div>
              <div onClick={() => handleNodeClick('obs-loki')} className={`p-2 ${getNodeStatusClass('obs-loki')}`}>
                <Terminal className="w-3.5 h-3.5 mx-auto text-cyan-400 mb-0.5" />
                <div className="text-[10px] font-bold">Loki</div>
                <div className="text-[8px] text-slate-400 font-mono">Logs</div>
              </div>
              <div onClick={() => handleNodeClick('obs-opentelemetry')} className={`p-2 ${getNodeStatusClass('obs-opentelemetry')}`}>
                <Activity className="w-3.5 h-3.5 mx-auto text-purple-400 mb-0.5" />
                <div className="text-[10px] font-bold">OpenTelemetry</div>
                <div className="text-[8px] text-slate-400 font-mono">Tracing</div>
              </div>
            </div>
          </div>

          {/* Alertmanager & Notifications */}
          <div className="lg:col-span-3 space-y-2">
            <div onClick={() => handleNodeClick('alertmanager')} className={`p-2.5 ${getNodeStatusClass('alertmanager')}`}>
              {renderBadge('alertmanager')}
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                <Bell className="w-3.5 h-3.5" /> Alertmanager
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Detect Anomalies (Error Rate, Latency, Pod Crash)</p>
            </div>

            <div onClick={() => handleNodeClick('notifications')} className={`p-2.5 ${getNodeStatusClass('notifications')}`}>
              {renderBadge('notifications')}
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                <MessageSquare className="w-3.5 h-3.5" /> Notifications
              </div>
              <div className="flex items-center gap-2 text-[10px] mt-1 text-slate-300">
                <span className="text-emerald-400 font-semibold">Slack</span> &bull; <span className="text-indigo-400 font-semibold">Discord</span>
              </div>
            </div>
          </div>

          {/* Automated Remediation (Self-Healing) */}
          <div className="lg:col-span-5 p-3 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs font-bold text-emerald-400">
              <div className="flex items-center gap-1.5"><RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} /> Automated Remediation (Self-Healing)</div>
              <span className="text-[9px] font-mono text-cyan-400">Auto-Recovery</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
              <div onClick={() => handleNodeClick('self-healing-hpa')} className={`p-2 ${getNodeStatusClass('self-healing-hpa')}`}>
                <div className="text-[9px] text-amber-300 font-semibold">High Load</div>
                <div className="font-bold text-white text-[10px] flex items-center justify-center gap-1 mt-0.5">
                  <Zap className="w-3 h-3 text-amber-400" /> HPA Scale
                </div>
              </div>

              <div onClick={() => handleNodeClick('self-healing-restart')} className={`p-2 ${getNodeStatusClass('self-healing-restart')}`}>
                <div className="text-[9px] text-red-300 font-semibold">Failure</div>
                <div className="font-bold text-white text-[10px] flex items-center justify-center gap-1 mt-0.5">
                  <RotateCw className="w-3 h-3 text-red-400" /> Restart Pod
                </div>
              </div>

              <div onClick={() => handleNodeClick('self-healing-rollback')} className={`p-2 ${getNodeStatusClass('self-healing-rollback')}`}>
                <div className="text-[9px] text-cyan-300 font-semibold">Bad Deploy</div>
                <div className="font-bold text-white text-[10px] flex items-center justify-center gap-1 mt-0.5">
                  <RotateCcw className="w-3 h-3 text-cyan-400" /> Rollback
                </div>
              </div>
            </div>

            <div onClick={() => handleNodeClick('continuous-improvement')} className={`p-2 rounded-lg border flex items-center justify-between text-xs ${getNodeStatusClass('continuous-improvement')}`}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-white">AI SRE &amp; Continuous Improvement</span>
              </div>
              <span className="text-[10px] font-mono text-indigo-300">&larr; Feedback Loop</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
