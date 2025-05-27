
import { ScrapingConfig, ScrapingResult } from './scrapingTypes';
import { delay } from './scrapingUtils';
import { performScrape } from './scrapingCore';
import { logScrapingAttempt } from './scrapingLogger';

export class ScrapingExecutor {
  async executeScraping(
    url: string, 
    config: ScrapingConfig, 
    category: string
  ): Promise<ScrapingResult> {
    const startTime = Date.now();
    let retriedCount = 0;
    const maxRetries = config.maxRetries || 3;
    let lastError: string = '';

    console.log(`Starting scraping for ${url} with config:`, config);

    // Try main URL with retries
    const mainResult = await this.tryScrapingWithRetries(url, config, category, maxRetries);
    if (mainResult.success) {
      return {
        ...mainResult,
        executionTimeMs: Date.now() - startTime
      };
    }

    retriedCount = mainResult.retriedCount;
    lastError = mainResult.error || 'No data found';

    // Try fallback URLs if main URL failed
    if (config.fallbackUrls && config.fallbackUrls.length > 0) {
      const fallbackResult = await this.tryFallbackUrls(config.fallbackUrls, config, category);
      if (fallbackResult.success) {
        return {
          ...fallbackResult,
          retriedCount,
          usedFallback: true,
          executionTimeMs: Date.now() - startTime
        };
      }
      lastError = fallbackResult.error || 'Fallback failed';
    }

    return {
      success: false,
      data: [],
      error: lastError,
      retriedCount,
      executionTimeMs: Date.now() - startTime
    };
  }

  private async tryScrapingWithRetries(
    url: string, 
    config: ScrapingConfig, 
    category: string, 
    maxRetries: number
  ): Promise<ScrapingResult & { retriedCount: number }> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Scraping attempt ${attempt + 1} for ${url}`);
        
        const result = await performScrape(url, config, category);
        
        if (result.success && result.data.length > 0) {
          return {
            ...result,
            retriedCount: attempt
          };
        }
        
        // Wait before retry
        if (attempt < maxRetries) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
          await delay(waitTime);
        }
        
      } catch (error) {
        console.error(`Scraping attempt ${attempt + 1} failed:`, error);
        
        if (attempt < maxRetries) {
          await delay(1000 * (attempt + 1));
        }
      }
    }

    return {
      success: false,
      data: [],
      error: 'All retry attempts failed',
      retriedCount: maxRetries,
      executionTimeMs: 0
    };
  }

  private async tryFallbackUrls(
    fallbackUrls: string[], 
    config: ScrapingConfig, 
    category: string
  ): Promise<ScrapingResult> {
    console.log(`Main URL failed, trying ${fallbackUrls.length} fallback URLs`);
    
    for (const fallbackUrl of fallbackUrls) {
      try {
        console.log(`Trying fallback URL: ${fallbackUrl}`);
        
        const result = await performScrape(fallbackUrl, config, category);
        
        if (result.success && result.data.length > 0) {
          return result;
        }
        
      } catch (error) {
        console.error(`Fallback URL ${fallbackUrl} failed:`, error);
      }
    }

    return {
      success: false,
      data: [],
      error: 'All fallback URLs failed',
      retriedCount: 0,
      executionTimeMs: 0
    };
  }
}
