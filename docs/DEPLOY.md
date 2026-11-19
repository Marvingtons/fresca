# Deploying Fresca

The site runs on Cloudflare Workers through OpenNext (`npm run deploy`).

## Build-time environment

`NEXT_PUBLIC_*` values are inlined when the site is built, so they must be in
`.env.local` (or the shell) on the machine that runs `npm run deploy`. They are
not Worker variables.

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | The live domain, e.g. `https://frescainteriordesign.com` (unconfirmed). The build fails without it. |
| `NEXT_PUBLIC_MEDIA_BASE` | The R2 custom domain for the hero film, e.g. `https://media.frescainteriordesign.com`. |

## Worker secrets (contact form)

```
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put CONTACT_TO_EMAIL
```

Enter `frescainteriordesign@gmail.com` for `CONTACT_TO_EMAIL`. Once the domain is
verified in Resend, also run `npx wrangler secret put CONTACT_FROM_EMAIL` with a
sender such as `Fresca website <website@frescainteriordesign.com>`. Until then the
form sends from `onboarding@resend.dev`, which Resend only delivers to the email
address that owns the Resend account.

## Media: R2 custom domain

The hero film lives in the R2 bucket. The `r2.dev` URL is rate limited and not
for production, so give the bucket a custom domain. The domain's zone must be on
the same Cloudflare account.

1. Cloudflare dashboard, **R2 Object Storage**, open the bucket that holds `fresca-hero-1080.webm`.
2. **Settings**, under **Custom Domains**, select **Add**.
3. Enter `media.frescainteriordesign.com` (or another subdomain of the site's zone), select **Continue**, then **Connect Domain**.
4. Wait until the domain shows **Active**.
5. Back in **Settings**, under **Public Development URL**, select **Disable** so the `r2.dev` address stops serving.
6. Set `NEXT_PUBLIC_MEDIA_BASE=https://media.frescainteriordesign.com` in `.env.local` and run `npm run deploy`.

The poster is not on R2: it is served from the site itself (`public/media/`) with
a one-year `Cache-Control` from `public/_headers`, because it is the page's
largest paint.

## Media: one-year edge cache

1. Dashboard, open the site's zone, **Caching**, **Cache Rules**, **Create rule**.
2. Rule name: `Media one year`.
3. **Custom filter expression**: Field **Hostname**, Operator **equals**, Value `media.frescainteriordesign.com`.
4. **Cache eligibility**: **Eligible for cache**.
5. **Edge TTL**: **Ignore cache-control header and use this TTL**, **1 year**.
6. **Browser TTL**: **Override origin and use this TTL**, **1 year**.
7. **Deploy**.

With a one-year TTL, never overwrite a file in place: upload a changed film under a
new name (for example `fresca-hero-1080-v2.webm`) and update `content/media.ts`, or
purge the URL under **Caching**, **Configuration**, **Purge Cache**.

## Cloudflare Images (next/image)

Every photo goes through `next/image`, which OpenNext serves with the Worker's
`IMAGES` binding (`wrangler.jsonc`). The binding is turned on per Worker by that
config; there is nothing to switch on per zone. The account does need Cloudflare
Images available: in the dashboard, open **Images** (under Media) and check the
plan on its overview page.

- **Images Free** (the default) includes **5,000 unique transformations per month**.
  A unique transformation is one source image at one set of parameters (width);
  format and quality do not count, and repeats in the same month are counted once.
  Past 5,000, cached sizes keep working but any new size fails with error 9422.
- **Images Paid**: the first 5,000 are included, then $0.50 per 1,000 unique
  transformations per month.

This site has about 30 photos, each requested at a handful of widths, so normal
traffic should use a few hundred unique transformations a month, well inside the
free allowance. Check the monthly count on the Images overview after launch.

## One host: www redirects to the apex

The canonical address is the apex, `https://frescainteriordesign.com` (the value of
`NEXT_PUBLIC_SITE_URL`), with no `www`. Every canonical tag, the sitemap, robots.txt
and the structured data use it. The `www` host must answer with a permanent
redirect to the same path on the apex, so search engines see one site.

This is done in Cloudflare, not in the app: a Redirect Rule runs before the Worker,
so it also covers static files (images, the poster) that never reach Next.

1. Dashboard, open the site's zone, **DNS**, **Records**. Make sure `www` has a
   **proxied** (orange cloud) record. If there is none, add **Type** `AAAA`, **Name**
   `www`, **IPv6 address** `100::`, **Proxy status** Proxied. (The address is a
   placeholder; the redirect answers before anything is fetched.)
2. **Rules**, **Redirect Rules**, **Create rule**. Rule name: `www to apex`.
3. **Custom filter expression**: Field **Hostname**, Operator **equals**, Value
   `www.frescainteriordesign.com`.
4. **Then**: **URL redirect**, Type **Dynamic**, Expression
   `concat("https://frescainteriordesign.com", http.request.uri.path)`,
   Status code **301**, tick **Preserve query string**.
5. **Deploy**.

Check after deploying (both should print `301` and the apex URL):

```
curl -sI https://www.frescainteriordesign.com/privacy | grep -iE "^(HTTP|location)"
curl -sI http://frescainteriordesign.com/ | grep -iE "^(HTTP|location)"
```

The second line checks HTTP to HTTPS: turn on **SSL/TLS**, **Edge Certificates**,
**Always Use HTTPS** if it does not redirect.

Trailing slashes are handled by Next: `/privacy/` answers 308 (permanent) to
`/privacy`. Unknown paths and `/404` answer 404.
