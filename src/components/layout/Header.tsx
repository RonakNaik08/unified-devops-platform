import React, { useState } from 'react';
import {
  ShieldCheck,
  Activity,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  AlertTriangle,
  Zap,
  CheckCircle2,
  XCircle,
  Radio,
  Server,
  Download
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';
import { ScenarioType } from '../../types/devsecops';
import { soundFx } from '../../utils/soundFx';

export const Header: React.FC = () => {
  const {
    activeScenario,
    isRunningPipeline,
    activeStepName,
    runScenario,
    resetScenario,
    cancelScenario,
    soundEnabled,
    setSoundEnabled,
    alerts,
    pods,
    vulnerabilities,
    sonarReport,
    argoApp
  } = useDevSecOps();

  const [downloaded, setDownloaded] = useState(false);

  const scenarios: Array<{ id: ScenarioType; label: string; icon: any; color: string; desc: string }> = [
    {
      id: 'happy-path',
      label: 'Standard Deployment',
      icon: CheckCircle2,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20',
      desc: 'Clean end-to-end build, security scan, GitOps sync & deploy'
    },
    {
      id: 'trivy-blocked',
      label: 'Security Blocker (CVE)',
      icon: ShieldCheck,
      color: 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20',
      desc: 'Trivy discovers Critical CVE -> Blocks deployment gate'
    },
    {
      id: 'hpa-traffic-surge',
      label: 'Traffic Surge (HPA)',
      icon: Zap,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20',
      desc: '2,500 RPS surge -> HPA autoscales pods from 2 to 6'
    },
    {
      id: 'pod-crash-healing',
      label: 'Pod Self-Healing',
      icon: Activity,
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20',
      desc: 'OOMKilled pod -> Kubelet auto-restarts within 3s'
    },
    {
      id: 'canary-rollback',
      label: 'Canary Auto-Rollback',
      icon: RotateCcw,
      color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20',
      desc: 'Canary 5xx error -> ArgoCD instant rollback'
    }
  ];

  const firingAlertsCount = alerts.filter(a => a.status === 'Firing').length;
  const runningPodsCount = pods.filter(p => p.status === 'Running').length;

  const handleExportAudit = () => {
    if (soundEnabled) soundFx.playClick();
    const reportData = {
      platform: 'Automated DevSecOps Platform (Code to Cloud)',
      timestamp: new Date().toISOString(),
      cluster: {
        name: 'devsecops-cloud-cluster',
        version: '1.30.2',
        region: 'us-east-1',
        activePods: `${runningPodsCount}/${pods.length}`,
        argoCdSync: argoApp.syncStatus
      },
      securityAudit: {
        sonarQubeStatus: sonarReport.status,
        codeCoverage: `${sonarReport.coverage}%`,
        trivyVulnerabilities: vulnerabilities.map(v => ({
          cve: v.cve,
          severity: v.severity,
          package: v.package,
          status: v.patched ? 'PATCHED' : 'OPEN'
        }))
      },
      observability: {
        activeAlerts: alerts.length,
        firingAlerts: firingAlertsCount
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devsecops-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <header className="border-b border-slate-800 bg-[#0a0f1d] sticky top-0 z-50">
      {/* Top Main Navigation Bar */}
      <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">
                Automated DevSecOps Platform
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                v1.2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Code to Cloud with Monitoring &amp; Self-Healing &bull; AWS EKS &bull; GitOps
            </p>
          </div>
        </div>

        {/* Cluster Status Badges */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span>EKS: <strong className="text-emerald-400">{runningPodsCount}/{pods.length} Pods</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>ArgoCD: <strong className="text-cyan-400">Synced</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>Self-Healing: <strong className="text-purple-400">Armed</strong></span>
          </div>

          {firingAlertsCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-500/40 text-red-300">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span><strong>{firingAlertsCount} Alert{firingAlertsCount > 1 ? 's' : ''}</strong></span>
            </div>
          )}
        </div>

        {/* Header Right Action Buttons */}
        <div className="flex items-center gap-2">
          {isRunningPipeline && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="font-semibold max-w-[160px] truncate">{activeStepName}</span>
              <button
                onClick={cancelScenario}
                className="p-0.5 hover:bg-cyan-800/50 rounded text-cyan-400"
                title="Cancel Scenario"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={handleExportAudit}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>{downloaded ? 'Exported' : 'Export Audit'}</span>
          </button>

          <button
            onClick={() => {
              if (soundEnabled) soundFx.playClick();
              resetScenario();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            title="Reset system state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700"
            title={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Scenario Control Strip */}
      <div className="bg-[#070b15] border-t border-slate-800/60 px-4 py-2">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold whitespace-nowrap">
            <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
            <span>Run Pipeline Scenarios:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {scenarios.map(sc => {
              const Icon = sc.icon;
              const isSelected = activeScenario === sc.id && isRunningPipeline;
              return (
                <button
                  key={sc.id}
                  onClick={() => {
                    if (soundEnabled) soundFx.playClick();
                    runScenario(sc.id);
                  }}
                  disabled={isRunningPipeline}
                  title={sc.desc}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
                    isSelected
                      ? 'ring-1 ring-cyan-400 bg-cyan-950 text-cyan-300 border-cyan-400'
                      : sc.color
                  } ${isRunningPipeline && !isSelected ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sc.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
