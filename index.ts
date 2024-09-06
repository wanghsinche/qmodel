import { getAssetFromKV, serveSinglePageApp } from '@cloudflare/kv-asset-handler';
import manifestJSON from '__STATIC_CONTENT_MANIFEST';
import clouldflareAdapter from './src/server/cloudflare-worker';
import { scheduleCleanAll } from './src/service/schedule_clean'
import { initLoadEnv } from './src/service/store';

const assetManifest = JSON.parse(manifestJSON);

export default {
  async fetch(request, env, ctx) {
    try {
      let pathname = new URL(request.url).pathname;
      if (pathname.startsWith('/trpc')) {
        return await clouldflareAdapter.fetch(request, env);
      }
      // Add logic to decide whether to serve an asset or run your original Worker code
      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          mapRequestToAsset: serveSinglePageApp,
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: assetManifest,
        }
      );
    } catch (e) {
      let pathname = new URL(request.url).pathname;

      if (e.toString().includes(`KVError: could not find`) && pathname !== '/') {
        return new Response(`"${pathname}" not found`, {
          status: 404,
          statusText: "not found"
        });
      }

      return new Response(`"${pathname}" got error \n ${e}`, {
        status: 500,
        statusText: 'Internal Error',
      });
    }
  },

  async scheduled(_event, env, _ctx) {
    initLoadEnv(env);
    console.log('scheduled');
    await scheduleCleanAll();
  },
};