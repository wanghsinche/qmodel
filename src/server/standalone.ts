// Export type router type signature, this is used by the client.
import { appRouter } from './router';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import cors from 'cors';

const server = createHTTPServer({
  router: appRouter,
  middleware: cors()
});

server.listen(3000);
