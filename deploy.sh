cd vite-client
npm install
WORKER_URL="/trpc" npm run build
cd ..
rm -fr dist
mkdir -p dist
cp -v -r vite-client/dist/* ./dist
# ask for comfirmation
# read -p "Build finished. Press enter to continue"
source ./.env

npx wrangler secret bulk < env.json
npx wrangler whoami 
npx wrangler deploy 
