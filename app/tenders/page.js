'use client';

import React, { useState, useEffect } from 'react';

const TendersPage = () => {
  const [tenders, setTenders] = useState([]);
  const [saved, setSaved] = useState([]);
  const [language, setLanguage] = useState('es');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [maxValue, setMaxValue] = useState(1000000);
  const [maxDays, setMaxDays] = useState(365);
  const [viewMode, setViewMode] = useState('all');

  const t = {
    es: {
      title: 'Licitaciones de Agua',
      search: 'Buscar...',
      filters: 'Filtros',
      country: 'País',
      value: 'Valor máx',
      deadline: 'Plazo',
      all: 'Todos',
      saved: 'Guardados',
      mark: 'Guardar',
      remove: 'Remover',
      download: 'Descargar CSV',
      noResults: 'Sin resultados',
      view: 'Ver Licitación',
      days: 'días',
      urgent: 'URGENTE',
    },
    en: {
      title: 'Water Tenders',
      search: 'Search...',
      filters: 'Filters',
      country: 'Country',
      value: 'Max Value',
      deadline: 'Deadline',
      all: 'All',
      saved: 'Saved',
      mark: 'Save',
      remove: 'Remove',
      download: 'Download CSV',
      noResults: 'No results',
      view: 'View Tender',
      days: 'days',
      urgent: 'URGENT',
    }
  };

  const str = t[language];

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/central-america-tenders-live.json');
        const data = await res.json();
        const allTenders = [];
        
        Object.entries(data.countries).forEach(([key, country]) => {
          if (country.tenders && Array.isArray(country.tenders)) {
            country.tenders.forEach((tender) => {
              allTenders.push({
                ...tender,
                pais: key,
                flag: country.flag,
              });
            });
          }
        });
        
        setTenders(allTenders);
      } catch (e) {
        console.error('Error loading tenders:', e);
      }
    };

    loadData();
    const saved = JSON.parse(localStorage.getItem('savedTenderIds') || '[]');
    setSaved(saved);
  }, []);

  // Filter logic
  const filtered = tenders.filter((t) => {
    const matchSearch = !searchTerm || t.titulo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCountry = selectedCountry === 'all' || t.pais === selectedCountry;
    const valor = parseInt(t.valor) || 0;
    const matchValue = valor <= maxValue;
    const matchDays = (t.dias_restantes || 365) <= maxDays;
    
    return matchSearch && matchCountry && matchValue && matchDays;
  });

  const displayed = viewMode === 'saved' 
    ? filtered.filter(t => saved.includes(t.numero))
    : filtered;

  const toggleSave = (numero) => {
    const updated = saved.includes(numero)
      ? saved.filter(id => id !== numero)
      : [...saved, numero];
    setSaved(updated);
    localStorage.setItem('savedTenderIds', JSON.stringify(updated));
  };

  const downloadCSV = () => {
    const rows = displayed.map(t => [
      t.flag || t.pais,
      t.numero,
      t.titulo?.substring(0, 60),
      t.valor || 'N/A',
      t.deadline,
      t.entidad,
    ]);
    const csv = [
      ['País', 'Licitación', 'Título', 'Valor', 'Plazo', 'Entidad'],
      ...rows
    ].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `licitaciones-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div style={{ backgroundColor: '#1a1f36', minHeight: '100vh', color: '#fff' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#0f1419', borderBottom: '1px solid #334466', padding: '16px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>🌊 {str.title}</h1>
            <button 
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              style={{ padding: '8px 16px', backgroundColor: '#334466', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}
            >
              {language === 'es' ? 'EN' : 'ES'}
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder={str.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#222d47',
              border: '1px solid #334466',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        {/* Filters - Mobile stacked */}
        <div style={{ 
          backgroundColor: '#222d47', 
          border: '1px solid #334466', 
          borderRadius: '8px', 
          padding: '16px',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', marginTop: 0 }}>
            ⚙️ {str.filters}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Country */}
            <div>
              <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '6px' }}>
                {str.country}
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#1a1f36',
                  border: '1px solid #334466',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Todas</option>
                <option value="panama">🇵🇦 Panama</option>
                <option value="costa_rica">🇨🇷 Costa Rica</option>
                <option value="nicaragua">🇳🇮 Nicaragua</option>
              </select>
            </div>

            {/* Value */}
            <div>
              <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '6px' }}>
                {str.value}: ${(maxValue/1000).toFixed(0)}K
              </label>
              <input
                type="range"
                min="0"
                max="1000000"
                step="50000"
                value={maxValue}
                onChange={(e) => setMaxValue(parseInt(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            {/* Days */}
            <div>
              <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '6px' }}>
                {str.deadline}: ≤ {maxDays} {str.days}
              </label>
              <input
                type="range"
                min="1"
                max="365"
                value={maxDays}
                onChange={(e) => setMaxDays(parseInt(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            {/* View Toggle */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setViewMode('all')}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: viewMode === 'all' ? '#0066cc' : '#334466',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🔍 {str.all}
              </button>
              <button
                onClick={() => setViewMode('saved')}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: viewMode === 'saved' ? '#0066cc' : '#334466',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ⭐ {str.saved} ({saved.length})
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
            {displayed.length} {displayed.length === 1 ? 'licitación' : 'licitaciones'}
          </h2>
          {displayed.length > 0 && (
            <button
              onClick={downloadCSV}
              style={{
                padding: '10px 16px',
                backgroundColor: '#10b981',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              📥 {str.download}
            </button>
          )}
        </div>

        {/* Empty State */}
        {displayed.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: '#aaa' }}>
            {str.noResults}
          </div>
        )}

        {/* Tender Cards - Mobile responsive grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {displayed.map((tender) => {
            const isUrgent = tender.dias_restantes < 7;
            const isSaved = saved.includes(tender.numero);

            return (
              <article
                key={tender.numero}
                style={{
                  backgroundColor: '#222d47',
                  border: isUrgent ? '2px solid #ff4444' : '1px solid #334466',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Card Header */}
                <div style={{
                  padding: '12px',
                  borderBottom: '1px solid #334466',
                  backgroundColor: isUrgent ? 'rgba(255, 68, 68, 0.1)' : 'transparent'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, lineHeight: '1.3' }}>
                      {tender.titulo?.substring(0, 50)}...
                    </h3>
                    {isUrgent && (
                      <span style={{ 
                        backgroundColor: '#ff4444', 
                        color: '#fff', 
                        padding: '2px 6px', 
                        borderRadius: '3px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap'
                      }}>
                        ⚠️ {str.urgent}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>
                    {tender.flag} {tender.numero}
                  </p>
                </div>

                {/* Card Body */}
                <div style={{ padding: '12px', flex: 1 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <p style={{ fontSize: '10px', color: '#888', margin: 0, marginBottom: '4px', textTransform: 'uppercase' }}>Valor</p>
                      <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#0066cc', margin: 0 }}>
                        ${parseInt(tender.valor || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#888', margin: 0, marginBottom: '4px', textTransform: 'uppercase' }}>Plazo</p>
                      <p style={{ fontSize: '12px', fontWeight: 'bold', margin: 0 }}>
                        {tender.deadline}
                      </p>
                      {tender.dias_restantes && (
                        <p style={{ fontSize: '11px', color: isUrgent ? '#ff4444' : '#aaa', margin: 0, marginTop: '2px' }}>
                          {tender.dias_restantes} {str.days}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #334466', paddingTop: '8px' }}>
                    <p style={{ fontSize: '10px', color: '#888', margin: 0, marginBottom: '4px', textTransform: 'uppercase' }}>Entidad</p>
                    <p style={{ fontSize: '12px', margin: 0, color: '#ccc' }}>{tender.entidad}</p>
                  </div>
                </div>

                {/* Card Footer */}
                <div style={{ padding: '12px', borderTop: '1px solid #334466', backgroundColor: '#1a1f36' }}>
                  <button
                    onClick={() => toggleSave(tender.numero)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginBottom: '8px',
                      backgroundColor: isSaved ? '#fbbf24' : '#334466',
                      border: 'none',
                      borderRadius: '4px',
                      color: isSaved ? '#000' : '#fff',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  >
                    {isSaved ? '⭐ ' : '☆ '} {isSaved ? str.remove : str.mark}
                  </button>

                  {tender.url && tender.url !== 'javascript:void(0)' ? (
                    <a
                      href={tender.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        padding: '10px',
                        backgroundColor: '#0066cc',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        textDecoration: 'none',
                        textAlign: 'center',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}
                    >
                      🔗 {str.view}
                    </a>
                  ) : (
                    <button
                      disabled
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#334466',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#888',
                        cursor: 'not-allowed',
                        fontWeight: 'bold'
                      }}
                    >
                      {str.view}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default TendersPage;
