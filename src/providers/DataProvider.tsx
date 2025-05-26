
import React, { createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Enhanced error logging for development and monitoring
const logError = (context: string, error: unknown) => {
  console.error(`[DataProvider] ${context}:`, error);
  // In production, you could send this to a monitoring service
  // e.g., Sentry, LogRocket, etc.
};

// Configure React Query with optimized settings for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
      retry: (failureCount, error) => {
        // Log retry attempts
        logError(`Query retry attempt ${failureCount}`, error);
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        logError('Mutation error', error);
      },
    },
  },
});

// Global error handler for queries
queryClient.setDefaultOptions({
  queries: {
    onError: (error) => {
      logError('Query error', error);
    },
  },
});

interface DataProviderContextType {
  queryClient: QueryClient;
  logError: (context: string, error: unknown) => void;
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
      <DataProviderContext.Provider value={{ queryClient, logError }}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </DataProviderContext.Provider>
    </QueryClientProvider>
  );
};
