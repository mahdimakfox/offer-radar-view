
export const htmlFetcher = {
  // Fetch HTML using AllOrigins API
  async fetchHtmlViaAllOrigins(url: string): Promise<string> {
    try {
      console.log(`Fetching HTML for ${url} via AllOrigins`);
      
      const encodedUrl = encodeURIComponent(url);
      const allOriginsUrl = `https://api.allorigins.win/get?url=${encodedUrl}`;
      
      const response = await fetch(allOriginsUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // 15 second timeout
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        throw new Error(`AllOrigins API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.contents) {
        throw new Error('No content received from AllOrigins API');
      }

      console.log(`Successfully fetched ${data.contents.length} characters from ${url}`);
      return data.contents;
      
    } catch (error) {
      console.error(`Failed to fetch HTML for ${url}:`, error);
      throw error;
    }
  }
};
