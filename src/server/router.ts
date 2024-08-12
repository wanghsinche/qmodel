import { groupQDII, sortETFGroup } from '../service/sort_qdii_with_sector';
import { router, publicProcedure } from './trpc';
import { z } from 'zod';


export const appRouter = router({
    QDIIGrounpedBySector: publicProcedure.query(() => {
        return sortETFGroup(groupQDII());
    })
  // ...
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;