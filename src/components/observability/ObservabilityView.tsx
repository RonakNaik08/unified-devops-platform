import React, { useState } from 'react';
import {
  BarChart3,
  Flame,
  Terminal,
  Activity,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useDevSecOps } from '../../context/DevSecOpsContext';
import { TraceSpan } from '../../types/devsecops';

export const ObservabilityView: React.FC = () => {
  const { metricsHistory, logs, traces } = useDevSecOps();
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');
  const [selectedLogLevel, setSelectedLogLevel] = useState<string>('ALL');
  const [selectedTrace, setSelectedTrace] = useState<TraceSpan>(traces[0]);

  const filteredLogs = logs.filter(l => {
    const matchesLevel = selectedLogLevel === 'ALL' || l.level === selectedLogLevel;
    const matchesQuery = logSearchQuery === '' ||
      l.message.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      l.service.toLowerCase().includes(logSearchQuery.toLowerCase());
    return matchesLevel && matchesQuery;
  });

  const latestMetric = metricsHistory[metricsHistory.length - 1] || {
    rps: 240,
    latencyMs: 38,
    errorRatePercent: 0.02,
    cpuPercent: 42,
    memoryPercent: 54,
    activePods: 5
  };

  const renderSpan = (span: TraceSpan, depth = 0) => {
    return (
      <div key={span.id} className="space-y-1">
        <div
          style={{ marginLeft: `${depth * 20}px` }}
          className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs hover:border-cyan-500/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${span.status === 'OK' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
            <span className="font-mono font-bold text-slate-300">{span.service}</span>
            <span className="text-slate-400 font-mono">[{span.operation}]</span>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <span className="text-[10px] text-slate-500">offset +{span.startTimeOffsetMs}ms</span>
            <span className="text-cyan-400 font-bold">{span.durationMs}ms</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${span.status === 'OK' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
              {span.statusCode}
            </span>
          </div>
        </div>

        {span.children && span.children.map(child => renderSpan(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Prometheus Telemetry Overview Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: RPS */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Request Rate (RPS)</span>
            <Flame className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {latestMetric.rps} <span className="text-xs text-slate-400 font-normal">req/s</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">
            &uarr; Ingress load balanced across {latestMetric.activePods} pods
          </p>
        </div>

        {/* Metric 2: P95 Latency */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">P95 Latency</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {latestMetric.latencyMs} <span className="text-xs text-slate-400 font-normal">ms</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Target SLA: &lt; 150ms
          </p>
        </div>

        {/* Metric 3: Error Rate */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">5xx Error Rate</span>
            <Activity className="w-4 h-4 text-red-400" />
          </div>
          <div className={`mt-2 text-2xl font-black font-mono ${latestMetric.errorRatePercent > 1 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
            {latestMetric.errorRatePercent}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Threshold alert: &gt; 5.0%
          </p>
        </div>

        {/* Metric 4: Cluster CPU */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Cluster CPU Usage</span>
            <BarChart3 className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`mt-2 text-2xl font-black font-mono ${latestMetric.cpuPercent > 80 ? 'text-amber-400' : 'text-cyan-400'}`}>
            {latestMetric.cpuPercent}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            HPA scale-up trigger: &gt; 70%
          </p>
        </div>
      </div>

      {/* Real-time Prometheus Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Traffic & Latency */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Prometheus: Traffic (RPS) &amp; Latency (ms)</h4>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Live 60s Stream</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricsHistory}>
                <defs>
                  <linearGradient id="rpsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090e1a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="rps" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#rpsGrad)" name="RPS" />
                <Line type="monotone" dataKey="latencyMs" stroke="#c084fc" strokeWidth={2} dot={false} name="Latency (ms)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: CPU & Memory Utilization */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Prometheus: CPU &amp; Memory Utilization (%)</h4>
            </div>
            <span className="text-[10px] font-mono text-slate-400">HPA Monitoring Loop</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricsHistory}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090e1a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="cpuPercent" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#cpuGrad)" name="CPU %" />
                <Line type="monotone" dataKey="memoryPercent" stroke="#10b981" strokeWidth={2} dot={false} name="Memory %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Loki Log Aggregation & OpenTelemetry Tracing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Loki Log Stream */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Loki Log Aggregator Stream</h4>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px]">
              {['ALL', 'INFO', 'WARN', 'ERROR'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLogLevel(lvl)}
                  className={`px-2 py-0.5 rounded font-mono font-medium ${
                    selectedLogLevel === lvl
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder='LogQL query: {namespace="production"} |= "error"...'
              value={logSearchQuery}
              onChange={e => setLogSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="h-64 rounded-xl bg-slate-950 border border-slate-800 p-3 font-mono text-xs overflow-y-auto space-y-2">
            {filteredLogs.map(l => (
              <div key={l.id} className="flex items-start gap-2 leading-relaxed">
                <span className="text-[10px] text-slate-500 shrink-0">{l.timestamp}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                  l.level === 'ERROR' ? 'bg-red-500/20 text-red-400' :
                  l.level === 'WARN' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-cyan-300'
                }`}>
                  {l.level}
                </span>
                <span className="text-indigo-300 font-bold shrink-0">[{l.service}]</span>
                <span className="text-slate-300">{l.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* OpenTelemetry Distributed Tracing Waterfall */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">OpenTelemetry Distributed Tracing</h4>
            </div>
            <span className="text-[10px] font-mono text-purple-300">Trace ID: {selectedTrace.traceId}</span>
          </div>

          <div className="space-y-2">
            {renderSpan(selectedTrace)}
          </div>
        </div>
      </div>
    </div>
  );
};
