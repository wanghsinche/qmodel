import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import manifestJSON from '__STATIC_CONTENT_MANIFEST';
import clouldflareAdapter from './src/server/cloudflare-worker';

const assetManifest = JSON.parse(manifestJSON);

export default {
  async fetch(request, env, ctx) {
    try {
      let pathname = new URL(request.url).pathname;
      if (pathname.startsWith('/trpc')) {
        console.log('ctx', ctx);
        console.log('env', env);
        return await clouldflareAdapter.fetch(request, env);
      }
      // Add logic to decide whether to serve an asset or run your original Worker code
      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: assetManifest,
        }
      );
    } catch (e) {
      let pathname = new URL(request.url).pathname;

      if (e.toString().includes(`KVError: could not find`) && pathname !== '/') {
        return new Response(e.message || e.toString(), {
          status: 301,
          headers: {
            Location: '/',
          },
        });
      }

      return new Response(`"${pathname}" got error \n ${e}`, {
        status: 500,
        statusText: 'Internal Error',
      });
    }
  },
};