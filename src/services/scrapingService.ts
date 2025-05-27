
import { ScrapingConfig, ScrapingResult } from './scraping/scrapingTypes';
import { ScrapingExecutor } from './scraping/scrapingExecutor';
import { performScrape } from './scraping/scrapingCore';
import { logScrapingAttempt } from './scraping/scrapingLogger';

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
