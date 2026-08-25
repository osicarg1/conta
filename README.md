# CASS Calculator - Cloudflare Deployment

This project is now configured for Cloudflare Workers + static assets + KV persistence.

## Why data was not persistent

In-memory values are reset across requests/deploys. Browser localStorage is per device/browser only. Persistent shared storage on Cloudflare requires KV, D1, or Durable Objects.

This app uses:
- Cloudflare Worker (`src/index.js`) for API route `/api/data/:id`
- Worker static assets (`index.html` and project files)
- Cloudflare KV (`CASS_DATA`) for persistence

## Ce calculează acum aplicația

- Venituri din chirii: impozit 10% aplicat la baza netă (80% din brut)
- Venituri din dobânzi: impozit 10% (inclusiv dobândă estimată automat din depozite)
- CASS: în funcție de plafoanele 6/12/24 salarii minime
- CAS: afișat explicit ca 0 RON pentru chirii și dobânzi

Pentru depozite poți introduce:
- sumă depozit
- dobândă anuală
- perioadă (luni)

Aplicația estimează dobânda simplu: `sumă x dobândă anuală x perioadă / 12`.

## Utilizare pe Android (PWA)

Aplicația include `manifest.webmanifest` și `service-worker.js`, deci poate fi instalată pe Android:

1. Deschide URL-ul aplicației în Chrome pe Android.
2. Din meniul browserului alege `Add to Home screen` / `Install app`.
3. Aplicația va rula în mod standalone, ca o aplicație mobilă.

## 1) Install Wrangler

```powershell
npm install -g wrangler
```

## 2) Login

```powershell
wrangler login
```

## 3) Create KV namespaces

```powershell
wrangler kv namespace create CASS_DATA
wrangler kv namespace create CASS_DATA --preview
```

Copy the returned `id` and `preview_id` into [wrangler.toml](wrangler.toml).

## 4) Run locally

```powershell
wrangler dev
```

Open the local URL and verify Save/Load works.

## 5) Deploy

```powershell
wrangler deploy
```

## Notes

- `Save (local + cloud)` writes localStorage and then syncs to Cloudflare KV.
- `Reload (cloud/local)` first tries cloud, then falls back to local storage.
- A browser-specific client id is generated and used as key in KV.
