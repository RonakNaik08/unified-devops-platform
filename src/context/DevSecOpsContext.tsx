import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  PipelineStageId,
  StageStatus,
  ScenarioType,
  Vulnerability,
  SonarQubeReportData,
  KubernetesPod,
  MetricPoint,
  LogItem,
  TraceSpan,
  TerraformResource,
  ArgoCDAppState,
  AlertNotification
} from '../types/devsecops';
import { initialVulnerabilities } from '../mockData/vulnerabilities';
import { initialSonarReport } from '../mockData/sonarReport';
import { initialTerraformResources } from '../mockData/terraformCode';
import { initialPods, initialArgoCDApp } from '../mockData/k8sManifests';
import { initialTraces } from '../mockData/traceData';
import confetti from 'canvas-confetti';
import { soundFx } from '../utils/soundFx';

export type MainTabType =
  | 'flowchart'
  | 'cicd'
  | 'security'
  | 'gitops'
  | 'kubernetes'
  | 'observability'
  | 'self-healing'
  | 'ai-copilot'
  | 'live-app';

interface DevSecOpsContextType {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  selectedNode: PipelineStageId | null;
  setSelectedNode: (node: PipelineStageId | null) => void;
  
  // Pipeline simulation state
  activeScenario: ScenarioType | null;
  isRunningPipeline: boolean;
  activeStepName: string;
  stageStatuses: Record<PipelineStageId, StageStatus>;
  pipelineLogs: string[];
  runScenario: (scenario: ScenarioType) => void;
  resetScenario: () => void;
  cancelScenario: () => void;

  // Real-time Cluster & Data
  pods: KubernetesPod[];
  vulnerabilities: Vulnerability[];
  patchVulnerability: (vulnId: string) => void;
  sonarReport: SonarQubeReportData;
  terraformResources: TerraformResource[];
  argoApp: ArgoCDAppState;
  metricsHistory: MetricPoint[];
  logs: LogItem[];
  traces: TraceSpan[];
  alerts: AlertNotification[];
  dismissAlert: (id: string) => void;

  // Interactive Controls
  appVersion: string;
  canarySplit: number;
  setCanarySplit: (split: number) => void;
  trafficRps: number;
  setTrafficRps: (rps: number) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean | ((prev: boolean) => boolean)) => void;

  // Manual Fault & Self-Healing Triggers
  simulateCrashPod: (podId: string) => void;
  simulateTrafficSurge: (targetRps: number) => void;
  simulateCanaryFault: () => void;
  triggerArgoSync: () => void;
  triggerAutoRollback: () => void;
  applyTerraformPlan: () => Promise<void>;
  aiAnalyses: Array<{ id: string; title: string; timestamp: string; recommendation: string; type: 'OPTIMIZATION' | 'SECURITY' | 'INCIDENT' }>;
}

const defaultStageStatuses: Record<PipelineStageId, StageStatus> = {
  'developer': 'idle',
  'github': 'idle',
  'ci-checkout': 'idle',
  'ci-tests': 'idle',
  'ci-sonarqube': 'idle',
  'ci-sast': 'idle',
  'ci-dependency': 'idle',
  'docker-build': 'idle',
  'trivy-scan': 'idle',
  'vuln-gate': 'idle',
  'ecr-push': 'idle',
  'update-config': 'idle',
  'gitops-repo': 'idle',
  'argocd': 'idle',
  'terraform-iac': 'idle',
  'k8s-frontend': 'idle',
  'k8s-backend': 'idle',
  'k8s-database': 'idle',
  'k8s-configmaps': 'idle',
  'k8s-secrets': 'idle',
  'k8s-ingress': 'idle',
  'k8s-helm': 'idle',
  'k8s-hpa': 'idle',
  'deploy-strategy': 'idle',
  'app-live': 'idle',
  'obs-prometheus': 'idle',
  'obs-grafana': 'idle',
  'obs-loki': 'idle',
  'obs-opentelemetry': 'idle',
  'alertmanager': 'idle',
  'notifications': 'idle',
  'self-healing-hpa': 'idle',
  'self-healing-restart': 'idle',
  'self-healing-rollback': 'idle',
  'continuous-improvement': 'idle',
};

const DevSecOpsContext = createContext<DevSecOpsContextType | undefined>(undefined);

export const DevSecOpsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<MainTabType>('flowchart');
  const [selectedNode, setSelectedNode] = useState<PipelineStageId | null>('developer');
  const [activeScenario, setActiveScenario] = useState<ScenarioType | null>(null);
  const [isRunningPipeline, setIsRunningPipeline] = useState<boolean>(false);
  const [activeStepName, setActiveStepName] = useState<string>('Ready');
  const [stageStatuses, setStageStatuses] = useState<Record<PipelineStageId, StageStatus>>(defaultStageStatuses);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([
    'Ready. Select a scenario or node to begin inspection.'
  ]);

  const [pods, setPods] = useState<KubernetesPod[]>(initialPods);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>(initialVulnerabilities);
  const [sonarReport, setSonarReport] = useState<SonarQubeReportData>(initialSonarReport);
  const [terraformResources, setTerraformResources] = useState<TerraformResource[]>(initialTerraformResources);
  const [argoApp, setArgoApp] = useState<ArgoCDAppState>(initialArgoCDApp);
  const [traces] = useState<TraceSpan[]>(initialTraces);
  
  const [appVersion, setAppVersion] = useState<string>('v1.2.0');
  const [canarySplit, setCanarySplit] = useState<number>(0);
  const [trafficRps, setTrafficRps] = useState<number>(240);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      service: 'ingress',
      message: 'NGINX Ingress routing 240 req/sec across 2 frontend replicas',
      traceId: 'tr-init-01'
    },
    {
      id: 'log-2',
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      service: 'argocd',
      message: 'Application devsecops-production-app is Synced with Git SHA 7e8910a',
      traceId: 'tr-init-02'
    },
    {
      id: 'log-3',
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      service: 'backend',
      message: 'PostgreSQL connection pool healthy (12/20 active connections)',
      traceId: 'tr-init-03'
    }
  ]);

  const [aiAnalyses, setAiAnalyses] = useState<Array<{ id: string; title: string; timestamp: string; recommendation: string; type: 'OPTIMIZATION' | 'SECURITY' | 'INCIDENT' }>>([
    {
      id: 'ai-1',
      title: 'HPA CPU Threshold Optimization',
      timestamp: '10 mins ago',
      type: 'OPTIMIZATION',
      recommendation: 'Target CPU threshold 70% is optimal for Node.js event loop latency. Autoscaler response time is within 1.8 seconds.',
    },
    {
      id: 'ai-2',
      title: 'Zero-Downtime Rolling Update Validated',
      timestamp: '1 hour ago',
      type: 'SECURITY',
      recommendation: 'Readiness probes and preStop sleep hooks prevented dropped in-flight HTTP connections during previous v1.2.0 rollout.',
    }
  ]);

  // Rolling metrics generator
  const [metricsHistory, setMetricsHistory] = useState<MetricPoint[]>(() => {
    const points: MetricPoint[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const t = new Date(now - i * 3000);
      points.push({
        timestamp: t.toISOString(),
        timeLabel: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        rps: 240 + Math.floor(Math.random() * 20 - 10),
        latencyMs: 38 + Math.floor(Math.random() * 6 - 3),
        errorRatePercent: 0.02,
        cpuPercent: 42 + Math.floor(Math.random() * 6 - 3),
        memoryPercent: 54,
        activePods: 5
      });
    }
    return points;
  });

  // Real Backend Data Sync on Mount
  useEffect(() => {
    // 1. Fetch real code analysis
    fetch('/api/v1/code-analysis')
      .then(res => res.json())
      .then(data => {
        if (data && data.ratings) {
          setSonarReport(prev => ({
            ...prev,
            status: data.status,
            bugs: data.bugs,
            vulnerabilities: data.vulnerabilities,
            securityHotspots: data.securityHotspots,
            codeSmells: data.codeSmells,
            coverage: data.coverage,
            ratings: data.ratings,
            issues: data.issues.length > 0 ? data.issues : prev.issues
          }));
        }
      })
      .catch(() => {});

    // 2. Fetch cluster state from persistent DB
    fetch('/api/v1/cluster/state')
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.pods && data.pods.length > 0) setPods(data.pods);
          if (data.vulnerabilities && data.vulnerabilities.length > 0) setVulnerabilities(data.vulnerabilities);
          if (data.appVersion) setAppVersion(data.appVersion);
        }
      })
      .catch(() => {});
  }, []);

  // Live Metrics Loop syncing with real backend telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/v1/telemetry')
        .then(res => res.json())
        .then(telemetryData => {
          const now = new Date();
          const baseRps = trafficRps;
          const jitter = Math.floor(Math.random() * 15 - 7);
          const currentRps = Math.max(10, baseRps + jitter);
          
          const runningBackendPods = pods.filter(p => p.tier === 'backend' && p.status === 'Running').length || 1;
          const hasCrashedPod = pods.some(p => p.status === 'CrashLoopBackOff');
          const errorRate = hasCrashedPod ? 8.4 : canarySplit > 0 && appVersion.includes('canary') ? 14.5 : 0.02;

          const newPoint: MetricPoint = {
            timestamp: now.toISOString(),
            timeLabel: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            rps: currentRps,
            latencyMs: telemetryData.latencyMs || 38,
            errorRatePercent: parseFloat(errorRate.toFixed(2)),
            cpuPercent: telemetryData.cpuPercent || 45,
            memoryPercent: telemetryData.memoryPercent || 54,
            activePods: pods.filter(p => p.status === 'Running').length
          };

          setMetricsHistory(prev => [...prev.slice(1), newPoint]);
        })
        .catch(() => {
          // Fallback if backend temporarily restarting
          const now = new Date();
          const newPoint: MetricPoint = {
            timestamp: now.toISOString(),
            timeLabel: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            rps: trafficRps,
            latencyMs: 38,
            errorRatePercent: 0.02,
            cpuPercent: 42,
            memoryPercent: 54,
            activePods: pods.filter(p => p.status === 'Running').length
          };
          setMetricsHistory(prev => [...prev.slice(1), newPoint]);
        });
    }, 2500);

    return () => clearInterval(interval);
  }, [trafficRps, pods, canarySplit, appVersion]);

  const addLog = useCallback((message: string, service: LogItem['service'] = 'backend', level: LogItem['level'] = 'INFO') => {
    const newLog: LogItem = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toLocaleTimeString(),
      level,
      service,
      message,
      traceId: 'tr-' + Math.random().toString(36).substring(2, 9)
    };
    setLogs(prev => [newLog, ...prev.slice(0, 80)]);
  }, []);

  const addAlert = useCallback((alertName: string, severity: AlertNotification['severity'], summary: string, channel: AlertNotification['channel'] = 'Slack', remediationAction?: string) => {
    const newAlert: AlertNotification = {
      id: 'alt-' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      alertName,
      severity,
      service: 'production-cluster',
      summary,
      description: summary,
      channel,
      status: 'Firing',
      remediationAction
    };
    setAlerts(prev => [newAlert, ...prev]);
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const patchVulnerability = useCallback((vulnId: string) => {
    setVulnerabilities(prev => prev.map(v => v.id === vulnId ? { ...v, patched: true } : v));
    addLog(`Security Patch applied for vulnerability ${vulnId}. Base image rebuilt.`, 'backend', 'INFO');
  }, [addLog]);

  const simulateCrashPod = useCallback((podId: string) => {
    setPods(prev => prev.map(p => {
      if (p.id === podId) {
        return {
          ...p,
          status: 'CrashLoopBackOff',
          restarts: p.restarts + 1,
          ready: '0/1',
          logs: [...p.logs, `[${new Date().toLocaleTimeString()}] FATAL: Uncaught Exception: Out of memory buffer allocation`, `[${new Date().toLocaleTimeString()}] Liveness probe failed on port 5000`]
        };
      }
      return p;
    }));

    addLog(`Pod ${podId} entered CrashLoopBackOff. Liveness probe failed 3 consecutive times.`, 'backend', 'ERROR');
    addAlert('PodCrashLoopBackOff', 'CRITICAL', `Pod ${podId} crashed. Self-healing restart initiated.`, 'Slack', 'Kubernetes Controller: Restarting container with fresh memory headroom');

    // Self Healing Auto-Recovery after 4.5s
    setTimeout(() => {
      setPods(prev => prev.map(p => {
        if (p.id === podId) {
          return {
            ...p,
            status: 'Running',
            ready: '1/1',
            cpu: '45m',
            memory: '135Mi',
            logs: [...p.logs, `[${new Date().toLocaleTimeString()}] K8s-Controller: Pod restarted. Health probe passed 200 OK`]
          };
        }
        return p;
      }));
      setAlerts(prev => prev.map(a => a.alertName === 'PodCrashLoopBackOff' ? { ...a, status: 'Resolved' } : a));
      addLog(`Self-Healing Success: Pod ${podId} restarted by kubelet and healthy.`, 'backend', 'INFO');
    }, 4500);
  }, [addLog, addAlert]);

  const simulateTrafficSurge = useCallback((targetRps: number) => {
    setTrafficRps(targetRps);
    addLog(`Traffic surge detected: Request volume increased to ${targetRps} RPS`, 'ingress', 'WARN');
    addAlert('HighTrafficLoad', 'WARNING', `Incoming traffic spiked to ${targetRps} RPS. CPU threshold exceeded 75%.`, 'Slack', 'HPA: Scaling backend deployment from 2 to 6 replicas');

    // HPA Auto Scaling
    setTimeout(() => {
      setPods(prev => {
        const existingBackend = prev.filter(p => p.tier === 'backend');
        if (existingBackend.length >= 6) return prev;
        
        const newPods: KubernetesPod[] = [
          {
            id: 'pod-be-hpa-3',
            name: 'backend-deployment-64d4b9bc6-hpa3a',
            tier: 'backend',
            version: 'v1.2.0',
            status: 'Running',
            ready: '1/1',
            restarts: 0,
            cpu: '65m',
            memory: '130Mi',
            node: 'ip-10-0-10-42.ec2.internal',
            ip: '10.0.10.220',
            age: '10s',
            logs: ['[INFO] Pod spawned by HorizontalPodAutoscaler', '[INFO] Health check /healthz ready']
          },
          {
            id: 'pod-be-hpa-4',
            name: 'backend-deployment-64d4b9bc6-hpa4b',
            tier: 'backend',
            version: 'v1.2.0',
            status: 'Running',
            ready: '1/1',
            restarts: 0,
            cpu: '62m',
            memory: '128Mi',
            node: 'ip-10-0-20-88.ec2.internal',
            ip: '10.0.20.221',
            age: '10s',
            logs: ['[INFO] Pod spawned by HorizontalPodAutoscaler', '[INFO] Health check /healthz ready']
          },
          {
            id: 'pod-be-hpa-5',
            name: 'backend-deployment-64d4b9bc6-hpa5c',
            tier: 'backend',
            version: 'v1.2.0',
            status: 'Running',
            ready: '1/1',
            restarts: 0,
            cpu: '58m',
            memory: '125Mi',
            node: 'ip-10-0-10-42.ec2.internal',
            ip: '10.0.10.222',
            age: '5s',
            logs: ['[INFO] Pod spawned by HorizontalPodAutoscaler', '[INFO] Health check /healthz ready']
          },
          {
            id: 'pod-be-hpa-6',
            name: 'backend-deployment-64d4b9bc6-hpa6d',
            tier: 'backend',
            version: 'v1.2.0',
            status: 'Running',
            ready: '1/1',
            restarts: 0,
            cpu: '59m',
            memory: '124Mi',
            node: 'ip-10-0-20-88.ec2.internal',
            ip: '10.0.20.223',
            age: '5s',
            logs: ['[INFO] Pod spawned by HorizontalPodAutoscaler', '[INFO] Health check /healthz ready']
          }
        ];
        return [...prev, ...newPods];
      });

      addLog(`HPA Scaling Complete: Backend cluster expanded to 6 replicas. Traffic balanced.`, 'backend', 'INFO');
      setAlerts(prev => prev.map(a => a.alertName === 'HighTrafficLoad' ? { ...a, status: 'Resolved' } : a));
    }, 3500);
  }, [addLog, addAlert]);

  const simulateCanaryFault = useCallback(() => {
    setAppVersion('v1.3.0-canary-faulty');
    setCanarySplit(25);
    addLog(`Canary rollout initiated (25% traffic -> v1.3.0-canary-faulty)`, 'ingress', 'WARN');
    addLog(`Canary endpoint returned 500 Internal Server Error (NullPointerException in auth handler)`, 'backend', 'ERROR');
    
    addAlert('CanaryHighErrorRate', 'CRITICAL', 'Canary v1.3.0 error rate spiked to 14.5% (> 5% threshold). Automated rollback triggered.', 'Discord', 'ArgoCD: Instant rollback to stable image v1.2.0');

    // Auto Rollback after 5s
    setTimeout(() => {
      setAppVersion('v1.2.0');
      setCanarySplit(0);
      setArgoApp(prev => ({ ...prev, syncStatus: 'Synced', healthStatus: 'Healthy', currentRevision: 'commit 7e8910a (v1.2.0)' }));
      addLog(`Automated Rollback Complete: Traffic 100% restored to stable v1.2.0. Error rate normalized.`, 'argocd', 'INFO');
      setAlerts(prev => prev.map(a => a.alertName === 'CanaryHighErrorRate' ? { ...a, status: 'Resolved' } : a));
    }, 5000);
  }, [addLog, addAlert]);

  const triggerArgoSync = useCallback(() => {
    setArgoApp(prev => ({ ...prev, syncStatus: 'Syncing' }));
    addLog('ArgoCD sync started: reconciling cluster state with git repository...', 'argocd', 'INFO');
    setTimeout(() => {
      setArgoApp(prev => ({ ...prev, syncStatus: 'Synced', healthStatus: 'Healthy', lastSyncDuration: '1.2s' }));
      addLog('ArgoCD sync completed successfully: 14 Kubernetes resources in sync.', 'argocd', 'INFO');
    }, 2000);
  }, [addLog]);

  const triggerAutoRollback = useCallback(() => {
    setAppVersion('v1.2.0');
    setCanarySplit(0);
    setArgoApp(prev => ({ ...prev, syncStatus: 'Synced', healthStatus: 'Healthy', currentRevision: 'commit 7e8910a (v1.2.0)' }));
    addLog('Manual/Auto Rollback executed: Deployment reverted to commit 7e8910a (v1.2.0)', 'argocd', 'INFO');
  }, [addLog]);

  const applyTerraformPlan = useCallback(async () => {
    addLog('Terraform: Running terraform plan -out=tfplan...', 'backend', 'INFO');
    setTerraformResources(prev => prev.map(r => ({ ...r, status: 'Provisioning' })));
    await new Promise(r => setTimeout(r, 2200));
    setTerraformResources(prev => prev.map(r => ({ ...r, status: 'Applied' })));
    addLog('Terraform Apply Complete: 5 resources provisioned / verified in AWS us-east-1.', 'backend', 'INFO');
  }, [addLog]);

  const cancelScenario = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsRunningPipeline(false);
    setActiveScenario(null);
    setActiveStepName('Cancelled');
  }, []);

  const resetScenario = useCallback(() => {
    cancelScenario();
    setStageStatuses(defaultStageStatuses);
    setPipelineLogs(['Baseline state restored. Ready.']);
    setPods(initialPods);
    setAppVersion('v1.2.0');
    setCanarySplit(0);
    setTrafficRps(240);
    setAlerts([]);
    setActiveStepName('Ready');
  }, [cancelScenario]);

  // Run Scenario Workflow
  const runScenario = useCallback((scenario: ScenarioType) => {
    cancelScenario();
    setIsRunningPipeline(true);
    setActiveScenario(scenario);
    setStageStatuses(defaultStageStatuses);
    setPipelineLogs([`[${new Date().toLocaleTimeString()}] Starting scenario: ${scenario.toUpperCase()}`]);

    const stepsQueue: Array<{
      stageId: PipelineStageId;
      status: StageStatus;
      stepName: string;
      delay: number;
      log: string;
      action?: () => void;
    }> = [];

    if (scenario === 'happy-path') {
      stepsQueue.push(
        { stageId: 'developer', status: 'running', stepName: '1. Developer Push Code', delay: 800, log: 'Developer committed feat(api): enhance order validation and pushed to main' },
        { stageId: 'developer', status: 'success', stepName: 'Code Pushed', delay: 300, log: 'Git push origin main -> SHA b94e18f' },
        { stageId: 'github', status: 'running', stepName: '2. GitHub Webhook Triggered', delay: 800, log: 'GitHub Webhook triggered GitHub Actions workflow .github/workflows/ci-cd.yaml' },
        { stageId: 'github', status: 'success', stepName: 'Workflow Queued', delay: 300, log: 'Workflow #492 running on ubuntu-latest runner' },
        { stageId: 'ci-checkout', status: 'running', stepName: '3. CI: Checkout Code', delay: 700, log: 'actions/checkout@v4 - Checked out repository at SHA b94e18f' },
        { stageId: 'ci-checkout', status: 'success', stepName: 'Code Checked Out', delay: 200, log: 'Workspace prepared' },
        { stageId: 'ci-tests', status: 'running', stepName: '4. CI: Run Unit Tests', delay: 900, log: 'Vitest / Jest: Running 84 unit tests...' },
        { stageId: 'ci-tests', status: 'success', stepName: 'Tests Passed (84/84)', delay: 300, log: 'PASS: 84 unit tests passed (Coverage: 92.4%)' },
        { stageId: 'ci-sonarqube', status: 'running', stepName: '5. CI: SonarQube Code Quality', delay: 900, log: 'SonarQube Scanner: Analyzing code smells, bugs, and security hotspots...' },
        { stageId: 'ci-sonarqube', status: 'success', stepName: 'SonarQube Quality Gate Passed', delay: 300, log: 'Quality Gate: PASSED (Bugs: 0, Vulns: 0, Security Rating: A)' },
        { stageId: 'ci-sast', status: 'running', stepName: '6. CI: SAST Security Scan', delay: 800, log: 'Semgrep / CodeQL: Static application security testing in progress...' },
        { stageId: 'ci-sast', status: 'success', stepName: 'SAST Scan Clean', delay: 300, log: '0 high/critical security flaws discovered' },
        { stageId: 'ci-dependency', status: 'running', stepName: '7. CI: Dependency Scan', delay: 800, log: 'Snyk / OWASP Dependency-Check: Auditing package lockfile...' },
        { stageId: 'ci-dependency', status: 'success', stepName: 'Dependencies Verified', delay: 300, log: '0 vulnerable packages in dependency tree' },
        { stageId: 'docker-build', status: 'running', stepName: '8. Build Docker Image', delay: 1000, log: 'docker build -t 123456789.dkr.ecr.us-east-1.amazonaws.com/devsecops-app:v1.3.0 .' },
        { stageId: 'docker-build', status: 'success', stepName: 'Docker Image Built', delay: 300, log: 'Image SHA256: 8f49b12e09c size: 84.2MB' },
        { stageId: 'trivy-scan', status: 'running', stepName: '9. Trivy Container Image Scan', delay: 1100, log: 'trivy image --severity HIGH,CRITICAL 123456789.dkr.ecr.us-east-1.amazonaws.com/devsecops-app:v1.3.0' },
        { stageId: 'trivy-scan', status: 'success', stepName: 'Trivy Scan Passed (0 Vulnerabilities)', delay: 400, log: 'Trivy: 0 CRITICAL, 0 HIGH vulnerabilities found.' },
        { stageId: 'vuln-gate', status: 'success', stepName: '10. Security Gate: Approved', delay: 300, log: 'Security Gate PASS: Proceeding to registry push' },
        { stageId: 'ecr-push', status: 'running', stepName: '11. Push to AWS ECR Registry', delay: 900, log: 'docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/devsecops-app:v1.3.0' },
        { stageId: 'ecr-push', status: 'success', stepName: 'Pushed to ECR', delay: 300, log: 'ECR digest immutable tag v1.3.0 recorded' },
        { stageId: 'update-config', status: 'running', stepName: '12. Update Helm Image Tag', delay: 800, log: 'GitOps: Updated values.yaml image.tag = "v1.3.0"' },
        { stageId: 'update-config', status: 'success', stepName: 'Helm Tag Updated', delay: 300, log: 'Committed to gitops-manifests repo' },
        { stageId: 'gitops-repo', status: 'success', stepName: '13. GitOps Repo Updated', delay: 400, log: 'Git revision main updated with new Helm chart manifest' },
        { stageId: 'argocd', status: 'running', stepName: '14. Argo CD Sync Triggered', delay: 1000, log: 'Argo CD detected git drift. Reconciling Kubernetes cluster...' },
        { stageId: 'argocd', status: 'success', stepName: 'Argo CD Synchronized', delay: 400, log: 'Argo CD sync status: Synced (14 resources)', action: () => {
          setAppVersion('v1.3.0');
          setArgoApp(prev => ({ ...prev, currentRevision: 'commit b94e18f (v1.3.0)', syncStatus: 'Synced' }));
        }},
        { stageId: 'deploy-strategy', status: 'running', stepName: '15. Canary Traffic Split (10% -> 100%)', delay: 1000, log: 'NGINX Ingress routing 10% canary traffic to v1.3.0 pods...' },
        { stageId: 'deploy-strategy', status: 'success', stepName: 'Zero-Downtime Rollout Complete', delay: 400, log: 'Canary health verified. 100% traffic promoted to v1.3.0' },
        { stageId: 'app-live', status: 'success', stepName: '16. Application Live to Users', delay: 500, log: 'Application healthy and serving live traffic behind AWS ALB Ingress' },
        { stageId: 'obs-prometheus', status: 'success', stepName: '17. Observability: Prometheus Metrics Collected', delay: 400, log: 'Prometheus metrics scrapers active (P95 latency: 34ms, 0 errors)' },
        { stageId: 'continuous-improvement', status: 'success', stepName: '18. Continuous Improvement & AI SRE Analysis', delay: 500, log: 'AI SRE Copilot: Zero regressions detected. System optimal.' }
      );
    } else if (scenario === 'trivy-blocked') {
      stepsQueue.push(
        { stageId: 'developer', status: 'success', stepName: '1. Developer Push Code', delay: 500, log: 'Developer pushed feature branch' },
        { stageId: 'github', status: 'success', stepName: '2. GitHub CI Triggered', delay: 500, log: 'Workflow triggered' },
        { stageId: 'ci-checkout', status: 'success', stepName: '3. Checkout Code', delay: 400, log: 'Code checked out' },
        { stageId: 'ci-tests', status: 'success', stepName: '4. Unit Tests Passed', delay: 500, log: 'Tests passed' },
        { stageId: 'docker-build', status: 'success', stepName: '5. Docker Image Built', delay: 700, log: 'Docker container built with legacy base image' },
        { stageId: 'trivy-scan', status: 'running', stepName: '6. Trivy Security Scan', delay: 1200, log: 'trivy image --severity HIGH,CRITICAL devsecops-app:v1.3.0-unpatched' },
        { stageId: 'trivy-scan', status: 'failed', stepName: 'Trivy Scan FAILED (1 CRITICAL Vulnerability)', delay: 400, log: 'CRITICAL: CVE-2024-38063 in libxml2:2.9.13-r0 (CVSS 9.8 Remote Code Execution)' },
        { stageId: 'vuln-gate', status: 'failed', stepName: '7. Security Gate: BLOCKED DEPLOYMENT', delay: 500, log: 'Deployment blocked by security policy! Image cannot be pushed to registry.' },
        { stageId: 'alertmanager', status: 'running', stepName: '8. Alertmanager Triggered', delay: 600, log: 'Alertmanager created critical alert: SecurityVulnerabilityDetected' },
        { stageId: 'notifications', status: 'warning', stepName: '9. Notification Sent to Slack / Discord', delay: 600, log: 'Slack notification posted to #devsecops-alerts: Trivy Scan Failed for commit b94e18f', action: () => {
          addAlert('TrivySecurityBlocker', 'CRITICAL', 'Deployment blocked: CVE-2024-38063 (CVSS 9.8) detected in libxml2', 'Slack', 'Auto-Remediation: Upgrade base image to alpine:3.20.2');
        }},
        { stageId: 'continuous-improvement', status: 'warning', stepName: '10. AI Remediation Feedback to Developer', delay: 800, log: 'AI SRE: Suggested Dockerfile fix generated. Pull request #14 opened with base image upgrade.' }
      );
    } else if (scenario === 'hpa-traffic-surge') {
      stepsQueue.push(
        { stageId: 'app-live', status: 'warning', stepName: '1. Massive Traffic Spike (2,500 RPS)', delay: 800, log: 'Load Generator: Simulating flash sale load (2,500 RPS)', action: () => {
          setTrafficRps(2200);
        }},
        { stageId: 'obs-prometheus', status: 'warning', stepName: '2. Prometheus Detects CPU > 85%', delay: 900, log: 'Prometheus query rate(container_cpu_usage[1m]) spiked to 88%' },
        { stageId: 'alertmanager', status: 'warning', stepName: '3. Alertmanager: HighCpuUtilization', delay: 700, log: 'Alertmanager firing alert: BackendHighCpuLoad' },
        { stageId: 'self-healing-hpa', status: 'running', stepName: '4. Automated Self-Healing: HPA Pod Autoscaling', delay: 1200, log: 'HorizontalPodAutoscaler: Replicas desired 2 -> 6 (Target: 70% CPU)', action: () => {
          simulateTrafficSurge(2400);
        }},
        { stageId: 'k8s-backend', status: 'running', stepName: '5. Kubernetes Scheduling 4 New Pods', delay: 1000, log: 'K8s scheduler assigned pods to worker nodes. ContainerCreating...' },
        { stageId: 'k8s-backend', status: 'success', stepName: '6. All 6 Replicas Ready', delay: 800, log: 'Readiness probes 200 OK. Ingress load balancing across 6 pods.' },
        { stageId: 'self-healing-hpa', status: 'success', stepName: '7. System Recovered (CPU Stabilized to 52%)', delay: 600, log: 'Latency stabilized to 38ms. Error rate 0.00%. Zero dropped requests.' },
        { stageId: 'continuous-improvement', status: 'success', stepName: '8. AI Capacity Planning Logged', delay: 600, log: 'AI Analytics: Autoscaler reaction time was 3.1s. Cluster node group headroom sufficient.' }
      );
    } else if (scenario === 'pod-crash-healing') {
      stepsQueue.push(
        { stageId: 'k8s-backend', status: 'failed', stepName: '1. Backend Pod OOMKilled Crash', delay: 800, log: 'Pod backend-deployment-64d4b9bc6-8fzt2 crashed (exit code 137: OOMKilled)', action: () => {
          simulateCrashPod('pod-be-1');
        }},
        { stageId: 'alertmanager', status: 'failed', stepName: '2. Alertmanager Fired: PodCrashLoopBackOff', delay: 800, log: 'Alert fired to #devsecops-alerts channel' },
        { stageId: 'notifications', status: 'warning', stepName: '3. Slack Notification Dispatched', delay: 600, log: 'Slack webhook notified On-Call engineer' },
        { stageId: 'self-healing-restart', status: 'running', stepName: '4. Self-Healing: Kubelet Container Restart', delay: 1200, log: 'Kubelet restarted container with exponential backoff reset. Reconnecting DB pool...' },
        { stageId: 'self-healing-restart', status: 'success', stepName: '5. Pod Successfully Restored', delay: 800, log: 'Health probe returned 200 OK. Pod status: Running (1/1 ready).' },
        { stageId: 'continuous-improvement', status: 'success', stepName: '6. Incident RCA Recorded', delay: 600, log: 'AI SRE Incident Report: Memory heap spike caused by unpaginated query. Recommended adding LIMIT clause.' }
      );
    } else if (scenario === 'canary-rollback') {
      stepsQueue.push(
        { stageId: 'deploy-strategy', status: 'running', stepName: '1. Canary Rollout v1.3.0-faulty (25%)', delay: 800, log: 'Deploying canary release v1.3.0 with 25% traffic split', action: () => {
          simulateCanaryFault();
        }},
        { stageId: 'obs-prometheus', status: 'failed', stepName: '2. Prometheus Detected Error Rate Spike (14.5%)', delay: 900, log: 'Prometheus 5xx error rate exceeded 5% critical threshold!' },
        { stageId: 'alertmanager', status: 'failed', stepName: '3. Alertmanager: CanaryDeploymentDegraded', delay: 700, log: 'Alertmanager triggered high-priority webhook to Argo CD' },
        { stageId: 'self-healing-rollback', status: 'running', stepName: '4. Automated Remediation: Instant GitOps Rollback', delay: 1200, log: 'Argo CD executing automated rollback to stable commit 7e8910a (v1.2.0)...' },
        { stageId: 'argocd', status: 'success', stepName: '5. Reverted to v1.2.0', delay: 800, log: 'Deployment synced to previous stable replica. Faulty pods terminated.' },
        { stageId: 'self-healing-rollback', status: 'success', stepName: '6. Error Rate Restored to 0.02%', delay: 600, log: 'Automated remediation successful. Downtime avoided.' },
        { stageId: 'continuous-improvement', status: 'success', stepName: '7. Bug Report & Trace Attached to JIRA / GitHub', delay: 600, log: 'OpenTelemetry trace with stack trace automatically attached to developer ticket.' }
      );
    }

    let currentIndex = 0;
    const runNextStep = () => {
      if (currentIndex >= stepsQueue.length) {
        setIsRunningPipeline(false);
        setActiveStepName('Completed');
        setPipelineLogs(prev => [`[${new Date().toLocaleTimeString()}] Scenario finished successfully.`, ...prev]);
        try {
          soundFx.playSuccess();
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}
        return;
      }

      const step = stepsQueue[currentIndex];
      setActiveStepName(step.stepName);
      setSelectedNode(step.stageId);
      
      setStageStatuses(prev => ({
        ...prev,
        [step.stageId]: step.status
      }));

      setPipelineLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [${step.stageId.toUpperCase()}] ${step.log}`,
        ...prev
      ]);

      if (step.action) {
        step.action();
      }

      currentIndex++;
      timerRef.current = setTimeout(runNextStep, step.delay);
    };

    runNextStep();
  }, [cancelScenario, addAlert, simulateCrashPod, simulateTrafficSurge, simulateCanaryFault]);

  return (
    <DevSecOpsContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedNode,
        setSelectedNode,
        activeScenario,
        isRunningPipeline,
        activeStepName,
        stageStatuses,
        pipelineLogs,
        runScenario,
        resetScenario,
        cancelScenario,
        pods,
        vulnerabilities,
        patchVulnerability,
        sonarReport,
        terraformResources,
        argoApp,
        metricsHistory,
        logs,
        traces,
        alerts,
        dismissAlert,
        appVersion,
        canarySplit,
        setCanarySplit,
        trafficRps,
        setTrafficRps,
        soundEnabled,
        setSoundEnabled,
        simulateCrashPod,
        simulateTrafficSurge,
        simulateCanaryFault,
        triggerArgoSync,
        triggerAutoRollback,
        applyTerraformPlan,
        aiAnalyses
      }}
    >
      {children}
    </DevSecOpsContext.Provider>
  );
};

export const useDevSecOps = () => {
  const context = useContext(DevSecOpsContext);
  if (!context) {
    throw new Error('useDevSecOps must be used within a DevSecOpsProvider');
  }
  return context;
};
