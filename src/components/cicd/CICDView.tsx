import React, { useState } from 'react';
import {
  GitBranch,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  FileCode,
  Shield,
  Layers,
  Search,
  Download,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import { useDevSecOps } from '../../context/DevSecOpsContext';

export const CICDView: React.FC = () => {
  const {
    pipelineLogs,
    isRunningPipeline,
    runScenario,
    stageStatuses,
    sonarReport,
    vulnerabilities
  } = useDevSecOps();

  const [selectedBranch, setSelectedBranch] = useState('main');

  const ciSteps = [
    { id: 'ci-checkout', name: '1. Checkout Source Code', runner: 'actions/checkout@v4', duration: '1.2s', status: stageStatuses['ci-checkout'] },
    { id: 'ci-tests', name: '2. Run Unit Tests (Vitest)', runner: 'npm run test:ci', duration: '3.4s', status: stageStatuses['ci-tests'] },
    { id: 'ci-sonarqube', name: '3. SonarQube Code Quality', runner: 'sonarsource/sonarqube-scan-action@v2', duration: '4.1s', status: stageStatuses['ci-sonarqube'] },
    { id: 'ci-sast', name: '4. SAST Security Scan', runner: 'github/codeql-action/analyze@v3', duration: '2.8s', status: stageStatuses['ci-sast'] },
    { id: 'ci-dependency', name: '5. Dependency Audit (Snyk)', runner: 'snyk/actions/node@master', duration: '2.1s', status: stageStatuses['ci-dependency'] },
    { id: 'docker-build', name: '6. Docker Multi-Stage Build', runner: 'docker/build-push-action@v5', duration: '5.6s', status: stageStatuses['docker-build'] },
    { id: 'trivy-scan', name: '7. Trivy Container CVE Scan', runner: 'aquasecurity/trivy-action@master', duration: '3.9s', status: stageStatuses['trivy-scan'] },
    { id: 'ecr-push', name: '8. Push to AWS ECR Registry', runner: 'aws-actions/amazon-ecr-login@v2', duration: '2.4s', status: stageStatuses['ecr-push'] },
    { id: 'update-config', name: '9. GitOps Manifests Update', runner: 'peter-evans/create-pull-request@v6', duration: '1.5s', status: stageStatuses['update-config'] },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <span className="flex items-center gap-1 text-cyan-400 font-bold animate-pulse"><RotateCw className="w-3.5 h-3.5 animate-spin" /> RUNNING</span>;
      case 'success':
        return <span className="flex items-center gap-1 text-emerald-400 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> PASSED</span>;
      case 'failed':
        return <span className="flex items-center gap-1 text-red-400 font-bold"><XCircle className="w-3.5 h-3.5" /> FAILED</span>;
      case 'warning':
        return <span className="flex items-center gap-1 text-amber-400 font-bold"><AlertTriangle className="w-3.5 h-3.5" /> WARN</span>;
      default:
        return <span className="text-slate-500 font-mono">QUEUED</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Workflow Metadata Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">GitHub Actions Workflow: <span className="font-mono text-cyan-400">.github/workflows/ci-cd.yaml</span></h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                Workflow #492
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Triggered by <span className="text-slate-200 font-mono">push to origin/main</span> &bull; Commit <span className="text-cyan-400 font-mono">7e8910a</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="main">branch: main</option>
            <option value="release-v1.3">branch: release-v1.3</option>
            <option value="feat/zero-downtime">branch: feat/zero-downtime</option>
          </select>

          <button
            onClick={() => runScenario('happy-path')}
            disabled={isRunningPipeline}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all ${
              isRunningPipeline ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Trigger CI/CD Pipeline</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Steps & Live Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Step Execution List */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pipeline Stages &amp; Gates</h4>
            <span className="text-xs font-mono text-slate-400">Total Duration: ~24s</span>
          </div>

          <div className="space-y-2">
            {ciSteps.map(step => (
              <div
                key={step.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-950 text-slate-400 border border-slate-800">
                    <FileCode className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{step.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{step.runner}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[11px] font-mono text-slate-400">{step.duration}</span>
                  <div className="min-w-[85px] text-right">
                    {getStatusBadge(step.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Build & Runner Console */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>GitHub Actions Runner Console Output</span>
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              ubuntu-latest (x86_64)
            </span>
          </div>

          <div className="h-[460px] rounded-xl bg-slate-950 border border-slate-800/90 p-4 font-mono text-xs overflow-y-auto space-y-1.5 shadow-inner">
            <div className="text-slate-400 pb-2 border-b border-slate-900 flex items-center justify-between">
              <span>=== Job Execution Stream ===</span>
              <span className="text-cyan-400">runner-id: gh-runner-us-east-94</span>
            </div>

            {pipelineLogs.map((log, idx) => {
              const isError = log.includes('FAILED') || log.includes('CRITICAL') || log.includes('error');
              const isSuccess = log.includes('Passed') || log.includes('SUCCESS') || log.includes('passed');
              const isInfo = log.includes('INFO') || log.includes('Starting');

              return (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    isError
                      ? 'text-red-400 font-semibold'
                      : isSuccess
                      ? 'text-emerald-400'
                      : isInfo
                      ? 'text-cyan-300'
                      : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
