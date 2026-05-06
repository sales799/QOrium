# SEO Submission Helper — Sitemap + Webmaster Tools

**Owner:** CEO + marketing ops
**When to run:** After PR #10 merges and `qorium.online` is fully launched (PRE-LAUNCH-CHECKLIST §F2)
**Time required:** ~30 minutes total

---

## Why this is a separate doc

GSC and Bing Webmaster property verification requires DNS or HTML-meta access. Both are 5-minute panel actions for the user; this helper is the recipe. CTO can't do these from the build environment because they require Hostinger DNS panel access (or repo-merge access for the meta-tag approach).

---

## 1. Google Search Console

### Step 1 — Add property

1. Go to <https://search.google.com/search-console>.
2. Sign in with the Google account that owns marketing (recommend: a shared `marketing@qorium.online` Google Workspace account, not a personal account).
3. Click **Add property** → choose **Domain** (preferred — covers all subdomains) or **URL prefix** (faster — no DNS access needed).

### Step 2 — Verify ownership

**Option A — Domain property (recommended):** Add the TXT record GSC gives you to Hostinger DNS for `qorium.online`. Wait 5-15 minutes for propagation.

**Option B — URL prefix:** Either:

- Upload an HTML file to `/public/google[hash].html` in the marketing app (then redeploy)
- Or add a `<meta name="google-site-verification" content="..." />` tag to `app/layout.tsx`

(Option A is preferred because it covers `qorium.in` redirect traffic too.)

### Step 3 — Submit sitemap

1. In GSC, click **Sitemaps** in the left nav.
2. Add new sitemap: `https://qorium.online/sitemap.xml`
3. Submit. Status should flip from "Couldn't fetch" to "Success" within 24h.

### Step 4 — Verify indexing kickoff

1. Within 48h, check **Pages** → **Indexed**. You should see at least the home page.
2. Use **URL inspection** to manually request indexing for these 5 priority routes (faster than waiting for crawl):
   - `https://qorium.online/`
   - `https://qorium.online/product`
   - `https://qorium.online/pricing`
   - `https://qorium.online/security`
   - `https://qorium.online/customers`

---

## 2. Bing Webmaster Tools

### Step 1 — Add site

1. Go to <https://www.bing.com/webmasters>.
2. Sign in.
3. Click **Add a site** → enter `https://qorium.online`.

### Step 2 — Import from GSC (saves verification step)

If GSC verification is already done, Bing offers **Import from Google Search Console** — one click; uses your GSC verification.

### Step 3 — Submit sitemap

1. Sitemap auto-discovers from `/sitemap.xml`.
2. If not, manually add: `https://qorium.online/sitemap.xml`.

---

## 3. Verification ping (CTO sanity check)

Once both are submitted, a CTO smoke test confirms the sitemap is reachable + well-formed:

```bash
# Confirms sitemap responds + has expected number of URLs
curl -s -m 8 https://qorium.online/sitemap.xml | grep -c "<loc>"
# Expected: 21 (as of 2026-05-06: 19 base routes + /changelog + /press-kit)

# Confirms robots.txt doesn't accidentally disallow indexed routes
curl -s -m 8 https://qorium.online/robots.txt
# Expected: 'Disallow: /styleguide' and '/api/' only; everything else allowed.
```

---

## 4. Common pitfalls (CTO observed in similar deploys)

- **Don't submit `/sitemap.xml` with the `http://` prefix.** Always `https://`.
- **Don't add the same property in both Domain and URL prefix forms.** Pick one. GSC will dedupe but it's confusing.
- **Don't wait for "0 errors" before publishing the announce posts** — announce posts go up at F6 / F7 regardless of GSC status. F4 is a parallel track.
- **Don't disallow `/api/`** more aggressively than the current `robots.txt` — the OG image, brand SVG, and RSS endpoints sit under various app paths; current robots.txt is correctly scoped.

---

## 5. Post-submission: monitor weekly for 4 weeks

Add to the Mon weekly forecast (`bali/templates/weekly-forecast.md` §7 Competitive Intelligence) for 4 weeks post-launch:

- GSC indexing count (target: 21 pages indexed within 4 weeks)
- Top 5 search queries reaching the site
- Any GSC-flagged crawl errors

After 4 weeks, this becomes part of the monthly business review (`bali/templates/monthly-business-review.md` §6 AI Agent / SEO Performance).

---

_Cross-references: PRE-LAUNCH-CHECKLIST §F4, `apps/marketing/src/app/sitemap.ts`, `apps/marketing/src/app/robots.ts`. Constitutional anchors: SO-13 (tech stack discipline; we use Next.js sitemap.ts not external generators) and SO-15 (no secrets — verification tokens stay in env files, not commits)._
