# Fresca deploy runbook: frescainteriordesign.com

Follow once, top to bottom. Tick each box as you go. The site is a Next.js app on
Cloudflare Workers (OpenNext); the canonical address is `https://frescainteriordesign.com`
(no www). Every account below belongs to Karen; Marvin is added with access (section 11).

## 1. Domain on Cloudflare

- [ ] 1.1 Cloudflare dashboard, **Add a domain**, enter `frescainteriordesign.com`, choose the **Free** plan, keep the scanned DNS records for now.
- [ ] 1.2 If onboarding asks about AI crawlers, choose **Do not block** and leave **managed robots.txt** off. The site's own robots.txt allows them on purpose; Karen can change that later (section 3.4).
- [ ] 1.3 Copy the two nameservers Cloudflare shows. At the registrar, replace the domain's nameservers with them.
- [ ] 1.4 Wait for the zone to show **Active** (usually under an hour; Cloudflare emails when done).
- [ ] 1.5 At the registrar: turn on **auto-renew**, **transfer lock** (registrar lock) and **WHOIS privacy**.
- [ ] 1.6 Cloudflare, **DNS**, **Settings**, **DNSSEC**, **Enable DNSSEC**. Copy the DS record it shows (Key tag, Algorithm `13`, Digest type `2`, Digest).
- [ ] 1.7 At the registrar's DNSSEC page, add a DS record with exactly those four values. Back in Cloudflare, DNSSEC shows **Success** once the registrar publishes it (can take a day).

## 2. DNS records

Cloudflare, **DNS**, **Records**. Delete any old `A`, `AAAA` or `CNAME` on `@` and `www` first: a Worker custom domain can't be created on a name that already has one.

| Type | Name | Value | Proxy | Purpose |
| --- | --- | --- | --- | --- |
| Worker | `@` | fresca-site | Proxied (auto) | Site. Created by `npm run deploy` from `wrangler.jsonc` routes (section 3). |
| Worker | `www` | fresca-site | Proxied (auto) | Same, so the www redirect rule has a host to run on. |
| R2 | `media` | the R2 bucket | Proxied (auto) | Hero film. Created by the R2 custom domain (section 6). |
| MX | `@` | `smtp.google.com`, priority `1` | DNS only | Google Workspace mail. |
| TXT | `@` | `v=spf1 include:_spf.google.com include:amazonses.com ~all` | DNS only | SPF. See note 1. |
| TXT | `google._domainkey` | from Google Admin (note 2) | DNS only | Google DKIM. |
| TXT | `resend._domainkey` | from Resend (note 3) | DNS only | Resend DKIM. |
| MX | `send` | from Resend, e.g. `feedback-smtp.us-east-1.amazonses.com`, priority `10` | DNS only | Resend return path (bounces). |
| TXT | `send` | from Resend, e.g. `v=spf1 include:amazonses.com ~all` | DNS only | Resend return-path SPF. |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:karen@frescainteriordesign.com; adkim=r; aspf=r` | DNS only | DMARC. See note 4. |
| CAA | `@` | `0 issue "letsencrypt.org"` | DNS only | Certificates. See note 5. |
| CAA | `@` | `0 issue "pki.goog; cansignhttpexchanges=yes"` | DNS only | Certificates. |
| CAA | `@` | `0 issue "ssl.com"` | DNS only | Certificates. |
| CAA | `@` | `0 issuewild ";"` | DNS only | No other wildcard certificates. |
| TXT | `@` | `google-site-verification=...` (from Search Console or Workspace) | DNS only | Placeholder, added in sections 7 and 9. |
| CNAME | code from Bing | `verify.bing.com` | DNS only | Placeholder, only if Bing is not imported from Search Console. |

1. **SPF:** Resend puts its own SPF on `send` (row above), so the apex usually needs only Google. Open Resend's domain page: if it lists nothing for `@`, use `v=spf1 include:_spf.google.com ~all`. Only one SPF record may exist at `@`.
2. **Google DKIM:** admin.google.com, **Apps**, **Google Workspace**, **Gmail**, **Authenticate email**, select the domain, **Generate new record** (2048-bit, prefix `google`). Copy the TXT name and value into Cloudflare, wait an hour, then click **Start authentication** on the same page.
3. **Resend:** resend.com, **Domains**, **Add domain**, `frescainteriordesign.com`. Copy each record exactly as that page lists it (name, type, value, priority); the region in the MX value comes from there.
4. **DMARC:** after two weeks of reports with no unknown senders, change `p=none` to `p=quarantine`.
5. **CAA:** Cloudflare adds hidden CAA records for the CAs it uses (Let's Encrypt, Google Trust Services, SSL.com) as soon as any CAA record exists, so Universal SSL keeps working, wildcard included. DigiCert is no longer one of Cloudflare's CAs, so it is left out. Check with `dig frescainteriordesign.com caa +short`.

## 3. Worker

- [ ] 3.1 On the deploying machine, `.env.local` holds `NEXT_PUBLIC_SITE_URL=https://frescainteriordesign.com` and `NEXT_PUBLIC_MEDIA_BASE`. Until section 6 is done, keep the r2.dev URL there (see `.env.example`); these values are built into the site, so a change needs a redeploy.
- [ ] 3.2 `npx wrangler login` (Karen's Cloudflare account), then deploy. This builds, uploads, and creates the two custom domains from `wrangler.jsonc`:

```
npm run deploy
```

- [ ] 3.3 **Rules**, **Redirect Rules**, **Create rule**, name `www to apex`. When: **Hostname** equals `www.frescainteriordesign.com`. Then: **Dynamic**, expression `concat("https://frescainteriordesign.com", http.request.uri.path)`, status **301**, tick **Preserve query string**. **Deploy**. (Redirect Rules run before the Worker.) The site also redirects www to the apex itself (`next.config.mjs`, built from `NEXT_PUBLIC_SITE_URL`), as a backup for pages if this rule is missing; the rule is still needed so static files and images redirect too.
- [ ] 3.4 **Security**, **Security rules**, **Create rule**, **Rate limiting rule**, name `contact form`. Expression: `(http.request.uri.path eq "/api/contact" and http.request.method eq "POST")`. Characteristics: **IP**. Rate: **5** requests per **1 minute**. Action: **Block** for **10 minutes**. **Deploy**. The Free plan only offers a 10-second period and a 10-second block; use 5 per 10 seconds, block 10 seconds there, or move the zone to Pro for the full rule.
- [ ] 3.5 To undo a bad deploy: `npx wrangler rollback`.

## 4. SSL and security

- [ ] 4.1 **SSL/TLS**, **Overview**: **Full (strict)**.
- [ ] 4.2 **SSL/TLS**, **Edge Certificates**: **Always Use HTTPS** on, **Automatic HTTPS Rewrites** on, **TLS 1.3** on, **Minimum TLS Version** 1.2.
- [ ] 4.3 Same page, **HTTP Strict Transport Security**, **Enable**: Max Age **6 months**, **Include subDomains** on, **Preload** off, **No-Sniff header** on. Only do this once `@`, `www` and `media` all load over HTTPS.
- [ ] 4.4 **Security**, **Settings** (or **Bots**): **Bot Fight Mode** on. Verified crawlers (Google, Bing) are not affected.
- [ ] 4.5 Leave **off**: **Rocket Loader** (it changes how scripts load and can break the intro and the form), **Email Address Obfuscation** (rewrites the mailto links). Auto Minify and Mirage are retired; if an older dashboard still shows them, keep them off.

## 5. Speed and caching

- [ ] 5.1 **Speed**, **Optimization**: **Early Hints** on, **HTTP/3 (with QUIC)** on, **0-RTT Connection Resumption** on. Brotli is always on now; there is no toggle.
- [ ] 5.2 **Caching**, **Cache Rules**, **Create rule**, name `Media one year`. When: **Hostname** equals `media.frescainteriordesign.com`. Then: **Eligible for cache**, **Edge TTL** ignore cache-control and use **1 year**, **Browser TTL** respect origin. **Deploy**.
- [ ] 5.3 **Caching**, **Configuration**, **Browser Cache TTL**: **Respect Existing Headers**.

No Cache Rule is needed for `/_next/static/*` or `/media/*` on the apex: a Worker on a custom domain is the origin, so zone Cache Rules don't apply to it. Those files are cached by Workers static assets; Next marks `/_next/static/*` immutable, and `public/_headers` gives `/media/*` a one-year immutable `Cache-Control`.

Never overwrite a media file in place: upload a changed film under a new name (e.g. `fresca-hero-1080-v2.webm`) and update `content/media.ts`.

## 6. R2 media domain

- [ ] 6.1 **R2 Object Storage**, open the bucket holding `fresca-hero-1080.webm`, **Settings**, **Custom Domains**, **Add**, `media.frescainteriordesign.com`, **Connect Domain**. Wait for **Active**.
- [ ] 6.2 Check the three films load (each prints `200`):

```
for f in fresca-hero-1080.webm fresca-hero-1080.mp4 fresca-hero-720.mp4; do curl -s -o /dev/null -w "%{http_code} $f\n" https://media.frescainteriordesign.com/$f; done
```

  The site loads the three films from here; the poster is served from the site itself (`public/media/`) as the first paint.
- [ ] 6.3 Set `NEXT_PUBLIC_MEDIA_BASE=https://media.frescainteriordesign.com` in `.env.local` and run `npm run deploy`.
- [ ] 6.4 Load the home page, confirm the film plays and comes from `media.` (browser dev tools, Network, filter `fresca-hero`).
- [ ] 6.5 Back in the bucket's **Settings**, **Public Development URL**, **Disable**, so r2.dev stops serving.

## 7. Email

- [ ] 7.1 workspace.google.com, **Business Starter**, domain `frescainteriordesign.com`, first user `karen@frescainteriordesign.com`. Add the verification TXT and MX from section 2 when asked, then the Google DKIM (note 2).
- [ ] 7.2 Resend: add and verify the domain (note 3). Its page shows **Verified** once all records resolve.
- [ ] 7.3 Create a Resend API key (**API Keys**, **Create**, sending access, this domain only), then set the Worker secrets:

```
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put CONTACT_TO_EMAIL
npx wrangler secret put CONTACT_FROM_EMAIL
```

  `RESEND_API_KEY`: the key from 7.3. `CONTACT_TO_EMAIL`: `frescainteriordesign@gmail.com`. `CONTACT_FROM_EMAIL`: `hello@frescainteriordesign.com` (sending domain `frescainteriordesign.com`).
- [ ] 7.4 Set `CONTACT_FROM_EMAIL` only after 7.2 shows **Verified**: Resend rejects a sender on an unverified domain. Until then leave it unset; the form sends from `onboarding@resend.dev`, which Resend only delivers to the Resend account owner's own address.

## 8. Cloudflare Images

Every photo goes through `next/image`, which OpenNext serves with the Worker's `IMAGES` binding (`wrangler.jsonc`). Nothing to switch on per zone.

- [ ] 8.1 Dashboard, **Images** (under Media), **Overview**: confirm the plan shows (Images Free is the default).
- [ ] 8.2 Free includes **5,000 unique transformations a month** (one source image at one width; repeats in the month count once). Past that, new sizes fail with error 9422; Images Paid is $0.50 per extra 1,000. About 30 photos at a few widths each should use a few hundred.
- [ ] 8.3 A week after launch, check the monthly count on the same Overview page.

## 9. Search and listings (after DNS is live)

- [ ] 9.1 Google Search Console, **Domain** property, verify with the TXT record: https://search.google.com/search-console
- [ ] 9.2 Same place, **Sitemaps**, submit `https://frescainteriordesign.com/sitemap.xml`; **URL inspection** on the home page, **Request indexing**.
- [ ] 9.3 Bing Webmaster Tools, **Import from Google Search Console**: https://www.bing.com/webmasters
- [ ] 9.4 Google Business Profile (service-area business, hide the address if it is a home): https://business.google.com
- [ ] 9.5 Bing Places: https://www.bingplaces.com
- [ ] 9.6 Apple Business Connect: https://businessconnect.apple.com
- [ ] 9.7 Instagram (fresca.interior.design), **Edit profile**, **Links**: `https://frescainteriordesign.com`

## 10. Tests

- [ ] `http://frescainteriordesign.com`, `http://www.frescainteriordesign.com` and `https://www.frescainteriordesign.com` each answer 301 to `https://frescainteriordesign.com/`:

```
for u in http://frescainteriordesign.com http://www.frescainteriordesign.com https://www.frescainteriordesign.com; do curl -sI $u | grep -iE "^(HTTP|location)"; done
```

- [ ] `curl -sI https://frescainteriordesign.com/` shows `strict-transport-security`. The site sets no Content-Security-Policy yet, so none appears; if one is added, its `media-src` and `img-src` must include the `NEXT_PUBLIC_MEDIA_BASE` host.
- [ ] SSL Labs grade A: https://www.ssllabs.com/ssltest/
- [ ] Headers report reviewed: https://securityheaders.com (expect a note about the missing CSP).
- [ ] mail-tester.com 9 or better: set `CONTACT_TO_EMAIL` to the address mail-tester.com shows, send the form, read the score, then set the secret back.
- [ ] Rich Results Test on `https://frescainteriordesign.com/` finds LocalBusiness and FAQ: https://search.google.com/test/rich-results (Google only shows FAQ results for government and health sites, so the test passing is the goal).
- [ ] `/sitemap.xml`, `/robots.txt`, `/llms.txt` answer 200; `/404` answers 404.
- [ ] Hero film loads from `media.frescainteriordesign.com` (step 6.4).
- [ ] Lighthouse mobile on the live URL (Chrome dev tools, **Lighthouse**, Mobile). Last lab run: performance 89 to 91, SEO 100 (docs/SEO-AUDIT.md).

## 11. Ownership

| Account | Owner | Access | Credentials |
| --- | --- | --- | --- |
| Domain registrar | Karen | Marvin (delegate, if offered) | Karen's password manager |
| Cloudflare (zone, Workers, R2, Images) | Karen | Marvin (account member) | Karen's password manager |
| Resend | Karen | Marvin (team member) | Karen's password manager |
| Google Workspace | Karen (super admin) | Marvin (admin, if needed) | Karen's password manager |
| Google Search Console | Karen | Marvin (full user) | Karen's Google account |
| Google Business Profile | Karen | Marvin (manager) | Karen's Google account |
