#!/usr/bin/env node
/**
 * SICOP Costa Rica Scraper
 * Portal: https://www.sicop.go.cr
 * API: SICOP has a public REST API for procurement data
 *
 * Run: node scripts/scrape-costa-rica.js
 * Output: updates public/central-america-tenders-live.json
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'public', 'central-america-tenders-live.json');

// SICOP API base (verify at https://www.sicop.go.cr/apiRest/)
const SICOP_API = 'https://www.sicop.go.cr/apiRest';

// Water sector institution codes in Costa Rica
const WATER_ENTITIES = [
  'AyA', 'SENARA', 'ASADAS', 'ICAA', 'Instituto Costarricense de Acueductos',
  'ESPH', 'agua', 'saneamiento', 'alcantarillado',
];

const WATER_KEYWORDS = [
  'agua', 'acueducto', 'alcantarillado', 'saneamiento', 'tubería',
  'potabiliz', 'hidrosanitario', 'planta de tratamiento', 'pozo',
  'AyA', 'SENARA', 'ASADAS',
];

function isWaterTender(tender) {
  const text = [
    tender.des_objeto_contratacion,
    tender.des_nombre_institucion,
    tender.des_tipo_procedimiento,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return WATER_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'AdvanceResearch/1.0', 'Accept': 'application/json' } }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`JSON parse: ${e.message}`));
          }
        });
      })
      .on('error', reject);
  });
}

function parseSicopTender(raw) {
  // SICOP field names from their REST API
  const numero = raw.cod_expediente || raw.num_contratacion || raw.id;
  const titulo = raw.des_objeto_contratacion || raw.nom_contratacion || '';
  const entidad = raw.des_nombre_institucion || raw.nom_institucion || '';
  const deadline = raw.fec_fecha_apertura || raw.fec_fecha_cierre || '';
  const valor = raw.mon_presupuesto || raw.mto_estimado || null;

  let dias_restantes = null;
  if (deadline) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(deadline);
    if (!isNaN(d.getTime())) {
      dias_restantes = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    }
  }

  // Direct tender URL
  const url = raw.url_detalle ||
    `https://www.sicop.go.cr/app/module/bid/public/tenders?search=${numero}`;

  return {
    numero: String(numero),
    titulo,
    entidad,
    deadline: deadline ? new Date(deadline).toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
    dias_restantes,
    valor: valor ? String(valor) : 'N/A',
    moneda: 'CRC',
    estado: raw.des_estado || 'Activo',
    categoria: raw.des_tipo_procedimiento || '',
    url,
  };
}

async function scrapeCR() {
  console.log('🇨🇷 Starting Costa Rica (SICOP) scrape...');

  // SICOP REST API endpoints (public, no auth required for active tenders)
  const ENDPOINTS = [
    `${SICOP_API}/contrataciones?estado=activo&page=1&size=200`,
    `${SICOP_API}/licitaciones?activas=true&page=1`,
    `${SICOP_API}/expedientes?estado=EN_PROCESO`,
  ];

  let rawTenders = [];

  for (const endpoint of ENDPOINTS) {
    try {
      console.log(`  Trying: ${endpoint}`);
      const data = await fetchJson(endpoint);
      const items = Array.isArray(data)
        ? data
        : data.content || data.data || data.results || data.expedientes || [];
      if (items.length > 0) {
        rawTenders = items;
        console.log(`  ✓ Got ${items.length} items`);
        break;
      }
    } catch (e) {
      console.warn(`  ✗ ${e.message}`);
    }
  }

  if (rawTenders.length === 0) {
    console.error('❌ Could not fetch Costa Rica data.');
    console.error('   SICOP may require session auth. Consider scraping via Playwright.');
    process.exit(1);
  }

  const waterTenders = rawTenders
    .filter(isWaterTender)
    .map(parseSicopTender)
    .filter((t) => t.numero && t.titulo);

  console.log(`  Water tenders: ${waterTenders.length} / ${rawTenders.length}`);

  const dataFile = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  dataFile.countries.costa_rica = {
    ...(dataFile.countries.costa_rica || {}),
    flag: '🇨🇷',
    tenders: waterTenders,
  };
  dataFile.timestamp = new Date().toISOString();

  fs.writeFileSync(DATA_FILE, JSON.stringify(dataFile, null, 2), 'utf8');
  console.log(`✅ Costa Rica updated: ${waterTenders.length} tenders`);

  return { total: waterTenders.length };
}

scrapeCR().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
