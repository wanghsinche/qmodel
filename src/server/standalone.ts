// Export type router type signature, this is used by the client.
import { appRouter } from './router';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
const server = createHTTPServer({
  router: appRouter,
});

server.listen(3000);
