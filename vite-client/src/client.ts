import type { AppRouter } from '../../src/server/router';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

export const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      transformer: superjson,
      url: TRPC_URL,
      // You can pass any HTTP headers you wish here
      headers: () => ({
        authentication: `Bearer ${localStorage.getItem('token') || ''}`,
      }),
    }),
  ],
});
