# HANDOFF — Advance IDAN Portal (Ada Vance)

## Skill Index

> Quick-scan reference: every skill cited in this document and the one thing it's for here.

| Skill | Use it for |
|---|---|
| `product-marketing-context` | **STEP 0** — create the shared ICP/positioning file that all downstream skills pull from |
| `programmatic-seo` | Generate SEO-optimized pages at scale (one page per tender / country / category) |
| `schema-markup` | Add JSON-LD structured data to tender entries for rich results in Google |
| `seo-audit` | Diagnose broken Costa Rica links, missing meta tags, crawl errors |
| `ai-seo` | Optimize tender content to appear in ChatGPT / Perplexity / AI Overview citations |
| `site-architecture` | Plan URL structure, internal linking, and page hierarchy for the tender directory |
| `page-cro` | Improve UX conversion on the portal — modals, CTAs, empty states, mobile layout |
| `copy-editing` | Refresh/polish bilingual UI copy without a full rewrite |
| `copywriting` | Rewrite hero, value prop, or any cold-start copy from scratch |
| `analytics-tracking` | Set up GA4 events, conversion tracking, UTMs, and reporting dashboard |
| `ab-test-setup` | Design and measure experiments (e.g. detail modal vs inline expansion) |
| `onboarding-cro` | Optimize the "favorites" and persistent saved-tender experience |
| `email-sequence` | Build automated email alert programs for saved/new tenders |
| `customer-research` | ICP / JTBD / review mining to sharpen the Advance buyer profile |
| `competitor-alternatives` | **Candidate** — comparison view (2–3 tenders side-by-side) may fit this pattern |
| `xlsx` | Export tender data to Excel format |
| `marketing-psychology` | Apply persuasion principles to urgency indicators, CTA copy, save prompts |

---

**To:** Claude Code Agent  
**From:** Max (Chief of Staff)  
**Date:** April 25, 2026  
**Status:** READY FOR HANDOFF

---

## MISSION
Improve, optimize, and expand the Advance IDAN Portal (procurement dashboard for Central America water tenders).

## CURRENT STATE

### ✅ What's Live
- **URL:** https://advance-idan-research.vercel.app
- **Codebase:** ~/Projects/advance-research (Next.js 16)
- **Tech Stack:** React, Next.js, Vercel, GitHub
- **Data:** 19 real tenders (9 Panama IDAAN + 10 Costa Rica)

### 📊 Current Features
- ✅ Search by keyword
- ✅ Filter by country, value, deadline
- ✅ Mark tenders as "Guardados" (save)
- ✅ CSV export
- ✅ Urgency indicators (red < 7 days)
- ✅ Dark theme, mobile responsive
- ✅ Bilingual (ES/EN)
- ✅ Clickable links to government portals

### 🔴 Known Issues
1. **Costa Rica links** — Search redirect, not direct tender page
   **Skills to invoke:** `seo-audit`, `site-architecture`
   **Why:** Broken/redirect links are a crawl-error class in technical SEO; direct URL mapping is a site-architecture decision.

2. **Nicaragua data** — Needs real scraper output
   **Skills to invoke:** none — outside marketing skill catalog (data acquisition / scraper engineering applies)
   **Why:** Scraper development and data pipeline work have no marketing skill equivalent.

3. **El Salvador** — Pending credentials
   **Skills to invoke:** none — outside marketing skill catalog (credentials / data access governance applies)
   **Why:** Credential management and vendor access are operational/engineering concerns.

4. **UX/UI** — Basic, can be polished
   **Skills to invoke:** `page-cro`, `copy-editing`, `copywriting`
   **Why:** Portal polish maps directly to conversion-surface optimization; bilingual text benefits from copy-editing before a full rewrite.

5. **Performance** — Not optimized
   **Skills to invoke:** none — outside marketing skill catalog (general engineering / Lighthouse optimization applies)
   **Why:** Bundle size, code splitting, and render performance are frontend engineering concerns.

6. **Accessibility** — Basic WCAG compliance
   **Skills to invoke:** none — outside marketing skill catalog (WCAG / a11y engineering applies)
   **Why:** WCAG AA compliance is a standards-based engineering task with no marketing skill equivalent.

### 📁 Key Files
- **App:** `app/tenders/page.js` (1000+ lines, inline CSS)
- **Data:** `public/central-america-tenders-live.json`
- **Config:** `next.config.js`, `package.json`, `config/advance-keywords.js`
- **Styles:** Inline CSS (no Tailwind)

### 🔑 Municipal Tender Keyword Filter
Advance only bids on tenders related to water systems and chemical reagents. Municipal-source tenders (any source key NOT in `NATIONAL_PORTAL_KEYS`) are filtered to only those matching `ACTIVE_KEYWORDS` in `config/advance-keywords.js` — currently `["agua", "reactivos"]`. National portals (PanamaCompra, SICOP, SISCAE, ANDA) are shown unfiltered. To add a keyword, move a candidate from the commented list in that file into `ACTIVE_KEYWORDS` after confirming with Miguel. The filter is currently a no-op since all data comes from national portals; it activates automatically when municipal sources are wired in.

---

## WHAT TO IMPROVE (PRIORITY ORDER)

### P0 — Code Quality
- [ ] Refactor `page.js` into components (TenderCard, FilterPanel, Header)
- [ ] Move inline CSS to CSS modules or Tailwind
- [ ] Extract logic into hooks (useTenders, useFilters, useSaved)
- [ ] Add TypeScript types
- [ ] Clean up duplicated code

**Skills to invoke:** none — outside marketing skill catalog (React component architecture, TypeScript, and CSS tooling apply)
**Why:** P0 is pure frontend engineering — refactoring, typing, and styling system decisions have no marketing skill analog.

### P1 — UX/UI Improvements
- [ ] Add empty state animations
- [ ] Add loading skeletons
- [ ] Improve mobile layout (buttons, spacing)
- [ ] Add tender detail modal (click card → detail view)
- [ ] Add sorting options (deadline, value, date added)
- [ ] Add "favorite" persistent list
- [ ] Toast notifications (save, filter feedback)

**Skills to invoke:** `page-cro`, `ab-test-setup`, `onboarding-cro`, `marketing-psychology`
**Why:** Empty states, modal UX, and CTAs are conversion-surface decisions; the detail modal is a strong A/B test candidate (modal vs inline expand); the favorites list is an activation/retention feature that `onboarding-cro` covers; urgency indicators and save prompts benefit from `marketing-psychology` persuasion principles.

### P2 — Features
- [ ] Add export to Excel (not just CSV)
- [ ] Add tender notifications (email alerts for saved tenders)
- [ ] Add email sharing (send tender list to team)
- [ ] Add calendar view (deadline timeline)
- [ ] Add comparison view (compare 2-3 tenders side-by-side)

**Skills to invoke:** `xlsx`, `email-sequence`, `competitor-alternatives` **candidate — verify scope before invoking**
**Why:** Excel export maps to the `xlsx` skill; email alerts for saved tenders are a triggered `email-sequence`; comparison view may fit the `competitor-alternatives` side-by-side format — verify that skill's scope covers non-competitor content before invoking; calendar view is a UI/engineering concern with no matching skill.

### P3 — Data & Integration
- [ ] Fix Costa Rica links (get direct tender URLs via API)
- [ ] Nicaragua scraper integration
- [ ] Real-time data updates
- [ ] Add tender history (track new/updated tenders)

**Skills to invoke:** `seo-audit` (for the Costa Rica link fix), `programmatic-seo` **candidate — verify scope before invoking**
**Why:** Direct tender URLs are a crawlability fix that `seo-audit` diagnoses; once real URLs exist, `programmatic-seo` could generate one SEO page per tender — verify that the data pipeline is stable before invoking; scraper integration and real-time updates are engineering-only concerns.

### P4 — Performance & SEO
- [ ] Lighthouse optimization (target 90+)
- [ ] Image optimization
- [ ] Code splitting
- [ ] SEO (meta tags, structured data)
- [ ] PWA support (offline capability)

**Skills to invoke:** `programmatic-seo`, `schema-markup`, `seo-audit`, `ai-seo`, `site-architecture`
**Why:** The tender directory is a textbook programmatic-SEO surface (one page per tender/country/category); `schema-markup` adds JSON-LD for rich results on individual tender pages; `seo-audit` catches missing meta tags and crawl issues; `ai-seo` targets ChatGPT/Perplexity citations for procurement queries; `site-architecture` defines the URL hierarchy and internal linking before any page generation begins. Lighthouse, image optimization, code splitting, and PWA are engineering concerns outside the catalog.

---

## YOUR AUTHORITY
**Tier 1 (Auto-handle):**
- Refactor code
- Add components
- Improve UX/UI
- Add features
- Optimize performance
- Fix bugs

**Tier 2 (Brief → Proceed):**
- Change data structure
- Modify API/scraper integration
- Deploy changes

**Tier 3 (Always Ask):**
- Any external commitments
- Spending/resource allocation

---

## SUCCESS CRITERIA
- [ ] Code is modular (components, not 1000-line file)
- [ ] Lighthouse score > 90
- [ ] WCAG AA compliant
- [ ] Mobile UX is polished
- [ ] Loading states present
- [ ] No console errors
- [ ] All tenders clickable + functional
- [ ] Performance improved (load time < 2s)

**Skills to invoke:** `analytics-tracking`, `page-cro`
**Why:** `analytics-tracking` instruments the measurable criteria (load time, conversion events, Core Web Vitals baseline); `page-cro` addresses mobile UX polish and loading-state experience. Code modularity, Lighthouse score, WCAG compliance, console errors, and render performance are engineering criteria outside the catalog.

---

## CONSTRAINTS
- No Chinese AI models (DeepSeek, Qwen, Baidu prohibited)
- No external API calls without approval
- Keep data structure compatible with scraper
- Maintain bilingual (ES/EN) support
- Auto-deploy on git push to Vercel

**Skills to invoke:** none — outside marketing skill catalog (governance, engineering, and deployment constraints apply)
**Why:** All constraints here are operational/engineering rules with no marketing skill equivalent.

---

## NEXT STEPS
1. Review current code (~/Projects/advance-research/app/tenders/page.js)
2. Propose refactor plan (components, structure, styling)
3. Implement P0 (code quality)
4. Implement P1 (UX improvements)
5. Deploy + validate
6. Report results

**Skills to invoke:** `product-marketing-context` (run before step 4), `page-cro` (step 4), `analytics-tracking` (steps 5–6)
**Why:** Run `product-marketing-context` first so the ICP/positioning file is in place before any UX copy decisions in step 4; `page-cro` guides the P1 UX implementation choices; `analytics-tracking` ensures the deploy validation in step 5 and results reporting in step 6 have measurable baselines. Steps 1–3 are code review and engineering tasks outside the catalog.

---

## CONTEXT
- **Client:** Somos Advance (water utilities + government contractor financing)
- **User:** Advance team (using portal to track water procurement)
- **Data Source:** Panama (panamacompra.gob.pa), Costa Rica (SICOP), Nicaragua (SISCAE)
- **Daily Pipeline:** Automated scraper runs 06:00, 06:30, 07:00, 08:00 AST
- **Owner:** Miguel Bethencourt (@MbethencourtM4X)

**Skills to invoke:** `product-marketing-context`, `customer-research`
**Why:** The client/user context here is exactly the ICP and JTBD input that `product-marketing-context` formalizes into a shared file; `customer-research` can mine procurement forums, G2-equivalent sources, and Advance team feedback to sharpen the buyer profile before any copy or feature decisions are made downstream.

---

## READY?
- ✅ Codebase is clean and accessible
- ✅ Current version is functional
- ✅ All data is live and real
- ✅ GitHub repo is active
- ✅ Vercel deployment is automatic

**Go build something great.** 🚀
