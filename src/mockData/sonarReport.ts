import { SonarQubeReportData } from '../types/devsecops';

export const initialSonarReport: SonarQubeReportData = {
  status: 'PASSED',
  bugs: 0,
  vulnerabilities: 0,
  securityHotspots: 0,
  codeSmells: 0,
  coverage: 94.2,
  duplicatedLinesPercent: 0.0,
  ratings: {
    security: 'A',
    reliability: 'A',
    maintainability: 'A',
  },
  issues: []
};

