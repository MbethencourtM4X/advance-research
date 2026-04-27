'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTenders } from './hooks/useTenders';
import { useSaved } from './hooks/useSaved';
import TenderCard from './components/TenderCard';
import FilterPanel from './components/FilterPanel';
import TenderModal from './components/TenderModal';
import EmptyState from './components/EmptyState';
import LoadingSkeleton from './components/LoadingSkeleton';
import { useToast, ToastContainer } from './components/Toast';
import { exportTendersXLSX } from './utils/exportXLSX';
import { ACTIVE_KEYWORDS, matchesAdvanceKeywords } from '../../config/advance-keywords';

const STRINGS = {
  es: {
    title: 'Licitaciones de Agua',
    search: 'Buscar licitaciones…',
    filters: 'Filtros',
    country: 'País',
    allCountries: 'Todos los países',
    value: 'Valor',
    maxValue: 'Valor máx',
    deadline: 'Plazo',
    all: 'Todas',
    saved: 'Guardados',
    save: 'Guardar',
    remove: 'Remover',
    download: 'Descargar CSV',
    downloadXLSX: 'Descargar Excel',
    noResults: 'Sin resultados',
    noResultsHint: 'Intenta ampliar los filtros o cambiar la búsqueda',
    noSaved: 'No hay guardados',
    noSavedHint: 'Guarda licitaciones con ☆ para verlas aquí',
    view: 'Ver Licitación',
    days: 'días',
    urgent: 'URGENTE',
    expired: 'VENCIDO',
    entity: 'Entidad',
    category: 'Categoría',
    status: 'Estado',
    noValue: 'No disponible',
    noLink: 'Sin enlace',
    sortBy: 'Ordenar',
    sortDeadline: '📅 Más urgente',
    sortValueDesc: '💰 Mayor valor',
    sortValueAsc: '💰 Menor valor',
    sortUrgency: '⚠ Urgencia',
    licitaciones: 'licitaciones',
    licitacion: 'licitación',
    toastSaved: '⭐ Licitación guardada',
    toastRemoved: '✓ Eliminada de guardados',
    lastUpdated: 'Actualizado',
  },
  en: {
    title: 'Water Tenders',
    search: 'Search tenders…',
    filters: 'Filters',
    country: 'Country',
    allCountries: 'All countries',
    value: 'Value',
    maxValue: 'Max value',
    deadline: 'Deadline',
    all: 'All',
    saved: 'Saved',
    save: 'Save',
    remove: 'Remove',
    download: 'Download CSV',
    downloadXLSX: 'Download Excel',
    noResults: 'No results',
    noResultsHint: 'Try broadening your filters or changing the search',
    noSaved: 'No saved tenders',
    noSavedHint: 'Save tenders with ☆ to see them here',
    view: 'View Tender',
    days: 'days',
    urgent: 'URGENT',
    expired: 'EXPIRED',
    entity: 'Entity',
    category: 'Category',
    status: 'Status',
    noValue: 'Not available',
    noLink: 'No link',
    sortBy: 'Sort by',
    sortDeadline: '📅 Most urgent',
    sortValueDesc: '💰 Highest value',
    sortValueAsc: '💰 Lowest value',
    sortUrgency: '⚠ Urgency',
    licitaciones: 'tenders',
    licitacion: 'tender',
    toastSaved: '⭐ Tender saved',
    toastRemoved: '✓ Removed from saved',
    lastUpdated: 'Updated',
  },
};

function sortTenders(tenders, sortBy) {
  return [...tenders].sort((a, b) => {
    if (sortBy === 'value_desc') return (parseFloat(b.valor) || 0) - (parseFloat(a.valor) || 0);
    if (sortBy === 'value_asc') return (parseFloat(a.valor) || 0) - (parseFloat(b.valor) || 0);
    if (sortBy === 'urgency') {
      const aU = a.dias_restantes != null && a.dias_restantes < 7;
      const bU = b.dias_restantes != null && b.dias_restantes < 7;
      if (aU && !bU) return -1;
      if (!aU && bU) return 1;
      return (a.dias_restantes ?? 999) - (b.dias_restantes ?? 999);
    }
    // deadline_asc (default)
    return (a.dias_restantes ?? 999) - (b.dias_restantes ?? 999);
  });
}

export default function TendersPage() {
  const { language } = useLanguage();
  const str = STRINGS[language] || STRINGS.es;

  const { tenders, loading, error, lastUpdated } = useTenders();
  const { saved, toggleSave, isSaved } = useSaved();
  const { toasts, addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [maxValue, setMaxValue] = useState(1000000);
  const [maxDays, setMaxDays] = useState(365);
  const [viewMode, setViewMode] = useState('all');
  const [sortBy, setSortBy] = useState('deadline_asc');
  const [selectedTender, setSelectedTender] = useState(null);

  const filtered = useMemo(() => {
    let result = tenders.filter((t) => {
      // Municipal tenders must match Advance-relevant keywords
      if (t.source_type === 'municipal' && !matchesAdvanceKeywords(t)) return false;
      if (searchTerm && !t.titulo?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedCountry !== 'all' && t.pais !== selectedCountry) return false;
      const val = parseFloat(t.valor) || 0;
      if (val > maxValue && val > 0) return false;
      if ((t.dias_restantes ?? 365) > maxDays) return false;
      return true;
    });
    if (viewMode === 'saved') result = result.filter((t) => isSaved(t.numero));
    return sortTenders(result, sortBy);
  }, [tenders, searchTerm, selectedCountry, maxValue, maxDays, viewMode, sortBy, saved]);

  const hasMunicipal = tenders.some((t) => t.source_type === 'municipal');

  const handleToggleSave = (numero) => {
    const wasAdded = !isSaved(numero);
    toggleSave(numero);
    addToast(wasAdded ? str.toastSaved : str.toastRemoved, wasAdded ? 'success' : 'info');
  };

  const downloadCSV = () => {
    const rows = filtered.map((t) => [
      t.flag || t.pais,
      t.numero,
      t.titulo?.substring(0, 80),
      t.valor || 'N/A',
      t.moneda || '',
      t.deadline,
      t.dias_restantes ?? '',
      t.entidad,
      t.url || '',
    ]);
    const csv = [
      ['País', 'Licitación', 'Título', 'Valor', 'Moneda', 'Plazo', 'Días restantes', 'Entidad', 'URL'],
      ...rows,
    ]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `licitaciones-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // JSON-LD for this page
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Licitaciones de Agua — Centroamérica',
    description: 'Base de datos de licitaciones activas de agua potable, acueductos y saneamiento en Panamá, Costa Rica, Nicaragua y El Salvador.',
    url: 'https://advance-idan-research.vercel.app/tenders',
    creator: { '@type': 'Organization', name: 'Somos Advance' },
    dateModified: lastUpdated || new Date().toISOString(),
    keywords: 'licitaciones agua Panama, IDAAN, SICOP Costa Rica, SISCAE Nicaragua, water tender',
  };

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    <div style={{ backgroundColor: '#151b2e', minHeight: '100vh', color: '#e8eaf0' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#0f1420',
        borderBottom: '1px solid #2e3d5e',
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#e8eaf0' }}>
              🌊 {str.title}
            </h1>
            {lastUpdated && (
              <span style={{ fontSize: '11px', color: '#6b7a99' }}>
                {str.lastUpdated}: {new Date(lastUpdated).toLocaleDateString(language === 'es' ? 'es-PA' : 'en-US')}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px' }}>
        <FilterPanel
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry}
          maxValue={maxValue} setMaxValue={setMaxValue}
          maxDays={maxDays} setMaxDays={setMaxDays}
          viewMode={viewMode} setViewMode={setViewMode}
          sortBy={sortBy} setSortBy={setSortBy}
          savedCount={saved.length}
          strings={str}
        />

        {/* Municipal keyword filter notice — only shown when municipal sources are present */}
        {hasMunicipal && (
          <div style={{
            marginBottom: '12px',
            padding: '8px 12px',
            backgroundColor: '#0d2d4a',
            border: '1px solid #1a5276',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#7eb3c8',
          }}>
            {language === 'es'
              ? `Licitaciones municipales filtradas por: ${ACTIVE_KEYWORDS.join(', ')}`
              : `Municipal tenders filtered by: ${ACTIVE_KEYWORDS.join(', ')}`}
          </div>
        )}

        {/* Results bar */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {!loading && (
            <p style={{ margin: 0, fontSize: '14px', color: '#9ba8c0' }}>
              <strong style={{ color: '#e8eaf0' }}>{filtered.length}</strong>{' '}
              {filtered.length === 1 ? str.licitacion : str.licitaciones}
            </p>
          )}
          {!loading && filtered.length > 0 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={downloadCSV}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#0d4f30',
                  border: '1px solid #1a8f57',
                  borderRadius: '6px',
                  color: '#7ec89e',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '12px',
                }}
              >
                📥 CSV
              </button>
              <button
                onClick={() => exportTendersXLSX(filtered, language)}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#0d3a4f',
                  border: '1px solid #1a6a8f',
                  borderRadius: '6px',
                  color: '#7ebec8',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '12px',
                }}
              >
                📊 Excel
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {loading && <LoadingSkeleton count={6} />}

        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '32px', color: '#ff7777' }}>
            Error cargando datos: {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState mode={viewMode} strings={str} />
        )}

        {!loading && !error && filtered.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
          }}>
            {filtered.map((tender) => (
              <TenderCard
                key={tender.numero}
                tender={tender}
                isSaved={isSaved(tender.numero)}
                onToggleSave={handleToggleSave}
                onOpenModal={setSelectedTender}
                strings={str}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedTender && (
        <TenderModal
          tender={selectedTender}
          onClose={() => setSelectedTender(null)}
          isSaved={isSaved(selectedTender.numero)}
          onToggleSave={handleToggleSave}
          strings={str}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} />
    </div>
    </>
  );
}
