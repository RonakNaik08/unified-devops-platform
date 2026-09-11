import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export class LocalDevOpsIntegrator {
  // 1. Probe Local Docker Daemon
  static async getDockerStatus() {
    try {
      const { stdout } = await execPromise('docker ps --format "{{json .}}"', { timeout: 3000 });
      const lines = stdout.trim().split('\n').filter(Boolean);
      const containers = lines.map(line => {
        try {
          const parsed = JSON.parse(line);
          return {
            id: parsed.ID,
            image: parsed.Image,
            command: parsed.Command,
            createdAt: parsed.CreatedAt,
            status: parsed.Status,
            ports: parsed.Ports,
            names: parsed.Names
          };
        } catch {
          return null;
        }
      }).filter(Boolean);

      return {
        installed: true,
        connected: true,
        containerCount: containers.length,
        containers,
        lastChecked: new Date().toISOString()
      };
    } catch (e) {
      return {
        installed: true,
        connected: false,
        containerCount: 0,
        containers: [],
        message: 'Docker daemon is not running (start Docker Desktop)',
        lastChecked: new Date().toISOString()
      };
    }
  }

  // 2. Probe Local Kubernetes Cluster (kubectl)
  static async getKubernetesStatus() {
    try {
      const contextRes = await execPromise('kubectl config current-context', { timeout: 3000 });
      const currentContext = contextRes.stdout.trim();

      const nodesRes = await execPromise('kubectl get nodes -o json', { timeout: 4000 });
      const nodesData = JSON.parse(nodesRes.stdout);
      const nodes = (nodesData.items || []).map(n => ({
        name: n.metadata?.name,
        status: n.status?.conditions?.find(c => c.type === 'Ready')?.status === 'True' ? 'Ready' : 'NotReady',
        kubeletVersion: n.status?.nodeInfo?.kubeletVersion,
        osImage: n.status?.nodeInfo?.osImage,
        roles: Object.keys(n.metadata?.labels || {}).filter(k => k.includes('node-role.kubernetes.io/')).map(k => k.split('/')[1]).join(', ') || 'worker'
      }));

      const podsRes = await execPromise('kubectl get pods --all-namespaces -o json', { timeout: 5000 });
      const podsData = JSON.parse(podsRes.stdout);
      const livePods = (podsData.items || []).map(p => ({
        namespace: p.metadata?.namespace,
        name: p.metadata?.name,
        status: p.status?.phase,
        ready: `${(p.status?.containerStatuses || []).filter(c => c.ready).length}/${(p.spec?.containers || []).length}`,
        restarts: (p.status?.containerStatuses || []).reduce((acc, c) => acc + (c.restartCount || 0), 0),
        ip: p.status?.podIP || 'Pending',
        node: p.spec?.nodeName || 'Pending',
        age: p.metadata?.creationTimestamp
      }));

      return {
        installed: true,
        connected: true,
        currentContext,
        nodeCount: nodes.length,
        podCount: livePods.length,
        nodes,
        pods: livePods,
        lastChecked: new Date().toISOString()
      };
    } catch (e) {
      return {
        installed: true,
        connected: false,
        currentContext: 'None',
        nodeCount: 0,
        podCount: 0,
        nodes: [],
        pods: [],
        message: 'No active Kubernetes context reachable (start minikube, kind, or Docker Desktop K8s)',
        lastChecked: new Date().toISOString()
      };
    }
  }

  // 3. Probe Local Jenkins Server (default http://localhost:8080)
  static async getJenkinsStatus(jenkinsUrl = 'http://localhost:8080') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${jenkinsUrl}/api/json`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return {
          connected: true,
          url: jenkinsUrl,
          version: res.headers.get('x-jenkins') || '2.x',
          mode: data.mode,
          jobs: (data.jobs || []).map(j => ({
            name: j.name,
            url: j.url,
            color: j.color
          })),
          lastChecked: new Date().toISOString()
        };
      }
    } catch {}

    return {
      connected: false,
      url: jenkinsUrl,
      jobs: [],
      message: `Jenkins server unreachable at ${jenkinsUrl}`,
      lastChecked: new Date().toISOString()
    };
  }

  // 4. Probe Local Grafana & Prometheus (defaults: :3000 & :9090)
  static async getObservabilityStatus(grafanaUrl = 'http://localhost:3000', prometheusUrl = 'http://localhost:9090') {
    let grafanaConnected = false;
    let prometheusConnected = false;

    try {
      const gCtrl = new AbortController();
      const gTimeout = setTimeout(() => gCtrl.abort(), 1500);
      const gRes = await fetch(`${grafanaUrl}/api/health`, { signal: gCtrl.signal });
      clearTimeout(gTimeout);
      if (gRes.ok) grafanaConnected = true;
    } catch {}

    try {
      const pCtrl = new AbortController();
      const pTimeout = setTimeout(() => pCtrl.abort(), 1500);
      const pRes = await fetch(`${prometheusUrl}/-/healthy`, { signal: pCtrl.signal });
      clearTimeout(pTimeout);
      if (pRes.ok) prometheusConnected = true;
    } catch {}

    return {
      grafana: {
        connected: grafanaConnected,
        url: grafanaUrl,
        message: grafanaConnected ? 'Grafana Active' : `Standby (probe ${grafanaUrl})`
      },
      prometheus: {
        connected: prometheusConnected,
        url: prometheusUrl,
        message: prometheusConnected ? 'Prometheus Scraper Active' : `Standby (probe ${prometheusUrl})`
      },
      lastChecked: new Date().toISOString()
    };
  }

  // Aggregate all local statuses
  static async getAllStatuses() {
    const [docker, k8s, jenkins, obs] = await Promise.all([
      LocalDevOpsIntegrator.getDockerStatus(),
      LocalDevOpsIntegrator.getKubernetesStatus(),
      LocalDevOpsIntegrator.getJenkinsStatus(),
      LocalDevOpsIntegrator.getObservabilityStatus()
    ]);

    return {
      docker,
      kubernetes: k8s,
      jenkins,
      observability: obs,
      timestamp: new Date().toISOString()
    };
  }

  // 5. Fetch Docker Images list
  static async getDockerImages() {
    try {
      const { stdout } = await execPromise('docker images --format "{{json .}}"', { timeout: 3000 });
      const lines = stdout.trim().split('\n').filter(Boolean);
      const images = lines.map(line => {
        try {
          const parsed = JSON.parse(line);
          return {
            repository: parsed.Repository,
            tag: parsed.Tag,
            id: parsed.ID,
            createdSince: parsed.CreatedSince,
            size: parsed.Size
          };
        } catch { return null; }
      }).filter(Boolean);

      return { connected: true, imageCount: images.length, images };
    } catch {
      return { connected: false, imageCount: 0, images: [] };
    }
  }

  // 6. Execute Docker Action (start, stop, restart)
  static async executeDockerAction(action, containerId) {
    if (!['start', 'stop', 'restart'].includes(action)) {
      throw new Error(`Unsupported action: ${action}`);
    }
    try {
      const { stdout } = await execPromise(`docker ${action} ${containerId}`, { timeout: 5000 });
      return { success: true, action, containerId, output: stdout.trim() };
    } catch (e) {
      return { success: false, action, containerId, error: e.message };
    }
  }

  // 7. Fetch Kubernetes Cluster Workloads (Pods, Deployments, Services, Events)
  static async getK8sWorkloads() {
    try {
      const [deployRes, svcRes, eventsRes] = await Promise.allSettled([
        execPromise('kubectl get deployments --all-namespaces -o json', { timeout: 4000 }),
        execPromise('kubectl get services --all-namespaces -o json', { timeout: 4000 }),
        execPromise('kubectl get events --all-namespaces --sort-by=.metadata.creationTimestamp -o json', { timeout: 4000 })
      ]);

      const deployments = deployRes.status === 'fulfilled' ? (JSON.parse(deployRes.value.stdout).items || []).map(d => ({
        namespace: d.metadata?.namespace,
        name: d.metadata?.name,
        replicas: `${d.status?.readyReplicas || 0}/${d.spec?.replicas || 0}`,
        upToDate: d.status?.updatedReplicas || 0,
        available: d.status?.availableReplicas || 0,
        age: d.metadata?.creationTimestamp
      })) : [];

      const services = svcRes.status === 'fulfilled' ? (JSON.parse(svcRes.value.stdout).items || []).map(s => ({
        namespace: s.metadata?.namespace,
        name: s.metadata?.name,
        type: s.spec?.type,
        clusterIP: s.spec?.clusterIP,
        ports: (s.spec?.ports || []).map(p => `${p.port}:${p.targetPort}/${p.protocol}`).join(', ')
      })) : [];

      const events = eventsRes.status === 'fulfilled' ? (JSON.parse(eventsRes.value.stdout).items || []).slice(-15).map(e => ({
        type: e.type,
        reason: e.reason,
        message: e.message,
        object: `${e.involvedObject?.kind}/${e.involvedObject?.name}`,
        timestamp: e.lastTimestamp || e.metadata?.creationTimestamp
      })) : [];

      return {
        connected: true,
        deployments,
        services,
        events
      };
    } catch {
      return {
        connected: false,
        deployments: [],
        services: [],
        events: []
      };
    }
  }

  // 8. Trigger Jenkins Job Build
  static async triggerJenkinsJob(jobName, jenkinsUrl = 'http://localhost:8080') {
    try {
      const res = await fetch(`${jenkinsUrl}/job/${jobName}/build`, { method: 'POST' });
      return { success: res.ok, status: res.status, jobName };
    } catch (e) {
      return { success: false, error: e.message, jobName };
    }
  }

  // 9. Quick-Launch DevOps Tool Stack Containers
  static async launchToolStack(toolName, action = 'start') {
    const toolsMap = {
      redis: { image: 'redis:7-alpine', name: 'devopshub-redis', port: '6379:6379', runCmd: 'docker run -d --name devopshub-redis -p 6379:6379 redis:7-alpine' },
      postgres: { image: 'postgres:16-alpine', name: 'devopshub-postgres', port: '5432:5432', runCmd: 'docker run -d --name devopshub-postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16-alpine' },
      prometheus: { image: 'prom/prometheus:v2.52.0', name: 'devopshub-prometheus', port: '9090:9090', runCmd: 'docker run -d --name devopshub-prometheus -p 9090:9090 prom/prometheus:v2.52.0' },
      grafana: { image: 'grafana/grafana:10.4.2', name: 'devopshub-grafana', port: '3000:3000', runCmd: 'docker run -d --name devopshub-grafana -p 3000:3000 grafana/grafana:10.4.2' },
      nginx: { image: 'nginx:alpine', name: 'devopshub-nginx', port: '8088:80', runCmd: 'docker run -d --name devopshub-nginx -p 8088:80 nginx:alpine' }
    };

    const tool = toolsMap[toolName.toLowerCase()];
    if (!tool) {
      return { success: false, error: `Unknown tool: ${toolName}. Available: ${Object.keys(toolsMap).join(', ')}` };
    }

    try {
      if (action === 'stop') {
        const { stdout } = await execPromise(`docker stop ${tool.name}`, { timeout: 8000 });
        return { success: true, toolName, action: 'stop', container: tool.name, output: stdout.trim() };
      }

      if (action === 'restart') {
        const { stdout } = await execPromise(`docker restart ${tool.name}`, { timeout: 8000 });
        return { success: true, toolName, action: 'restart', container: tool.name, output: stdout.trim() };
      }

      // Start or Launch
      // Check if container already exists
      const { stdout: psAll } = await execPromise(`docker ps -a --filter "name=^/${tool.name}$" --format "{{.ID}} {{.Status}}"`, { timeout: 3000 });
      if (psAll.trim()) {
        const [containerId] = psAll.trim().split(' ');
        const { stdout } = await execPromise(`docker start ${containerId}`, { timeout: 5000 });
        return { success: true, toolName, action: 'start', containerId, output: stdout.trim(), port: tool.port };
      }

      // Otherwise run new container
      const { stdout } = await execPromise(tool.runCmd, { timeout: 10000 });
      return { success: true, toolName, action: 'created', containerId: stdout.trim(), port: tool.port };
    } catch (err) {
      return { success: false, toolName, action, error: err.message };
    }
  }
}
