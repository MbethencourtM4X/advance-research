#!/usr/bin/env node
/**
 * SICOP Costa Rica — Playwright fallback scraper
 * Use when the REST API (/apiRest/) requires auth or returns empty.
 *
 * Run: node scripts/scrape-costa-rica-playwright.js
 *
 * Prerequisite: npx playwright install chromium
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'public', 'central-america-tenders-live.json');
const SICOP_URL = 'https://www.sicop.go.cr';

// Water authority institution codes in SICOP
const WATER_KEYWORDS = [
  'agua', 'acueducto', 'alcantarillado', 'saneamiento', 'AyA', 'SENARA',
  'ASADAS', 'hidráulico', 'planta de tratamiento', 'pozo',
];

function isWater(text) {
  return WATER_KEYWORDS.some((kw) => (text || '').toLowerCase().includes(kw.toLowerCase()));
}

async function scrapeSicop() {
  console.log('🇨🇷 Playwright: Starting SICOP Costa Rica scrape...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (compatible; AdvanceBot/1.0)',
  });
  const page = await context.newPage();

  // Intercept API responses
  const apiResponses = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/apiRest/') || url.includes('/api/') || url.includes('.json')) {
      try {
        const body = await response.json().catch(() => null);
        if (body && (Array.isArray(body) || body.content || body.data)) {
          apiResponses.push({ url, body });
        }
      } catch { /* skip non-JSON */ }
    }
  });

  try {
    // SICOP public tender search — no login required for listing
    const SEARCH_URL = `${SICOP_URL}/app/module/bid/public/tenders`;
    await page.goto(SEARCH_URL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log(`  Loaded: ${page.url()}`);

    // Wait for results
    await page.waitForSelector('table, .tender-list, [class*="licitacion"], [class*="bid"]', {
      timeout: 15000,
    }).catch(() => console.warn('  No table found — trying API intercepts'));

    // If we got API data from the page load, use it
    if (apiResponses.length > 0) {
      console.log(`  Got ${apiResponses.length} API responses from page load`);
      const best = apiResponses.reduce((a, b) => {
        const aLen = Array.isArray(a.body) ? a.body.length : (a.body?.content?.length || 0);
        const bLen = Array.isArray(b.body) ? b.body.length : (b.body?.content?.length || 0);
        return bLen > aLen ? b : a;
      });
      const items = Array.isArray(best.body) ? best.body : best.body.content || best.body.data || [];
      console.log(`  Best response: ${best.url} → ${items.length} items`);

      const waterTenders = items
        .filter((t) => isWater(JSON.stringify(t)))
        .map((t, idx) => {
          const numero = t.cod_expediente || t.num_contratacion || t.id || `CR-${idx}`;
          const titulo = t.des_objeto_contratacion || t.nom_contratacion || '';
          const entidad = t.des_nombre_institucion || t.nom_institucion || '';
          const deadline = t.fec_fecha_apertura || t.fec_fecha_cierre || '';
          const valor = t.mon_presupuesto || t.mto_estimado || null;
          return {
            numero: String(numero),
            titulo,
            entidad,
            deadline,
            dias_restantes: null,
            valor: valor ? String(valor) : 'N/A',
            moneda: 'CRC',
            estado: t.des_estado || 'Activo',
            categoria: t.des_tipo_procedimiento || '',
            url: `${SICOP_URL}/app/module/bid/public/tenders?search=${numero}`,
          };
        });

      const dataFile = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      dataFile.countries.costa_rica = { flag: '🇨🇷', tenders: waterTenders };
      dataFile.timestamp = new Date().toISOString();
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataFile, null, 2), 'utf8');
      console.log(`✅ Costa Rica (Playwright API intercept) updated: ${waterTenders.length} tenders`);
      return;
    }

    // Fallback: scrape the table directly
    const rows = await page.$$eval('table tr', (trs) =>
      trs.slice(1).map((tr) => {
        const cells = Array.from(tr.querySelectorAll('td')).map((td) => td.textContent?.trim() || '');
        const link = tr.querySelector('a');
        return { cells, href: link?.href || null };
      })
    );

    const waterTenders = rows
      .filter((r) => r.cells.length >= 2 && isWater(r.cells.join(' ')))
      .map((r, idx) => {
        const [numero = '', titulo = '', entidad = '', deadline = '', valor = ''] = r.cells;
        return {
          numero: numero || `CR-${idx}`,
          titulo,
          entidad,
          deadline,
          dias_restantes: null,
          valor: valor && !isNaN(parseFloat(valor)) ? valor : 'N/A',
          moneda: 'CRC',
          estado: 'Activo',
          categoria: '',
          url: r.href || `${SICOP_URL}/app/module/bid/public/tenders?search=${numero}`,
        };
      });

    console.log(`  Scraped ${waterTenders.length} water tenders from table`);

    const dataFile = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    dataFile.countries.costa_rica = { flag: '🇨🇷', tenders: waterTenders };
    dataFile.timestamp = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataFile, null, 2), 'utf8');
    console.log(`✅ Costa Rica (Playwright table) updated: ${waterTenders.length} tenders`);
  } finally {
    await browser.close();
  }
}

scrapeSicop().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
