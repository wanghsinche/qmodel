import type { AppRouter } from '../../src/server/router';
import { createTRPCClient, httpBatchLink } from '@trpc/client';

export const client = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: TRPC_URL,
        // You can pass any HTTP headers you wish here
      }),
    ],
  });
  