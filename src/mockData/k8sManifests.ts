import { KubernetesPod, ArgoCDAppState } from '../types/devsecops';

export const initialPods: KubernetesPod[] = [
  {
    id: 'pod-fe-1',
    name: 'frontend-deployment-78f9d658b-k2x9l',
    tier: 'frontend',
    version: 'v1.2.0',
    status: 'Running',
    ready: '1/1',
    restarts: 0,
    cpu: '18m',
    memory: '42Mi',
    node: 'ip-10-0-10-42.ec2.internal',
    ip: '10.0.10.114',
    age: '4h 12m',
    logs: [
      '[2026-09-11 16:10:01] INFO: React Vite client static server listening on port 80',
      '[2026-09-11 16:10:05] INFO: Healthcheck probe /healthz returned 200 OK',
      '[2026-09-11 16:12:30] INFO: Static bundle requested: /assets/index-D8xL3a.js (200)',
      '[2026-09-11 16:14:12] INFO: Ingress routing proxy request -> backend.production.svc.cluster.local:5000'
    ]
  },
  {
    id: 'pod-fe-2',
    name: 'frontend-deployment-78f9d658b-9pqw1',
    tier: 'frontend',
    version: 'v1.2.0',
    status: 'Running',
    ready: '1/1',
    restarts: 0,
    cpu: '15m',
    memory: '39Mi',
    node: 'ip-10-0-20-88.ec2.internal',
    ip: '10.0.20.91',
    age: '4h 12m',
    logs: [
      '[2026-09-11 16:10:02] INFO: React Vite client static server listening on port 80',
      '[2026-09-11 16:10:06] INFO: Healthcheck probe /healthz returned 200 OK',
      '[2026-09-11 16:13:45] INFO: Proxying API call to /api/v1/metrics'
    ]
  },
  {
    id: 'pod-be-1',
    name: 'backend-deployment-64d4b9bc6-8fzt2',
    tier: 'backend',
    version: 'v1.2.0',
    status: 'Running',
    ready: '1/1',
    restarts: 0,
    cpu: '84m',
    memory: '148Mi',
    node: 'ip-10-0-10-42.ec2.internal',
    ip: '10.0.10.204',
    age: '4h 10m',
    logs: [
      '[2026-09-11 16:10:04] INFO: Node.js Express microservice started on :5000',
      '[2026-09-11 16:10:05] INFO: OpenTelemetry tracer connected to collector:4318 (gRPC)',
      '[2026-09-11 16:10:06] INFO: Connected to PostgreSQL pool (postgres.production.svc.cluster.local:5432)',
      '[2026-09-11 16:11:00] INFO: Vault Secret synced successfully via AWS Secrets CSI driver',
      '[2026-09-11 16:14:20] INFO: GET /api/v1/orders - 200 OK (duration: 14.2ms)'
    ]
  },
  {
    id: 'pod-be-2',
    name: 'backend-deployment-64d4b9bc6-x7lm9',
    tier: 'backend',
    version: 'v1.2.0',
    status: 'Running',
    ready: '1/1',
    restarts: 0,
    cpu: '76m',
    memory: '142Mi',
    node: 'ip-10-0-20-88.ec2.internal',
    ip: '10.0.20.145',
    age: '4h 10m',
    logs: [
      '[2026-09-11 16:10:04] INFO: Node.js Express microservice started on :5000',
      '[2026-09-11 16:10:05] INFO: OpenTelemetry tracer connected to collector:4318',
      '[2026-09-11 16:14:22] INFO: POST /api/v1/auth/verify - 200 OK (duration: 21.0ms)'
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
      '[2026-09-09 02:00:00] LOG: PostgreSQL database server initialized on port 5432',
      '[2026-09-09 02:00:01] LOG: Attached AWS EBS gp3 persistent volume claim (pvc-db-volume-100Gi)',
      '[2026-09-11 16:14:20] LOG: Query execute: SELECT * FROM platform_metrics LIMIT 100',
      '[2026-09-11 16:14:20] LOG: Transaction committed in 2.1ms'
    ]
  }
];

export const initialArgoCDApp: ArgoCDAppState = {
  name: 'devsecops-production-app',
  repoURL: 'https://github.com/cloud-native/devsecops-gitops-manifests.git',
  targetRevision: 'main (commit 7e8910a)',
  currentRevision: 'commit 7e8910a',
  syncStatus: 'Synced',
  healthStatus: 'Healthy',
  syncPolicy: 'Automated (Prune + Self-Heal)',
  resourcesCount: 14,
  lastSyncDuration: '1.4s'
};

export const sampleManifests = {
  hpa: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80`,

  ingress: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: devsecops-ingress
  namespace: production
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/canary: "false"
spec:
  rules:
  - host: app.devsecops.cloud
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 5000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80`,

  helmValues: `replicaCount: 2

image:
  repository: 123456789.dkr.ecr.us-east-1.amazonaws.com/devsecops-app
  pullPolicy: IfNotPresent
  tag: "v1.2.0"

service:
  type: ClusterIP
  port: 5000

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

securityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  runAsNonRoot: true
  runAsUser: 10001
  capabilities:
    drop:
    - ALL`
};
