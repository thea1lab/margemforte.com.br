# Margem Forte

Calculadora de margem de lucro real para seu negocio. Inclui custos fixos, variaveis e impostos.

Live at: [margemforte.com.br](https://margemforte.com.br)

## Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Cloudflare Workers (deploy)

## Development

```bash
npm install
npm run dev
```

## Deploy

Automatic via GitHub Actions on every push to `main`. Deploys to Cloudflare Workers using Wrangler.

Required GitHub Secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
