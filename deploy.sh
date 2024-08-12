cd vite-client
npm install
npm run build
cd ..
mkdir -p dist
cp -v -r vite-client/dist/* ./dist
# ask for comfirmation
read -p "Build finished. Press enter to continue"
source ./.env
npx wrangler whoami
npx wrangler deploy ./index.js

