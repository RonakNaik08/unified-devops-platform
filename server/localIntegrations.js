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
}
