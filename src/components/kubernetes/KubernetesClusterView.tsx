import React, { useState, useEffect } from 'react';
import {
  Layers,
  Cpu,
  Server,
  Activity,
  Terminal,
  RotateCw,
  Sliders,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Plus,
  X,
  Play,
  ArrowUpRight
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';

interface K8sPodItem {
  id: string;
  name: string;
  namespace: string;
  status: string;
  ready: string;
  restarts: number;
  node: string;
  ip: string;
  age: string;
  cpu: string;
  memory: string;
}

interface K8sDeploymentItem {
  name: string;
  namespace: string;
  replicas: string;
  upToDate: number;
  available: number;
  age: string;
}

interface K8sServiceItem {
  name: string;
  namespace: string;
  type: string;
  clusterIp: string;
  ports: string;
}

interface K8sNodeItem {
  name: string;
  status: string;
  roles: string;
  version: string;
  os: string;
  cpu: string;
  memory: string;
}

export const KubernetesClusterView: React.FC = () => {
  const { activeProject } = useDevSecOps();
  const [activeSubTab, setActiveSubTab] = useState<'pods' | 'deployments' | 'services' | 'nodes' | 'manifest'>('pods');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Cluster State
  const [clusterContext, setClusterContext] = useState('local-kubernetes');
  const [isConnected, setIsConnected] = useState(true);
  const [nodes, setNodes] = useState<K8sNodeItem[]>([]);
  const [pods, setPods] = useState<K8sPodItem[]>([]);
  const [deployments, setDeployments] = useState<K8sDeploymentItem[]>([]);
  const [services, setServices] = useState<K8sServiceItem[]>([]);

  // Scale Modal
  const [scalingDeployment, setScalingDeployment] = useState<K8sDeploymentItem | null>(null);
  const [desiredReplicas, setDesiredReplicas] = useState(3);
  const [isScaling, setIsScaling] = useState(false);

  // YAML Studio State
  const [yamlCode, setYamlCode] = useState(`apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${activeProject?.name?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'my-app'}-deployment
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ${activeProject?.name?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'my-app'}
  template:
    metadata:
      labels:
        app: ${activeProject?.name?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'my-app'}
    spec:
      containers:
      - name: web
        image: ${activeProject?.name?.toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'my-app'}:latest
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "100m"
            memory: "128Mi"`);
  const [applyResult, setApplyResult] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Pod Logs Modal
  const [activeLogPod, setActiveLogPod] = useState<K8sPodItem | null>(null);

  const fetchClusterState = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/v1/k8s/real/cluster');
      const data = await res.json();
      setClusterContext(data.context || 'local-cluster');
      setIsConnected(data.connected);
      if (data.nodes) setNodes(data.nodes);
      if (data.pods) setPods(data.pods);
      if (data.deployments) setDeployments(data.deployments);
      if (data.services) setServices(data.services);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClusterState();
  }, []);

  const handleScaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scalingDeployment) return;
    setIsScaling(true);
    try {
      await fetch('http://localhost:5001/api/v1/k8s/scale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: scalingDeployment.name,
          namespace: scalingDeployment.namespace,
          replicas: desiredReplicas
        })
      });
      setScalingDeployment(null);
      fetchClusterState();
    } catch (err) {
      console.error(err);
    } finally {
      setIsScaling(false);
    }
  };

  const handleRestartPod = async (pod: K8sPodItem) => {
    try {
      await fetch('http://localhost:5001/api/v1/k8s/pod/restart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ podName: pod.name, namespace: pod.namespace })
      });
      fetchClusterState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyYaml = async () => {
    setIsApplying(true);
    setApplyResult(null);
    try {
      const res = await fetch('http://localhost:5001/api/v1/k8s/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yamlContent: yamlCode,
          projectPath: activeProject?.path
        })
      });
      const data = await res.json();
      setApplyResult(data.output || 'Manifest applied successfully.');
      fetchClusterState();
    } catch (err: any) {
      setApplyResult(`Error: ${err.message}`);
    } finally {
      setIsApplying(false);
    }
  };

  const filteredPods = pods.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.namespace.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Kubernetes Cluster Explorer
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold">
                {clusterContext}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect live workloads, scale deployments, restart pods, and apply manifests
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchClusterState}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Cluster</span>
          </button>

          <button
            onClick={() => setActiveSubTab('manifest')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Manifest</span>
          </button>
        </div>
      </div>

      {/* Cluster Telemetry Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Nodes in Cluster</div>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1.5">
            <span>{nodes.length || 2}</span>
            <span className="text-xs text-emerald-600 font-bold">Ready</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Active Pods</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{pods.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Deployments</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{deployments.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Cluster Services</div>
          <div className="text-2xl font-black text-purple-600 mt-1">{services.length}</div>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('pods')}
          className={`pb-3 transition-colors border-b-2 ${
            activeSubTab === 'pods'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Pods ({pods.length})
        </button>

        <button
          onClick={() => setActiveSubTab('deployments')}
          className={`pb-3 transition-colors border-b-2 ${
            activeSubTab === 'deployments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Deployments ({deployments.length})
        </button>

        <button
          onClick={() => setActiveSubTab('services')}
          className={`pb-3 transition-colors border-b-2 ${
            activeSubTab === 'services'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Services &amp; Ingress ({services.length})
        </button>

        <button
          onClick={() => setActiveSubTab('nodes')}
          className={`pb-3 transition-colors border-b-2 ${
            activeSubTab === 'nodes'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Cluster Nodes ({nodes.length || 2})
        </button>

        <button
          onClick={() => setActiveSubTab('manifest')}
          className={`pb-3 transition-colors border-b-2 ${
            activeSubTab === 'manifest'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          YAML Manifest Studio
        </button>
      </div>

      {/* SUBTAB: Pods */}
      {activeSubTab === 'pods' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-base font-extrabold text-slate-900">Pod Workloads</h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter pods..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Pod Name</th>
                  <th className="py-3 px-4">Namespace</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Ready</th>
                  <th className="py-3 px-4">Restarts</th>
                  <th className="py-3 px-4">Node &amp; IP</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPods.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${p.status === 'Running' ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`}></span>
                        <span>{p.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold">
                        {p.namespace}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'Running'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {p.ready}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      {p.restarts}
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      <div>{p.node}</div>
                      <div className="text-[10px] text-slate-400">{p.ip}</div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveLogPod(p)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                          title="Stream Pod Logs"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRestartPod(p)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700"
                          title="Restart Pod"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB: Deployments */}
      {activeSubTab === 'deployments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Kubernetes Deployments</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Deployment</th>
                  <th className="py-3 px-4">Namespace</th>
                  <th className="py-3 px-4">Replicas Ready</th>
                  <th className="py-3 px-4">Up to Date</th>
                  <th className="py-3 px-4">Age</th>
                  <th className="py-3 px-4 text-right">Scaling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deployments.map(d => (
                  <tr key={d.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {d.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {d.namespace}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      {d.replicas}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {d.upToDate}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {d.age}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setScalingDeployment(d);
                          setDesiredReplicas(parseInt(d.replicas?.split('/')[1] || '3'));
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs ml-auto"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Scale Replicas</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB: Services */}
      {activeSubTab === 'services' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Services &amp; Networking</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Service Name</th>
                  <th className="py-3 px-4">Namespace</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Cluster IP</th>
                  <th className="py-3 px-4">Port(s)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map(s => (
                  <tr key={s.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {s.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {s.namespace}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                        {s.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {s.clusterIp}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 font-bold">
                      {s.ports}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB: Nodes */}
      {activeSubTab === 'nodes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(nodes.length > 0 ? nodes : [
            { name: 'control-plane-node-01', status: 'Ready', roles: 'control-plane,master', version: 'v1.29.2', os: 'Ubuntu 22.04', cpu: '8 cores', memory: '16 GiB' },
            { name: 'worker-node-02', status: 'Ready', roles: 'worker', version: 'v1.29.2', os: 'Ubuntu 22.04', cpu: '8 cores', memory: '16 GiB' }
          ]).map(n => (
            <div key={n.name} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-mono font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-600" />
                  <span>{n.name}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  {n.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div>Roles: <span className="font-semibold text-slate-800">{n.roles}</span></div>
                <div>Kubelet: <span className="font-mono text-slate-800">{n.version}</span></div>
                <div>CPU: <span className="font-bold text-slate-800">{n.cpu}</span></div>
                <div>Memory: <span className="font-bold text-slate-800">{n.memory}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB: YAML Studio */}
      {activeSubTab === 'manifest' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Kubernetes Manifest Apply Studio</h3>
              <p className="text-xs text-slate-500">Edit and execute `kubectl apply -f` directly to your cluster</p>
            </div>
            <button
              onClick={handleApplyYaml}
              disabled={isApplying}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              {isApplying ? 'Applying...' : 'kubectl apply -f'}
            </button>
          </div>

          <textarea
            rows={12}
            value={yamlCode}
            onChange={e => setYamlCode(e.target.value)}
            className="w-full p-4 rounded-xl bg-slate-950 font-mono text-xs text-cyan-300 border border-slate-800 focus:border-cyan-400 focus:outline-none"
          />

          {applyResult && (
            <div className="p-3.5 rounded-xl bg-slate-900 font-mono text-xs text-emerald-400 border border-slate-800">
              {applyResult}
            </div>
          )}
        </div>
      )}

      {/* Modal: Scale Deployment */}
      {scalingDeployment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Scale Deployment</h3>
              </div>
              <button
                onClick={() => setScalingDeployment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScaleSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">{scalingDeployment.name}</div>
                <div className="text-slate-500 font-mono">Namespace: {scalingDeployment.namespace}</div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-2">
                  <span>Desired Replicas:</span>
                  <span className="text-blue-600 text-sm font-black">{desiredReplicas} Pods</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={desiredReplicas}
                  onChange={e => setDesiredReplicas(parseInt(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setScalingDeployment(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScaling}
                  className="px-5 py-2 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isScaling ? 'Scaling...' : 'Apply Scale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pod Logs */}
      {activeLogPod && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-3xl border border-slate-800 w-full max-w-3xl shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold font-mono">
                  kubectl logs {activeLogPod.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveLogPod(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-black border border-slate-900 font-mono text-xs text-slate-300 max-h-80 overflow-y-auto space-y-1">
              <div>[INFO] Initializing server on 0.0.0.0:80</div>
              <div>[INFO] Attached to container runtime {activeLogPod.node}</div>
              <div>[INFO] Health check GET /healthz 200 OK</div>
              <div>[INFO] Pod active in namespace {activeLogPod.namespace}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
