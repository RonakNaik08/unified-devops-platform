import React, { useState } from 'react';
import {
  Cpu,
  Server,
  Layers,
  Terminal,
  AlertTriangle,
  RotateCw,
  Zap,
  Activity,
  CheckCircle2,
  XCircle,
  Database,
  Code2,
  Network
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';
import { KubernetesPod } from '../../types/devsecops';
import { PodTerminalModal } from '../common/PodTerminalModal';
import { soundFx } from '../../utils/soundFx';

export const KubernetesView: React.FC = () => {
  const {
    pods,
    simulateCrashPod,
    simulateTrafficSurge,
    soundEnabled
  } = useDevSecOps();

  const [selectedPodForLogs, setSelectedPodForLogs] = useState<KubernetesPod | null>(null);
  const [podForTerminal, setPodForTerminal] = useState<KubernetesPod | null>(null);
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('ALL');

  const filteredPods = pods.filter(p => {
    if (selectedTierFilter === 'ALL') return true;
    return p.tier === selectedTierFilter;
  });

  const handleOpenTerminal = (pod: KubernetesPod) => {
    if (soundEnabled) soundFx.playClick();
    setPodForTerminal(pod);
  };

  const handleCrash = (podId: string) => {
    if (soundEnabled) soundFx.playAlert();
    simulateCrashPod(podId);
  };

  return (
    <div className="space-y-6">
      {/* Cluster Overview Banner */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-md">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">AWS EKS Cluster Console: <span className="font-mono text-cyan-400">devsecops-cloud-cluster</span></h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  Kubernetes v1.30.2
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">
                  us-east-1
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Namespace: <span className="font-mono text-white">production</span> &bull; Node Group: <span className="font-mono text-slate-300">managed-ng-t3-large (2 active nodes)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (soundEnabled) soundFx.playClick();
                simulateTrafficSurge(2500);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Trigger HPA Scale-Out</span>
            </button>
          </div>
        </div>

        {/* 3-Tier Cluster Distribution Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Code2 className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-xs font-bold text-white">Frontend Tier</div>
                <div className="text-[10px] text-slate-400">React + NGINX Ingress</div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-cyan-400 text-sm">{pods.filter(p => p.tier === 'frontend').length} Replicas</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xs font-bold text-white">Backend Microservices</div>
                <div className="text-[10px] text-slate-400">Node.js Express + HPA</div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-emerald-400 text-sm">{pods.filter(p => p.tier === 'backend').length} Replicas</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-indigo-400" />
              <div>
                <div className="text-xs font-bold text-white">Database Tier</div>
                <div className="text-[10px] text-slate-400">PostgreSQL StatefulSet</div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-indigo-400 text-sm">{pods.filter(p => p.tier === 'database').length} StatefulSet</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pods Grid & Live Table */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Active Pods &amp; Workloads</h3>
              <p className="text-xs text-slate-400">Live Kubernetes pod states, liveness probes, restart history, and live interactive web shells</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {['ALL', 'frontend', 'backend', 'database'].map(tier => (
              <button
                key={tier}
                onClick={() => setSelectedTierFilter(tier)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  selectedTierFilter === tier
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tier.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Pods Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Pod Name</th>
                <th className="py-2.5 px-3">Tier</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Ready</th>
                <th className="py-2.5 px-3">Restarts</th>
                <th className="py-2.5 px-3">CPU / Mem</th>
                <th className="py-2.5 px-3">Node &amp; IP</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredPods.map(pod => (
                <tr key={pod.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-mono font-bold text-slate-200">{pod.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Image: {pod.version}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      pod.tier === 'frontend'
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : pod.tier === 'backend'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {pod.tier}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      pod.status === 'Running'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                    }`}>
                      {pod.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">{pod.ready}</td>
                  <td className="py-3 px-3 font-mono">
                    <span className={pod.restarts > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                      {pod.restarts}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    <div>{pod.cpu}</div>
                    <div className="text-[10px] text-slate-500">{pod.memory}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                    <div>{pod.ip}</div>
                    <div className="text-[9px] text-slate-500">{pod.node}</div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenTerminal(pod)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900/80 text-cyan-300 text-[11px] font-bold flex items-center gap-1 border border-cyan-500/40"
                        title="Interactive Pod Shell (kubectl exec)"
                      >
                        <Terminal className="w-3 h-3 text-cyan-400" />
                        <span>Shell</span>
                      </button>

                      <button
                        onClick={() => setSelectedPodForLogs(pod)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 border border-slate-700"
                        title="View kubectl logs"
                      >
                        <span>Logs</span>
                      </button>

                      {pod.tier === 'backend' && (
                        <button
                          onClick={() => handleCrash(pod.id)}
                          className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 text-[11px] font-medium border border-red-500/40 flex items-center gap-1"
                          title="Simulate container crash"
                        >
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                          <span>Crash</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pod Log Modal */}
      {selectedPodForLogs && (
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white">
                Live Pod Logs: <span className="font-mono text-cyan-400">{selectedPodForLogs.name}</span>
              </h4>
            </div>
            <button
              onClick={() => setSelectedPodForLogs(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close Console
            </button>
          </div>

          <div className="font-mono text-xs text-slate-300 space-y-1 bg-slate-900/90 p-4 rounded-xl max-h-60 overflow-y-auto">
            {selectedPodForLogs.logs.map((l, i) => (
              <div key={i} className="leading-relaxed">{l}</div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Web Shell Modal */}
      {podForTerminal && (
        <PodTerminalModal pod={podForTerminal} onClose={() => setPodForTerminal(null)} />
      )}
    </div>
  );
};
