#!/usr/bin/env node
/**
 * SISCAE Nicaragua Scraper
 * Portal: https://www.siscae.gob.ni
 * Targets: water / infrastructure tenders (ENACAL, ANA, MEM)
 *
 * Approach: SISCAE has a public JSON API at /api/contrataciones.
 * Run: node scripts/scrape-nicaragua.js
 * Output: updates public/central-america-tenders-live.json
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'public', 'central-america-tenders-live.json');

// Keywords that indicate water-sector tenders
const WATER_KEYWORDS = [
  'agua', 'acueducto', 'alcantarillado', 'saneamiento', 'tubería',
  'potabilización', 'hidráulico', 'planta de tratamiento', 'pozo',
  'ENACAL', 'ANA ', 'riego', 'sistema de agua',
];

// Known water authorities in Nicaragua
const WATER_ENTITIES = ['ENACAL', 'ANA', 'FISE', 'IDR', 'INIFOM'];

function isWaterTender(tender) {
  const text = [tender.nombre, tender.descripcion, tender.institucion]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return WATER_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'AdvanceResearch/1.0' } }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`JSON parse error: ${e.message}\nRaw: ${data.substring(0, 200)}`));
          }
        });
      })
      .on('error', reject);
  });
}

function parseSiscaeTender(raw) {
  // SISCAE field mapping (verify against live API response)
  const numero = raw.codigo || raw.numero || raw.id;
  const titulo = raw.nombre || raw.descripcion || '';
  const entidad = raw.institucion || raw.entidad || '';
  const deadline = raw.fecha_presentacion || raw.fecha_cierre || raw.plazo || '';
  const valor = raw.monto_estimado || raw.valor || null;

  let dias_restantes = null;
  if (deadline) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // SISCAE typically returns DD/MM/YYYY
    const parts = deadline.split(/[\s/T]/);
    let date;
    if (parts[0].length === 4) {
      date = new Date(parts[0], parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else if (parts[2]?.length === 4) {
      date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    if (date && !isNaN(date.getTime())) {
      dias_restantes = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    }
  }

  // Build URL — SISCAE detail page pattern
  const url = raw.url ||
    (numero ? `https://www.siscae.gob.ni/contrataciones/${numero}` : null);

  return {
    id: `NI-${numero}`,
    numero: String(numero),
    titulo,
    entidad,
    deadline,
    dias_restantes,
    valor: valor ? String(valor) : 'N/A',
    moneda: 'NIO',
    estado: raw.estado || 'Activo',
    categoria: raw.tipo_contratacion || raw.modalidad || '',
    url,
    pais: 'nicaragua',
  };
}

async function scrapeNicaragua() {
  console.log('🇳🇮 Starting Nicaragua (SISCAE) scrape...');

  // SISCAE API endpoints to try
  // NOTE: Verify the correct endpoint by inspecting network traffic on https://www.siscae.gob.ni
  // The portal may require session cookies. Update BASE_API if the URL changes.
  const BASE_API = 'https://www.siscae.gob.ni/api';
  const ENDPOINTS = [
    `${BASE_API}/contrataciones?estado=activo&tipo=licitacion&page=1&per_page=100`,
    `${BASE_API}/licitaciones?estado=activo&page=1&limit=100`,
    `${BASE_API}/public/contrataciones?estado=Activo`,
  ];

  let rawTenders = [];
  let successEndpoint = null;

  for (const endpoint of ENDPOINTS) {
    try {
      console.log(`  Trying: ${endpoint}`);
      const data = await fetchJson(endpoint);
      const items = Array.isArray(data) ? data : data.data || data.results || data.contrataciones || [];
      if (items.length > 0) {
        rawTenders = items;
        successEndpoint = endpoint;
        console.log(`  ✓ Got ${items.length} items from ${endpoint}`);
        break;
      }
    } catch (e) {
      console.warn(`  ✗ Failed: ${e.message}`);
    }
  }

  if (rawTenders.length === 0) {
    console.error('❌ Could not fetch Nicaragua data from any endpoint.');
    console.error('   Manual action required: inspect https://www.siscae.gob.ni network traffic');
    console.error('   and update ENDPOINTS in scripts/scrape-nicaragua.js');
    process.exit(1);
  }

  // Filter to water-sector tenders
  const waterTenders = rawTenders
    .filter(isWaterTender)
    .map(parseSiscaeTender)
    .filter((t) => t.numero && t.titulo);

  console.log(`  Water tenders found: ${waterTenders.length} / ${rawTenders.length} total`);

  // Load and update the main data file
  const dataFile = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const prev = dataFile.countries.nicaragua?.tenders || [];
  const prevNums = new Set(prev.map((t) => t.numero));
  const newNums = new Set(waterTenders.map((t) => t.numero));

  const added = waterTenders.filter((t) => !prevNums.has(t.numero));
  const removed = prev.filter((t) => !newNums.has(t.numero));

  dataFile.countries.nicaragua = {
    ...(dataFile.countries.nicaragua || {}),
    flag: '🇳🇮',
    tenders: waterTenders,
  };
  dataFile.timestamp = new Date().toISOString();

  fs.writeFileSync(DATA_FILE, JSON.stringify(dataFile, null, 2), 'utf8');

  console.log(`✅ Nicaragua updated: ${waterTenders.length} tenders`);
  console.log(`   +${added.length} new, -${removed.length} removed`);
  if (added.length > 0) {
    console.log('   New tenders:');
    added.forEach((t) => console.log(`     - ${t.numero}: ${t.titulo?.substring(0, 60)}`));
  }

  // Output summary for GitHub Actions step output
  if (process.env.GITHUB_OUTPUT) {
    const summary = `nicaragua_count=${waterTenders.length}\nnicaragua_new=${added.length}\nnicaragua_removed=${removed.length}`;
    fs.appendFileSync(process.env.GITHUB_OUTPUT, summary + '\n');
  }

  return { total: waterTenders.length, added: added.length, removed: removed.length };
}

scrapeNicaragua().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
