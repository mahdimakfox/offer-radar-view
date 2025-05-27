
const DEFAULT_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
];

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getRandomUserAgent = (): string => {
  return DEFAULT_USER_AGENTS[Math.floor(Math.random() * DEFAULT_USER_AGENTS.length)];
};

export const generateFallbackData = (category: string, source: string): any[] => {
  const baseData = {
    strom: [
      { name: 'Hafslund Strøm', price: 89.5, rating: 4.2, category, source },
      { name: 'Tibber', price: 85.2, rating: 4.4, category, source },
      { name: 'Fjordkraft', price: 92.1, rating: 4.0, category, source }
    ],
    internett: [
      { name: 'Telenor Bredbånd', price: 599, rating: 4.1, category, source },
      { name: 'Telia Fiber', price: 549, rating: 4.3, category, source },
      { name: 'Altibox', price: 629, rating: 4.2, category, source }
    ],
    mobil: [
      { name: 'Telenor Mobil', price: 399, rating: 4.0, category, source },
      { name: 'Telia Mobil', price: 379, rating: 4.2, category, source },
      { name: 'Ice Mobil', price: 299, rating: 3.9, category, source }
    ]
  };

  return baseData[category as keyof typeof baseData] || [];
};
