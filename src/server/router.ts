import { groupQDII, sortETFGroup } from '../service/sort_qdii_with_sector';
import { router, publicProcedure } from './trpc';


export const appRouter = router({
  QDIIGrounpedBySector: publicProcedure.query(async () => {
    const gp = await groupQDII()
    return sortETFGroup(gp);
  })
  // ...
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;