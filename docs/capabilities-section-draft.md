# Capabilities section — draft

**Status:** draft for approval. Nothing implemented yet.
**Date:** 2026-08-17
**Scope:** one new page section (`#capabilities`), nav entry, EN/PT copy, analytics events.

---

## 1. The gap this closes

The page today shows *what we built* (Work) and *how we work* (Approach). It never states **what
the company delivers**. A visitor has to infer the service offer from five product cards — which
means the site currently reads as a portfolio, not as a firm you can hire.

That inference costs us in a specific way: everything on the page implies "we build products from
scratch." A buyer who needs their existing tools wired together, an agent inside their CRM, or a
manual process automated has no signal that we do that work at all. The capability exists; the page
doesn't say so.

A capabilities section fixes that and does three more things:

1. **Lowers the entry ticket.** A single automation or integration is a far easier first purchase
   than a full product build. It converts buyers who would otherwise leave.
2. **Gives Spark's small leads somewhere to land.** Ideas that come back too small for a 4-week
   build are automation work, and today they fall out of the funnel.
3. **Creates recurring revenue.** Run & Support is a monthly relationship, not a one-off project.

---

## 2. Positioning

The section states the company's delivery surface as four capabilities that compose:

> **Built, integrated, automated, and kept running.**

Most engagements use more than one. Saying so up front is the commercial point — it moves the
conversation from "can you build this?" to "which parts do we start with?", and it makes the
retainer feel like part of the offer rather than an upsell after launch.

**Section name:** "Capabilities" in nav, "What we deliver" as the plain-language framing in copy.

---

## 3. The four capabilities

| # | Capability | What it sells |
|---|---|---|
| 1 | **AI Product Engineering** | The existing offer, finally stated as an offer instead of implied by the portfolio. |
| 2 | **Automation & AI Agents** | The new surface — n8n, Make, Salesforce Agentforce, GoHighLevel. Lowest entry ticket. |
| 3 | **Integrations** | Payments, messaging, CRM. Frequently the real reason a client calls, and a natural doorway into 1 and 2. |
| 4 | **Run & Support** | Monthly cadence. The recurring-revenue line and the seat inside the client's operation. |

Ordered deliberately: the strongest proven claim first, the new market second while attention is
still high, plumbing third, and the ongoing relationship last so it reads as the natural end state.

Automation and Agents carries the most platform detail of the four, since it's the capability the
page has never communicated and the one with the widest buyer pool.

---

## 4. Copy — EN (master)

```
eyebrow:   Capabilities
title:     Built, integrated, automated, and kept running.
subtitle:  Four capabilities, one delivery team. Most engagements use more than one —
           we scope them together so nothing falls between vendors.

items.product.title:        AI Product Engineering
items.product.description:  Multi-tenant SaaS with AI in the product, not bolted onto it.
                            Auth, billing, tenancy, dashboards — the parts every product
                            needs, already solved and shipped five times over.
items.product.stack:        Next.js · TypeScript · PostgreSQL · Vercel AI SDK · OpenRouter · Stripe

items.automation.title:       Automation & AI Agents
items.automation.description: The work that happens between your tools — lead routing,
                              follow-up, document handling, reporting, escalation. Built as
                              workflows on n8n or Make, or as agents working inside the CRM
                              your team already lives in.
items.automation.stack:       n8n · Make · Salesforce Agentforce · GoHighLevel · Webhooks & APIs

items.integrations.title:       Integrations
items.integrations.description: Payments, messaging and CRM wired into one operation. Money
                                through Stripe, conversation through WhatsApp, pipeline
                                through Salesforce or GoHighLevel — one system of record
                                instead of five that disagree.
items.integrations.stack:       Stripe Connect · WhatsApp / Evolution API · Salesforce · Supabase · REST

items.run.title:        Run & Support
items.run.description:  Shipping is the start. We deploy, monitor, own the error runbook and
                        keep improving on a monthly cadence — so nothing quietly breaks when
                        the tools around it change.
items.run.stack:        Vercel · CI/CD · Playwright · Vitest · Monitoring

footnote:  Most engagements start with one capability and grow into the others.
cta:       Talk about your requirement
```

## 5. Copy — PT (mirror)

```
eyebrow:   Capacidades
title:     Construído, integrado, automatizado e mantido no ar.
subtitle:  Quatro capacidades, um time de entrega. A maioria dos projetos usa mais de uma —
           escopamos juntas para que nada caia no vão entre fornecedores.

items.product.title:        Engenharia de Produto com IA
items.product.description:  SaaS multi-tenant com IA dentro do produto, não pendurada nele.
                            Autenticação, cobrança, tenancy, dashboards — as partes que todo
                            produto precisa, já resolvidas e entregues cinco vezes.
items.product.stack:        Next.js · TypeScript · PostgreSQL · Vercel AI SDK · OpenRouter · Stripe

items.automation.title:       Automação & Agentes de IA
items.automation.description: O trabalho que acontece entre as suas ferramentas — distribuição
                              de leads, follow-up, tratamento de documentos, relatórios,
                              escalonamento. Construído como fluxos no n8n ou Make, ou como
                              agentes dentro do CRM onde seu time já trabalha.
items.automation.stack:       n8n · Make · Salesforce Agentforce · GoHighLevel · Webhooks & APIs

items.integrations.title:       Integrações
items.integrations.description: Pagamentos, mensagens e CRM ligados em uma operação só.
                                Dinheiro pelo Stripe, conversa pelo WhatsApp, pipeline pelo
                                Salesforce ou GoHighLevel — um sistema de registro em vez de
                                cinco que se contradizem.
items.integrations.stack:       Stripe Connect · WhatsApp / Evolution API · Salesforce · Supabase · REST

items.run.title:        Operação & Suporte
items.run.description:  Entregar é o começo. Fazemos deploy, monitoramos, assumimos o runbook
                        de erros e seguimos evoluindo em cadência mensal — para que nada
                        quebre em silêncio quando as ferramentas ao redor mudam.
items.run.stack:        Vercel · CI/CD · Playwright · Vitest · Monitoramento

footnote:  A maioria dos projetos começa com uma capacidade e cresce para as outras.
cta:       Conversar sobre o seu requisito
```

---

## 6. Component spec

**File:** `components/Capabilities.tsx` — `'use client'` (Framer Motion `useInView`, same as
`Work.tsx` / `Approach.tsx`).

```tsx
<section id="capabilities" className="py-24 md:py-32 bg-secondary/60" ref={ref}>
  <div className="container mx-auto px-4">
```

**Header block** — identical to `Work.tsx:52–67`: `max-w-3xl mb-16`, mono eyebrow
(`text-xs font-semibold uppercase tracking-[0.18em] text-primary`), `h2` at
`text-3xl md:text-5xl font-bold tracking-tight leading-[1.05] text-balance`, `text-lg
text-muted-foreground` subtitle.

**Capability grid** — `grid grid-cols-1 md:grid-cols-2 gap-6`, staggered `delay: index * 0.1`.
Card structure borrows `Approach.tsx`'s icon treatment and `Work.tsx`'s stack-chip footer, which
keeps it visibly part of the same system while reading as its own thing:

```tsx
<motion.article className="flex flex-col rounded-xl border border-border bg-card p-6 md:p-8">
  <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary mb-5">
    <Icon className="h-5 w-5" />
  </div>
  <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
  <p className="text-base text-muted-foreground leading-relaxed mb-6 flex-grow">{description}</p>
  <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
    {stack.map((tech) => (
      <span className="font-mono inline-flex items-center rounded-md bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
        {tech}
      </span>
    ))}
  </div>
</motion.article>
```

Icons (lucide, already installed): `Boxes` (product), `Workflow` (automation), `Plug` (integrations),
`Activity` (run & support).

**Stack chips** are hardcoded in the component as arrays — same pattern as `products[]` in
`Work.tsx:16–42` — not in translations. Tool names are identical across locales, and keeping them
out of `messages/*.json` avoids two files drifting on a list that changes often. The `· ` separators
in §4/§5 are for readability in this draft only; the component renders one chip per tool.

**Closing row** — footnote (`text-sm text-muted-foreground`) and CTA anchored to `#contact`, styled
as the hero primary button, firing `cta_click` with `location: 'capabilities'`.

**Design-system compliance**

- Violet appears once: the eyebrow, plus the established `bg-primary/10` icon chip. No gradient, no
  tint of the accent, no second accent colour.
- Cards `bg-card` on the `bg-secondary/60` band; no `#FFFFFF` ground anywhere.
- Mono reserved for eyebrow and chips; Inter Tight for everything else.
- Existing rhythm: `py-24 md:py-32`, `gap-6`, `mb-16`.
- `prefers-reduced-motion` handled the way `Spark.tsx` does it.

---

## 7. Placement and the background band

Proposed order:

```
Header → Hero → Spark → Work → Capabilities → Approach → About → Contact
```

After Work, because the portfolio earns the right to make a breadth claim — five shipped products
first, then "and here's the full surface we deliver on." Before Approach, so Approach's delivery
promises land as covering *all four* capabilities rather than product builds only.

**Background conflict.** The page uses exactly one tinted band today: `Approach` at
`bg-secondary/60`. A second tinted band directly above it makes one heavy block.

**Recommendation:** Capabilities takes `bg-secondary/60`; flip `Approach` to `bg-background`
(one-line change at `Approach.tsx:21`). The page still has a single tinted band, moved one section
up, and the tint does real work — it separates "what we deliver" from the portfolio grid above it.

Alternative: Capabilities on `bg-background` and Approach untouched — costs the section its
separation from Work, since two card grids on Paper run together.

**Nav:** add `#capabilities` labelled "Capabilities" / "Capacidades", between Work and Approach.
Four links plus the CTA on desktop; the mobile sheet is stacked, so no width pressure.

---

## 8. i18n key tree

Added identically to `messages/en.json` and `messages/pt.json` — next-intl throws at runtime if a
key is missing in one locale. Verify with the `jq` parity diff in CLAUDE.md.

```
capabilities.eyebrow
capabilities.title
capabilities.subtitle
capabilities.items.{product,automation,integrations,run}.{title,description}
capabilities.footnote
capabilities.cta
nav.capabilities
```

Stack chips are intentionally absent — see §6.

---

## 9. Analytics

Consistent with `lib/analytics.ts` (fans out to GTM dataLayer + Vercel Analytics). All events carry
`locale`.

| Event | Fires when | Props |
|---|---|---|
| `capabilities_view` | Section enters viewport (once) | `locale` |
| `capability_view` | Card enters viewport (once, per card) | `capability`, `locale` |
| `cta_click` | Closing CTA clicked | `location: 'capabilities'`, `label: 'talk_requirement'`, `destination: '#contact'`, `locale` |

`capability_view` is the one worth having: it tells us which capability actually holds attention,
which is the input for deciding whether Automation deserves its own dedicated section later.

The CTA should also write a sessionStorage prefill for the contact form the way Spark's "Talk to us
about this →" does, carrying a `from_capabilities` flag alongside the existing `from_spark` so the
funnel report can separate the doors.

---

## 10. Follow-ups (not in this draft)

- **Automation case in Work.** The portfolio is the proof engine; an automation engagement shown
  there would do more for the automation claim than any capability copy. FlowDeski already ships
  automation rules and WhatsApp messaging in production and could be re-cut to lead with that.
- **Spark → automation routing.** When a submitted idea comes back small, point the result panel at
  `#capabilities` instead of only offering a build plan. Touches the Spark prompt and validator, so
  it deserves its own pass.
- **A dedicated Automation section**, if `capability_view` shows the automation card carrying the
  section. That's the version with an offer ladder and per-platform depth — worth building on
  evidence, not ahead of it.

---

## 11. Implementation phases (not started)

| Phase | Work | Verify |
|---|---|---|
| 1 | `messages/{en,pt}.json` key trees + `nav.capabilities` | `jq` parity diff passes |
| 2 | `components/Capabilities.tsx`, mount in `app/[locale]/page.tsx`, nav link in `Header.tsx`, `Approach.tsx` background flip | `npm run build`; both locales at 3 breakpoints |
| 3 | Analytics events + contact prefill wiring | `dataLayer` entries in console; prefill drains into the form |
| 4 | `CLAUDE.md` section-order + analytics updates; `README.md` site-features line | — |
