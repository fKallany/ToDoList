'use client';

import { createTRPCContext } from '@trpc/tanstack-react-query';
import type { AppRouter } from '@/utils/server/appRouter';

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();
