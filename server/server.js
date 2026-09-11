import express from 'express';
import cors from 'cors';
import { PersistentDB } from './db.js';
import { SecurityScanner } from './scanners.js';
import { telemetry } from './telemetry.js';
import { LocalDevOpsIntegrator } from './localIntegrations.js';

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

app.listen(PORT, () => {
  console.log(`[Industrial DevSecOps Backend] Live running on http://localhost:${PORT}`);
  console.log(`- Health probe: http://localhost:${PORT}/api/healthz`);
  console.log(`- Prometheus metrics: http://localhost:${PORT}/api/metrics`);
  console.log(`- Local DevOps Probes: http://localhost:${PORT}/api/v1/local/status`);
});
