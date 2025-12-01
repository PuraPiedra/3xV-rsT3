# Deploying TRIPLE V:RusT3 to Cloudflare Pages

This repository is framework-agnostic, so deployment is handled as a static build. The steps below assume you already have a build pipeline that outputs compiled assets (HTML/CSS/JS) into a `dist/` directory (e.g., Vite, Next static export, or your custom bundler).

## Prerequisites
- Node.js 18+ installed locally
- `npm install -g wrangler` (Cloudflare CLI)
- A Cloudflare account with Pages enabled

## Configure Wrangler
A `wrangler.toml` is provided with sensible defaults:

```toml
name = "triple-vrust3"
pages_build_output_dir = "./dist"
compatibility_date = "2024-05-01"
```

If your build artifacts live elsewhere, update `pages_build_output_dir` to match.

## Build locally
Produce your static assets into `dist/` (or your chosen output directory). For example, with a Vite setup:

```bash
npm install
npm run build
```

## Test with Pages Dev (optional)
Preview the production build locally with Cloudflare's Pages runtime:

```bash
npx wrangler pages dev dist
```

## Publish
Deploy to Cloudflare Pages using the Wrangler CLI. Replace `triple-vrust3` with your preferred project slug if needed.

```bash
npx wrangler pages publish dist --project-name=triple-vrust3
```

After the first publish, Cloudflare will remember the project name; subsequent publishes can simply run `npx wrangler pages publish dist`.

## CI integration (optional)
In CI/CD, cache dependencies and run the same build/publish commands. Ensure `CLOUDFLARE_ACCOUNT_ID` and an API token with **Pages Write** permissions are available in the environment for automated deploys.
