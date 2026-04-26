#!/usr/bin/env node
/**
 * SISCAE Nicaragua — Playwright fallback scraper
 * Use when the REST API endpoints fail (session-gated, CSRF, etc.)
 *
 * Run: node scripts/scrape-nicaragua-playwright.js
 *
 * Prerequisite: npx playwright install chromium
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'public', 'central-america-tenders-live.json');
const SISCAE_URL = 'https://www.siscae.gob.ni';

const WATER_KEYWORDS = [
  'agua', 'acueducto', 'alcantarillado', 'saneamiento', 'tubería',
  'potabilización', 'hidráulico', 'planta de tratamiento', 'pozo',
  'ENACAL', 'ANA ', 'riego', 'sistema de agua',
];

function isWater(text) {
  return WATER_KEYWORDS.some((kw) => (text || '').toLowerCase().includes(kw.toLowerCase()));
}

async function scrapeSiscae() {
  console.log('🇳🇮 Playwright: Starting SISCAE Nicaragua scrape...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.setDefaultTimeout(30000);

  try {
    // Navigate to the public procurement list
    await page.goto(`${SISCAE_URL}/public/listado_contrataciones`, { waitUntil: 'networkidle' });

    // If that 404s, try the home and navigate
    const url = page.url();
    if (!url.includes('listado')) {
      await page.goto(SISCAE_URL, { waitUntil: 'networkidle' });
      // Try to find the "Contrataciones" / "Licitaciones" link
      const links = await page.$$eval('a', (as) =>
        as.map((a) => ({ text: a.textContent?.trim(), href: a.href }))
      );
      const contLink = links.find(
        (l) =>
          l.text?.toLowerCase().includes('licitaci') ||
          l.text?.toLowerCase().includes('contrataci')
      );
      if (contLink?.href) {
        console.log(`  Navigating to: ${contLink.href}`);
        await page.goto(contLink.href, { waitUntil: 'networkidle' });
      }
    }

    console.log(`  Page URL: ${page.url()}`);

    // Wait for any table or list to load
    await page.waitForSelector('table, .contratacion, .licitacion, [class*="tender"], [class*="contrat"]', {
      timeout: 15000,
    }).catch(() => console.warn('  No obvious tender container found — scraping page text'));

    // Try to extract from a table
    const tenderRows = await page.$$eval(
      'table tr',
      (rows) =>
        rows.slice(1).map((row) => {
          const cells = Array.from(row.querySelectorAll('td, th')).map((c) => c.textContent?.trim() || '');
          const link = row.querySelector('a');
          return { cells, href: link?.href || null };
        })
    );

    // Also try JSON interception — intercept XHR for API responses
    // (Playwright captures these automatically above via networkidle)

    console.log(`  Rows scraped: ${tenderRows.length}`);

    // Heuristic mapping: adjust column indices based on actual site
    // SISCAE typically: [ID, Descripción, Modalidad, Institución, Monto, Fecha]
    const tenders = tenderRows
      .filter((r) => r.cells.length >= 3 && isWater(r.cells.join(' ')))
      .map((r, idx) => {
        const [numero = '', titulo = '', modalidad = '', entidad = '', valor = '', deadline = ''] = r.cells;
        return {
          id: `NI-${numero || idx}`,
          numero: numero || `NI-${idx}`,
          titulo: titulo || r.cells[1] || '',
          entidad: entidad || r.cells[3] || '',
          deadline,
          dias_restantes: null,
          valor: valor && !isNaN(parseFloat(valor)) ? valor : 'N/A',
          moneda: 'NIO',
          estado: 'Activo',
          categoria: modalidad || '',
          url: r.href || SISCAE_URL,
        };
      })
      .filter((t) => t.titulo);

    console.log(`  Water tenders extracted: ${tenders.length}`);

    // Update data file
    const dataFile = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    dataFile.countries.nicaragua = {
      ...(dataFile.countries.nicaragua || {}),
      flag: '🇳🇮',
      tenders,
    };
    dataFile.timestamp = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(dataFile, null, 2), 'utf8');

    console.log(`✅ Nicaragua (Playwright) updated: ${tenders.length} tenders`);
    return { total: tenders.length };
  } finally {
    await browser.close();
  }
}

scrapeSiscae().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
