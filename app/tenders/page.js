'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, Download, AlertCircle, Star, X } from 'lucide-react';

const TendersPage = () => {
  const [tenders, setTenders] = useState([]);
  const [saved, setSaved] = useState([]);
  const [language, setLanguage] = useState('es');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [valueRange, setValueRange] = useState([0, 1000000]);
  const [daysRemaining, setDaysRemaining] = useState(30);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'saved'
  const [sortBy, setSortBy] = useState('deadline'); // 'deadline' or 'value'

  // Translations
  const t = {
    es: {
      title: 'Licitaciones de Agua',
      subtitle: 'Procurement portal for Central America',
      search: 'Buscar por título...',
      filters: 'Filtros',
      country: 'País',
      value: 'Valor',
      deadline: 'Plazo',
      viewAll: 'Todos',
      viewSaved: 'Guardados',
      sortBy: 'Ordenar por',
      mark: 'Guardar',
      remove: 'Descartar',
      download: 'Descargar CSV',
      noResults: 'Sin resultados',
      urgent: 'URGENTE',
      days: 'días',
      entity: 'Entidad',
      viewTender: 'Ver Licitación',
      marked: 'Guardado',
    },
    en: {
      title: 'Water Tenders',
      subtitle: 'Procurement portal for Central America',
      search: 'Search by title...',
      filters: 'Filters',
      country: 'Country',
      value: 'Value',
      deadline: 'Deadline',
      viewAll: 'All',
      viewSaved: 'Saved',
      sortBy: 'Sort by',
      mark: 'Save',
      remove: 'Remove',
      download: 'Download CSV',
      noResults: 'No results',
      urgent: 'URGENT',
      days: 'days',
      entity: 'Entity',
      viewTender: 'View Tender',
      marked: 'Saved',
    },
  };

  const strings = t[language];

  // Load tenders on mount
  useEffect(() => {
    const loadTenders = async () => {
      try {
        const res = await fetch('/central-america-tenders-live.json');
        const data = await res.json();
        
        const allTenders = [];
        Object.entries(data.countries).forEach(([key, country]) => {
          country.tenders?.forEach((tender) => {
            allTenders.push({
              ...tender,
              pais: key,
              flag: country.flag,
            });
          });
        });
        
        setTenders(allTenders);
      } catch (error) {
        console.error('Error loading tenders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTenders();

    // Load saved from localStorage
    const savedIds = JSON.parse(localStorage.getItem('savedTenderIds') || '[]');
    setSaved(savedIds);
  }, []);

  // Filter and sort logic
  const filtered = tenders.filter((tender) => {
    const matchSearch = tender.titulo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCountry = selectedCountry === 'all' || tender.pais === selectedCountry;
    const matchValue = parseInt(tender.valor) >= valueRange[0] && parseInt(tender.valor) <= valueRange[1];
    
    let matchDeadline = true;
    if (tender.dias_restantes !== undefined) {
      matchDeadline = tender.dias_restantes <= daysRemaining;
    }

    return matchSearch && matchCountry && matchValue && matchDeadline;
  });

  const displayTenders = viewMode === 'saved' 
    ? filtered.filter(t => saved.includes(t.numero))
    : filtered;

  const sorted = [...displayTenders].sort((a, b) => {
    if (sortBy === 'deadline') {
      const aDate = new Date(a.deadline);
      const bDate = new Date(b.deadline);
      return aDate - bDate;
    } else {
      return parseInt(b.valor) - parseInt(a.valor);
    }
  });

  const toggleSave = (numero) => {
    const updated = saved.includes(numero)
      ? saved.filter(id => id !== numero)
      : [...saved, numero];
    setSaved(updated);
    localStorage.setItem('savedTenderIds', JSON.stringify(updated));
  };

  const downloadCSV = () => {
    const headers = ['País', 'Licitación', 'Título', 'Valor', 'Plazo', 'Entidad'];
    const rows = sorted.map(t => [
      t.flag || t.pais,
      t.numero,
      t.titulo,
      t.valor || 'N/A',
      t.deadline,
      t.entidad,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `licitaciones-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-1">
                🌊 {strings.title}
              </h1>
              <p className="text-slate-400 text-sm">{strings.subtitle}</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
              >
                {language === 'es' ? 'EN' : 'ES'}
              </button>
              <div className="px-4 py-2 bg-blue-600/20 text-blue-300 rounded-lg border border-blue-600">
                ⭐ {saved.length}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder={strings.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 sticky top-24">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <ChevronDown className="w-4 h-4" />
                {strings.filters}
              </h2>

              {/* Country Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  {strings.country}
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Todas las regiones</option>
                  <option value="panama">🇵🇦 Panama</option>
                  <option value="costa_rica">🇨🇷 Costa Rica</option>
                  <option value="nicaragua">🇳🇮 Nicaragua</option>
                  <option value="el_salvador">🇸🇻 El Salvador</option>
                </select>
              </div>

              {/* Value Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  {strings.value}: ${valueRange[1].toLocaleString()}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="50000"
                  value={valueRange[1]}
                  onChange={(e) => setValueRange([0, parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="text-xs text-slate-400 mt-2">Hasta ${valueRange[1].toLocaleString()}</div>
              </div>

              {/* Days Remaining */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  {strings.deadline}: ≤ {daysRemaining} {strings.days}
                </label>
                <input
                  type="range"
                  min="1"
                  max="365"
                  value={daysRemaining}
                  onChange={(e) => setDaysRemaining(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  {strings.sortBy}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="deadline">Por plazo</option>
                  <option value="value">Por valor</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="border-t border-slate-700 pt-6">
                <div className="space-y-2">
                  <button
                    onClick={() => setViewMode('all')}
                    className={`w-full px-4 py-2 rounded-lg transition text-sm font-medium ${
                      viewMode === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    🔍 {strings.viewAll}
                  </button>
                  <button
                    onClick={() => setViewMode('saved')}
                    className={`w-full px-4 py-2 rounded-lg transition text-sm font-medium ${
                      viewMode === 'saved'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    ⭐ {strings.viewSaved} ({saved.length})
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Tenders Grid */}
          <section className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {sorted.length} {sorted.length === 1 ? 'licitación' : 'licitaciones'}
              </h2>
              {sorted.length > 0 && (
                <button
                  onClick={downloadCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                >
                  <Download className="w-4 h-4" />
                  📥 {strings.download}
                </button>
              )}
            </div>

            {/* Empty State */}
            {loading && (
              <div className="col-span-3 py-16 text-center">
                <div className="inline-block p-3 bg-slate-700 rounded-full mb-4">
                  <div className="animate-spin">⏳</div>
                </div>
                <p className="text-slate-400">Cargando licitaciones...</p>
              </div>
            )}

            {!loading && sorted.length === 0 && (
              <div className="py-16 text-center">
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">{strings.noResults}</p>
              </div>
            )}

            {/* Tender Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sorted.map((tender) => {
                const isUrgent = tender.dias_restantes < 7;
                const isSaved = saved.includes(tender.numero);

                return (
                  <article
                    key={tender.numero}
                    className={`bg-slate-800 border rounded-xl overflow-hidden transition hover:shadow-lg ${
                      isUrgent
                        ? 'border-red-500/50 shadow-lg shadow-red-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {/* Card Header with Urgency */}
                    <div className={`px-6 py-4 border-b ${
                      isUrgent ? 'bg-red-950/20 border-red-500/30' : 'border-slate-700'
                    }`}>
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-white leading-snug mb-2">
                            {tender.titulo?.substring(0, 60)}...
                          </h3>
                          <p className="text-xs text-slate-400">
                            {tender.flag} {tender.numero}
                          </p>
                        </div>
                        {isUrgent && (
                          <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full whitespace-nowrap">
                            ⚠️ {strings.urgent}
                          </span>
                        )}
                      </div>

                      {/* Quick Save Button in Header */}
                      <button
                        onClick={() => toggleSave(tender.numero)}
                        className={`flex items-center gap-2 text-sm font-medium transition ${
                          isSaved
                            ? 'text-yellow-400'
                            : 'text-slate-400 hover:text-yellow-400'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        {isSaved ? strings.marked : strings.mark}
                      </button>
                    </div>

                    {/* Card Body */}
                    <div className="px-6 py-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                              {strings.value}
                            </p>
                            <p className="text-xl font-bold text-blue-400">
                              ${parseInt(tender.valor).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                              {strings.deadline}
                            </p>
                            <p className="text-sm font-semibold text-white">
                              {tender.deadline}
                            </p>
                            {tender.dias_restantes && (
                              <p className={`text-xs mt-1 ${
                                isUrgent ? 'text-red-400 font-bold' : 'text-slate-400'
                              }`}>
                                {tender.dias_restantes} {strings.days}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-700">
                          <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                            {strings.entity}
                          </p>
                          <p className="text-sm text-slate-300">{tender.entidad}</p>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer CTA */}
                    <div className="px-6 py-4 border-t border-slate-700 bg-slate-900/50">
                      {tender.url && tender.url !== 'javascript:void(0)' ? (
                        <a
                          href={tender.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                        >
                          🔗 {strings.viewTender}
                        </a>
                      ) : (
                        <button className="w-full px-4 py-2 bg-slate-700 text-slate-400 cursor-not-allowed rounded-lg">
                          {strings.viewTender}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-700 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>Advance IDAN — Central America Water Procurement Portal</p>
          <p className="mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </footer>
    </div>
  );
};

export default TendersPage;
