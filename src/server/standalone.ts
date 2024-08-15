// Export type router type signature, this is used by the client.
import { appRouter } from './router';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import cors from 'cors';
import 'dotenv/config'
import { createContext } from './trpc/context';

if (process.env.CODESPACE_NAME) {
  const url = `https://${process.env.CODESPACE_NAME}-${process.env.TRPC_PORT||'3000'}.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
  process.env.API_HOST = url
}

const server = createHTTPServer({
  router: appRouter,
  middleware: cors(),
  createContext
});


server.listen(Number(process.env.TRPC_PORT||'3000'));
