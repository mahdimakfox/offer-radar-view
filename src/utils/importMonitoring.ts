
export interface ImportMetrics {
  totalImports: number;
  successfulImports: number;
  failedImports: number;
  successRate: number;
  lastImportTime: string | null;
  errorPatterns: Record<string, number>;
}

export interface AlertConfig {
  successRateThreshold: number; // Alert if success rate falls below this
  consecutiveFailuresThreshold: number; // Alert after this many consecutive failures
  enabled: boolean;
}

export const calculateImportMetrics = (logs: any[]): ImportMetrics => {
  if (logs.length === 0) {
    return {
      totalImports: 0,
      successfulImports: 0,
      failedImports: 0,
      successRate: 0,
      lastImportTime: null,
      errorPatterns: {}
    };
  }

  const totalImports = logs.length;
  const successfulImports = logs.filter(log => log.import_status === 'completed').length;
  const failedImports = totalImports - successfulImports;
  const successRate = totalImports > 0 ? (successfulImports / totalImports) * 100 : 0;
  const lastImportTime = logs[0]?.created_at || null;

  // Analyze error patterns
  const errorPatterns: Record<string, number> = {};
  logs.forEach(log => {
    if (log.import_status === 'failed' && log.error_details?.errors) {
      log.error_details.errors.forEach((error: string) => {
        // Extract error type (first part before colon)
        const errorType = error.split(':')[0] || 'Unknown Error';
        errorPatterns[errorType] = (errorPatterns[errorType] || 0) + 1;
      });
    }
  });

  return {
    totalImports,
    successfulImports,
    failedImports,
    successRate,
    lastImportTime,
    errorPatterns
  };
};

export const checkImportHealth = (metrics: ImportMetrics, config: AlertConfig): string[] => {
  const alerts: string[] = [];

  if (!config.enabled) {
    return alerts;
  }

  // Check success rate
  if (metrics.totalImports > 0 && metrics.successRate < config.successRateThreshold) {
    alerts.push(`Import success rate (${metrics.successRate.toFixed(1)}%) is below threshold (${config.successRateThreshold}%)`);
  }

  // Check for patterns in errors
  const mostCommonError = Object.entries(metrics.errorPatterns)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (mostCommonError && mostCommonError[1] >= 3) {
    alerts.push(`Recurring error detected: "${mostCommonError[0]}" (${mostCommonError[1]} occurrences)`);
  }

  return alerts;
};

export const generateImportReport = (metrics: ImportMetrics): string => {
  const report = `
Import Health Report
===================
Total Imports: ${metrics.totalImports}
Successful: ${metrics.successfulImports}
Failed: ${metrics.failedImports}
Success Rate: ${metrics.successRate.toFixed(1)}%
Last Import: ${metrics.lastImportTime ? new Date(metrics.lastImportTime).toLocaleString() : 'Never'}

${Object.keys(metrics.errorPatterns).length > 0 ? 
  `Common Errors:\n${Object.entries(metrics.errorPatterns)
    .map(([error, count]) => `- ${error}: ${count} times`)
    .join('\n')}` : 
  'No errors detected'}
`;

  return report.trim();
};
