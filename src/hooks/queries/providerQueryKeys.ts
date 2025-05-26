
// Centralized query keys for consistency
export const PROVIDER_QUERY_KEYS = {
  all: ['providers'] as const,
  categories: () => [...PROVIDER_QUERY_KEYS.all, 'categories'] as const,
  category: (category: string) => [...PROVIDER_QUERY_KEYS.categories(), category] as const,
  search: (category: string, searchTerm: string) => [...PROVIDER_QUERY_KEYS.category(category), 'search', searchTerm] as const,
  counts: () => [...PROVIDER_QUERY_KEYS.all, 'counts'] as const,
  byId: (id: number) => [...PROVIDER_QUERY_KEYS.all, 'byId', id] as const,
} as const;
