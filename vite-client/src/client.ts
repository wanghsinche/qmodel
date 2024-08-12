import type { AppRouter } from '../../src/server/router';
import { createTRPCClient, httpBatchLink } from '@trpc/client';

export const client = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: 'https://turbo-waffle-wrgg7994j56hv6x6-3000.app.github.dev/',
        // You can pass any HTTP headers you wish here
      }),
    ],
  });
  