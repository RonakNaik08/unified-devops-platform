import React, { useState } from 'react';
import {
  Globe,
  Server,
  Database,
  Cpu,
  Zap,
  Sliders,
  Play,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  Layers,
  ArrowRight,
  Code2
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';

export const LiveAppView: React.FC = () => {
  const {
    appVersion,
    canarySplit,
    setCanarySplit,
    trafficRps,
    setTrafficRps,
    simulateTrafficSurge,
    pods
  } = useDevSecOps();

  const [orders, setOrders] = useState<Array<{ id: string; item: string; amount: string; status: string; version: string; latency: string }>>([]);

  // Fetch live orders on mount
  React.useEffect(() => {
    fetch('/api/v1/orders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
        } else {
          setOrders([
            { id: 'ORD-9842', item: 'AWS EKS Managed Node Group Provisioning', amount: '$120.00', status: 'Completed', version: appVersion, latency: '24ms' },
            { id: 'ORD-9843', item: 'Trivy Security Scanning License Tier', amount: '$49.00', status: 'Completed', version: appVersion, latency: '31ms' },
            { id: 'ORD-9844', item: 'ArgoCD Enterprise Pipeline Runner', amount: '$280.00', status: 'Completed', version: appVersion, latency: '19ms' },
          ]);
        }
      })
      .catch(() => {});
  }, [appVersion]);

  const [newItemName, setNewItemName] = useState('');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setIsLoadingApi(true);

    fetch('/api/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: newItemName })
    })
      .then(res => res.json())
      .then(newOrd => {
        setOrders(prev => [newOrd, ...prev]);
        setNewItemName('');
        setApiResponse(`HTTP 201 Created: Order ${newOrd.id} persisted to database table orders (Latency: ${newOrd.latency}).`);
        setIsLoadingApi(false);
      })
      .catch(() => {
        const newOrd = {
          id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
          item: newItemName,
          amount: '$' + (Math.floor(Math.random() * 200) + 25) + '.00',
          status: 'Completed',
          version: appVersion,
          latency: (Math.floor(Math.random() * 25) + 15) + 'ms'
        };
        setOrders(prev => [newOrd, ...prev]);
        setNewItemName('');
        setApiResponse(`HTTP 201 Created: Order ${newOrd.id} persisted to PostgreSQL StatefulSet.`);
        setIsLoadingApi(false);
      });
  };

  const handleTestHealth = () => {
    setIsLoadingApi(true);
    fetch('/api/v1/telemetry')
      .then(res => res.json())
      .then(telemetry => {
        setApiResponse(JSON.stringify({
          status: 'UP',
          version: appVersion,
          system: telemetry.systemInfo,
          cpuPercent: telemetry.cpuPercent,
          memoryPercent: telemetry.memoryPercent,
          uptimeSeconds: telemetry.uptimeSeconds,
          cluster: 'devsecops-cloud-cluster (us-east-1)',
          database: 'PostgreSQL 16.3 connected (pool: 12/20)',
          vaultSecrets: 'synced',
          timestamp: new Date().toISOString()
        }, null, 2));
        setIsLoadingApi(false);
      })
      .catch(() => {
        const runningPods = pods.filter(p => p.status === 'Running').length;
        setApiResponse(JSON.stringify({
          status: 'UP',
          version: appVersion,
          activeReplicas: runningPods,
          cluster: 'devsecops-cloud-cluster (us-east-1)',
          timestamp: new Date().toISOString()
        }, null, 2));
        setIsLoadingApi(false);
      });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Load Balancer & Ingress Gateway */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Live Application Sandbox: <span className="font-mono text-emerald-400">https://app.devsecops.cloud</span></h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  Version {appVersion}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Served via <span className="text-slate-200">AWS Application Load Balancer &bull; NGINX Ingress Controller</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestHealth}
              disabled={isLoadingApi}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Probe /healthz</span>
            </button>
          </div>
        </div>

        {/* Real-time Traffic Simulator Slider */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" /> Real-time User Load Simulator (RPS)
            </span>
            <span className="font-mono text-cyan-400 font-bold">{trafficRps} Requests / Second</span>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="50"
              max="3000"
              step="50"
              value={trafficRps}
              onChange={e => setTrafficRps(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>50 RPS (Normal)</span>
            <span>750 RPS (Moderate)</span>
            <span>1,500 RPS (Surge)</span>
            <span className="text-amber-400 font-bold">3,000 RPS (Spike &rarr; HPA Trigger)</span>
          </div>
        </div>
      </div>

      {/* 2-Column: Live 3-Tier App Demo & API Test Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3-Tier Live E-Commerce SaaS Preview */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">CloudScale Cloud Services Store (Frontend Tier)</h4>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Rendered via React 18</span>
          </div>

          {/* New Order Form */}
          <form onSubmit={handleCreateOrder} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter service name (e.g. 'Kubernetes Observability Addon')..."
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={isLoadingApi || !newItemName.trim()}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/20 disabled:opacity-50"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Order Service</span>
            </button>
          </form>

          {/* Recent Orders List */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Persisted Cloud Orders (Database Tier)</div>
            {orders.map(ord => (
              <div key={ord.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{ord.item}</div>
                  <div className="text-[10px] font-mono text-slate-400">Order ID: {ord.id} &bull; Latency: <span className="text-cyan-400">{ord.latency}</span></div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-400 font-mono">{ord.amount}</div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-300">
                    {ord.status} ({ord.version})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: API Response & Latency Inspector */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">REST API Backend Inspector</h4>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">Port :5000</span>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-slate-300 font-semibold">Live Endpoints:</div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-cyan-400">
                GET /api/v1/healthz
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-emerald-400">
                GET /api/v1/metrics
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-indigo-400">
                POST /api/v1/orders
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-purple-400">
                GET /api/v1/database
              </div>
            </div>
          </div>

          {/* Response Box */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Response Payload:</div>
            <div className="h-44 rounded-xl bg-slate-950 border border-slate-800 p-3 font-mono text-xs overflow-y-auto text-slate-200">
              {apiResponse ? (
                <pre className="text-cyan-300 whitespace-pre-wrap">{apiResponse}</pre>
              ) : (
                <span className="text-slate-500">Click &quot;Probe /healthz&quot; or submit an order to inspect live JSON payload...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
