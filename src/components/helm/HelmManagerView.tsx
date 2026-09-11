import React, { useState, useEffect } from 'react';
import {
  Package,
  Layers,
  Download,
  Trash2,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Search,
  Plus,
  X,
  Sliders,
  Sparkles
} from 'lucide-react';

interface HelmRelease {
  name: string;
  namespace: string;
  revision: string;
  updated: string;
  status: string;
  chart: string;
  appVersion: string;
}

const HELM_CATALOG = [
  {
    chartName: 'ingress-nginx/ingress-nginx',
    displayName: 'NGINX Ingress Controller',
    category: 'Networking',
    description: 'Production ingress controller for Kubernetes using NGINX as a reverse proxy and load balancer.',
    version: '4.8.3',
    appVersion: 'v1.9.4',
    iconColor: 'bg-emerald-50 text-emerald-600 border-emerald-200'
  },
  {
    chartName: 'jetstack/cert-manager',
    displayName: 'Cert-Manager (Let\'s Encrypt)',
    category: 'Security',
    description: 'Automated TLS/SSL certificate management and renewal natively within Kubernetes.',
    version: 'v1.13.1',
    appVersion: 'v1.13.1',
    iconColor: 'bg-blue-50 text-blue-600 border-blue-200'
  },
  {
    chartName: 'argo/argo-cd',
    displayName: 'ArgoCD GitOps Engine',
    category: 'GitOps & CI/CD',
    description: 'Declarative, GitOps continuous delivery tool for Kubernetes cluster state reconciliation.',
    version: '5.46.7',
    appVersion: 'v2.8.4',
    iconColor: 'bg-orange-50 text-orange-600 border-orange-200'
  },
  {
    chartName: 'prometheus-community/kube-prometheus-stack',
    displayName: 'Kube-Prometheus Stack',
    category: 'Observability',
    description: 'Full monitoring pipeline with Prometheus Operator, Grafana dashboards, and Alertmanager.',
    version: '51.2.0',
    appVersion: 'v0.68.0',
    iconColor: 'bg-red-50 text-red-600 border-red-200'
  },
  {
    chartName: 'bitnami/postgresql-ha',
    displayName: 'PostgreSQL High-Availability',
    category: 'Databases',
    description: 'Highly available PostgreSQL cluster with streaming replication, Pgpool-II, and automated failover.',
    version: '12.4.1',
    appVersion: '16.0.0',
    iconColor: 'bg-cyan-50 text-cyan-600 border-cyan-200'
  },
  {
    chartName: 'bitnami/redis',
    displayName: 'Redis Sentinel Cluster',
    category: 'Caching',
    description: 'Distributed in-memory key-value database with master-replica Sentinel high availability.',
    version: '17.15.0',
    appVersion: '7.2.1',
    iconColor: 'bg-amber-50 text-amber-600 border-amber-200'
  }
];

export const HelmManagerView: React.FC = () => {
  const [releases, setReleases] = useState<HelmRelease[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Install Modal State
  const [selectedChart, setSelectedChart] = useState<any | null>(null);
  const [releaseName, setReleaseName] = useState('');
  const [targetNamespace, setTargetNamespace] = useState('default');
  const [customValues, setCustomValues] = useState('replicaCount: 2\nresources:\n  limits:\n    cpu: 200m\n    memory: 256Mi');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installStatus, setInstallStatus] = useState<string | null>(null);

  const fetchReleases = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/v1/helm/releases');
      const data = await res.json();
      if (data.releases) setReleases(data.releases);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  const handleInstallChart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChart || !releaseName.trim()) return;
    setIsInstalling(true);
    setInstallStatus('Installing Helm chart on cluster...');

    try {
      const res = await fetch('http://localhost:5001/api/v1/helm/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          releaseName: releaseName.trim(),
          chartName: selectedChart.chartName,
          namespace: targetNamespace.trim()
        })
      });
      const data = await res.json();
      setInstallStatus(data.message || 'Installed successfully.');
      setTimeout(() => {
        setSelectedChart(null);
        setInstallStatus(null);
        fetchReleases();
      }, 1500);
    } catch (err: any) {
      setInstallStatus(`Error: ${err.message}`);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleUninstall = async (rel: HelmRelease) => {
    try {
      await fetch('http://localhost:5001/api/v1/helm/uninstall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ releaseName: rel.name, namespace: rel.namespace })
      });
      fetchReleases();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCatalog = HELM_CATALOG.filter(c =>
    c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Helm Package Manager &amp; Cloud Marketplace
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                v3.13 Active
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              1-click deploy cloud-native infrastructure, ingress controllers, and databases to Kubernetes
            </p>
          </div>
        </div>

        <button
          onClick={fetchReleases}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sync Releases</span>
        </button>
      </div>

      {/* Installed Releases Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Installed Helm Releases ({releases.length})</h3>
            <p className="text-xs text-slate-500">Live packages currently deployed to Kubernetes namespaces</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Release Name</th>
                <th className="py-3 px-4">Namespace</th>
                <th className="py-3 px-4">Chart &amp; Version</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Revision</th>
                <th className="py-3 px-4">Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {releases.map(r => (
                <tr key={r.name} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>{r.name}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold">
                      {r.namespace}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-700 font-semibold">
                    {r.chart}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      {r.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    rev {r.revision}
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {r.updated}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleUninstall(r)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 ml-auto"
                      title="Uninstall Helm Release"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cloud-Native Catalog Grid */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Cloud-Native Helm Catalog</h3>
            <p className="text-xs text-slate-500">Pre-configured verified charts ready for 1-click cluster deployment</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCatalog.map(item => (
            <div
              key={item.chartName}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl border ${item.iconColor}`}>
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {item.displayName}
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[10px] font-mono text-slate-400">
                  v{item.version}
                </div>

                <button
                  onClick={() => {
                    setSelectedChart(item);
                    setReleaseName(item.displayName.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 15));
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install Chart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Install Helm Chart */}
      {selectedChart && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Install: {selectedChart.displayName}</h3>
              </div>
              <button
                onClick={() => setSelectedChart(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInstallChart} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Release Name *</label>
                <input
                  type="text"
                  required
                  value={releaseName}
                  onChange={e => setReleaseName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Namespace *</label>
                <input
                  type="text"
                  required
                  value={targetNamespace}
                  onChange={e => setTargetNamespace(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Custom values.yaml (Optional)</label>
                <textarea
                  rows={4}
                  value={customValues}
                  onChange={e => setCustomValues(e.target.value)}
                  className="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              {installStatus && (
                <div className="p-3 rounded-xl bg-blue-50 text-blue-900 font-medium text-xs border border-blue-200">
                  {installStatus}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedChart(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInstalling}
                  className="px-5 py-2 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isInstalling ? 'Installing...' : 'Confirm & Deploy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
