import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './router';
import { initStore } from '../service/store';
export default {
  async fetch(request: Request, env: any): Promise<Response> {
    initStore(env);
    return fetchRequestHandler({
      endpoint: '/trpc',
      req: request,
      router: appRouter,
    });
  },
};
