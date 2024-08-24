import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const getBaseUrl = () => {
  if (process.env.WORKER_URL) {
    console.info(`Worker URL: ${process.env.WORKER_URL}`);
    // reference for vercel.com
    return process.env.WORKER_URL;
  }

  if (process.env.CODESPACE_NAME) {
    const url = `https://${process.env.CODESPACE_NAME}-${process.env.TRPC_PORT||'3000'}.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
    console.info(`Codespace URL: ${url}`);
    // if we are in a Codespace, return the base URL
    return url;
  }

  console.info(`Local URL: localhost:${process.env.TRPC_PORT}`);
  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
};


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    TRPC_URL: JSON.stringify(getBaseUrl()),
    TITLE: JSON.stringify('QModel 轻策略'),
  }
})
