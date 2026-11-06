export type StageStatus = 'idle' | 'running' | 'success' | 'failed' | 'warning' | 'remediating';

export type PipelineStageId =
  | 'developer'
  | 'github'
  | 'ci-checkout'
  | 'ci-tests'
  | 'ci-sonarqube'
  | 'ci-sast'
  | 'ci-dependency'
  | 'docker-build'
  | 'trivy-scan'
  | 'vuln-gate'
  | 'ecr-push'
  | 'update-config'
  | 'gitops-repo'
  | 'argocd'
  | 'terraform-iac'
  | 'k8s-frontend'
  | 'k8s-backend'
  | 'k8s-database'
  | 'k8s-configmaps'
  | 'k8s-secrets'
  | 'k8s-ingress'
  | 'k8s-helm'
  | 'k8s-hpa'
  | 'deploy-strategy'
  | 'app-live'
  | 'obs-prometheus'
  | 'obs-grafana'
  | 'obs-loki'
  | 'obs-opentelemetry'
  | 'alertmanager'
  | 'notifications'
  | 'self-healing-hpa'
  | 'self-healing-restart'
  | 'self-healing-rollback'
  | 'continuous-improvement';

export type ScenarioType =
  | 'happy-path'
  | 'trivy-blocked'
  | 'hpa-traffic-surge'
  | 'pod-crash-healing'
  | 'canary-rollback'
  | 'custom';

export interface Vulnerability {
  id: string;
  cve: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  package: string;
  installedVersion: string;
  fixedVersion: string;
  title: string;
  description: string;
  publishedDate: string;
  cvss: number;
  remediationPath: string;
  patched?: boolean;
}

export interface SonarQubeReportData {
  status: 'PASSED' | 'FAILED' | 'WARNING';
  bugs: number;
  vulnerabilities: number;
  securityHotspots: number;
  codeSmells: number;
  coverage: number;
  duplicatedLinesPercent: number;
  ratings: {
    security: 'A' | 'B' | 'C' | 'D' | 'E';
    reliability: 'A' | 'B' | 'C' | 'D' | 'E';
    maintainability: 'A' | 'B' | 'C' | 'D' | 'E';
  };
  issues: Array<{
    id: string;
    type: 'BUG' | 'VULNERABILITY' | 'CODE_SMELL' | 'SECURITY_HOTSPOT';
    severity: 'BLOCKER' | 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';
    message: string;
    file: string;
    line: number;
  }>;
}

export interface KubernetesPod {
  id: string;
  name: string;
  tier: 'frontend' | 'backend' | 'database';
  version: string;
  status: 'Running' | 'CrashLoopBackOff' | 'Pending' | 'Terminating' | 'ContainerCreating';
  ready: string;
  restarts: number;
  cpu: string;
  memory: string;
  node: string;
  ip: string;
  age: string;
  logs: string[];
}

export interface MetricPoint {
  timestamp: string;
  timeLabel: string;
  rps: number;
  latencyMs: number;
  errorRatePercent: number;
  cpuPercent: number;
  memoryPercent: number;
  activePods: number;
}

export interface LogItem {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  service: 'frontend' | 'backend' | 'database' | 'ingress' | 'argocd' | 'alertmanager';
  message: string;
  traceId?: string;
  podId?: string;
}

export interface TraceSpan {
  id: string;
  traceId: string;
  service: string;
  operation: string;
  durationMs: number;
  statusCode: number;
  status: 'OK' | 'ERROR';
  startTimeOffsetMs: number;
  tags: Record<string, string>;
  children?: TraceSpan[];
}

export interface TerraformResource {
  id: string;
  type: string;
  name: string;
  status: 'Applied' | 'Provisioning' | 'Modified' | 'Destroyed';
  provider: 'aws' | 'kubernetes' | 'helm';
  details: Record<string, any>;
  hclSnippet: string;
}

export interface ArgoCDAppState {
  name: string;
  repoURL: string;
  targetRevision: string;
  currentRevision: string;
  syncStatus: 'Synced' | 'OutOfSync' | 'Syncing' | 'Unknown';
  healthStatus: 'Healthy' | 'Progressing' | 'Degraded' | 'Missing';
  syncPolicy: 'Automated (Prune + Self-Heal)' | 'Manual';
  resourcesCount: number;
  lastSyncDuration: string;
}

export interface AlertNotification {
  id: string;
  timestamp: string;
  alertName: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  service: string;
  summary: string;
  description: string;
  channel: 'Slack' | 'Discord' | 'PagerDuty';
  status: 'Firing' | 'Resolved' | 'Remediating';
  remediationAction?: string;
}

export interface ActivePipelineRun {
  id: string;
  scenario: ScenarioType;
  startTime: number;
  currentStepIndex: number;
  status: 'idle' | 'running' | 'success' | 'failed' | 'remediating';
  logs: string[];
}

export interface RealGitInfo {
  repository: string;
  branch: string;
  commitHash: string;
  author: string;
  lastCommitMessage: string;
  commits: Array<{
    hash: string;
    author: string;
    date: string;
    message: string;
  }>;
}

export interface RealAuditData {
  totalDependencies: number;
  productionDependencies: number;
  devDependencies: number;
  vulnerabilitiesCount: number;
  critical: number;
  high: number;
  moderate: number;
  low: number;
  vulnerabilities: Vulnerability[];
}

export interface RealSystemTelemetry {
  timestamp: string;
  timeLabel: string;
  cpuPercent: number;
  memoryPercent: number;
  totalMemoryGb: string;
  freeMemoryGb: string;
  usedMemoryGb: string;
  heapUsedMb: number;
  uptimeHours: string;
  cpuModel: string;
  cores: number;
  platform: string;
  hostname: string;
  networkInterfaces: Array<{
    interface: string;
    ip: string;
    mac: string;
  }>;
}

export interface ProjectWorkspace {
  id: string;
  name: string;
  path: string;
  type: string;
  description: string;
  branch: string;
  commitHash: string;
  author: string;
  techStack: string[];
  dockerfilePresent: boolean;
  k8sManifestsPresent: boolean;
  jenkinsfilePresent: boolean;
  version?: string;
  dependenciesCount?: number;
  packageJson?: any;
  lastScanned: string;
}

export interface DeploymentRecord {
  id: string;
  projectId: string;
  projectName: string;
  environment: string;
  branch: string;
  commitHash: string;
  commitMessage: string;
  author: string;
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';
  dockerImage: string;
  dockerImageSize: string;
  k8sNamespace: string;
  k8sDeployment: string;
  k8sReplicas: string;
  jenkinsJob: string;
  jenkinsBuildNumber: number;
  duration: string;
  logs: string[];
  timestamp: string;
}

export interface DockerImageDetail {
  repository: string;
  tag: string;
  id: string;
  createdSince: string;
  size: string;
}

export interface DockerContainerDetail {
  id: string;
  image: string;
  command: string;
  createdAt: string;
  status: string;
  ports: string;
  names: string;
}

export interface K8sDeploymentDetail {
  namespace: string;
  name: string;
  replicas: string;
  upToDate: number;
  available: number;
  age: string;
}

export interface K8sServiceDetail {
  namespace: string;
  name: string;
  type: string;
  clusterIP: string;
  ports: string;
}

export interface K8sEventDetail {
  type: string;
  reason: string;
  message: string;
  object: string;
  timestamp: string;
}

export interface K8sWorkloadsBundle {
  connected: boolean;
  deployments: K8sDeploymentDetail[];
  services: K8sServiceDetail[];
  events: K8sEventDetail[];
}

export interface JenkinsJobDetail {
  name: string;
  url: string;
  color: string;
}
