import { groupQDII, sortETFGroup } from '../service/sort_qdii_with_sector';
import { createCheckoutSession } from '../service/stripe_payment';
import { router, publicProcedure } from './trpc';
import z from 'zod';

export const appRouter = router({
  QDIIGrounpedBySector: publicProcedure.query(async () => {
    const gp = await groupQDII()
    return sortETFGroup(gp);
  }),
  getCheckoutSession: publicProcedure.input(
    z.object({
      priceId: z.string(),
      quantity: z.number().default(1),
    })
  ).query(async ({ input }) => {
    const session = await createCheckoutSession(input.priceId, input.quantity);
    return { url: session };
  }),

  // Add more procedures here
  // ...
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;