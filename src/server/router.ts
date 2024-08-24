import { accountValidator, checkAccountUsed, createUserAccount, loginAccount } from '../service/account_service';
import { getPremiumDetail } from '../service/premium_detail_service';
import { groupQDII, sortETFGroup } from '../service/sort_qdii_with_sector';
import { createCheckoutSession } from '../service/stripe_payment';
import { router, publicProcedure, protectedProcedure } from './trpc';
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
      resultURL: z.string().url(),
    })
  ).mutation(async ({ input }) => {
    const session = await createCheckoutSession(input.priceId, input.quantity, input.resultURL);
    return { url: session };
  }),
  register: publicProcedure.input(accountValidator)
    .mutation(async ({ input }) => {
      const token  = await createUserAccount(input)
      return token
    }),
  login: publicProcedure.input(accountValidator)
  .mutation(async ({ input }) => {
    const token  = await loginAccount(input)
    return token
  }),
  getProfile: protectedProcedure.query(({ ctx }) => {
    return ctx.user
  }),
  checkAccountUsed: publicProcedure.input(z.string()).query(async ({ input }) => {
    return await checkAccountUsed(input)
  }),
  getQDIIPremium: publicProcedure.input(z.object({ code: z.string(), start: z.date(), end: z.date() })).query(async ({
    input: { code, start, end }
  }) => {
    return await getPremiumDetail(code, start, end)
  })
  // Add more procedures here
  // ...
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;