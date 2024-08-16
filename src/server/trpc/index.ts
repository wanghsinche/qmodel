import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create();

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        cause: new Error('User not found'),
        message: 'User not found',
        code: 'UNAUTHORIZED',
      });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  })
  