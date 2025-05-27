
interface ProviderEntry {
  category: string;
  name: string;
  url: string;
}

export const fileReader = {
  // Read providers from LEVERANDØRER.txt file
  async readProvidersFromFile(): Promise<ProviderEntry[]> {
    try {
      const response = await fetch('/LEVERANDØRER.txt');
      if (!response.ok) {
        throw new Error(`Failed to load file: ${response.statusText}`);
      }
      
      const content = await response.text();
      console.log('Successfully loaded LEVERANDØRER.txt');
      
      return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('#'))
        .map(line => {
          const [category, name, url] = line.split('|');
          if (!category || !name || !url) {
            console.warn(`Skipping invalid line: ${line}`);
            return null;
          }
          return { 
            category: category.trim(), 
            name: name.trim(), 
            url: url.trim() 
          };
        })
        .filter((provider): provider is ProviderEntry => provider !== null);
    } catch (error) {
      console.error('Error reading providers file:', error);
      throw new Error(`Could not read LEVERANDØRER.txt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};
