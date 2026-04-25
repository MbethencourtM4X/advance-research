# HANDOFF — Advance IDAN Portal (Ada Vance)
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
2. **Nicaragua data** — Needs real scraper output
3. **El Salvador** — Pending credentials
4. **UX/UI** — Basic, can be polished
5. **Performance** — Not optimized
6. **Accessibility** — Basic WCAG compliance

### 📁 Key Files
- **App:** `app/tenders/page.js` (1000+ lines, inline CSS)
- **Data:** `public/central-america-tenders-live.json`
- **Config:** `next.config.js`, `package.json`
- **Styles:** Inline CSS (no Tailwind)

---

## WHAT TO IMPROVE (PRIORITY ORDER)

### P0 — Code Quality
- [ ] Refactor `page.js` into components (TenderCard, FilterPanel, Header)
- [ ] Move inline CSS to CSS modules or Tailwind
- [ ] Extract logic into hooks (useTenders, useFilters, useSaved)
- [ ] Add TypeScript types
- [ ] Clean up duplicated code

### P1 — UX/UI Improvements
- [ ] Add empty state animations
- [ ] Add loading skeletons
- [ ] Improve mobile layout (buttons, spacing)
- [ ] Add tender detail modal (click card → detail view)
- [ ] Add sorting options (deadline, value, date added)
- [ ] Add "favorite" persistent list
- [ ] Toast notifications (save, filter feedback)

### P2 — Features
- [ ] Add export to Excel (not just CSV)
- [ ] Add tender notifications (email alerts for saved tenders)
- [ ] Add email sharing (send tender list to team)
- [ ] Add calendar view (deadline timeline)
- [ ] Add comparison view (compare 2-3 tenders side-by-side)

### P3 — Data & Integration
- [ ] Fix Costa Rica links (get direct tender URLs via API)
- [ ] Nicaragua scraper integration
- [ ] Real-time data updates
- [ ] Add tender history (track new/updated tenders)

### P4 — Performance & SEO
- [ ] Lighthouse optimization (target 90+)
- [ ] Image optimization
- [ ] Code splitting
- [ ] SEO (meta tags, structured data)
- [ ] PWA support (offline capability)

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

---

## CONSTRAINTS
- No Chinese AI models (DeepSeek, Qwen, Baidu prohibited)
- No external API calls without approval
- Keep data structure compatible with scraper
- Maintain bilingual (ES/EN) support
- Auto-deploy on git push to Vercel

---

## NEXT STEPS
1. Review current code (~/Projects/advance-research/app/tenders/page.js)
2. Propose refactor plan (components, structure, styling)
3. Implement P0 (code quality)
4. Implement P1 (UX improvements)
5. Deploy + validate
6. Report results

---

## CONTEXT
- **Client:** Somos Advance (water utilities + government contractor financing)
- **User:** Advance team (using portal to track water procurement)
- **Data Source:** Panama (panamacompra.gob.pa), Costa Rica (SICOP), Nicaragua (SISCAE)
- **Daily Pipeline:** Automated scraper runs 06:00, 06:30, 07:00, 08:00 AST
- **Owner:** Miguel Bethencourt (@MbethencourtM4X)

---

## READY?
- ✅ Codebase is clean and accessible
- ✅ Current version is functional
- ✅ All data is live and real
- ✅ GitHub repo is active
- ✅ Vercel deployment is automatic

**Go build something great.** 🚀

