import React, { useState } from 'react';
import {
  Send,
  Gauge,
  Activity,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Code2,
  RefreshCw,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';

export const ApiTesterAndBenchmarkerView: React.FC = () => {
  const { activeProject } = useDevSecOps();
  const [activeTab, setActiveTab] = useState<'client' | 'benchmark'>('client');

  // REST Client State
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('http://localhost:5001/api/healthz');
  const [headersJson, setHeadersJson] = useState('{\n  "Accept": "application/json"\n}');
  const [bodyJson, setBodyJson] = useState('{\n  "query": "telemetry"\n}');
  const [isSending, setIsSending] = useState(false);
  const [responseResult, setResponseResult] = useState<any | null>(null);

  // Benchmarker State
  const [benchUrl, setBenchUrl] = useState('http://localhost:5001/api/healthz');
  const [benchMethod, setBenchMethod] = useState('GET');
  const [totalRequests, setTotalRequests] = useState(50);
  const [concurrency, setConcurrency] = useState(5);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<any | null>(null);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setIsSending(true);
    setResponseResult(null);

    try {
      let parsedHeaders = {};
      try {
        if (headersJson.trim()) parsedHeaders = JSON.parse(headersJson);
      } catch {}

      let parsedBody = null;
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        try {
          if (bodyJson.trim()) parsedBody = JSON.parse(bodyJson);
        } catch {
          parsedBody = bodyJson;
        }
      }

      const res = await fetch('http://localhost:5001/api/v1/traffic/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          url: url.trim(),
          headers: parsedHeaders,
          body: parsedBody
        })
      });

      const data = await res.json();
      setResponseResult(data);
    } catch (err: any) {
      setResponseResult({
        success: false,
        status: 0,
        statusText: 'Client Error',
        error: err.message,
        durationMs: 0
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleRunBenchmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!benchUrl.trim()) return;
    setIsBenchmarking(true);
    setBenchmarkResult(null);

    try {
      const res = await fetch('http://localhost:5001/api/v1/traffic/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: benchUrl.trim(),
          method: benchMethod,
          totalRequests,
          concurrency
        })
      });

      const data = await res.json();
      setBenchmarkResult(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsBenchmarking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              API Client &amp; Traffic Load Benchmarker
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                Low-Latency Engine
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Test REST endpoints, simulate microservice traffic load, and inspect latency distribution
            </p>
          </div>
        </div>

        <div className="flex border border-slate-200 p-1 rounded-xl bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('client')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === 'client' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            REST API Client
          </button>
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === 'benchmark' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Load Benchmarker
          </button>
        </div>
      </div>

      {/* REST API CLIENT TAB */}
      {activeTab === 'client' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Request Configurator */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Endpoint</label>
                <div className="flex gap-2">
                  <select
                    value={method}
                    onChange={e => setMethod(e.target.value)}
                    className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-purple-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>

                  <input
                    type="url"
                    required
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="http://localhost:5001/api/healthz"
                    className="flex-1 px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                  />

                  <button
                    type="submit"
                    disabled={isSending}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSending ? 'Sending...' : 'Send'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="text-slate-400 py-0.5">Presets:</span>
                <button
                  type="button"
                  onClick={() => { setMethod('GET'); setUrl('http://localhost:5001/api/healthz'); }}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono"
                >
                  GET /api/healthz
                </button>
                <button
                  type="button"
                  onClick={() => { setMethod('GET'); setUrl('http://localhost:5001/api/v1/telemetry'); }}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono"
                >
                  GET /telemetry
                </button>
                <button
                  type="button"
                  onClick={() => { setMethod('GET'); setUrl('http://localhost:5173/'); }}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono"
                >
                  GET / (Vite App)
                </button>
              </div>

              {/* Headers JSON */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Request Headers (JSON)</label>
                <textarea
                  rows={3}
                  value={headersJson}
                  onChange={e => setHeadersJson(e.target.value)}
                  className="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Request Body (for POST/PUT) */}
              {['POST', 'PUT', 'PATCH'].includes(method) && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Request Body (JSON)</label>
                  <textarea
                    rows={4}
                    value={bodyJson}
                    onChange={e => setBodyJson(e.target.value)}
                    className="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}
            </form>
          </div>

          {/* Response Viewer */}
          <div className="lg:col-span-6 bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="font-bold text-sm text-slate-200">HTTP Response</div>
              {responseResult && (
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    responseResult.status >= 200 && responseResult.status < 300
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {responseResult.status} {responseResult.statusText}
                  </span>
                  <span className="text-slate-400">{responseResult.durationMs} ms</span>
                  {responseResult.sizeBytes && (
                    <span className="text-slate-400">{responseResult.sizeBytes} B</span>
                  )}
                </div>
              )}
            </div>

            {responseResult ? (
              <div className="space-y-3">
                <div className="max-h-96 overflow-y-auto p-4 rounded-xl bg-black border border-slate-900 font-mono text-xs text-cyan-300">
                  <pre className="whitespace-pre-wrap">
                    {typeof responseResult.data === 'object'
                      ? JSON.stringify(responseResult.data, null, 2)
                      : responseResult.data || responseResult.error || 'Empty Response'}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs text-center">
                <Code2 className="w-8 h-8 mb-2 opacity-50" />
                <span>Send a request to inspect live response payload and status codes</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOAD BENCHMARKER TAB */}
      {activeTab === 'benchmark' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <form onSubmit={handleRunBenchmark} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Method</label>
                  <select
                    value={benchMethod}
                    onChange={e => setBenchMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </div>

                <div className="md:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Microservice URL</label>
                  <input
                    type="url"
                    required
                    value={benchUrl}
                    onChange={e => setBenchUrl(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Requests ({totalRequests})</label>
                  <input
                    type="range"
                    min={10}
                    max={200}
                    step={10}
                    value={totalRequests}
                    onChange={e => setTotalRequests(parseInt(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Concurrency ({concurrency})</label>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    value={concurrency}
                    onChange={e => setConcurrency(parseInt(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isBenchmarking}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>{isBenchmarking ? 'Running Load Test...' : 'Run Load Benchmark'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Benchmark Results */}
          {benchmarkResult && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-scale-up">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Benchmark Telemetry Report</h3>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {benchmarkResult.totalRequests} requests &bull; Concurrency {benchmarkResult.concurrency} &bull; {benchmarkResult.totalDurationSec}s total duration
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-purple-600">{benchmarkResult.rps} RPS</div>
                  <div className="text-[11px] text-slate-400 font-semibold">Throughput Rate</div>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-xs font-medium">Mean Latency</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{benchmarkResult.latency.mean} ms</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-xs font-medium">p50 Latency</div>
                  <div className="text-xl font-bold text-blue-600 mt-1">{benchmarkResult.latency.p50} ms</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-xs font-medium">p95 Latency</div>
                  <div className="text-xl font-bold text-purple-600 mt-1">{benchmarkResult.latency.p95} ms</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-xs font-medium">Success Rate</div>
                  <div className="text-xl font-bold text-emerald-600 mt-1">
                    {((benchmarkResult.successCount / benchmarkResult.totalRequests) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Distribution Bars */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700">Latency Histogram Distribution</h4>
                <div className="space-y-2">
                  {benchmarkResult.distribution?.map((item: any, i: number) => {
                    const percent = (item.count / benchmarkResult.totalRequests) * 100;
                    return (
                      <div key={i} className="flex items-center gap-3 text-xs font-mono">
                        <span className="w-28 text-slate-500">{item.range}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-3.5 overflow-hidden">
                          <div
                            className="bg-purple-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className="w-12 text-right font-bold text-slate-700">{item.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
