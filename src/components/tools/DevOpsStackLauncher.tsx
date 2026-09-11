import React, { useState } from 'react';
import {
  Database,
  Cpu,
  Layers,
  Activity,
  Play,
  Square,
  RotateCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Container,
  Server
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';

export const DevOpsStackLauncher: React.FC = () => {
  const { dockerContainers, dockerImages, launchDevOpsTool } = useDevSecOps();
  const [loadingTool, setLoadingTool] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const tools = [
    {
      id: 'postgres',
      name: 'PostgreSQL Database',
      image: 'postgres:16-alpine',
      containerName: 'devopshub-postgres',
      port: '5432',
      icon: Database,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 border-blue-500/30'
    },
    {
      id: 'redis',
      name: 'Redis In-Memory Cache',
      image: 'redis:7-alpine',
      containerName: 'devopshub-redis',
      port: '6379',
      icon: Layers,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10 border-red-500/30'
    },
    {
      id: 'prometheus',
      name: 'Prometheus Metrics Server',
      image: 'prom/prometheus:v2.52.0',
      containerName: 'devopshub-prometheus',
      port: '9090',
      icon: Activity,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
      url: 'http://localhost:9090'
    },
    {
      id: 'grafana',
      name: 'Grafana Telemetry Dashboard',
      image: 'grafana/grafana:10.4.2',
      containerName: 'devopshub-grafana',
      port: '3000',
      icon: Cpu,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10 border-orange-500/30',
      url: 'http://localhost:3000'
    },
    {
      id: 'nginx',
      name: 'NGINX Reverse Proxy',
      image: 'nginx:alpine',
      containerName: 'devopshub-nginx',
      port: '8088',
      icon: Server,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
      url: 'http://localhost:8088'
    }
  ];

  const isContainerRunning = (containerName: string) => {
    return dockerContainers.some(
      c => (c.names || '').includes(containerName) && (c.status || '').toLowerCase().includes('up')
    );
  };

  const handleToolAction = async (toolId: string, action: 'start' | 'stop' | 'restart') => {
    setLoadingTool(toolId);
    setActionMessage(null);
    try {
      const res = await launchDevOpsTool(toolId, action);
      if (res.success) {
        setActionMessage(`Successfully ${action}ed ${toolId}`);
        setTimeout(() => setActionMessage(null), 3000);
      } else {
        setActionMessage(`Error: ${res.error || 'Action failed'}`);
      }
    } catch (err: any) {
      setActionMessage(`Failed to ${action} ${toolId}: ${err.message}`);
    } finally {
      setLoadingTool(null);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Container className="w-5 h-5 text-blue-600" />
            <span>DevOps Tool Quick-Launch Hub (Docker)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            1-click instant launch for local host databases, telemetry scrapers, and dashboards
          </p>
        </div>

        {actionMessage && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 animate-fade-in">
            {actionMessage}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {tools.map(tool => {
          const Icon = tool.icon;
          const isRunning = isContainerRunning(tool.containerName);
          const isLoading = loadingTool === tool.id;

          return (
            <div
              key={tool.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isRunning
                  ? 'bg-slate-900 text-white border-slate-800 shadow-md ring-1 ring-blue-500/20'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${tool.bgColor}`}>
                    <Icon className={`w-4 h-4 ${tool.color}`} />
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      isRunning
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isRunning ? 'RUNNING' : 'STOPPED'}
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className={`text-xs font-bold ${isRunning ? 'text-white' : 'text-slate-900'}`}>
                    {tool.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] text-slate-400">
                    <span>Port: {tool.port}</span>
                    {tool.url && isRunning && (
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/40 flex items-center gap-1.5">
                {!isRunning ? (
                  <button
                    onClick={() => handleToolAction(tool.id, 'start')}
                    disabled={isLoading}
                    className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <RotateCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3 fill-white" />
                    )}
                    <span>Launch</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleToolAction(tool.id, 'stop')}
                      disabled={isLoading}
                      className="flex-1 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[11px] font-bold flex items-center justify-center gap-1 border border-red-500/40 transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <RotateCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Square className="w-3 h-3 fill-red-300" />
                      )}
                      <span>Stop</span>
                    </button>

                    <button
                      onClick={() => handleToolAction(tool.id, 'restart')}
                      disabled={isLoading}
                      title="Restart Container"
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      <RotateCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
