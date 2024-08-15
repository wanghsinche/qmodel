import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from './router';
import { initLoadEnv } from '../service/store';
import { createContext } from './trpc/context';
export default {
  async fetch(request: Request, env: any): Promise<Response> {
    initLoadEnv(env);
    return fetchRequestHandler({
      endpoint: '/trpc',
      req: request,
      router: appRouter,
      createContext
    });
  },
};
