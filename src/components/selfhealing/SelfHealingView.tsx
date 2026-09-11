import React from 'react';
import {
  Flame,
  AlertTriangle,
  RotateCcw,
  Zap,
  RotateCw,
  Bell,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Shield,
  Activity,
  Cpu
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';

export const SelfHealingView: React.FC = () => {
  const {
    alerts,
    dismissAlert,
    simulateTrafficSurge,
    simulateCrashPod,
    simulateCanaryFault,
    triggerAutoRollback,
    pods
  } = useDevSecOps();

  const firstBackendPod = pods.find(p => p.tier === 'backend');

  return (
    <div className="space-y-6">
      {/* Top Banner: Self-Healing Remediation Engine */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <RotateCw className="w-6 h-6 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Automated Self-Healing &amp; Remediation Controller</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                ACTIVE &bull; 0 Human Intervention
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuously observes Alertmanager anomaly webhooks and triggers closed-loop Kubernetes controller interventions
            </p>
          </div>
        </div>

        {/* 3 Automated Remediation Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> 1. High Load Anomaly
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">CPU &gt; 70%</span>
            </div>
            <p className="text-xs text-slate-300">HorizontalPodAutoscaler automatically scales pods up to 10 replicas.</p>
            <div className="text-[10px] font-mono text-emerald-400">Response time: 2.8s</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <RotateCw className="w-4 h-4" /> 2. Service Failure
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">CrashLoopBackOff</span>
            </div>
            <p className="text-xs text-slate-300">Kubelet detects failing liveness probe and restarts unhealthy containers.</p>
            <div className="text-[10px] font-mono text-emerald-400">Response time: 3.2s</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4" /> 3. Canary Failure
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">5xx &gt; 5%</span>
            </div>
            <p className="text-xs text-slate-300">ArgoCD automatically halts rollout and rolls back to previous stable Git revision.</p>
            <div className="text-[10px] font-mono text-emerald-400">Response time: 4.1s</div>
          </div>
        </div>
      </div>

      {/* Chaos Engineering Studio & Fault Injection */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Chaos Engineering Studio (Fault Injection)</h3>
              <p className="text-xs text-slate-400">Simulate real-world cloud failures to observe live Alertmanager alerts and automatic recovery</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Chaos 1 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Zap className="w-4 h-4" />
              <span>Simulate Traffic Surge</span>
            </div>
            <p className="text-xs text-slate-400">
              Spike incoming user traffic to 2,500 RPS. Tests HPA scaling and load balancing.
            </p>
            <button
              onClick={() => simulateTrafficSurge(2500)}
              className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Inject 2,500 RPS Load</span>
            </button>
          </div>

          {/* Chaos 2 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>Crash Backend Pod (OOM)</span>
            </div>
            <p className="text-xs text-slate-400">
              Trigger an Out-Of-Memory fault on a live backend pod to test Kubelet self-restart.
            </p>
            <button
              onClick={() => firstBackendPod && simulateCrashPod(firstBackendPod.id)}
              className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Crash Pod (OOMKilled)</span>
            </button>
          </div>

          {/* Chaos 3 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <RotateCcw className="w-4 h-4" />
              <span>Deploy Faulty Canary</span>
            </div>
            <p className="text-xs text-slate-400">
              Deploy a faulty release (v1.3.0) with high 5xx error rate to test automated rollback.
            </p>
            <button
              onClick={simulateCanaryFault}
              className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Inject Canary Bug &amp; Rollback</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alertmanager Active Alerts & Slack / Discord Dispatch Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alertmanager Panel */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-red-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Alertmanager Firing Rules</h4>
            </div>
            <span className="text-[10px] font-mono text-slate-400">{alerts.length} Active Alerts</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-xs">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400 mb-1" />
                All Prometheus alerting rules healthy &bull; No active incidents
              </div>
            ) : (
              alerts.map(alt => (
                <div
                  key={alt.id}
                  className={`p-3 rounded-xl border space-y-1.5 ${
                    alt.status === 'Firing'
                      ? 'bg-red-950/40 border-red-500/50 text-red-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-white">{alt.alertName}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      alt.severity === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'
                    }`}>
                      {alt.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{alt.summary}</p>
                  {alt.remediationAction && (
                    <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <RotateCw className="w-3 h-3 text-emerald-400" />
                      <span>{alt.remediationAction}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>{alt.timestamp}</span>
                    <button
                      onClick={() => dismissAlert(alt.id)}
                      className="text-slate-400 hover:text-white underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Slack & Discord Webhook Notification Stream */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Slack / Discord Webhooks (#devsecops-alerts)</h4>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">Webhook Status: 200 OK</span>
          </div>

          <div className="h-72 rounded-xl bg-slate-950 border border-slate-800 p-3 font-sans text-xs overflow-y-auto space-y-2">
            <div className="p-2.5 rounded-lg bg-slate-900 border-l-4 border-l-emerald-500 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-emerald-400">DevSecOps Bot [APP]</span>
                <span className="text-slate-500">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="text-slate-200 font-medium">
                Deployment <span className="font-mono text-cyan-400">devsecops-production-app</span> synced to EKS cluster successfully.
              </div>
            </div>

            {alerts.map(alt => (
              <div
                key={alt.id}
                className={`p-2.5 rounded-lg bg-slate-900 border-l-4 ${
                  alt.severity === 'CRITICAL' ? 'border-l-red-500' : 'border-l-amber-500'
                } space-y-1`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-red-400">Alertmanager Bot [APP] &bull; {alt.channel}</span>
                  <span className="text-slate-500">{alt.timestamp}</span>
                </div>
                <div className="text-slate-200 font-semibold">{alt.summary}</div>
                {alt.remediationAction && (
                  <div className="text-[11px] text-cyan-400 font-mono">
                    &rarr; {alt.remediationAction}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
