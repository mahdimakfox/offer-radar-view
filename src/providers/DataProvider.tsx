
import React, { createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Configure React Query with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

interface DataProviderContextType {
  queryClient: QueryClient;
}

const DataProviderContext = createContext<DataProviderContextType | undefined>(undefined);

export const useDataProvider = () => {
  const context = useContext(DataProviderContext);
  if (!context) {
    throw new Error('useDataProvider must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: React.ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <DataProviderContext.Provider value={{ queryClient }}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </DataProviderContext.Provider>
    </QueryClientProvider>
  );
};
