import { KubernetesPod, ArgoCDAppState } from '../types/devsecops';

export const initialPods: KubernetesPod[] = [];

export const initialArgoCDApp: ArgoCDAppState = {
  name: 'projectt-production-app',
  repoURL: 'https://github.com/ronaknaik/projectt-gitops-manifests.git',
  targetRevision: 'main (commit e67ac16)',
  currentRevision: 'commit e67ac16',
  syncStatus: 'Synced',
  healthStatus: 'Healthy',
  syncPolicy: 'Automated (Prune + Self-Heal)',
  resourcesCount: 14,
  lastSyncDuration: '1.2s'
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
  name: projectt-ingress
  namespace: production
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  rules:
  - host: app.devsecops.local
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 5001
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 5173`,

  helmValues: `replicaCount: 2

image:
  repository: projectt-app
  pullPolicy: IfNotPresent
  tag: "latest"

service:
  type: ClusterIP
  port: 5001

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

