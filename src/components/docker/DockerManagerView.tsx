import React, { useState, useEffect } from 'react';
import {
  Container,
  Play,
  Square,
  RotateCw,
  Trash2,
  Terminal,
  Plus,
  Layers,
  Sparkles,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileCode,
  X,
  Cpu,
  Clock
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';

interface DockerContainerItem {
  id: string;
  names: string;
  image: string;
  status: string;
  state: string;
  ports: string;
  createdAt: string;
}

export const DockerManagerView: React.FC = () => {
  const { activeProject } = useDevSecOps();
  const [containers, setContainers] = useState<DockerContainerItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Image Builder State
  const [imageTag, setImageTag] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [showBuildPanel, setShowBuildPanel] = useState(false);

  // Container Logs Modal
  const [activeLogContainer, setActiveLogContainer] = useState<DockerContainerItem | null>(null);
  const [containerLogs, setContainerLogs] = useState<string[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Run Container Modal
  const [showRunModal, setShowRunModal] = useState(false);
  const [runImage, setRunImage] = useState('redis:7-alpine');
  const [runName, setRunName] = useState('');
  const [runPort, setRunPort] = useState('6379:6379');
  const [runEnv, setRunEnv] = useState('');
  const [isRunningContainer, setIsRunningContainer] = useState(false);

  const fetchContainers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/v1/docker/containers/real');
      const data = await res.json();
      if (data.containers) {
        setContainers(data.containers);
      }
    } catch (e) {
      console.error('Failed to load containers:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
    if (activeProject) {
      setImageTag(`${activeProject.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}:latest`);
    }
  }, [activeProject]);

  const handleContainerAction = async (action: 'start' | 'stop' | 'restart' | 'rm', containerId: string) => {
    try {
      await fetch('http://localhost:5001/api/v1/docker/container/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, containerId })
      });
      fetchContainers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuildImage = async () => {
    if (!imageTag.trim()) return;
    setIsBuilding(true);
    setShowBuildPanel(true);
    setBuildLogs([`[${new Date().toLocaleTimeString()}] Sending build request to Docker Daemon...`]);

    try {
      const res = await fetch('http://localhost:5001/api/v1/docker/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectPath: activeProject?.path,
          imageName: imageTag.trim()
        })
      });
      const data = await res.json();
      if (data.logs) {
        setBuildLogs(data.logs);
      }
      fetchContainers();
    } catch (err: any) {
      setBuildLogs(prev => [...prev, `[ERROR] Build failed: ${err.message}`]);
    } finally {
      setIsBuilding(false);
    }
  };

  const openContainerLogs = async (container: DockerContainerItem) => {
    setActiveLogContainer(container);
    setIsLoadingLogs(true);
    try {
      const res = await fetch(`http://localhost:5001/api/v1/docker/container/logs?containerId=${container.id}&tail=150`);
      const data = await res.json();
      setContainerLogs(data.logs || ['No logs returned']);
    } catch (err) {
      setContainerLogs(['Failed to fetch container logs']);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleRunNewContainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!runImage.trim()) return;
    setIsRunningContainer(true);

    try {
      const envVars = runEnv
        .split('\n')
        .filter(l => l.includes('='))
        .map(l => {
          const [key, ...rest] = l.split('=');
          return { key: key.trim(), value: rest.join('=').trim() };
        });

      await fetch('http://localhost:5001/api/v1/docker/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: runImage.trim(),
          name: runName.trim() || undefined,
          portMapping: runPort.trim() || undefined,
          envVars
        })
      });

      setShowRunModal(false);
      fetchContainers();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunningContainer(false);
    }
  };

  const filteredContainers = containers.filter(c =>
    c.names.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.image.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const runningCount = containers.filter(c => c.state === 'running' || c.status.toLowerCase().startsWith('up')).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
            <Container className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Docker Engine &amp; Container Manager
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                Host Socket Active
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Build production images, inspect container logs, and manage local Docker containers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchContainers}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowRunModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Run Container</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Running Containers</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{runningCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Containers on Host</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{containers.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Active Workspace Image</div>
            <div className="text-xs font-mono font-bold text-slate-800 mt-1 truncate max-w-[180px]">
              {imageTag || 'devopshub-app:latest'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Live Docker Image Builder Section */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold">Live Docker Image Builder (`docker build -t`)</div>
              <div className="text-[11px] text-slate-400 font-mono">
                Source: {activeProject?.path || '/Users/ronak/Desktop/Projectt'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowBuildPanel(prev => !prev)}
            className="text-xs text-slate-400 hover:text-white underline"
          >
            {showBuildPanel ? 'Hide Console' : 'Show Console'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[260px]">
            <label className="block text-[11px] text-slate-400 font-medium mb-1">
              Target Image Tag &amp; Repository:
            </label>
            <input
              type="text"
              value={imageTag}
              onChange={e => setImageTag(e.target.value)}
              placeholder="e.g. devopshub/microservice:v1.0.0"
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="self-end">
            <button
              onClick={handleBuildImage}
              disabled={isBuilding || !imageTag.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold hover:brightness-110 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
            >
              {isBuilding ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Building Image...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Build Docker Image</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Build Console Stream */}
        {showBuildPanel && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 max-h-56 overflow-y-auto space-y-1">
            {buildLogs.map((line, i) => (
              <div key={i} className={`leading-relaxed ${line.includes('ERROR') ? 'text-red-400 font-bold' : line.includes('Successfully') ? 'text-emerald-400 font-bold' : ''}`}>
                {line}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Container Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Host Container Inventory</h3>
            <p className="text-xs text-slate-500">Live containers discovered on local Docker daemon socket</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search containers..."
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
                <th className="py-3 px-4">Container</th>
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Status / State</th>
                <th className="py-3 px-4">Port Mapping</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContainers.map(c => {
                const isRunning = c.state === 'running' || c.status.toLowerCase().startsWith('up');
                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        <span>{c.names.replace(/^\//, '')}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">ID: {c.id.slice(0, 12)}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {c.image}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isRunning
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {c.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {c.ports || '-'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {c.createdAt}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openContainerLogs(c)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                          title="View Live Logs"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                        </button>

                        {isRunning ? (
                          <button
                            onClick={() => handleContainerAction('stop', c.id)}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700"
                            title="Stop Container"
                          >
                            <Square className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleContainerAction('start', c.id)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                            title="Start Container"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleContainerAction('restart', c.id)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700"
                          title="Restart Container"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleContainerAction('rm', c.id)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                          title="Remove Container"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Container Logs */}
      {activeLogContainer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-3xl border border-slate-800 w-full max-w-3xl shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-base font-bold font-mono">
                    Logs: {activeLogContainer.names.replace(/^\//, '')}
                  </h3>
                  <div className="text-[10px] text-slate-400 font-mono">Image: {activeLogContainer.image}</div>
                </div>
              </div>
              <button
                onClick={() => setActiveLogContainer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-black border border-slate-900 font-mono text-xs text-slate-300 max-h-96 overflow-y-auto space-y-1">
              {isLoadingLogs ? (
                <div className="text-center py-6 text-slate-500">Loading container logs...</div>
              ) : (
                containerLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Run New Container */}
      {showRunModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Container className="w-5 h-5 text-cyan-600" />
                <h3 className="text-base font-bold text-slate-900">Run Docker Container</h3>
              </div>
              <button
                onClick={() => setShowRunModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRunNewContainer} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Docker Image Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. postgres:16-alpine or redis:7-alpine"
                  value={runImage}
                  onChange={e => setRunImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Container Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. my-local-redis"
                  value={runName}
                  onChange={e => setRunName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Port Mapping (Host:Container)</label>
                <input
                  type="text"
                  placeholder="e.g. 6379:6379 or 8080:80"
                  value={runPort}
                  onChange={e => setRunPort(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Environment Variables (KEY=VALUE per line)</label>
                <textarea
                  rows={3}
                  placeholder={`POSTGRES_PASSWORD=secret\nNODE_ENV=production`}
                  value={runEnv}
                  onChange={e => setRunEnv(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRunModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRunningContainer}
                  className="px-5 py-2 rounded-xl bg-cyan-600 font-bold text-white hover:bg-cyan-700 disabled:opacity-50"
                >
                  {isRunningContainer ? 'Starting...' : 'Launch Container'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
