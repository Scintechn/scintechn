# Postmark domain verification — `scintechn.com`

**Status:** Pending — currently using single-sender verification on `development@scintechn.com`.
**Owner:** Operator (DNS work happens on the domain registrar, not in this repo).
**Estimated time:** 15 minutes of work + 5–30 minutes of DNS propagation.

---

## Why bother

We currently send transactional email through Postmark using a **single Sender Signature** verified on `development@scintechn.com`. That works, but:

- We can only send *from* that one address. Adding `hello@`, `no-reply@`, `contact@` etc. would require a fresh verification each time.
- DKIM signing is on Postmark's shared infrastructure rather than our domain, which lowers inbox placement vs Gmail/Outlook spam filters.
- If we ever switch ESPs (Resend, AWS SES, Sendgrid), the new provider can pick up the same verified domain without us setting up sender signatures again.

Verifying the full domain solves all three.

---

## Step 1 — Add the domain in Postmark

1. Postmark dashboard → **Sender Signatures** → **Add Domain**
2. Enter `scintechn.com`
3. Postmark generates two DNS records you'll need to copy:
   - **DKIM TXT record** — name like `pm._domainkey.scintechn.com`, value is a long string starting with `k=rsa; p=...`
   - **Return-Path CNAME** — name like `pm-bounces.scintechn.com`, value is `pm.mtasv.net` (or similar)

Leave the Postmark page open in a tab — you'll come back to click **Verify** once DNS is in place.

---

## Step 2 — Add the DNS records

Add these to the `scintechn.com` zone at your DNS provider (Cloudflare based on prior project context).

### DKIM TXT record

| Field | Value |
|---|---|
| Type | TXT |
| Name | `pm._domainkey` (Postmark may use a different selector — copy from their UI) |
| Content | the full `k=rsa; p=...` string from Postmark |
| TTL | Auto / 300s |
| Proxy status (Cloudflare) | **DNS only** (orange cloud OFF) — TXT records aren't proxiable but Cloudflare's UI sometimes confuses this |

> ⚠ **Cloudflare gotcha:** Cloudflare's UI sometimes auto-quotes long TXT values, which breaks the DKIM signature. Paste the value as-is, do **not** wrap it in additional `"..."`. After saving, click into the record and verify the value is exactly what Postmark gave you with no extra quotes.

### Return-Path CNAME record

| Field | Value |
|---|---|
| Type | CNAME |
| Name | `pm-bounces` (or whatever Postmark says) |
| Content | `pm.mtasv.net` |
| TTL | Auto / 300s |
| Proxy status (Cloudflare) | **DNS only** (orange cloud OFF) — CNAMEs to mail providers must be unproxied |

### Optional but recommended — SPF record

If `scintechn.com` doesn't already have an SPF record (common for newer domains), add one:

| Field | Value |
|---|---|
| Type | TXT |
| Name | `@` (root) |
| Content | `v=spf1 include:spf.mtasv.net ~all` |

If an SPF record already exists, **merge the include** rather than adding a second record (multiple SPF records = automatic fail). Existing record might look like `v=spf1 ...other includes... ~all` — change to `v=spf1 ...other includes... include:spf.mtasv.net ~all`.

---

## Step 3 — Verify in Postmark

1. Go back to the Postmark Sender Signatures page (the tab you left open).
2. Click **Verify** next to your `scintechn.com` domain.
3. Postmark checks DNS. If DKIM and Return-Path resolve correctly, the domain status flips to **Verified** within a few minutes. If DNS hasn't propagated yet, Postmark will say "pending" — wait 10 minutes and click again.

---

## Step 4 — Update the application sender (optional)

After the domain is verified, you can switch from `development@scintechn.com` to a more public-facing address.

Recommended: `hello@scintechn.com` for outbound transactional, or `no-reply@scintechn.com` if you want to discourage replies.

Where to update:

1. **Vercel env (Production + Preview)** — change `POSTMARK_FROM_EMAIL` to the new address. **No code change needed.**
2. Redeploy (or wait for the next push).

The contact route (`app/api/contact/route.ts`) and Spark email (`lib/spark-email.ts`) both read `POSTMARK_FROM_EMAIL` from env and pass it to `lib/postmark.ts`'s `sendPostmarkEmail()`. They don't care which verified address they're sending from.

---

## Step 5 — Smoke test

Send a real test plan via the production Spark form:

1. Visit `https://scintechn.com/en`
2. Submit a real idea + your email
3. Check that the plan email lands in your inbox (not spam)
4. In Gmail: **More → Show original** → look for `dkim=pass header.i=@scintechn.com` in the headers. If you see `dkim=pass header.i=@pmbounces.com` (Postmark's domain), DKIM signing is still on Postmark infrastructure — domain verification didn't fully take. Re-check the DNS records.

---

## Rollback / fallback

If anything goes wrong, the single-sender signature on `development@scintechn.com` keeps working as long as `POSTMARK_FROM_EMAIL` points at it. To rollback, just leave `POSTMARK_FROM_EMAIL=development@scintechn.com` in Vercel env and the existing DNS-less flow continues.

The DNS records added in Step 2 are harmless if not used — they don't affect any other email service. You can leave them in place even if you decide not to switch the From address.

---

## Why this isn't automated in the repo

DNS work happens at the domain registrar, not in this codebase. There's no Terraform / Pulumi / Cloudflare-API setup here, and adding one for a single set of records would be over-engineered. If we ever scale to managing many domains or many email providers, revisit and codify.

---

## Related references

- `lib/postmark.ts` — the wrapper that sends via Postmark's HTTP API
- `lib/spark-email.ts` — Spark plan render
- `app/api/contact/route.ts` — contact form route
- `CLAUDE.md` § *Forms & API* — env var documentation
- Postmark docs: <https://postmarkapp.com/support/article/1014-how-do-i-set-up-dns-records-for-postmark>
