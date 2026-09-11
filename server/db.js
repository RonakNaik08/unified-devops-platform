import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data_store.json');
const ROOT_DIR = path.resolve(__dirname, '..');

// Default initial state for persistent database
const defaultState = {
  activeProjectId: 'project-projectt',
  projects: [
    {
      id: 'project-projectt',
      name: 'Projectt (DevSecOps Platform)',
      path: ROOT_DIR,
      type: 'Full-Stack Cloud-Native',
      description: 'Automated DevSecOps Platform with CI/CD, Kubernetes, Docker, and Self-Healing',
      branch: 'main',
      commitHash: 'e67ac16',
      author: 'Ronak Naik',
      techStack: ['React 19', 'TypeScript', 'Node.js Express', 'Vite', 'Tailwind CSS'],
      dockerfilePresent: true,
      k8sManifestsPresent: true,
      jenkinsfilePresent: true,
      lastScanned: new Date().toISOString()
    }
  ],
  deployments: [
    {
      id: 'DEP-1001',
      projectId: 'project-projectt',
      projectName: 'Projectt (DevSecOps Platform)',
      environment: 'production',
      branch: 'main',
      commitHash: 'e67ac16',
      commitMessage: 'feat(devsecops): initial production release v1.0.0',
      author: 'Ronak Naik',
      status: 'SUCCESS',
      dockerImage: 'projectt-app:v1.0.0',
      dockerImageSize: '84.2 MB',
      k8sNamespace: 'production',
      k8sDeployment: 'frontend-deployment',
      k8sReplicas: '2/2',
      jenkinsJob: 'projectt-main-pipeline',
      jenkinsBuildNumber: 492,
      duration: '2.06s',
      logs: [
        `[${new Date().toLocaleTimeString()}] Pipeline triggered: Starting real local build & scan...`,
        `[${new Date().toLocaleTimeString()}] Step 1: Checking TypeScript compliance (tsc -b)...`,
        `[${new Date().toLocaleTimeString()}] Step 2: Vite bundled production assets cleanly (2,462 modules).`,
        `[${new Date().toLocaleTimeString()}] Step 3: Docker image tagged projectt-app:v1.0.0`,
        `[${new Date().toLocaleTimeString()}] Step 4: Kubernetes manifests synced via Argo CD (SHA e67ac16)`,
        `[${new Date().toLocaleTimeString()}] Deployment SUCCESS in 2.06s. 0 errors.`
      ],
      timestamp: new Date().toISOString()
    }
  ],
  appVersion: 'v1.0.0',
  canarySplit: 0,
  trafficRps: 240,
  pods: [
    {
      id: 'pod-fe-1',
      name: 'frontend-deployment-78f9d658b-k2x9l',
      tier: 'frontend',
      version: 'v1.0.0',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      cpu: '18m',
      memory: '42Mi',
      node: 'ip-10-0-10-42.ec2.internal',
      ip: '10.0.10.114',
      age: '4h 12m',
      logs: [
        '[INFO] React Vite client static server listening on port 80',
        '[INFO] Healthcheck probe /healthz returned 200 OK',
        '[INFO] Ingress proxy request -> backend.production.svc.cluster.local:5000'
      ]
    },
    {
      id: 'pod-fe-2',
      name: 'frontend-deployment-78f9d658b-9pqw1',
      tier: 'frontend',
      version: 'v1.0.0',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      cpu: '15m',
      memory: '39Mi',
      node: 'ip-10-0-20-88.ec2.internal',
      ip: '10.0.20.91',
      age: '4h 12m',
      logs: [
        '[INFO] React Vite client static server listening on port 80',
        '[INFO] Healthcheck probe /healthz returned 200 OK'
      ]
    },
    {
      id: 'pod-be-1',
      name: 'backend-deployment-64d4b9bc6-8fzt2',
      tier: 'backend',
      version: 'v1.0.0',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      cpu: '84m',
      memory: '148Mi',
      node: 'ip-10-0-10-42.ec2.internal',
      ip: '10.0.10.204',
      age: '4h 10m',
      logs: [
        '[INFO] Node.js Express microservice started on :5000',
        '[INFO] OpenTelemetry tracer connected to collector:4318 (gRPC)',
        '[INFO] Connected to PostgreSQL pool (postgres.production.svc.cluster.local:5432)',
        '[INFO] GET /api/v1/orders - 200 OK (duration: 14.2ms)'
      ]
    },
    {
      id: 'pod-be-2',
      name: 'backend-deployment-64d4b9bc6-x7lm9',
      tier: 'backend',
      version: 'v1.0.0',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      cpu: '76m',
      memory: '142Mi',
      node: 'ip-10-0-20-88.ec2.internal',
      ip: '10.0.20.145',
      age: '4h 10m',
      logs: [
        '[INFO] Node.js Express microservice started on :5000',
        '[INFO] OpenTelemetry tracer connected to collector:4318',
        '[INFO] POST /api/v1/auth/verify - 200 OK (duration: 21.0ms)'
      ]
    },
    {
      id: 'pod-db-0',
      name: 'postgres-statefulset-0',
      tier: 'database',
      version: 'v16.3',
      status: 'Running',
      ready: '1/1',
      restarts: 0,
      cpu: '120m',
      memory: '380Mi',
      node: 'ip-10-0-10-42.ec2.internal',
      ip: '10.0.10.19',
      age: '2d 14h',
      logs: [
        '[LOG] PostgreSQL database server initialized on port 5432',
        '[LOG] Attached AWS EBS gp3 persistent volume claim (pvc-db-volume-100Gi)',
        '[LOG] Transaction committed in 2.1ms'
      ]
    }
  ],
  vulnerabilities: [
    {
      id: 'vuln-1',
      cve: 'CVE-2024-38063',
      severity: 'CRITICAL',
      package: 'libxml2',
      installedVersion: '2.9.13-r0',
      fixedVersion: '2.9.14-r0',
      title: 'Remote Code Execution via integer overflow in XML parsing',
      description: 'A heap buffer overflow vulnerability exists in libxml2 through crafted XML entities.',
      cvss: 9.8,
      remediationPath: 'Upgrade base image to alpine:3.20.2 or run apk upgrade libxml2 in Dockerfile',
      patched: false
    }
  ],
  orders: [
    { id: 'ORD-9842', item: 'AWS EKS Managed Node Group Provisioning', amount: '$120.00', status: 'Completed', version: 'v1.0.0', latency: '24ms', createdAt: new Date().toISOString() },
    { id: 'ORD-9843', item: 'Trivy Security Scanning License Tier', amount: '$49.00', status: 'Completed', version: 'v1.0.0', latency: '31ms', createdAt: new Date().toISOString() },
    { id: 'ORD-9844', item: 'ArgoCD Enterprise Pipeline Runner', amount: '$280.00', status: 'Completed', version: 'v1.0.0', latency: '19ms', createdAt: new Date().toISOString() }
  ],
  alerts: []
};

export class PersistentDB {
  static load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.projects || parsed.projects.length === 0) {
          parsed.projects = defaultState.projects;
        }
        if (!parsed.activeProjectId) {
          parsed.activeProjectId = defaultState.activeProjectId;
        }
        if (!parsed.deployments) {
          parsed.deployments = defaultState.deployments;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error reading DB_FILE, fallback to default:', e);
    }
    PersistentDB.save(defaultState);
    return defaultState;
  }

  static save(data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing DB_FILE:', e);
    }
  }

  static get(key) {
    const data = PersistentDB.load();
    return data[key];
  }

  static update(key, value) {
    const data = PersistentDB.load();
    data[key] = value;
    PersistentDB.save(data);
    return data[key];
  }

  static getActiveProject() {
    const db = PersistentDB.load();
    const active = db.projects.find(p => p.id === db.activeProjectId);
    return active || db.projects[0] || defaultState.projects[0];
  }

  static addProject(projectData) {
    const db = PersistentDB.load();
    const id = 'project-' + (projectData.name.toLowerCase().replace(/[^a-z0-9]/g, '-') || Date.now());
    const newProj = {
      id,
      name: projectData.name || 'Unnamed Project',
      path: projectData.path,
      type: projectData.type || 'Web Application',
      description: projectData.description || 'Local workspace folder',
      branch: 'main',
      commitHash: 'e67ac16',
      author: 'Ronak Naik',
      techStack: projectData.techStack || ['Node.js', 'JavaScript'],
      dockerfilePresent: fs.existsSync(path.join(projectData.path, 'Dockerfile')),
      k8sManifestsPresent: fs.existsSync(path.join(projectData.path, 'k8s')) || fs.existsSync(path.join(projectData.path, 'manifests')),
      jenkinsfilePresent: fs.existsSync(path.join(projectData.path, 'Jenkinsfile')),
      lastScanned: new Date().toISOString()
    };
    db.projects.push(newProj);
    db.activeProjectId = id;
    PersistentDB.save(db);
    return newProj;
  }

  static addDeployment(depData) {
    const db = PersistentDB.load();
    const active = PersistentDB.getActiveProject();
    const id = 'DEP-' + (1000 + (db.deployments?.length || 0) + 1);
    const record = {
      id,
      projectId: depData.projectId || active.id,
      projectName: depData.projectName || active.name,
      environment: depData.environment || 'production',
      branch: depData.branch || 'main',
      commitHash: depData.commitHash || 'e67ac16',
      commitMessage: depData.commitMessage || 'Automated CI/CD build release',
      author: depData.author || 'Ronak Naik',
      status: depData.status || 'SUCCESS',
      dockerImage: depData.dockerImage || `${active.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}:latest`,
      dockerImageSize: depData.dockerImageSize || '84.2 MB',
      k8sNamespace: depData.k8sNamespace || 'production',
      k8sDeployment: depData.k8sDeployment || 'frontend-deployment',
      k8sReplicas: depData.k8sReplicas || '2/2',
      jenkinsJob: depData.jenkinsJob || 'local-pipeline',
      jenkinsBuildNumber: depData.jenkinsBuildNumber || (db.deployments?.length || 0) + 1,
      duration: depData.duration || '2.1s',
      logs: depData.logs || [],
      timestamp: new Date().toISOString()
    };
    db.deployments = db.deployments || [];
    db.deployments.unshift(record);
    PersistentDB.save(db);
    return record;
  }

  static reset() {
    PersistentDB.save(defaultState);
    return defaultState;
  }
}

