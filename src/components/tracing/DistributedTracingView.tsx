import React, { useState, useEffect } from 'react';
import {
  Activity,
  GitPullRequest,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  ArrowRight,
  Server,
  Database,
  Network
} from 'lucide-react';

interface TraceSpan {
  id: string;
  service: string;
  operation: string;
  durationMs: number;
  status: number;
  timestamp: string;
  error: boolean;
}

interface TopologyNode {
  id: string;
  label: string;
  tier: string;
  rpm: number;
  latency: string;
}

export const DistributedTracingView: React.FC = () => {
  const [spans, setSpans] = useState<TraceSpan[]>([]);
  const [nodes, setNodes] = useState<TopologyNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTracingData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/v1/tracing/data');
      const data = await res.json();
      if (data.spans) setSpans(data.spans);
      if (data.topology?.nodes) setNodes(data.topology.nodes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTracingData();
  }, []);

  const totalDuration = spans.reduce((max, s) => Math.max(max, s.durationMs), 15);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              OpenTelemetry Traces &amp; Service Topology
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                OTel v1.28 Live
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive distributed tracing flame graphs, span waterfall analysis, and microservice dependencies
            </p>
          </div>
        </div>

        <button
          onClick={fetchTracingData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Traces</span>
        </button>
      </div>

      {/* Microservice Dependency Topology Graph */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-extrabold text-slate-900">Microservice Dependency Network Map</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Real-time RPC &amp; HTTP Routing</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {nodes.map(node => (
            <div
              key={node.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-blue-400 transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>{node.label}</span>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                  {node.tier}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
                <div>Throughput: <span className="font-bold text-slate-800">{node.rpm} req/m</span></div>
                <div>Latency: <span className="font-mono font-bold text-blue-600">{node.latency}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Distributed Traces Waterfall / Flame Graph */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Distributed Trace Waterfall (Flame Graph)</h3>
            <p className="text-xs text-slate-500">End-to-end request trace for `GET /api/v1/orders` across microservices</p>
          </div>
          <div className="text-xs font-mono text-slate-600">
            Total Trace Duration: <span className="font-bold text-purple-600">{totalDuration.toFixed(1)} ms</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {spans.map((span, i) => {
            const widthPercent = Math.max(8, (span.durationMs / totalDuration) * 100);
            const indentPx = i * 16;

            return (
              <div key={span.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2" style={{ paddingLeft: `${indentPx}px` }}>
                    <span className="font-bold text-slate-900">{span.service}</span>
                    <span className="text-slate-500 text-[11px]">&bull; {span.operation}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      HTTP {span.status}
                    </span>
                    <span className="font-bold text-purple-600 w-16 text-right">
                      {span.durationMs} ms
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden" style={{ marginLeft: `${indentPx}px`, width: `calc(100% - ${indentPx}px)` }}>
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${widthPercent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
