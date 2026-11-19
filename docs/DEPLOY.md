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
