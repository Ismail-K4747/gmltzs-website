# CMS Setup — One-Time Steps

This site is now powered by **Astro** (build tool) + **Sveltia CMS** (editor) + **Cloudflare Pages** (hosting).
Below is everything needed to flip the switch from the legacy static site to the new CMS-driven setup.

---

## 1. Install dependencies & verify locally

```powershell
npm install
npm run dev          # opens http://localhost:4321
npm run build        # outputs to dist/
npm run preview      # serves dist/ locally to verify
```

If `npm run build` succeeds, the migration is structurally sound.

---

## 2. Create the GitHub OAuth App (one-time)

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
2. **Application name:** `GM Group CMS`
3. **Homepage URL:** `https://gmltzs.com`
4. **Authorization callback URL:** `https://gmltzs-cms-auth.<your-cf-subdomain>.workers.dev/callback`
   (you'll know the exact URL after step 3 — just guess for now and edit after)
5. Click **Register application**, then **Generate a new client secret**
6. Copy the **Client ID** and **Client Secret** somewhere safe

---

## 3. Deploy the auth worker (Cloudflare)

```powershell
cd cms-auth-worker
npx wrangler login            # opens browser, log in to your Cloudflare account
npx wrangler secret put GITHUB_CLIENT_ID       # paste the ID
npx wrangler secret put GITHUB_CLIENT_SECRET   # paste the secret
npx wrangler deploy
```

The output prints your worker URL (e.g. `https://gmltzs-cms-auth.example.workers.dev`).
- Go back to the GitHub OAuth App and update the callback URL to `<worker-url>/callback` exactly.
- Open `public/admin/config.yml` and set `backend.base_url` to the worker URL.

---

## 4. Set up Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**
2. Pick the `gmltzs-website` repo, branch `main`
3. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Deploy. Then go to **Custom domains → Set up a custom domain → gmltzs.com**.
5. Cloudflare will tell you to add a CNAME or update nameservers — follow the steps.
6. Once verified, **switch GitHub Pages off** (Settings → Pages → Source: None) so traffic flows through Cloudflare.

---

## 5. Add GitHub Action secrets

GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**:
- `CLOUDFLARE_API_TOKEN` — create at Cloudflare → My Profile → API Tokens → "Edit Cloudflare Workers" template
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare dashboard sidebar, right side

(The action will then auto-deploy on every push to `main`.)

---

## 6. Give the client access

The client logs in with their **GitHub account**.
- Either add them as a collaborator on the `gmltzs-website` repo (Settings → Collaborators), OR
- Move the repo to a GitHub Organization and add them as a member with write access.

They visit **https://gmltzs.com/admin/**, click "Login with GitHub", and they're in.

---

## How the client edits photos & text (the answer to your question)

1. Go to `gmltzs.com/admin/`
2. Login with GitHub (one-click)
3. Sidebar → **Pages** → pick the page (e.g. *Pharmacy*)
4. Scroll to **Photo gallery — photos** section
5. Click **+ Add Photo** → drag in a photo → write caption → click **Publish**
6. Behind the scenes:
   - Sveltia commits the photo + updated `.md` file to `main`
   - GitHub Action compresses the image (`calibreapp/image-actions`)
   - Astro rebuilds the site
   - Cloudflare deploys → live in ~30–60 seconds
7. Refresh `gmltzs.com/businesses/medics` → photos appear

Same flow for editing **any text** on any page.

---

## What's migrated (current branch state — `cms-migration`)

**Phase 3 complete** — all 8 pages are now CMS-driven Astro pages:
- Homepage (`index.html`)
- 4 business pages (medical-devices, real-estate, medics, laboratory)
- Insights page
- Terms & Privacy pages

All legacy `.html` files have been removed; Astro emits the same URLs (with `.html` suffix preserved). The client can edit every page's text, headlines, service cards, articles, legal sections, project stats/timeline, and photo galleries via `/admin/`.

Branch `cms-migration` is ready to merge into `main` after the OAuth/Worker/Cloudflare setup steps above.
