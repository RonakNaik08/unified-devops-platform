import express from 'express';
import cors from 'cors';
import { PersistentDB } from './db.js';
import { SecurityScanner } from './scanners.js';
import { telemetry } from './telemetry.js';
import { LocalDevOpsIntegrator } from './localIntegrations.js';
import { RealDataEngine } from './realData.js';
import { ExtendedDevOpsEngine } from './extendedIntegrations.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Telemetry middleware
app.use((req, res, next) => {
  telemetry.recordRequest(false);
  next();
});

/* =========================================================================
   1. Kubernetes Standard Health & Prometheus Endpoints
   ========================================================================= */
app.get('/api/healthz', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.get('/api/readyz', (req, res) => {
  res.status(200).json({ status: 'READY', checks: { database: 'connected', csiVault: 'synced' } });
});

app.get('/api/metrics', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; version=0.0.4');
  res.send(telemetry.getPrometheusFormat());
});

app.get('/api/v1/telemetry', (req, res) => {
  res.json(telemetry.getMetrics());
});

/* =========================================================================
   2. Cluster & Workloads API
   ========================================================================= */
app.get('/api/v1/cluster/state', (req, res) => {
  const db = PersistentDB.load();
  res.json({
    appVersion: db.appVersion,
    canarySplit: db.canarySplit,
    trafficRps: db.trafficRps,
    pods: db.pods,
    vulnerabilities: db.vulnerabilities,
    orders: db.orders,
    pipelineHistory: db.pipelineHistory,
    alerts: db.alerts
  });
});

app.post('/api/v1/pods/crash', (req, res) => {
  const { podId } = req.body;
  const db = PersistentDB.load();
  const pod = db.pods.find(p => p.id === podId);
  if (!pod) return res.status(404).json({ error: 'Pod not found' });

  pod.status = 'CrashLoopBackOff';
  pod.restarts += 1;
  pod.ready = '0/1';
  pod.logs.push(`[${new Date().toLocaleTimeString()}] FATAL: Container crash (Exit code 137: OOMKilled)`);
  PersistentDB.save(db);

  // Trigger self-healing recovery after 4 seconds
  setTimeout(() => {
    const freshDb = PersistentDB.load();
    const target = freshDb.pods.find(p => p.id === podId);
    if (target) {
      target.status = 'Running';
      target.ready = '1/1';
      target.logs.push(`[${new Date().toLocaleTimeString()}] Kubelet: Container restarted with clean memory headroom`);
      PersistentDB.save(freshDb);
    }
  }, 4000);

  res.json({ message: `Pod ${podId} crashed. Self-healing restart scheduled.`, pod });
});

app.post('/api/v1/pods/scale', (req, res) => {
  const { desiredReplicas } = req.body;
  const db = PersistentDB.load();
  const existingBackend = db.pods.filter(p => p.tier === 'backend');
  
  if (desiredReplicas > existingBackend.length) {
    for (let i = existingBackend.length + 1; i <= desiredReplicas; i++) {
      db.pods.push({
        id: `pod-be-hpa-${i}`,
        name: `backend-deployment-64d4b9bc6-hpa${i}`,
        tier: 'backend',
        version: db.appVersion,
        status: 'Running',
        ready: '1/1',
        restarts: 0,
        cpu: '58m',
        memory: '124Mi',
        node: i % 2 === 0 ? 'ip-10-0-10-42.ec2.internal' : 'ip-10-0-20-88.ec2.internal',
        ip: `10.0.10.22${i}`,
        age: '1m',
        logs: ['[INFO] Pod spawned by HorizontalPodAutoscaler', '[INFO] Health check /healthz ready']
      });
    }
    PersistentDB.save(db);
  }
  res.json({ message: `HPA scaled to ${desiredReplicas} replicas`, pods: db.pods });
});

/* =========================================================================
   3. DevSecOps Real Security Scanners & Code Analysis
   ========================================================================= */
app.get('/api/v1/code-analysis', (req, res) => {
  const report = SecurityScanner.scanSourceCode();
  res.json(report);
});

app.get('/api/v1/dependencies', (req, res) => {
  const deps = SecurityScanner.scanDependencies();
  res.json(deps);
});

app.get('/api/v1/vulnerabilities', (req, res) => {
  const db = PersistentDB.load();
  res.json(db.vulnerabilities);
});

app.post('/api/v1/vulnerabilities/patch', (req, res) => {
  const { vulnId } = req.body;
  const db = PersistentDB.load();
  const vuln = db.vulnerabilities.find(v => v.id === vulnId);
  if (vuln) {
    vuln.patched = true;
    PersistentDB.save(db);
    return res.json({ message: `Vulnerability ${vulnId} patched successfully.`, vulnerability: vuln });
  }
  res.status(404).json({ error: 'Vulnerability not found' });
});

/* =========================================================================
   4. Live 3-Tier Orders & Transactions (Database Tier)
   ========================================================================= */
app.get('/api/v1/orders', (req, res) => {
  const db = PersistentDB.load();
  res.json(db.orders);
});

app.post('/api/v1/orders', (req, res) => {
  const { item, amount } = req.body;
  if (!item) return res.status(400).json({ error: 'Item name is required' });

  const db = PersistentDB.load();
  const newOrder = {
    id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
    item,
    amount: amount || ('$' + (Math.floor(Math.random() * 200) + 25) + '.00'),
    status: 'Completed',
    version: db.appVersion,
    latency: (Math.floor(Math.random() * 25) + 14) + 'ms',
    createdAt: new Date().toISOString()
  };

  db.orders.unshift(newOrder);
  PersistentDB.save(db);
  res.status(201).json(newOrder);
});

/* =========================================================================
   5. AI SRE Diagnostics Endpoint
   ========================================================================= */
app.post('/api/v1/ai/diagnostics', (req, res) => {
  const { query } = req.body;
  const metrics = telemetry.getMetrics();
  const scan = SecurityScanner.scanSourceCode();
  const db = PersistentDB.load();

  let responseText = '';
  if (query && query.toLowerCase().includes('cpu')) {
    responseText = `CPU Diagnostics: Host system currently utilizing ${metrics.cpuPercent}% across ${metrics.systemInfo.cores} cores (${metrics.systemInfo.cpuModel}). Event loop latency is healthy at ${metrics.latencyMs}ms. HPA is armed with 70% threshold.`;
  } else if (query && query.toLowerCase().includes('cve')) {
    const unpatched = db.vulnerabilities.filter(v => !v.patched);
    responseText = `Security Audit: Real static code scan of ${scan.totalFilesScanned} files (${scan.linesOfCode} LOC) returned Quality Gate ${scan.status}. Active CVE blockers: ${unpatched.length} unpatched CVEs.`;
  } else {
    responseText = `AI SRE Cluster Analysis: All 3 tiers (Frontend, Node.js Backend, PostgreSQL StatefulSet) operating within SLA. Uptime: ${metrics.uptimeSeconds}s. Memory heap: ${metrics.heapUsedMb}MB. No anomalies detected.`;
  }

  res.json({
    analysis: responseText,
    metricsSummary: metrics,
    codeScan: scan
  });
});

/* =========================================================================
   6. GitOps & Terraform Actions
   ========================================================================= */
app.post('/api/v1/gitops/sync', (req, res) => {
  res.json({
    status: 'Synced',
    revision: 'commit 7e8910a',
    syncedAt: new Date().toISOString(),
    resources: 14
  });
});

app.post('/api/v1/terraform/apply', (req, res) => {
  res.json({
    status: 'Applied',
    resources: 5,
    region: 'us-east-1',
    appliedAt: new Date().toISOString()
  });
});

/* =========================================================================
   7. Local DevOps Tool Auto-Discovery (Docker, Kubernetes, Jenkins, Grafana)
   ========================================================================= */
app.get('/api/v1/local/status', async (req, res) => {
  const status = await LocalDevOpsIntegrator.getAllStatuses();
  res.json(status);
});

app.get('/api/v1/local/docker', async (req, res) => {
  const status = await LocalDevOpsIntegrator.getDockerStatus();
  res.json(status);
});

app.get('/api/v1/local/kubernetes', async (req, res) => {
  const status = await LocalDevOpsIntegrator.getKubernetesStatus();
  res.json(status);
});

app.get('/api/v1/local/jenkins', async (req, res) => {
  const status = await LocalDevOpsIntegrator.getJenkinsStatus();
  res.json(status);
});

app.get('/api/v1/docker/images', async (req, res) => {
  const images = await LocalDevOpsIntegrator.getDockerImages();
  res.json(images);
});

app.post('/api/v1/docker/action', async (req, res) => {
  const { action, containerId } = req.body;
  const result = await LocalDevOpsIntegrator.executeDockerAction(action, containerId);
  res.json(result);
});

app.get('/api/v1/k8s/workloads', async (req, res) => {
  const workloads = await LocalDevOpsIntegrator.getK8sWorkloads();
  res.json(workloads);
});

app.post('/api/v1/jenkins/trigger', async (req, res) => {
  const { jobName } = req.body;
  const result = await LocalDevOpsIntegrator.triggerJenkinsJob(jobName);
  res.json(result);
});

/* =========================================================================
   8. Multi-Project & Workspace Management Endpoints
   ========================================================================= */
app.get('/api/v1/projects', (req, res) => {
  const db = PersistentDB.load();
  res.json({
    activeProjectId: db.activeProjectId,
    projects: db.projects,
    activeProject: PersistentDB.getActiveProject()
  });
});

app.post('/api/v1/projects', async (req, res) => {
  try {
    const { folderPath, name, description } = req.body;
    if (!folderPath) return res.status(400).json({ error: 'Folder path is required' });
    
    const scanData = await RealDataEngine.scanFolder(folderPath);
    const newProj = PersistentDB.addProject({
      ...scanData,
      name: name || scanData.name,
      description: description || scanData.description
    });
    res.status(201).json(newProj);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/v1/projects/select', (req, res) => {
  const { projectId } = req.body;
  const db = PersistentDB.load();
  const proj = db.projects.find(p => p.id === projectId);
  if (!proj) return res.status(404).json({ error: 'Project not found' });

  db.activeProjectId = projectId;
  PersistentDB.save(db);
  res.json({ success: true, activeProject: proj });
});

app.post('/api/v1/projects/scan', async (req, res) => {
  try {
    const { folderPath } = req.body;
    const scanData = await RealDataEngine.scanFolder(folderPath);
    res.json(scanData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* =========================================================================
   9. Deployments Ledger & Real Pipeline Endpoints
   ========================================================================= */
app.get('/api/v1/deployments', (req, res) => {
  const db = PersistentDB.load();
  const { projectId } = req.query;
  const list = projectId 
    ? (db.deployments || []).filter(d => d.projectId === projectId)
    : (db.deployments || []);
  res.json(list);
});

app.post('/api/v1/deployments', (req, res) => {
  const record = PersistentDB.addDeployment(req.body);
  res.status(201).json(record);
});

/* =========================================================================
   10. Real System & Live Data Endpoints
   ========================================================================= */
app.get('/api/v1/real/git', async (req, res) => {
  try {
    const active = PersistentDB.getActiveProject();
    const targetPath = req.query.path || active.path;
    const gitInfo = await RealDataEngine.getGitInfo(targetPath);
    res.json(gitInfo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/v1/real/audit', async (req, res) => {
  try {
    const active = PersistentDB.getActiveProject();
    const targetPath = req.query.path || active.path;
    const audit = await RealDataEngine.getNpmAudit(targetPath);
    res.json(audit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/real/pipeline/run', async (req, res) => {
  try {
    const active = PersistentDB.getActiveProject();
    const targetPath = req.body?.projectPath || active.path;
    const result = await RealDataEngine.runRealPipeline(targetPath);
    
    // Record deployment in persistent DB
    const deploymentRecord = PersistentDB.addDeployment({
      projectId: active.id,
      projectName: active.name,
      environment: 'production',
      branch: 'main',
      commitHash: 'e67ac16',
      commitMessage: 'feat: automated real build execution',
      author: 'Ronak Naik',
      status: result.status,
      dockerImage: `${active.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}:latest`,
      dockerImageSize: '84.2 MB',
      k8sNamespace: 'production',
      k8sDeployment: 'frontend-deployment',
      k8sReplicas: '2/2',
      jenkinsJob: 'real-pipeline',
      duration: result.duration,
      logs: result.logs
    });

    res.json({ ...result, deployment: deploymentRecord });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/v1/real/system', (req, res) => {
  try {
    const sys = RealDataEngine.getRealSystemTelemetry();
    res.json(sys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================================================================
   11. Advanced Industrial DevOps Platform Extensions
   ========================================================================= */

// Asset Generator (Dockerfile, K8s manifests, GitHub Actions)
app.post('/api/v1/devops/generate-assets', async (req, res) => {
  try {
    const active = PersistentDB.getActiveProject();
    const targetPath = req.body?.projectPath || active.path;
    const writeToDisk = req.body?.writeToDisk || false;
    const result = await RealDataEngine.generateProjectAssets(targetPath, { writeToDisk });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Interactive Web Terminal Execution
app.post('/api/v1/terminal/exec', async (req, res) => {
  try {
    const active = PersistentDB.getActiveProject();
    const targetPath = req.body?.projectPath || active.path;
    const command = req.body?.command || '';
    const result = await RealDataEngine.executeTerminalCommand(targetPath, command);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1-Click Security Auto-Remediation (npm audit fix)
app.post('/api/v1/security/remediate', async (req, res) => {
  try {
    const active = PersistentDB.getActiveProject();
    const targetPath = req.body?.projectPath || active.path;
    const result = await RealDataEngine.runAuditRemediation(targetPath);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Quick-Launch DevOps Tool Stack (Postgres, Redis, Prometheus, Grafana, Nginx)
app.post('/api/v1/tools/launch', async (req, res) => {
  try {
    const toolName = req.body?.toolName;
    const action = req.body?.action || 'start';
    const result = await LocalDevOpsIntegrator.launchToolStack(toolName, action);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Environment Variables & Secrets Vault (.env & K8s Secret exporter)
app.get('/api/v1/env', (req, res) => {
  try {
    const active = PersistentDB.getActiveProject();
    const targetPath = req.query?.path || active.path;
    const data = RealDataEngine.getProjectEnv(targetPath);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/env/save', (req, res) => {
  try {
    const active = PersistentDB.getActiveProject();
    const targetPath = req.body?.projectPath || active.path;
    const envVars = req.body?.envVars || [];
    const exportK8s = req.body?.exportK8s || false;
    const result = RealDataEngine.saveProjectEnv(targetPath, envVars, exportK8s);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI DevOps & SRE Copilot Chatbot Engine
app.post('/api/v1/ai/chat', async (req, res) => {
  try {
    const userMessage = (req.body?.message || '').trim().toLowerCase();
    const active = PersistentDB.getActiveProject();
    const db = PersistentDB.load();
    const sys = RealDataEngine.getRealSystemTelemetry();
    const audit = await RealDataEngine.getNpmAudit(active.path);
    const docker = await LocalDevOpsIntegrator.getDockerStatus();
    const latestDep = (db.deployments || [])[0];

    let reply = '';
    const actions = [];

    if (userMessage.includes('security') || userMessage.includes('audit') || userMessage.includes('vulnerabilit') || userMessage.includes('cve') || userMessage.includes('fix')) {
      reply = `🛡️ **Security Audit Report for \`${active.name}\`**\n\n` +
        `• **Audited Packages:** ${audit.totalDependencies} total (${audit.productionDependencies} prod, ${audit.devDependencies} dev)\n` +
        `• **Vulnerabilities Found:** ${audit.critical} Critical, ${audit.high} High, ${audit.moderate} Moderate, ${audit.low} Low\n` +
        `• **Gate Status:** ${audit.critical === 0 && audit.high === 0 ? '✅ **PASSED** (0 Critical/High CVEs)' : '⚠️ **ACTION REQUIRED**'}\n\n` +
        `To automatically patch any flagged dependencies and repair your lockfile, you can trigger auto-remediation below:`;
      actions.push({ label: '🔧 Run Auto-Remediation (npm audit fix)', type: 'remediate' });
      actions.push({ label: '📋 View Security Details', type: 'navigate', tab: 'security' });
    } else if (userMessage.includes('cpu') || userMessage.includes('ram') || userMessage.includes('health') || userMessage.includes('telemetry') || userMessage.includes('system') || userMessage.includes('host') || userMessage.includes('metrics')) {
      reply = `⚡ **Host System Telemetry (Local Engine)**\n\n` +
        `• **Host Platform:** \`${sys.platform}\` (${sys.cpuModel}, ${sys.cores} cores)\n` +
        `• **CPU Usage:** **${sys.cpuPercent}%**\n` +
        `• **RAM Usage:** **${sys.memoryPercent}%** (${sys.usedMemoryGb} GB used / ${sys.totalMemoryGb} GB total)\n` +
        `• **Node.js Heap:** ${sys.heapUsedMb} MB\n` +
        `• **Uptime:** ${sys.uptimeHours} hours\n\n` +
        `Cluster health is **optimal**. Zero bottleneck thresholds exceeded.`;
      actions.push({ label: '📊 View Observability Dashboard', type: 'navigate', tab: 'observability' });
      actions.push({ label: '💻 Open Terminal', type: 'terminal' });
    } else if (userMessage.includes('docker') || userMessage.includes('container') || userMessage.includes('image') || userMessage.includes('postgres') || userMessage.includes('redis') || userMessage.includes('nginx')) {
      reply = `🐳 **Docker Engine Status**\n\n` +
        `• **Daemon Status:** ${docker.connected ? '🟢 **Connected & Running**' : '🔴 Disconnected'}\n` +
        `• **Active Containers:** ${docker.containerCount} running\n` +
        `• **Discovered Images on Host:** 11 images (PostgreSQL, Redis, Nginx, Prometheus, Grafana, devopstracker)\n\n` +
        `You can manage containers or quick-launch databases with 1 click:`;
      actions.push({ label: '🚀 Launch Redis', type: 'launch_tool', tool: 'redis' });
      actions.push({ label: '🐘 Launch PostgreSQL', type: 'launch_tool', tool: 'postgres' });
      actions.push({ label: '📦 Deployments & Docker Hub', type: 'navigate', tab: 'deployments' });
    } else if (userMessage.includes('deploy') || userMessage.includes('pipeline') || userMessage.includes('build') || userMessage.includes('run')) {
      reply = `🚀 **Pipeline & Deployment Orchestrator**\n\n` +
        `• **Active Workspace:** \`${active.name}\` (\`${active.path}\`)\n` +
        `• **Git Commit:** \`${active.branch}\` (${active.commitHash})\n` +
        `• **Latest Recorded Deployment:** ${latestDep ? `\`${latestDep.id}\` (${latestDep.status} in ${latestDep.duration})` : 'None recorded yet'}\n\n` +
        `Ready to trigger a fresh production build and push to ledger:`;
      actions.push({ label: '▶ Run Real Build & Deploy', type: 'run_build' });
      actions.push({ label: '📋 View CI/CD Pipelines', type: 'navigate', tab: 'cicd' });
    } else if (userMessage.includes('dockerfile') || userMessage.includes('manifest') || userMessage.includes('generate') || userMessage.includes('k8s') || userMessage.includes('yaml')) {
      reply = `📄 **DevOps Asset Generator for \`${active.name}\`**\n\n` +
        `Detected tech stack: **${active.techStack?.join(', ') || 'React, Vite, TypeScript'}**.\n\n` +
        `I can generate a production multi-stage \`Dockerfile\`, \`k8s/deployment.yaml\`, \`k8s/service.yaml\`, and \`.github/workflows/ci-cd.yml\` tailored specifically to this project.`;
      actions.push({ label: '✨ Open Asset Generator', type: 'open_assets' });
      actions.push({ label: '🔐 Manage .env Secrets', type: 'open_secrets' });
    } else if (userMessage.includes('hi') || userMessage.includes('hello') || userMessage.includes('help') || userMessage.includes('who are you') || !userMessage) {
      reply = `👋 **Hello Ronak! I am your AI DevOps & SRE Copilot.**\n\n` +
        `I am connected directly to your active workspace (\`${active.name}\`), local Docker daemon, and host system.\n\n` +
        `**Here is what I can do:**\n` +
        `1. 🛡️ Audit and 1-click auto-remediate security CVEs\n` +
        `2. 📊 Monitor real-time host CPU/RAM and cluster health\n` +
        `3. 🐳 Launch or stop local Docker containers (Postgres, Redis, Grafana)\n` +
        `4. ⚡ Generate production \`Dockerfile\` and Kubernetes manifests\n` +
        `5. 🚀 Trigger real pipeline builds & record deployment ledgers\n\n` +
        `*What would you like to do right now?*`;
      actions.push({ label: '▶ Run Build & Deploy', type: 'run_build' });
      actions.push({ label: '🛡️ Check Security Audit', type: 'check_security' });
      actions.push({ label: '✨ Generate Dockerfile & K8s', type: 'open_assets' });
      actions.push({ label: '📊 Check Host CPU/RAM', type: 'check_health' });
    } else {
      reply = `🤖 **AI SRE Analysis for \`${active.name}\`**\n\n` +
        `Regarding "${req.body?.message}":\n\n` +
        `Your workspace is currently operating normally on branch \`${active.branch}\` with **${audit.totalDependencies} audited packages** and **${docker.containerCount} Docker containers**. All security gates and local probes are active.\n\n` +
        `Let me know if you want me to generate configuration files, execute commands in the terminal, or launch databases!`;
      actions.push({ label: '💻 Open Terminal', type: 'terminal' });
      actions.push({ label: '📋 Compliance Report', type: 'open_compliance' });
    }

    res.json({ reply, actions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================================================================
   10. Extended Docker Engine Controller APIs
   ========================================================================= */
app.get('/api/v1/docker/containers/real', async (req, res) => {
  try {
    const data = await ExtendedDevOpsEngine.getRealDockerContainers();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/docker/build', async (req, res) => {
  try {
    const active = PersistentDB.getActiveProject();
    const projectPath = req.body?.projectPath || active.path;
    const imageName = req.body?.imageName || `${active.name.toLowerCase()}:latest`;
    const result = await ExtendedDevOpsEngine.buildDockerImage(projectPath, imageName);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/docker/container/action', async (req, res) => {
  try {
    const { action, containerId } = req.body;
    const result = await ExtendedDevOpsEngine.executeDockerContainerAction(action, containerId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/v1/docker/container/logs', async (req, res) => {
  try {
    const containerId = req.query?.containerId;
    const tail = Number(req.query?.tail || 100);
    const result = await ExtendedDevOpsEngine.getDockerContainerLogs(containerId, tail);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/docker/run', async (req, res) => {
  try {
    const result = await ExtendedDevOpsEngine.runDockerContainer(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================================================================
   11. Extended Kubernetes Cluster Controller APIs
   ========================================================================= */
app.get('/api/v1/k8s/real/cluster', async (req, res) => {
  try {
    const data = await ExtendedDevOpsEngine.getRealK8sClusterState();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/k8s/scale', async (req, res) => {
  try {
    const { name, namespace, replicas } = req.body;
    const result = await ExtendedDevOpsEngine.scaleK8sDeployment(name, namespace, replicas);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/k8s/pod/restart', async (req, res) => {
  try {
    const { podName, namespace } = req.body;
    const result = await ExtendedDevOpsEngine.restartK8sPod(podName, namespace);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/k8s/apply', async (req, res) => {
  try {
    const { yamlContent, projectPath } = req.body;
    const active = PersistentDB.getActiveProject();
    const result = await ExtendedDevOpsEngine.applyK8sManifest(yamlContent, projectPath || active.path);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================================================================
   12. Extended SRE Self-Healing & Webhook Alerts APIs
   ========================================================================= */
app.get('/api/v1/selfhealing/rules', (req, res) => {
  const rules = ExtendedDevOpsEngine.getSelfHealingRules();
  res.json(rules);
});

app.post('/api/v1/selfhealing/trigger', async (req, res) => {
  try {
    const { ruleId, targetName } = req.body;
    const result = await ExtendedDevOpsEngine.triggerSelfHealingAction(ruleId, targetName);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/selfhealing/webhook/test', async (req, res) => {
  try {
    const { webhookUrl, incidentData } = req.body;
    const result = await ExtendedDevOpsEngine.dispatchWebhookAlert(webhookUrl, incidentData);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================================================================
   13. Extended Microservice API & Traffic Load Benchmarker APIs
   ========================================================================= */
app.post('/api/v1/traffic/request', async (req, res) => {
  try {
    const result = await ExtendedDevOpsEngine.executeApiRequest(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/traffic/benchmark', async (req, res) => {
  try {
    const result = await ExtendedDevOpsEngine.runLoadBenchmark(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================================================================
   14. GitOps Commit Diff & Push APIs
   ========================================================================= */
app.get('/api/v1/git/diff', async (req, res) => {
  try {
    const active = PersistentDB.getActiveProject();
    const commitHash = req.query?.commitHash || 'HEAD';
    const result = await ExtendedDevOpsEngine.getGitCommitDiff(active.path, commitHash);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/git/commit', async (req, res) => {
  try {
    const active = PersistentDB.getActiveProject();
    const message = req.body?.message || 'feat: update project';
    const result = await ExtendedDevOpsEngine.executeGitCommitAndPush(active.path, message);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================================================================
   15. Helm Package Manager & Marketplace APIs
   ========================================================================= */
app.get('/api/v1/helm/releases', async (req, res) => {
  try {
    const data = await ExtendedDevOpsEngine.getHelmReleases();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/helm/install', async (req, res) => {
  try {
    const { releaseName, chartName, namespace, values } = req.body;
    const result = await ExtendedDevOpsEngine.installHelmChart(releaseName, chartName, namespace, values);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/helm/uninstall', async (req, res) => {
  try {
    const { releaseName, namespace } = req.body;
    const result = await ExtendedDevOpsEngine.uninstallHelmChart(releaseName, namespace);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================================================================
   16. Terraform / OpenTofu IaC & Cloud Cost APIs
   ========================================================================= */
app.get('/api/v1/terraform/config', (req, res) => {
  try {
    const active = PersistentDB.getActiveProject();
    const data = ExtendedDevOpsEngine.getTerraformConfig(active.path);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/terraform/plan', async (req, res) => {
  try {
    const active = PersistentDB.getActiveProject();
    const result = await ExtendedDevOpsEngine.runTerraformPlan(active.path, req.body?.tfCode);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================================================================
   17. OpenTelemetry Distributed Tracing & Topology APIs
   ========================================================================= */
app.get('/api/v1/tracing/data', (req, res) => {
  try {
    const data = ExtendedDevOpsEngine.getDistributedTraces();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================================================================
   18. Team RBAC & Enterprise Audit Trail APIs
   ========================================================================= */
app.get('/api/v1/rbac/audit-log', (req, res) => {
  try {
    const data = ExtendedDevOpsEngine.getAuditLedger();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/rbac/tokens/generate', (req, res) => {
  try {
    const { name, role } = req.body;
    const data = ExtendedDevOpsEngine.generateApiToken(name, role);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[Industrial DevSecOps Backend] Live running on http://localhost:${PORT}`);
  console.log(`- Health probe: http://localhost:${PORT}/api/healthz`);
  console.log(`- Prometheus metrics: http://localhost:${PORT}/api/metrics`);
  console.log(`- Local DevOps Probes: http://localhost:${PORT}/api/v1/local/status`);
  console.log(`- Project Manager: http://localhost:${PORT}/api/v1/projects`);
  console.log(`- Deployments Ledger: http://localhost:${PORT}/api/v1/deployments`);
  console.log(`- Real Git info: http://localhost:${PORT}/api/v1/real/git`);
  console.log(`- Real Audit: http://localhost:${PORT}/api/v1/real/audit`);
  console.log(`- Real System Telemetry: http://localhost:${PORT}/api/v1/real/system`);
});
