import React, { useState } from 'react';
import {
  X,
  FileCode,
  Shield,
  Container,
  Cpu,
  Server,
  Activity,
  Zap,
  Terminal,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Play,
  Copy
} from 'lucide-react';
import { useDevSecOps, MainTabType } from '../../context/DevSecOpsContext';
import { PipelineStageId } from '../../types/devsecops';
import { sampleManifests } from '../../mockData/k8sManifests';
import { CodeViewer } from '../common/CodeViewer';

export const NodeDetailDrawer: React.FC = () => {
  const {
    selectedNode,
    setSelectedNode,
    stageStatuses,
    setActiveTab,
    vulnerabilities,
    sonarReport,
    pods,
    argoApp,
    terraformResources,
    simulateTrafficSurge,
    simulateCrashPod,
    patchVulnerability,
    triggerArgoSync
  } = useDevSecOps();

  const [activeSubTab, setActiveSubTab] = useState<'details' | 'manifest' | 'logs'>('details');

  if (!selectedNode) return null;

  const getDrawerContent = (id: PipelineStageId) => {
    switch (id) {
      case 'developer':
        return {
          title: 'Developer Workspace & Git Workflow',
          subtitle: 'Source code updates, branch management, and pre-commit security hooks',
          manifest: `# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run test:unit
gitleaks protect --staged --verbose`,
          manifestLang: 'bash',
          manifestFile: '.husky/pre-commit',
          content: (
            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Developers work on feature branches with Husky pre-commit hooks configured for local linting, gitleaks secret detection, and unit test execution.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-slate-300 space-y-1">
                <div className="text-cyan-400 font-bold"># Developer Commit &amp; Push</div>
                <div>git checkout -b feat/zero-downtime-endpoint</div>
                <div>git add . &amp;&amp; git commit -m &quot;feat(api): add health probes and circuit breaker&quot;</div>
                <div>git push origin main</div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setActiveTab('cicd')}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-600/20"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View CI/CD Pipelines</span>
                </button>
              </div>
            </div>
          )
        };

      case 'k8s-hpa':
      case 'self-healing-hpa':
        return {
          title: 'Horizontal Pod Autoscaler (HPA)',
          subtitle: 'Metric-driven dynamic pod scaling based on CPU/Memory thresholds',
          manifest: sampleManifests.hpa,
          manifestLang: 'yaml',
          manifestFile: 'backend-hpa.yaml',
          content: (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono space-y-1">
                <div className="text-amber-400 font-bold">HPA Configuration:</div>
                <div className="text-slate-300">Min Replicas: 2 | Max Replicas: 10</div>
                <div className="text-slate-300">Target CPU Utilization: 70%</div>
                <div className="text-slate-300">Scale-up velocity: 100% in 15s</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-slate-300 font-semibold">Simulate Traffic Spike</div>
                <p className="text-slate-400 text-[11px]">Inject a 2,500 RPS surge to watch HPA scale pods in real time.</p>
                <button
                  onClick={() => simulateTrafficSurge(2500)}
                  className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Simulate 2,500 RPS Surge</span>
                </button>
              </div>
            </div>
          )
        };

      case 'ci-sonarqube':
        return {
          title: 'SonarQube Code Quality Gate',
          subtitle: 'Static code analysis, code smells, bugs, security hotspots, and test coverage',
          manifest: `sonar.projectKey=devsecops-cloud-core
sonar.projectName=Cloud-Native Platform
sonar.sources=src
sonar.tests=tests
sonar.qualitygate.wait=true
sonar.coverage.exclusions=**/*.test.ts,**/*.config.js`,
          manifestLang: 'properties',
          manifestFile: 'sonar-project.properties',
          content: (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-slate-400 text-[10px]">Quality Gate</div>
                  <div className="text-emerald-400 font-bold text-sm">{sonarReport.status}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-slate-400 text-[10px]">Test Coverage</div>
                  <div className="text-cyan-400 font-bold text-sm">{sonarReport.coverage}%</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <div className="text-slate-400 text-[10px]">Security Rating</div>
                  <div className="text-emerald-400 font-bold text-sm">Grade {sonarReport.ratings.security}</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400">Detected Issues ({sonarReport.issues.length})</div>
                {sonarReport.issues.map(iss => (
                  <div key={iss.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-slate-200">{iss.message}</div>
                      <div className="text-[10px] font-mono text-slate-500">{iss.file}:{iss.line}</div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                      {iss.severity}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveTab('security')}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-center shadow-md shadow-blue-600/20"
              >
                Open Full Security Dashboard
              </button>
            </div>
          )
        };

      default:
        return {
          title: selectedNode.toUpperCase(),
          subtitle: 'Cloud-native DevSecOps platform architectural component',
          manifest: sampleManifests.helmValues,
          manifestLang: 'yaml',
          manifestFile: 'values.yaml',
          content: (
            <div className="space-y-3 text-xs text-slate-300">
              <p>Component is fully integrated into the automated DevSecOps delivery pipeline.</p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-cyan-400">
                Pipeline Stage Status: {stageStatuses[selectedNode] || 'Healthy'}
              </div>
            </div>
          )
        };
    }
  };

  const details = getDrawerContent(selectedNode);

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 shadow-2xl mb-4 backdrop-blur-xl transition-all">
      <div className="flex items-start justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-md">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {details.title}
            </h3>
            <p className="text-xs text-slate-400">{details.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tab switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveSubTab('details')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeSubTab === 'details' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSubTab('manifest')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeSubTab === 'manifest' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Manifest / Config
            </button>
          </div>

          <button
            onClick={() => setSelectedNode(null)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="pt-4">
        {activeSubTab === 'details' ? (
          details.content
        ) : (
          <CodeViewer
            code={details.manifest}
            language={details.manifestLang}
            fileName={details.manifestFile}
          />
        )}
      </div>
    </div>
  );
};
