# Cloudflare Git deployment

Worker: sparkling-recipe-4dd0

Production branch: development/supabase-klusbeheer-pro

Root directory: /

Build command: npm test && node scripts/build-static.mjs

Deploy command: npx wrangler@4 deploy --config cloudflare-app/wrangler.jsonc

Static output: cloudflare-app/dist, generated from the Supabase app. The original Next.js build is not used by this deployment.

This commit also requests a build through the existing Cloudflare Git integration. Confirm the result in the Cloudflare build logs and verify the live app before treating publication as complete.
