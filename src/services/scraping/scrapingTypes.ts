
export interface ScrapingConfig {
  selectors: {
    [key: string]: string;
  };
  waitTime?: number;
  maxRetries?: number;
  userAgent?: string;
  proxy?: string;
  fallbackUrls?: string[];
}

export interface ScrapingResult {
  success: boolean;
  data: any[];
  error?: string;
  retriedCount: number;
  usedFallback?: boolean;
  executionTimeMs: number;
}
