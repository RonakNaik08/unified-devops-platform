import React, { useState, useEffect } from 'react';
import {
  Container,
  Cpu,
  Workflow,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Layers,
  Terminal,
  Server
} from 'lucide-react';
import { soundFx } from '../../utils/soundFx';

export interface LocalDevOpsStatus {
  docker: {
    installed: boolean;
    connected: boolean;
    containerCount: number;
    containers: Array<{ id: string; image: string; status: string; names: string; ports: string }>;
    message?: string;
  };
  kubernetes: {
    installed: boolean;
    connected: boolean;
    currentContext: string;
    nodeCount: number;
    podCount: number;
    nodes: Array<{ name: string; status: string; kubeletVersion?: string; roles?: string }>;
    pods: Array<{ name: string; namespace: string; status: string; ready: string }>;
    message?: string;
  };
  jenkins: {
    connected: boolean;
    url: string;
    version?: string;
    jobs: Array<{ name: string; url: string; color: string }>;
    message?: string;
  };
  observability: {
    grafana: { connected: boolean; url: string; message: string };
    prometheus: { connected: boolean; url: string; message: string };
  };
  timestamp: string;
}

export const LocalIntegrationsPanel: React.FC = () => {
  const [status, setStatus] = useState<LocalDevOpsStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchStatus = () => {
    setIsRefreshing(true);
    fetch('/api/v1/local/status')
      .then(res => res.json())
      .then(data => {
        setStatus(data);
        setIsRefreshing(false);
      })
      .catch(() => {
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  const connectedCount =
    (status.docker.connected ? 1 : 0) +
    (status.kubernetes.connected ? 1 : 0) +
    (status.jenkins.connected ? 1 : 0) +
    (status.observability.grafana.connected ? 1 : 0);

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Local DevOps Auto-Link &amp; Direct Discovery
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                connectedCount > 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {connectedCount}/4 Local Daemons Linked
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automatically hooks into your local Docker, Kubernetes (kubectl), Jenkins, and Grafana instances the moment they are started.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            fetchStatus();
          }}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>{isRefreshing ? 'Probing...' : 'Re-probe Local Ports'}</span>
        </button>
      </div>

      {/* 4 Tool Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Docker Local Link */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Container className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-bold text-slate-900">Docker Daemon</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              status.docker.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.docker.connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span>{status.docker.connected ? 'Linked' : 'Standby'}</span>
            </span>
          </div>

          <div className="text-xs text-slate-600">
            {status.docker.connected ? (
              <div className="space-y-1">
                <div className="font-bold text-slate-900">{status.docker.containerCount} Containers Running</div>
                <div className="text-[10px] text-slate-500 font-mono">/var/run/docker.sock active</div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 leading-relaxed">
                CLI detected. Start <strong>Docker Desktop</strong> to stream local containers automatically.
              </div>
            )}
          </div>
        </div>

        {/* 2. Kubernetes Local Link */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900">Kubernetes (kubectl)</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              status.kubernetes.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.kubernetes.connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span>{status.kubernetes.connected ? 'Linked' : 'Standby'}</span>
            </span>
          </div>

          <div className="text-xs text-slate-600">
            {status.kubernetes.connected ? (
              <div className="space-y-1">
                <div className="font-bold text-slate-900">Context: {status.kubernetes.currentContext}</div>
                <div className="text-[10px] text-slate-500 font-mono">{status.kubernetes.nodeCount} Nodes &bull; {status.kubernetes.podCount} Pods</div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 leading-relaxed">
                kubectl found. Start <strong>minikube start</strong> or Kind to stream cluster topology.
              </div>
            )}
          </div>
        </div>

        {/* 3. Jenkins Local Link */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Workflow className="w-5 h-5 text-red-600" />
              <span className="text-xs font-bold text-slate-900">Jenkins CI Server</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              status.jenkins.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.jenkins.connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span>{status.jenkins.connected ? 'Linked' : 'Standby'}</span>
            </span>
          </div>

          <div className="text-xs text-slate-600">
            {status.jenkins.connected ? (
              <div className="space-y-1">
                <div className="font-bold text-slate-900">{status.jenkins.jobs.length} Pipelines Detected</div>
                <div className="text-[10px] text-slate-500 font-mono">{status.jenkins.url}</div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 leading-relaxed">
                Probing <strong>http://localhost:8080</strong> for active Jenkins master instance.
              </div>
            )}
          </div>
        </div>

        {/* 4. Grafana & Prometheus Link */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-bold text-slate-900">Grafana / Prom</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              status.observability.grafana.connected || status.observability.prometheus.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.observability.grafana.connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span>{status.observability.grafana.connected ? 'Linked' : 'Standby'}</span>
            </span>
          </div>

          <div className="text-xs text-slate-600">
            {status.observability.grafana.connected ? (
              <div className="space-y-1">
                <div className="font-bold text-slate-900">Grafana Dashboard Connected</div>
                <div className="text-[10px] text-slate-500 font-mono">http://localhost:3000</div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 leading-relaxed">
                Probing <strong>:3000 (Grafana)</strong> &amp; <strong>:9090 (Prometheus)</strong>.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
