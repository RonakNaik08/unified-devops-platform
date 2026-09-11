import { SonarQubeReportData } from '../types/devsecops';

export const initialSonarReport: SonarQubeReportData = {
  status: 'PASSED',
  bugs: 0,
  vulnerabilities: 0,
  securityHotspots: 1,
  codeSmells: 3,
  coverage: 92.4,
  duplicatedLinesPercent: 0.8,
  ratings: {
    security: 'A',
    reliability: 'A',
    maintainability: 'A',
  },
  issues: [
    {
      id: 'SONAR-101',
      type: 'SECURITY_HOTSPOT',
      severity: 'MAJOR',
      message: 'Make sure that using CORS with Access-Control-Allow-Origin: * is safe here.',
      file: 'src/server/middleware/cors.ts',
      line: 14,
    },
    {
      id: 'SONAR-102',
      type: 'CODE_SMELL',
      severity: 'MINOR',
      message: 'Remove this useless assignment to local variable "cachedToken".',
      file: 'src/server/auth/jwt.ts',
      line: 42,
    },
    {
      id: 'SONAR-103',
      type: 'CODE_SMELL',
      severity: 'INFO',
      message: 'Consider using optional chaining operator ?. here.',
      file: 'src/client/components/Dashboard.tsx',
      line: 88,
    }
  ]
};
