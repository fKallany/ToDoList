'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import type { AppRouter, Task } from '@/utils/server/appRouter';
import { TRPCProvider } from '@/utils/client/trpc';
import TaskList from './TaskList';

function makeQueryClient() {
  // Creates a new React Query client instance
  // Configures default options like staleTime
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  // Returns the query client for the current environment
  // Ensures a singleton instance on the browser
  if (typeof window === 'undefined') {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function getBaseUrl() {
  // Determines the base URL for API requests
  // Handles server-side (Vercel/localhost) and client-side logic
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

type ListProps = {
  initialData: {
    tasks: Task[];
    nextCursor: number | undefined;
  };
};

function List({ initialData }: ListProps) {
  // Main container component for the task list
  // Sets up tRPC and React Query providers
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <div className="w-full">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
            Task Management
          </h1>
          <TaskList initialData={initialData} />
        </div>
      </TRPCProvider>
    </QueryClientProvider>
  );
}

export default List;