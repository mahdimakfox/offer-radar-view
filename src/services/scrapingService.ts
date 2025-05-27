
import { ScrapingConfig, ScrapingResult } from './scraping/scrapingTypes';
import { delay } from './scraping/scrapingUtils';
import { performScrape } from './scraping/scrapingCore';
import { logScrapingAttempt } from './scraping/scrapingLogger';

// Re-export types for backward compatibility
export type { ScrapingConfig, ScrapingResult };

export const scrapingService = {
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
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Scraping attempt ${attempt + 1} for ${url}`);
        
        const result = await performScrape(url, config, category);
        
        if (result.success && result.data.length > 0) {
          await logScrapingAttempt(url, true);
          return {
            ...result,
            retriedCount: attempt,
            executionTimeMs: Date.now() - startTime
          };
        }
        
        lastError = result.error || 'No data found';
        retriedCount = attempt;
        
        // Wait before retry
        if (attempt < maxRetries) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
          await delay(waitTime);
        }
        
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Scraping attempt ${attempt + 1} failed:`, error);
        await logScrapingAttempt(url, false, lastError);
        
        if (attempt < maxRetries) {
          await delay(1000 * (attempt + 1));
        }
      }
    }

    // Try fallback URLs if main URL failed
    if (config.fallbackUrls && config.fallbackUrls.length > 0) {
      console.log(`Main URL failed, trying ${config.fallbackUrls.length} fallback URLs`);
      
      for (const fallbackUrl of config.fallbackUrls) {
        try {
          console.log(`Trying fallback URL: ${fallbackUrl}`);
          
          const result = await performScrape(fallbackUrl, config, category);
          
          if (result.success && result.data.length > 0) {
            await logScrapingAttempt(fallbackUrl, true);
            return {
              ...result,
              retriedCount,
              usedFallback: true,
              executionTimeMs: Date.now() - startTime
            };
          }
          
        } catch (error) {
          console.error(`Fallback URL ${fallbackUrl} failed:`, error);
          lastError = error instanceof Error ? error.message : 'Fallback failed';
          await logScrapingAttempt(fallbackUrl, false, lastError);
        }
      }
    }

    return {
      success: false,
      data: [],
      error: lastError,
      retriedCount,
      executionTimeMs: Date.now() - startTime
    };
  },

  performScrape,
  logScrapingAttempt
};
