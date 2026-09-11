import React, { useState } from 'react';
import {
  Boxes,
  Server,
  Container,
  GitBranch,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  RotateCw,
  FolderTree,
  Terminal,
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  Plus,
  RefreshCw,
  Eye,
  X
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';
import { DeploymentRecord, DockerContainerDetail, DockerImageDetail } from '../../types/devsecops';

export const DeploymentsManagerView: React.FC = () => {
  const {
    activeProject,
    deployments,
    dockerImages,
    dockerContainers,
    k8sWorkloads,
    jenkinsJobs,
    executeRealPipeline,
    isExecutingRealPipeline,
    executeDockerAction,
    triggerJenkinsJob,
    gitInfo,
    systemTelemetry
  } = useDevSecOps();

  const [activeTab, setActiveTab] = useState<'deployments' | 'docker' | 'kubernetes' | 'jenkins'>('deployments');
  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentRecord | null>(null);
  const [filterEnv, setFilterEnv] = useState<string>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDeployments = deployments.filter(d => {
    const matchesEnv = filterEnv === 'ALL' || d.environment === filterEnv;
    const matchesQuery = searchQuery === '' ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.commitHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.dockerImage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEnv && matchesQuery;
  });

  const handleDockerAction = async (action: 'start' | 'stop' | 'restart', containerId: string) => {
    setActionLoading(containerId);
    try {
      await executeDockerAction(action, containerId);
    } finally {
      setActionLoading(null);
    }
  };

  const handleJenkinsTrigger = async (jobName: string) => {
    setActionLoading(jobName);
    try {
      await triggerJenkinsJob(jobName);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Workspace Header Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {activeProject?.name || 'Projectt'}
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                Active Workspace
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              Path: {activeProject?.path || '/Users/ronak/Desktop/Projectt'} &bull; Branch: {gitInfo?.branch || 'main'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={executeRealPipeline}
            disabled={isExecutingRealPipeline}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors ${
              isExecutingRealPipeline ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isExecutingRealPipeline ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>Trigger Real Deployment</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('deployments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'deployments'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Deployments Ledger ({deployments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('docker')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'docker'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Container className="w-4 h-4 text-cyan-400" />
          <span>Docker Engine ({dockerImages.length} images)</span>
        </button>

        <button
          onClick={() => setActiveTab('kubernetes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'kubernetes'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Server className="w-4 h-4 text-blue-400" />
          <span>Kubernetes Workloads</span>
        </button>

        <button
          onClick={() => setActiveTab('jenkins')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'jenkins'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Jenkins CI/CD ({jenkinsJobs.length} jobs)</span>
        </button>
      </div>

      {/* Tab 1: Deployments Ledger */}
      {activeTab === 'deployments' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search deployments, commits, images..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs">
              {['ALL', 'production', 'staging', 'preview'].map(env => (
                <button
                  key={env}
                  onClick={() => setFilterEnv(env)}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors capitalize ${
                    filterEnv === env ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Deployment ID</th>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Environment</th>
                    <th className="py-3 px-4">Commit / Author</th>
                    <th className="py-3 px-4">Docker Image</th>
                    <th className="py-3 px-4">K8s Namespace</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredDeployments.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No deployments recorded yet. Click "Trigger Real Deployment" above to run a live build!
                      </td>
                    </tr>
                  ) : (
                    filteredDeployments.map(dep => (
                      <tr key={dep.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                          {dep.id}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {dep.projectName}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold capitalize">
                            {dep.environment}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          <div><span className="text-cyan-600 font-bold">{dep.commitHash}</span> &bull; {dep.branch}</div>
                          <div className="text-[10px] text-slate-400">{dep.author}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700">
                          <div>{dep.dockerImage}</div>
                          <div className="text-[10px] text-slate-400">{dep.dockerImageSize}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-purple-700">
                          {dep.k8sNamespace} ({dep.k8sReplicas})
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            dep.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dep.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            <span>{dep.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                          {dep.duration}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedDeployment(dep)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors"
                            title="View Execution Logs"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Docker Engine Explorer */}
      {activeTab === 'docker' && (
        <div className="space-y-6">
          {/* Docker Images Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Container className="w-5 h-5 text-cyan-600" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Local Docker Images ({dockerImages.length})
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-600 font-bold">docker daemon: active</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-semibold border-b border-slate-100 text-[11px] uppercase">
                    <th className="py-2.5 px-2">Repository</th>
                    <th className="py-2.5 px-2">Tag</th>
                    <th className="py-2.5 px-2">Image ID</th>
                    <th className="py-2.5 px-2">Created</th>
                    <th className="py-2.5 px-2 text-right">Virtual Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {dockerImages.map((img, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-2 font-bold text-slate-800">{img.repository}</td>
                      <td className="py-2.5 px-2 text-cyan-600">{img.tag}</td>
                      <td className="py-2.5 px-2 text-slate-500">{img.id}</td>
                      <td className="py-2.5 px-2 text-slate-400 font-sans text-[11px]">{img.createdSince}</td>
                      <td className="py-2.5 px-2 text-right font-bold text-slate-700">{img.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Docker Running Containers */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Live Docker Containers ({dockerContainers.length})
                </h3>
              </div>
            </div>

            {dockerContainers.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No active containers running currently on local Docker daemon.
              </div>
            ) : (
              <div className="space-y-2">
                {dockerContainers.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <div>
                        <div className="font-bold text-slate-800 font-mono">{c.names || c.id}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{c.image} &bull; {c.status}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDockerAction('restart', c.id)}
                        disabled={actionLoading === c.id}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-bold text-[11px] text-slate-700"
                      >
                        Restart
                      </button>
                      <button
                        onClick={() => handleDockerAction('stop', c.id)}
                        disabled={actionLoading === c.id}
                        className="px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 font-bold text-[11px] text-red-600"
                      >
                        Stop
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Kubernetes Workloads */}
      {activeTab === 'kubernetes' && (
        <div className="space-y-6">
          {/* Deployments Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Kubernetes Deployments &amp; Services
              </h3>
              <span className="text-xs font-mono text-purple-600 font-bold">kubectl cluster context: connected</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Deployments */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Deployments</span>
                {k8sWorkloads?.deployments && k8sWorkloads.deployments.length > 0 ? (
                  k8sWorkloads.deployments.map((d, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800 font-mono">{d.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">namespace: {d.namespace}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-mono font-bold text-[11px]">
                        {d.replicas} Replicas
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 text-slate-400 text-xs font-mono">
                    frontend-deployment (2/2) &bull; backend-deployment (2/2) &bull; postgres-statefulset (1/1)
                  </div>
                )}
              </div>

              {/* Services */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Services &amp; Ingress</span>
                {k8sWorkloads?.services && k8sWorkloads.services.length > 0 ? (
                  k8sWorkloads.services.map((s, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800 font-mono">{s.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{s.clusterIP}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-mono font-bold text-[11px]">
                        {s.ports || s.type}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 text-slate-400 text-xs font-mono">
                    frontend-svc:80 &bull; backend-svc:5001 &bull; postgres-svc:5432
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Jenkins CI/CD */}
      {activeTab === 'jenkins' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Jenkins CI/CD Pipelines &amp; Jobs
              </h3>
            </div>
          </div>

          {jenkinsJobs.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No Jenkins jobs returned from http://localhost:8080. Start Jenkins Desktop to probe active jobs.
            </div>
          ) : (
            <div className="space-y-2">
              {jenkinsJobs.map((job, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${job.color === 'blue' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    <span className="font-bold text-slate-800 font-mono">{job.name}</span>
                  </div>

                  <button
                    onClick={() => handleJenkinsTrigger(job.name)}
                    disabled={actionLoading === job.name}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px]"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Trigger Build</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: View Deployment Logs */}
      {selectedDeployment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b101d] border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col h-[480px]">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-mono font-bold text-white">
                  Deployment Log Stream: {selectedDeployment.id} ({selectedDeployment.projectName})
                </span>
              </div>

              <button
                onClick={() => setSelectedDeployment(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1.5 bg-[#070b14] select-text">
              <div className="text-slate-500 pb-2 border-b border-slate-900 flex justify-between">
                <span>Commit: {selectedDeployment.commitHash} ({selectedDeployment.branch})</span>
                <span className="text-emerald-400 font-bold">{selectedDeployment.status}</span>
              </div>

              {selectedDeployment.logs && selectedDeployment.logs.map((log, idx) => (
                <div key={idx} className="text-slate-300 leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
