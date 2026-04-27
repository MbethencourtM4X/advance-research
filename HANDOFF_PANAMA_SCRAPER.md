# HANDOFF — Panama Scraper (PanamaCompra / IDAAN) Managed Agent

**To:** Claude Code Agent  
**Project:** advance-research (Windmar-Home/advance-research)  
**Date:** April 27, 2026  
**Status:** READY — implement and push to main

---

## MISSION

Build `scripts/scrape-panama.js` — a managed scraper agent that pulls active IDAAN tender data from PanamaCompra and writes it to `public/central-america-tenders-live.json`. Wire it into the existing GitHub Actions workflow at `.github/workflows/scrape-data.yml` so it runs alongside the Nicaragua and Costa Rica scrapers.

---

## CONTEXT — What You're Joining

This is a live procurement dashboard at https://advance-idan-research.vercel.app. It shows water-sector tenders across Central America for Advance (Somos Advance), a water infrastructure company. The data file `public/central-america-tenders-live.json` is the single source of truth — it's served as a static asset on Vercel.

Currently Panama has **9 manually-seeded tenders**. Your job is to replace those with real scraped data from PanamaCompra on every GitHub Actions run.

---

## PORTAL INTELLIGENCE — What We Know About PanamaCompra

**Portal:** https://www.panamacompra.gob.pa  
**Architecture:** Angular SPA. The entry point is `/Inicio/#/`. The `#/` indicates Angular hash routing — all routes return the same HTML shell; state is client-rendered.

**Key URLs:**
| Purpose | URL |
|---|---|
| SPA entry | `https://www.panamacompra.gob.pa/Inicio/` |
| General search page (all Panama cards point here) | `https://www.panamacompra.gob.pa/Inicio/#/busqueda-avanzada` |
| Advanced search v2 | `https://www.panamacompra.gob.pa/Inicio/#/busqueda-avanzada-v2` |
| Public acts listing | `https://www.panamacompra.gob.pa/Inicio/#/listado-actos-publicos` |
| Business opportunities | `https://www.panamacompra.gob.pa/Inicio/#/oportunidades-de-negocio` |

**Backend:** ASMX web services under `/Security/AmbientePublico.asmx/` and `/Security/index.asmx/`. All known endpoints return HTTP 500 when called directly without a session/CSRF token. Do NOT waste time on direct ASMX calls.

**What works:** Playwright (headless Chromium). The SPA renders when JavaScript executes. XHR interception via `page.on('response')` is the best approach — let the Angular app make its own API calls, intercept the JSON, and extract from there.

---

## TARGET DATA

**Primary institution:** IDAAN (Instituto de Acueductos y Alcantarillados Nacionales) — Panama's national water authority. All 9 existing Panama tenders come from IDAAN. Broaden to any water-related institution if IDAAN alone yields fewer than 5 results.

**Water keywords for filtering:**
```
agua, acueducto, alcantarillado, saneamiento, reactivos, desinfección,
tratamiento, tubería, planta, medidores, IDAAN, AAUD, ASEP, MIVIOT
```

**Output format — each Panama tender must match this shape exactly:**
```json
{
  "id": "2026-1-06-01-99-LP-000012",
  "numero": "2026-1-06-01-99-LP-000012",
  "titulo": "Suministro e instalación de...",
  "entidad": "IDAAN",
  "valor": "89500.00",
  "moneda": "B/.",
  "deadline": "2026-05-15",
  "dias_restantes": 18,
  "estado": "ABIERTA",
  "categoria": "agua",
  "url": "https://www.panamacompra.gob.pa/Inicio/#/busqueda-avanzada",
  "pais": "panama"
}
```

**Notes on field mapping from PanamaCompra API response:**
- `numero` / `id` → look for `num_acto`, `cod_acto`, `num_contratacion`, or `id`
- `titulo` → `des_acto`, `des_objeto`, `nom_acto`, or `descripcion`
- `entidad` → `nom_institucion`, `des_institucion`, or `entidad`
- `valor` → `mto_estimado`, `mon_presupuesto`, or `valor_referencial`
- `deadline` → `fec_apertura`, `fec_cierre`, or `plazo` (normalize to `YYYY-MM-DD`)
- `estado` → `des_estado`, default to `"ABIERTA"` for active tenders
- `categoria` → `tip_contratacion`, `des_tipo`, or `"agua"` as fallback
- `url` → always use static search page: `https://www.panamacompra.gob.pa/Inicio/#/busqueda-avanzada` (Miguel confirmed — no deep-link)

---

## IMPLEMENTATION PLAN

### Step 1 — Playwright scraper (`scripts/scrape-panama.js`)

Use Playwright to navigate to the advanced search page. Set up XHR interception BEFORE navigating (important — responses fire during navigation). Look for any JSON responses containing tender arrays.

```js
// Intercept pattern to try:
page.on('response', async (response) => {
  const url = response.url();
  // Intercept calls to the ASMX backend or any /api/ path
  if (url.includes('AmbientePublico') || url.includes('/api/') || url.includes('actos')) {
    const json = await response.json().catch(() => null);
    if (json) apiCaptures.push({ url, json });
  }
});

await page.goto('https://www.panamacompra.gob.pa/Inicio/#/busqueda-avanzada', {
  waitUntil: 'networkidle',
  timeout: 30000,
});
```

If XHR interception yields results, extract and filter. If not, try:
1. Navigate to `#/oportunidades-de-negocio` — the "business opportunities" listing
2. Navigate to `#/listado-actos-publicos` — public acts listing
3. Wait for any table/list selector and scrape DOM rows

**Selector candidates to try:**
- `table tr`, `.acto-row`, `[class*="licitacion"]`, `[class*="acto"]`, `app-acto`, `.card`

**Search input strategy (if needed):** Find the search field and type `"agua"` to pre-filter results before scraping.

### Step 2 — Fallback to IDAAN institution search

If general search fails, try navigating to a URL with institution pre-filtered:
```
https://www.panamacompra.gob.pa/Inicio/#/busqueda-avanzada?institucion=IDAAN
https://www.panamacompra.gob.pa/Inicio/#/oportunidades-de-negocio?entidad=IDAAN
```
Intercept whatever API calls those routes make.

### Step 3 — Data merge and write

Follow the exact same pattern as `scripts/scrape-nicaragua.js`:
```js
const dataFile = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const prev = dataFile.countries.panama?.tenders || [];
// diff logic: compare prevNums vs newNums
dataFile.countries.panama = { flag: '🇵🇦', tenders: waterTenders };
dataFile.timestamp = new Date().toISOString();
fs.writeFileSync(DATA_FILE, JSON.stringify(dataFile, null, 2), 'utf8');
```

**Critical:** Do NOT overwrite existing Panama tenders with an empty array if scraping fails. Only write if `waterTenders.length > 0`. If zero results, log a warning and `process.exit(1)` — let GitHub Actions treat it as a failure and skip the commit step.

### Step 4 — Wire into GitHub Actions (`.github/workflows/scrape-data.yml`)

Add Panama steps following the same API → Playwright fallback pattern as Nicaragua and Costa Rica:

```yaml
# ── Panama ───────────────────────────────────────────────────────────────
- name: Scrape Panama (PanamaCompra / IDAAN)
  if: ${{ (github.event.inputs.country == 'all' || github.event.inputs.country == 'panama' || github.event_name == 'schedule') && github.event.inputs.use_playwright != 'true' }}
  id: scrape_pa
  run: node scripts/scrape-panama.js
  continue-on-error: true

- name: Install Playwright for Panama fallback
  if: ${{ steps.scrape_pa.outcome == 'failure' && steps.scrape_nic_api.outcome != 'failure' && steps.scrape_cr_api.outcome != 'failure' }}
  run: npx playwright install chromium --with-deps

- name: Scrape Panama Playwright (fallback)
  if: ${{ steps.scrape_pa.outcome == 'failure' || github.event.inputs.use_playwright == 'true' }}
  run: node scripts/scrape-panama-playwright.js
  continue-on-error: true
```

Also update the `workflow_dispatch` country input to include `panama`:
```yaml
description: 'Country to scrape (all | nicaragua | costa_rica | panama)'
```
(Already documented — verify it's still there.)

Also update the workflow summary Python snippet to include `panama` in the output table.

### Step 5 — `scripts/scrape-panama-playwright.js`

Since the ASMX API is session-gated, the Playwright script IS the primary scraper, not just a fallback. You may choose to make `scrape-panama.js` thin (just calls the Playwright script directly) or to try a REST approach first. Given what we know, Playwright-first is fine.

---

## FILES TO CREATE / MODIFY

| Action | File |
|---|---|
| **Create** | `scripts/scrape-panama.js` — main scraper entry point |
| **Create** | `scripts/scrape-panama-playwright.js` — Playwright implementation |
| **Modify** | `.github/workflows/scrape-data.yml` — add Panama steps |
| **No touch** | `public/central-america-tenders-live.json` — written by the script itself |
| **No touch** | `app/tenders/` — data format already handles Panama |

---

## TESTING LOCALLY

```bash
# Prerequisites
npx playwright install chromium

# Run the scraper
node scripts/scrape-panama-playwright.js

# Verify output
node -e "
const d = require('./public/central-america-tenders-live.json');
const p = d.countries.panama.tenders;
console.log('Panama tenders:', p.length);
p.forEach(t => console.log(' -', t.numero, '|', t.titulo?.substring(0,50)));
"
```

**Success criteria:**
- At least 3 real IDAAN tenders in output (not the manually-seeded ones)
- Each tender has: `numero`, `titulo`, `entidad`, `deadline`, `url`
- No fabricated/hardcoded data — if the scrape fails, write zero results and exit 1

---

## EXISTING PATTERNS TO FOLLOW

- Read `scripts/scrape-nicaragua.js` for the API-first + diff + write pattern
- Read `scripts/scrape-costa-rica-playwright.js` for the Playwright XHR-intercept pattern
- Read `.github/workflows/scrape-data.yml` for the step structure and `continue-on-error` pattern

---

## HARD RULES

1. **No fabricated data.** If the scraper can't reach PanamaCompra or gets 0 results, exit 1. Do NOT write hardcoded tenders.
2. **No secrets in code.** PanamaCompra is public — no credentials needed. If a login wall appears, flag it instead of hardcoding credentials.
3. **Preserve existing data on failure.** Only overwrite `countries.panama.tenders` when `waterTenders.length > 0`.
4. **URL field is always the static search page** — `https://www.panamacompra.gob.pa/Inicio/#/busqueda-avanzada`. No per-tender deep links (they don't exist on this SPA).
5. **Don't push to prod directly** — the GitHub Actions workflow auto-commits to main when data changes. Local test runs should NOT commit.

---

## COMMIT MESSAGE

```
feat(scraper): Panama PanamaCompra/IDAAN managed scraper

Adds scripts/scrape-panama.js + scrape-panama-playwright.js. Playwright-first
approach (ASMX API is session-gated). XHR interception on busqueda-avanzada
and oportunidades-de-negocio routes. Filters to IDAAN and water-keyword tenders.
Wired into scrape-data.yml with continue-on-error and Playwright install step.
Replaces the 9 manually-seeded Panama tenders with live data.
```

---

## BLOCKERS / UNKNOWNS

| Unknown | How to resolve |
|---|---|
| Exact XHR endpoint that serves tender listings | Run Playwright with `slowMo: 200`, log all intercepted URLs with their response size, pick the largest one |
| Whether `networkidle` reliably fires after Angular hydration | If results are empty, try `waitForSelector` on a known element instead |
| Whether IDAAN tenders show on the public search page without login | If yes, Playwright works. If a login wall appears, flag to Miguel — may need institution-specific scraping strategy |
| PanamaCompra field names in JSON response | Log the raw first item from the intercept, map fields manually |

---

## CONTACT

Questions → Miguel (miguel@m4xdigital.com). He owns the Windmar-Home GitHub org and the Vercel project `advance-idan-research` (team: `miguel-1122s-projects`).
