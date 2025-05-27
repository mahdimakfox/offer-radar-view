
import { ProviderEndpoint, ExecutionResult } from './endpointTypes';
import { realApiService } from '../realApiService';
import { scrapingService } from '../scrapingService';
import { insertProviderWithDuplicateDetection } from './providerProcessor';
import { logExecution } from './endpointLogger';

export const executeEndpoint = async (
  endpoint: ProviderEndpoint,
  executionType: 'manual' | 'scheduled' | 'fallback' = 'manual'
): Promise<ExecutionResult> => {
  const startTime = Date.now();
  let providersFetched = 0;
  let providersSaved = 0;
  let duplicatesFound = 0;
  let usedFallback = false;
  let retriedCount = 0;

  try {
    console.log(`Executing ${endpoint.endpoint_type} endpoint: ${endpoint.name} for category ${endpoint.category}`);
    
    let apiResponse;
    
    if (endpoint.endpoint_type === 'scraping' && endpoint.scraping_config) {
      const scrapingResult = await scrapingService.executeScraping(
        endpoint.url,
        endpoint.scraping_config,
        endpoint.category
      );
      
      if (!scrapingResult.success) {
        throw new Error(scrapingResult.error || 'Scraping failed');
      }
      
      await scrapingService.logScrapingAttempt(
        endpoint.url,
        scrapingResult.success,
        scrapingResult.error
      );
      
      apiResponse = {
        success: true,
        data: scrapingResult.data.map(item => ({
          name: item.name,
          price: item.price,
          rating: item.rating,
          description: `Provider scraped from ${endpoint.name}`,
          external_url: item.source || endpoint.url,
          org_number: '',
          logo_url: '',
          pros: ['Scraped data'],
          cons: []
        }))
      };
      
      usedFallback = scrapingResult.usedFallback || false;
      retriedCount = scrapingResult.retriedCount;
      
    } else {
      apiResponse = await realApiService.fetchProvidersFromApi(endpoint.category);
    }
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.error || 'Failed to fetch data from endpoint');
    }

    providersFetched = apiResponse.data.length;
    console.log(`Fetched ${providersFetched} providers from ${endpoint.name}`);

    for (const provider of apiResponse.data) {
      const result = await insertProviderWithDuplicateDetection(
        provider, 
        endpoint.category, 
        endpoint.id
      );
      
      if (result.success) {
        if (result.action === 'duplicate') {
          duplicatesFound++;
        } else {
          providersSaved++;
        }
      }
    }

    const executionTimeMs = Date.now() - startTime;
    const result: ExecutionResult = {
      success: true,
      providers: apiResponse.data,
      executionTimeMs,
      providersFetched,
      providersSaved,
      duplicatesFound,
      usedFallback,
      retriedCount
    };

    await logExecution(endpoint.id, executionType, result);
    return result;
  } catch (error) {
    const executionTimeMs = Date.now() - startTime;
    const result: ExecutionResult = {
      success: false,
      providers: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTimeMs,
      providersFetched,
      providersSaved,
      duplicatesFound,
      usedFallback,
      retriedCount
    };

    await logExecution(endpoint.id, executionType, result);
    return result;
  }
};
