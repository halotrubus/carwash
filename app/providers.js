'use client';

// Client-only context wrapper.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { WashflowProvider } from '@/lib/washflow/store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WashflowProvider>{children}</WashflowProvider>
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
