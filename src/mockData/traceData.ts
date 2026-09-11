import { TraceSpan } from '../types/devsecops';

export const initialTraces: TraceSpan[] = [
  {
    id: 'span-root-1',
    traceId: 'tr-8f4b912c478a2d',
    service: 'ingress-nginx',
    operation: 'GET /api/v1/deployments/status',
    durationMs: 46.4,
    statusCode: 200,
    status: 'OK',
    startTimeOffsetMs: 0,
    tags: {
      'http.method': 'GET',
      'http.status_code': '200',
      'http.client_ip': '172.56.21.9',
      'k8s.pod.name': 'ingress-nginx-controller-7f8d-q1',
    },
    children: [
      {
        id: 'span-be-auth',
        traceId: 'tr-8f4b912c478a2d',
        service: 'backend-service',
        operation: 'middleware: verifyTokenJwt',
        durationMs: 4.8,
        statusCode: 200,
        status: 'OK',
        startTimeOffsetMs: 2.1,
        tags: {
          'auth.type': 'Bearer JWT',
          'auth.user_id': 'usr_devsecops_lead',
        }
      },
      {
        id: 'span-be-core',
        traceId: 'tr-8f4b912c478a2d',
        service: 'backend-service',
        operation: 'controller: getDeploymentTelemetry',
        durationMs: 35.2,
        statusCode: 200,
        status: 'OK',
        startTimeOffsetMs: 7.2,
        tags: {
          'k8s.namespace': 'production',
          'app.version': 'v1.2.0',
        },
        children: [
          {
            id: 'span-db-query',
            traceId: 'tr-8f4b912c478a2d',
            service: 'postgres-database',
            operation: 'pg.query: SELECT pods, metrics FROM telemetry_history WHERE cluster_id = $1',
            durationMs: 14.6,
            statusCode: 200,
            status: 'OK',
            startTimeOffsetMs: 12.0,
            tags: {
              'db.system': 'postgresql',
              'db.name': 'devsecops_metrics',
              'db.statement': 'SELECT * FROM telemetry_history LIMIT 50',
            }
          },
          {
            id: 'span-prom-fetch',
            traceId: 'tr-8f4b912c478a2d',
            service: 'prometheus-scraper',
            operation: 'http.client: query_range?query=rate(container_cpu_usage_seconds_total[5m])',
            durationMs: 12.8,
            statusCode: 200,
            status: 'OK',
            startTimeOffsetMs: 27.5,
            tags: {
              'http.url': 'http://prometheus-k8s.monitoring.svc:9090',
              'metrics.count': '42',
            }
          }
        ]
      }
    ]
  },
  {
    id: 'span-root-2',
    traceId: 'tr-3e198bba491f0c',
    service: 'ingress-nginx',
    operation: 'POST /api/v1/auth/exchange',
    durationMs: 18.2,
    statusCode: 200,
    status: 'OK',
    startTimeOffsetMs: 0,
    tags: {
      'http.method': 'POST',
      'http.status_code': '200',
    },
    children: [
      {
        id: 'span-vault-token',
        traceId: 'tr-3e198bba491f0c',
        service: 'backend-service',
        operation: 'vault: readSecretKeyPair',
        durationMs: 11.4,
        statusCode: 200,
        status: 'OK',
        startTimeOffsetMs: 2.3,
        tags: {
          'vault.path': 'secret/data/production/jwt-keys',
          'cache.hit': 'true',
        }
      }
    ]
  }
];
