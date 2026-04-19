import { initTRPC } from '@trpc/server';
import type { AppRouter } from './appRouter';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;