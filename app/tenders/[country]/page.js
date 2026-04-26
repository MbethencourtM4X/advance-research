import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const COUNTRY_CONFIG = {
  panama: {
    key: 'panama',
    name: 'Panamá',
    flag: '🇵🇦',
    authority: 'IDAAN',
    authorityFull: 'Instituto de Acueductos y Alcantarillados Nacionales',
    portal: 'panamacompra.gob.pa',
    portalUrl: 'https://www.panamacompra.gob.pa',
    description:
      'Licitaciones activas del IDAAN (Instituto de Acueductos y Alcantarillados Nacionales) de Panamá. Proyectos de agua potable, saneamiento y alcantarillado.',
    keywords: [
      'licitaciones IDAAN Panama', 'licitaciones agua Panama', 'PanamaCompra agua',
      'contratos IDAAN', 'acueductos Panama licitacion',
    ],
  },
  'costa-rica': {
    key: 'costa_rica',
    name: 'Costa Rica',
    flag: '🇨🇷',
    authority: 'AyA / SICOP',
    authorityFull: 'Instituto Costarricense de Acueductos y Alcantarillados',
    portal: 'sicop.go.cr',
    portalUrl: 'https://www.sicop.go.cr',
    description:
      'Licitaciones activas de AyA y entidades de agua en Costa Rica via SICOP. Proyectos de acueductos, alcantarillado y saneamiento.',
    keywords: [
      'licitaciones AyA Costa Rica', 'SICOP agua Costa Rica', 'contratos acueductos Costa Rica',
      'licitacion publica Costa Rica agua', 'SENARA ASADAS licitacion',
    ],
  },
  nicaragua: {
    key: 'nicaragua',
    name: 'Nicaragua',
    flag: '🇳🇮',
    authority: 'ENACAL / SISCAE',
    authorityFull: 'Empresa Nicaragüense de Acueductos y Alcantarillados',
    portal: 'siscae.gob.ni',
    portalUrl: 'https://www.siscae.gob.ni',
    description:
      'Licitaciones activas de ENACAL y entidades de agua en Nicaragua via SISCAE. Proyectos de agua potable y saneamiento.',
    keywords: [
      'licitaciones ENACAL Nicaragua', 'SISCAE agua Nicaragua', 'contratos agua Nicaragua',
      'licitacion publica Nicaragua', 'ENACAL contratacion',
    ],
  },
  'el-salvador': {
    key: 'el_salvador',
    name: 'El Salvador',
    flag: '🇸🇻',
    authority: 'ANDA / UNAC',
    authorityFull: 'Administración Nacional de Acueductos y Alcantarillados',
    portal: 'compras.gob.sv',
    portalUrl: 'https://www.compras.gob.sv',
    description:
      'Licitaciones activas de ANDA y entidades de agua en El Salvador via CompraGov. Proyectos de agua potable y saneamiento.',
    keywords: [
      'licitaciones ANDA El Salvador', 'compras publicas El Salvador agua',
      'UNAC licitacion', 'contratos agua El Salvador',
    ],
  },
};

function getTendersData() {
  const dataPath = path.join(process.cwd(), 'public', 'central-america-tenders-live.json');
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

export async function generateStaticParams() {
  return Object.keys(COUNTRY_CONFIG).map((country) => ({ country }));
}

export async function generateMetadata({ params }) {
  const { country } = await params;
  const config = COUNTRY_CONFIG[country];
  if (!config) return {};

  return {
    title: `Licitaciones de Agua ${config.name} — ${config.authority}`,
    description: config.description,
    keywords: config.keywords,
    openGraph: {
      title: `Licitaciones Agua ${config.name} ${config.flag}`,
      description: config.description,
      url: `https://advance-idan-research.vercel.app/tenders/${country}`,
    },
    alternates: {
      canonical: `https://advance-idan-research.vercel.app/tenders/${country}`,
    },
  };
}

export default async function CountryTendersPage({ params }) {
  const { country } = await params;
  const config = COUNTRY_CONFIG[country];
  if (!config) notFound();

  const data = getTendersData();
  const countryData = data.countries[config.key] || {};
  const tenders = countryData.tenders || [];
  const lastUpdated = data.timestamp;

  // Sort by deadline (urgency first)
  const sorted = [...tenders].sort((a, b) => {
    const aD = a.dias_restantes ?? 999;
    const bD = b.dias_restantes ?? 999;
    return aD - bD;
  });

  // JSON-LD for this country page
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `Licitaciones de Agua ${config.name} — ${config.authority}`,
    description: config.description,
    url: `https://advance-idan-research.vercel.app/tenders/${country}`,
    creator: {
      '@type': 'Organization',
      name: config.authorityFull,
      url: config.portalUrl,
    },
    dateModified: lastUpdated,
    keywords: config.keywords.join(', '),
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'text/csv',
        contentUrl: `https://advance-idan-research.vercel.app/tenders`,
      },
    ],
    hasPart: sorted.slice(0, 10).map((t) => ({
      '@type': 'GovernmentService',
      name: t.titulo,
      identifier: t.numero,
      provider: { '@type': 'GovernmentOrganization', name: t.entidad },
      endDate: t.deadline,
      url: t.url || `${config.portalUrl}`,
    })),
  };

  const urgentCount = sorted.filter((t) => t.dias_restantes != null && t.dias_restantes < 7).length;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ backgroundColor: '#151b2e', minHeight: '100vh', color: '#e8eaf0' }}>
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #0f1420 0%, #1e2640 100%)',
          borderBottom: '1px solid #2e3d5e',
          padding: '32px 20px',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <nav style={{ fontSize: '12px', color: '#6b7a99', marginBottom: '12px' }}>
              <Link href="/" style={{ color: '#6b7a99', textDecoration: 'none' }}>Inicio</Link>
              {' / '}
              <Link href="/tenders" style={{ color: '#6b7a99', textDecoration: 'none' }}>Licitaciones</Link>
              {' / '}
              <span style={{ color: '#9ba8c0' }}>{config.name}</span>
            </nav>

            <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px', color: '#e8eaf0' }}>
              {config.flag} Licitaciones de Agua — {config.name}
            </h1>
            <p style={{ fontSize: '15px', color: '#9ba8c0', margin: '0 0 16px', maxWidth: '640px', lineHeight: '1.5' }}>
              {config.description}
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Stat value={tenders.length} label="licitaciones activas" />
              {urgentCount > 0 && <Stat value={urgentCount} label="urgentes (<7d)" color="#ff7777" />}
              {lastUpdated && (
                <Stat value={new Date(lastUpdated).toLocaleDateString('es-PA')} label="última actualización" />
              )}
            </div>
          </div>
        </div>

        {/* Tenders List */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>
          {tenders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <p style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</p>
              <h2 style={{ color: '#9ba8c0', fontWeight: '400', fontSize: '18px' }}>
                Scraper pendiente para {config.name}
              </h2>
              <p style={{ color: '#6b7a99', fontSize: '14px', maxWidth: '400px', margin: '8px auto 0', lineHeight: '1.5' }}>
                El agente de scraping para {config.authority} está en desarrollo.
                Los datos aparecerán aquí automáticamente una vez activo.
              </p>
              <a
                href={config.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: '20px',
                  padding: '10px 20px',
                  backgroundColor: '#0055b3',
                  borderRadius: '6px',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                🔗 Ver {config.portal} directamente
              </a>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {sorted.map((tender) => (
                <TenderSummaryCard key={tender.numero} tender={tender} config={config} />
              ))}
            </div>
          )}

          {/* Back link */}
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #2e3d5e' }}>
            <Link
              href="/tenders"
              style={{
                color: '#3b9eff',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              ← Ver todos los países
            </Link>
          </div>

          {/* Other countries nav */}
          <div style={{ marginTop: '24px' }}>
            <p style={{ fontSize: '12px', color: '#6b7a99', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Otros países
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(COUNTRY_CONFIG)
                .filter(([slug]) => slug !== country)
                .map(([slug, cfg]) => (
                  <Link
                    key={slug}
                    href={`/tenders/${slug}`}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: '#1e2640',
                      border: '1px solid #2e3d5e',
                      borderRadius: '6px',
                      color: '#9ba8c0',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontWeight: '600',
                    }}
                  >
                    {cfg.flag} {cfg.name}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ value, label, color }) {
  return (
    <div style={{ backgroundColor: '#1e2640', border: '1px solid #2e3d5e', borderRadius: '8px', padding: '10px 16px' }}>
      <p style={{ fontSize: '20px', fontWeight: '700', color: color || '#3b9eff', margin: 0 }}>{value}</p>
      <p style={{ fontSize: '11px', color: '#6b7a99', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
    </div>
  );
}

function TenderSummaryCard({ tender, config }) {
  const isUrgent = tender.dias_restantes != null && tender.dias_restantes < 7;
  const isExpired = tender.dias_restantes != null && tender.dias_restantes < 0;
  const valorDisplay =
    tender.valor && tender.valor !== 'N/A'
      ? `${tender.moneda === 'CRC' ? '₡' : '$'}${parseFloat(tender.valor).toLocaleString()}`
      : '—';

  return (
    <div style={{
      backgroundColor: '#1e2640',
      border: isUrgent ? '2px solid #ff4444' : '1px solid #2e3d5e',
      borderRadius: '10px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <p style={{ fontSize: '12px', color: '#6b7a99', margin: 0 }}>{tender.numero}</p>
        {isUrgent && !isExpired && (
          <span style={{ backgroundColor: '#ff4444', color: '#fff', padding: '2px 7px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            ⚠ URGENTE
          </span>
        )}
        {isExpired && (
          <span style={{ backgroundColor: '#444', color: '#888', padding: '2px 7px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
            VENCIDO
          </span>
        )}
      </div>

      <h3 style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: '#e8eaf0', lineHeight: '1.4' }}>
        {tender.titulo?.length > 80 ? tender.titulo.substring(0, 80) + '…' : tender.titulo}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <p style={{ fontSize: '10px', color: '#6b7a99', margin: '0 0 2px', textTransform: 'uppercase' }}>Valor</p>
          <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#3b9eff', margin: 0 }}>{valorDisplay}</p>
        </div>
        <div>
          <p style={{ fontSize: '10px', color: '#6b7a99', margin: '0 0 2px', textTransform: 'uppercase' }}>Plazo</p>
          <p style={{ fontSize: '12px', fontWeight: '600', margin: 0, color: '#e8eaf0' }}>{tender.deadline?.split(' ')[0]}</p>
          {tender.dias_restantes != null && (
            <p style={{ fontSize: '11px', color: isExpired ? '#888' : isUrgent ? '#ff6666' : '#7ec89e', margin: '2px 0 0' }}>
              {isExpired ? `Venció hace ${Math.abs(tender.dias_restantes)}d` : `${tender.dias_restantes} días`}
            </p>
          )}
        </div>
      </div>

      <p style={{ fontSize: '11px', color: '#9ba8c0', margin: 0, lineHeight: '1.3' }}>
        {tender.entidad?.length > 55 ? tender.entidad.substring(0, 55) + '…' : tender.entidad}
      </p>

      {tender.url && tender.url !== 'javascript:void(0)' && (
        <a
          href={tender.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            padding: '8px',
            backgroundColor: '#0055b3',
            borderRadius: '6px',
            color: '#fff',
            textDecoration: 'none',
            textAlign: 'center',
            fontWeight: '600',
            fontSize: '12px',
          }}
        >
          🔗 Ver Licitación
        </a>
      )}
    </div>
  );
}
