import React, { useState } from 'react';
import {
  Boxes,
  Server,
  Zap,
  RefreshCw,
  GitCommit,
  Layers,
  Code2,
  CheckCircle2,
  ExternalLink,
  Shield,
  Activity,
  Play
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';

export const GitOpsView: React.FC = () => {
  const {
    argoApp,
    triggerArgoSync,
    terraformResources,
    applyTerraformPlan
  } = useDevSecOps();

  const [selectedTerraformRes, setSelectedTerraformRes] = useState<string>(terraformResources[0]?.id || '');
  const [isApplyingTf, setIsApplyingTf] = useState<boolean>(false);

  const activeRes = terraformResources.find(r => r.id === selectedTerraformRes) || terraformResources[0];

  const handleApplyTf = async () => {
    setIsApplyingTf(true);
    await applyTerraformPlan();
    setIsApplyingTf(false);
  };

  const k8sArgoResources = [
    { kind: 'Deployment', name: 'backend-deployment', namespace: 'production', status: 'Synced', health: 'Healthy' },
    { kind: 'Deployment', name: 'frontend-deployment', namespace: 'production', status: 'Synced', health: 'Healthy' },
    { kind: 'StatefulSet', name: 'postgres-statefulset', namespace: 'production', status: 'Synced', health: 'Healthy' },
    { kind: 'Service', name: 'backend-service', namespace: 'production', status: 'Synced', health: 'Healthy' },
    { kind: 'Service', name: 'frontend-service', namespace: 'production', status: 'Synced', health: 'Healthy' },
    { kind: 'Ingress', name: 'devsecops-ingress', namespace: 'production', status: 'Synced', health: 'Healthy' },
    { kind: 'HorizontalPodAutoscaler', name: 'backend-hpa', namespace: 'production', status: 'Synced', health: 'Healthy' },
    { kind: 'SecretProviderClass', name: 'vault-aws-secrets', namespace: 'production', status: 'Synced', health: 'Healthy' },
  ];

  return (
    <div className="space-y-6">
      {/* ArgoCD GitOps Header Card */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Argo CD GitOps Engine: <span className="font-mono text-purple-400">{argoApp.name}</span></h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono border ${
                  argoApp.syncStatus === 'Synced'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                }`}>
                  {argoApp.syncStatus}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                  {argoApp.healthStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Repo: <span className="font-mono text-slate-300">{argoApp.repoURL}</span> &bull; Target: <span className="font-mono text-cyan-400">{argoApp.targetRevision}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerArgoSync}
              disabled={argoApp.syncStatus === 'Syncing'}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${argoApp.syncStatus === 'Syncing' ? 'animate-spin' : ''}`} />
              <span>{argoApp.syncStatus === 'Syncing' ? 'Syncing GitOps...' : 'Sync Application (Reconcile)'}</span>
            </button>
          </div>
        </div>

        {/* ArgoCD Resources Tree */}
        <div className="pt-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Synchronized Kubernetes Resources (Helm Chart Tree)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {k8sArgoResources.map((res, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] font-mono text-purple-400 font-semibold">{res.kind}</div>
                  <div className="font-bold text-white text-xs truncate max-w-[140px]">{res.name}</div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {res.health}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Terraform Infrastructure as Code (IaC) Explorer */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Infrastructure as Code (Terraform AWS Cloud Engine)</h3>
              <p className="text-xs text-slate-400">Declarative VPC networking, AWS EKS 1.30, Application Load Balancers, IAM IRSA roles, and ECR registries</p>
            </div>
          </div>

          <button
            onClick={handleApplyTf}
            disabled={isApplyingTf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isApplyingTf ? 'Running terraform apply...' : 'Run terraform apply'}</span>
          </button>
        </div>

        {/* 2-Column: Resource Selector & HCL Code Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Left: Managed Resources */}
          <div className="lg:col-span-5 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-1">
              Cloud Resources State (5 Applied)
            </div>

            {terraformResources.map(res => (
              <div
                key={res.id}
                onClick={() => setSelectedTerraformRes(res.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedTerraformRes === res.id
                    ? 'bg-indigo-950/40 border-indigo-500/70 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-300 text-xs">{res.type}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                    {res.status}
                  </span>
                </div>
                <div className="text-xs font-semibold text-white mt-1">{res.name}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  Provider: <span className="text-amber-400">{res.provider}</span> &bull; Region: <span className="text-slate-300">us-east-1</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right: HCL Code Viewer */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Terraform HCL Manifest: <span className="font-mono text-cyan-400">{activeRes.type}.tf</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Terraform v1.9.5 (AWS Provider v5.64)</span>
            </div>

            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-200 overflow-x-auto h-[320px] shadow-inner">
              <pre className="text-cyan-300 leading-relaxed">{activeRes.hclSnippet}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
