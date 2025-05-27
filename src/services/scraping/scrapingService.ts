
import { ScrapingConfig, ScrapingResult } from './scrapingTypes';
import { ScrapingExecutor } from './scrapingExecutor';
import { performScrape } from './scrapingCore';
import { logScrapingAttempt } from './scrapingLogger';

// Re-export types for backward compatibility
export type { ScrapingConfig, ScrapingResult };

const scrapingExecutor = new ScrapingExecutor();

export const scrapingService = {
  async executeScraping(
    url: string, 
    config: ScrapingConfig, 
    category: string
  ): Promise<ScrapingResult> {
    return scrapingExecutor.executeScraping(url, config, category);
  },

  performScrape,
  logScrapingAttempt
};
