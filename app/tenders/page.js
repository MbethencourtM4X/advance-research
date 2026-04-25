'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';

export default function TendersPage() {
  const [allTenders, setAllTenders] = useState([]);
  const [decisions, setDecisions] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [view, setView] = useState('search');
  const [advancedFilters, setAdvancedFilters] = useState({
    valueMin: 0,
    valueMax: 1000000,
    daysUrgency: 'all',
    projectType: 'all',
    searchQuery: '',
  });
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    fetch('/central-america-tenders-live.json')
      .then(res => res.json())
      .then(data => {
        const tenders = [];
        Object.values(data.countries).forEach(country => {
          if (country.tenders && Array.isArray(country.tenders)) {
            country.tenders.forEach(tender => {
              tenders.push({
                ...tender,
                projectType: classifyProjectType(tender.titulo),
                daysRemaining: tender.dias_restantes || calculateDaysRemaining(tender.deadline),
                numericValue: parseValue(tender.valor)
              });
            });
          }
        });
        setAllTenders(tenders);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading tenders:', err);
        setLoading(false);
      });

    const saved = localStorage.getItem('tender-decisions');
    if (saved) setDecisions(JSON.parse(saved));
  }, []);

  const parseValue = (valueStr) => {
    const num = parseFloat(String(valueStr).replace(/[^\d.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const calculateDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diff = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const classifyProjectType = (title) => {
    const lower = String(title).toLowerCase();
    if (lower.includes('construcción') || lower.includes('rehabilitación') || lower.includes('línea')) return 'infrastructure';
    if (lower.includes('equipo') || lower.includes('medidor') || lower.includes('válvula') || lower.includes('bomba') || lower.includes('repuesto')) return 'equipment';
    if (lower.includes('limpieza') || lower.includes('mantenimiento') || lower.includes('desinfección') || lower.includes('servicio')) return 'services';
    if (lower.includes('consultoría') || lower.includes('auditoría') || lower.includes('certificación')) return 'consulting';
    return 'other';
  };

  const toggleDecision = (id, decision) => {
    const updated = { ...decisions };
    if (updated[id]?.choice === decision) {
      delete updated[id];
    } else {
      updated[id] = {
        choice: decision,
        timestamp: new Date().toISOString()
      };
    }
    setDecisions(updated);
    localStorage.setItem('tender-decisions', JSON.stringify(updated));
  };

  const getCountryFlag = (pais) => {
    const flags = {
      panama: '🇵🇦',
      costa_rica: '🇨🇷',
      nicaragua: '🇳🇮',
      el_salvador: '🇸🇻'
    };
    return flags[pais] || '🌍';
  };

  const getCountryName = (pais) => {
    const names = {
      panama: 'Panamá',
      costa_rica: 'Costa Rica',
      nicaragua: 'Nicaragua',
      el_salvador: 'El Salvador'
    };
    return names[pais] || pais;
  };

  const getFilteredTenders = () => {
    return allTenders.filter(t => {
      const decision = decisions[t.id];
      
      if (filter === 'yes' && decision?.choice !== 'yes') return false;
      if (filter === 'no' && decision?.choice !== 'no') return false;
      if (filter === 'pending' && decision?.choice) return false;
      if (filter === 'all' && decision?.choice === 'no') return false;

      if (countryFilter !== 'all' && t.pais !== countryFilter) return false;

      if (t.numericValue < advancedFilters.valueMin || t.numericValue > advancedFilters.valueMax) return false;

      if (advancedFilters.daysUrgency !== 'all') {
        if (advancedFilters.daysUrgency === 'urgent' && t.daysRemaining >= 10) return false;
        if (advancedFilters.daysUrgency === 'soon' && (t.daysRemaining < 10 || t.daysRemaining > 20)) return false;
        if (advancedFilters.daysUrgency === 'later' && t.daysRemaining <= 20) return false;
      }

      if (advancedFilters.projectType !== 'all' && t.projectType !== advancedFilters.projectType) return false;

      const titleField = t.titulo || '';
      if (advancedFilters.searchQuery && !String(titleField).toLowerCase().includes(advancedFilters.searchQuery.toLowerCase())) return false;

      if (t.estado !== 'ABIERTA') return false;

      return true;
    });
  };

  const getActiveTenders = () => {
    return allTenders.filter(t => decisions[t.id]?.choice === 'yes');
  };

  const exportToCSV = () => {
    const activos = getActiveTenders();
    if (activos.length === 0) {
      alert('No hay licitaciones marcadas como interesantes');
      return;
    }

    const headers = ['País', 'Licitación', 'Título', 'Valor', 'Moneda', 'Deadline', 'Días Restantes', 'Entidad'];
    const rows = activos.map(t => [
      getCountryName(t.pais),
      t.numero,
      t.titulo,
      t.valor,
      t.moneda,
      t.deadline,
      t.daysRemaining,
      t.entidad
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `licitaciones-activas-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    total: allTenders.filter(t => t.estado === 'ABIERTA').length,
    interested: Object.values(decisions).filter(d => d?.choice === 'yes').length,
    notInterested: Object.values(decisions).filter(d => d?.choice === 'no').length,
    pending: allTenders.filter(t => t.estado === 'ABIERTA').length - Object.keys(decisions).length
  };

  const filtered = getFilteredTenders();
  const activos = getActiveTenders();
  const urgentCount = filtered.filter(t => t.daysRemaining < 7).length;

  const handleSearchPliego = (tenderNumber, pais) => {
    if (pais === 'panama') {
      window.open(
        `https://www.panamacompra.gob.pa/inicio/portal-interno/#/proceso/busqueda-avanzada?numero=${encodeURIComponent(tenderNumber)}`,
        '_blank'
      );
    } else if (pais === 'costa_rica') {
      window.open(`https://www.sicop.go.cr/app`, '_blank');
    } else if (pais === 'nicaragua') {
      window.open(`https://www.gestion.nicaraguacompra.gob.ni/siscae/portal`, '_blank');
    } else if (pais === 'el_salvador') {
      window.open(`https://www.compra.sal.gob.sv`, '_blank');
    }
  };

  return (
    <main className="tenders-page">
      <header className="tenders-header">
        <h1>🌎 Centro America - Licitaciones de Agua</h1>
        <p>Rastreo de oportunidades de agua en Panamá, Costa Rica, Nicaragua y El Salvador</p>
        <div className="tender-count">Licitaciones Abiertas: <strong>{stats.total}</strong></div>
      </header>

      <section className="view-switcher">
        <button 
          className={`view-btn ${view === 'search' ? 'active' : ''}`}
          onClick={() => setView('search')}
        >
          🔍 Buscar
        </button>
        <button 
          className={`view-btn ${view === 'activas' ? 'active' : ''}`}
          onClick={() => setView('activas')}
        >
          ⭐ Licitaciones Activas ({stats.interested})
        </button>
      </section>

      {view === 'search' ? (
        <>
          <section className="stats-section">
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-label">Total Abiertas</div>
                <div className="stat-number">{stats.total}</div>
              </div>
              <div className="stat-card success">
                <div className="stat-label">Interesantes</div>
                <div className="stat-number">{stats.interested}</div>
              </div>
              <div className="stat-card warning">
                <div className="stat-label">Descartadas</div>
                <div className="stat-number">{stats.notInterested}</div>
              </div>
              <div className="stat-card pending">
                <div className="stat-label">Pendientes</div>
                <div className="stat-number">{stats.pending}</div>
              </div>
              {urgentCount > 0 && (
                <div className="stat-card urgent">
                  <div className="stat-label">Urgentes (&lt; 7 días)</div>
                  <div className="stat-number">{urgentCount}</div>
                </div>
              )}
            </div>
          </section>

          <section className="filters-section">
            <h2>Filtros</h2>
            
            <div className="filters-container">
              <div className="filter-group">
                <label>País</label>
                <select 
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                >
                  <option value="all">Todos los países</option>
                  <option value="panama">🇵🇦 Panamá</option>
                  <option value="costa_rica">🇨🇷 Costa Rica</option>
                  <option value="nicaragua">🇳🇮 Nicaragua</option>
                  <option value="el_salvador">🇸🇻 El Salvador</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Buscar por título</label>
                <input 
                  type="text" 
                  placeholder="Ej: desinfección, medidores, agua..."
                  value={advancedFilters.searchQuery}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, searchQuery: e.target.value})}
                  className="search-input"
                />
              </div>

              <div className="filter-group">
                <label>Rango de Valor</label>
                <div className="filter-inputs">
                  <input 
                    type="number" 
                    min="0" 
                    max="1000000"
                    value={advancedFilters.valueMin}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, valueMin: parseInt(e.target.value) || 0})}
                  />
                  <span>–</span>
                  <input 
                    type="number" 
                    min="0" 
                    max="1000000"
                    value={advancedFilters.valueMax}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, valueMax: parseInt(e.target.value) || 1000000})}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Urgencia</label>
                <select 
                  value={advancedFilters.daysUrgency}
                  onChange={(e) => setAdvancedFilters({...advancedFilters, daysUrgency: e.target.value})}
                >
                  <option value="all">Todas</option>
                  <option value="urgent">Muy urgente (&lt; 10 días)</option>
                  <option value="soon">Próximas (10-20 días)</option>
                  <option value="later">Con tiempo (&gt; 20 días)</option>
                </select>
              </div>
            </div>

            <div className="decision-filter">
              <span>Filtrar por decisión:</span>
              <div className="filter-buttons">
                {[
                  { v: 'all', l: 'Todos', c: 'primary' },
                  { v: 'pending', l: 'Pendientes', c: 'pending' },
                  { v: 'yes', l: 'Interesantes', c: 'success' },
                  { v: 'no', l: 'Descartadas', c: 'danger' }
                ].map(f => (
                  <button
                    key={f.v}
                    onClick={() => setFilter(f.v)}
                    className={`filter-btn ${f.c} ${filter === f.v ? 'active' : ''}`}
                  >
                    {f.l}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Cargando licitaciones...</p>
            </div>
          ) : filtered.length > 0 ? (
            <section className="tenders-section">
              <div className="tenders-summary">
                Mostrando {filtered.length} de {stats.total} licitaciones abiertas
              </div>
              <div className="tenders-list">
                {filtered.map(tender => (
                  <article key={tender.id} className={`tender-card ${decisions[tender.id]?.choice ? 'decided-' + decisions[tender.id].choice : 'undecided'}`}>
                    <div className="tender-header">
                      <div>
                        <h3>{getCountryFlag(tender.pais)} {tender.titulo}</h3>
                        <div className="tender-id">Licitación: <strong>{tender.numero}</strong></div>
                      </div>
                      <div className="tender-decision">
                        {decisions[tender.id]?.choice === 'yes' && <span className="badge success">Interesante</span>}
                        {decisions[tender.id]?.choice === 'no' && <span className="badge danger">Descartada</span>}
                      </div>
                    </div>

                    <div className="tender-body">
                      <div className="tender-grid">
                        <div className="tender-info">
                          <div className="info-item">
                            <span className="label">Valor</span>
                            <span className="value">{tender.valor} {tender.moneda}</span>
                          </div>
                          <div className="info-item">
                            <span className="label">Deadline</span>
                            <span className="value deadline">{tender.deadline}</span>
                            <span className="days">{tender.daysRemaining} días</span>
                          </div>
                          <div className="info-item">
                            <span className="label">Entidad</span>
                            <span className="value">{tender.entidad}</span>
                          </div>
                        </div>
                      </div>

                      <div className="tender-cta">
                        <button 
                          onClick={() => handleSearchPliego(tender.numero, tender.pais)}
                          className="btn-link"
                        >
                          📄 Ver Licitación
                        </button>
                      </div>
                    </div>

                    <div className="tender-actions">
                      <button
                        onClick={() => toggleDecision(tender.id, 'yes')}
                        className={`action-btn success ${decisions[tender.id]?.choice === 'yes' ? 'active' : ''}`}
                      >
                        ⭐ Interesante
                      </button>
                      <button
                        onClick={() => toggleDecision(tender.id, 'no')}
                        className={`action-btn danger ${decisions[tender.id]?.choice === 'no' ? 'active' : ''}`}
                      >
                        ✗ Descartar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <section className="empty-state">
              <div className="empty-content">
                <div className="empty-icon">Sin resultados</div>
                <p>No hay licitaciones que coincidan con tus filtros.</p>
              </div>
            </section>
          )}
        </>
      ) : (
        <section className="activas-section">
          <div className="activas-header">
            <div>
              <h2>⭐ Licitaciones Activas</h2>
              <p>Licitaciones que has marcado como interesantes</p>
            </div>
            {activos.length > 0 && (
              <button className="btn-export" onClick={exportToCSV}>
                📥 Descargar CSV
              </button>
            )}
          </div>

          {activos.length > 0 ? (
            <div className="activas-list">
              {activos.map(tender => (
                <article key={tender.id} className="activa-card">
                  <div className="activa-header">
                    <h3>{getCountryFlag(tender.pais)} {tender.titulo}</h3>
                    <span className="badge success">Interesante</span>
                  </div>

                  <div className="activa-body">
                    <div className="activa-grid">
                      <div className="info-row">
                        <span className="label">Licitación:</span>
                        <span className="value">{tender.numero}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">País:</span>
                        <span className="value">{getCountryName(tender.pais)}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Valor:</span>
                        <span className="value">{tender.valor} {tender.moneda}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Deadline:</span>
                        <span className="value deadline">{tender.deadline} ({tender.daysRemaining} días)</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Entidad:</span>
                        <span className="value">{tender.entidad}</span>
                      </div>
                    </div>
                  </div>

                  <div className="activa-actions">
                    <button 
                      onClick={() => handleSearchPliego(tender.numero, tender.pais)}
                      className="btn-view"
                    >
                      📄 Ver Licitación
                    </button>
                    <button 
                      onClick={() => toggleDecision(tender.id, 'no')}
                      className="btn-remove"
                    >
                      Remover
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-content">
                <div className="empty-icon">📋</div>
                <h3>Sin licitaciones marcadas</h3>
                <p>Ve a la sección "Buscar" y marca licitaciones como interesantes para verlas aquí.</p>
              </div>
            </div>
          )}
        </section>
      )}

      <style jsx>{`
        .tenders-page { background: var(--light); }
        .tenders-header { background: linear-gradient(135deg, #004A94 0%, #0066cc 100%); color: white; padding: 3rem 2rem; text-align: center; }
        .tenders-header h1 { font-family: 'Oswald', sans-serif; font-size: 2rem; margin-bottom: 0.5rem; }
        .tenders-header p { font-size: 1.1rem; opacity: 0.95; margin-bottom: 1rem; }
        .tender-count { font-size: 1.2rem; font-weight: 600; }
        .view-switcher { max-width: 1200px; margin: 2rem auto 0; padding: 0 2rem; display: flex; gap: 1rem; border-bottom: 1px solid #ddd; }
        .view-btn { padding: 1rem 1.5rem; background: transparent; border: none; cursor: pointer; font-weight: 600; color: #666; border-bottom: 3px solid transparent; transition: all 0.2s; }
        .view-btn.active { color: #004A94; border-bottom-color: #004A94; }
        .view-btn:hover { color: #004A94; }
        .stats-section { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; }
        .stat-card { padding: 1.5rem; border-radius: 8px; color: white; text-align: center; animation: slideIn 0.3s ease-out; }
        .stat-card.primary { background: linear-gradient(135deg, #004A94, #0066cc); }
        .stat-card.success { background: linear-gradient(135deg, #12b86f, #12b86f); }
        .stat-card.warning { background: linear-gradient(135deg, #f59e0b, #f59e0b); }
        .stat-card.pending { background: linear-gradient(135deg, #6B7280, #9CA3AF); }
        .stat-card.urgent { background: linear-gradient(135deg, #ef4444, #ef4444); }
        .stat-label { font-size: 0.85rem; opacity: 0.9; margin-bottom: 0.5rem; }
        .stat-number { font-family: 'Oswald', sans-serif; font-size: 2rem; font-weight: 700; }
        .filters-section { max-width: 1200px; margin: 0 auto 2rem; padding: 0 2rem; }
        .filters-section h2 { font-family: 'Oswald', sans-serif; font-size: 1.5rem; color: #004A94; margin-bottom: 1.5rem; }
        .filters-container { background: white; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
        .filter-group { display: flex; flex-direction: column; }
        .filter-group label { font-weight: 600; margin-bottom: 0.5rem; color: #004A94; font-size: 0.9rem; }
        .search-input { padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem; }
        .filter-inputs { display: flex; gap: 0.5rem; align-items: center; }
        .filter-inputs input { flex: 1; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; }
        select { padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem; background: white; }
        .decision-filter { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
        .decision-filter span { font-weight: 600; margin-right: 1rem; color: #004A94; }
        .filter-buttons { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem; }
        .filter-btn { padding: 0.5rem 1rem; border: 2px solid transparent; border-radius: 6px; background: #f3f4f6; color: #333; cursor: pointer; font-weight: 600; transition: all 0.2s; }
        .filter-btn.primary.active { background: #004A94; color: white; }
        .filter-btn.success.active { background: #12b86f; color: white; }
        .filter-btn.pending.active { background: #9CA3AF; color: white; }
        .filter-btn.danger.active { background: #ef4444; color: white; }
        .tenders-section { max-width: 1200px; margin: 0 auto; padding: 0 2rem 2rem; }
        .tenders-summary { color: #666; margin-bottom: 1rem; font-size: 0.95rem; }
        .tenders-list { display: grid; gap: 1rem; }
        .tender-card { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); overflow: hidden; border-left: 4px solid #ddd; animation: slideIn 0.3s ease-out; }
        .tender-card.decided-yes { border-left-color: #12b86f; }
        .tender-card.decided-no { border-left-color: #ef4444; }
        .tender-card:hover { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); transform: translateY(-2px); }
        .tender-header { padding: 1.5rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: flex-start; }
        .tender-header h3 { font-family: 'Oswald', sans-serif; font-size: 1.1rem; margin: 0 0 0.5rem 0; color: #333; font-weight: 600; }
        .tender-id { font-size: 0.9rem; color: #666; }
        .tender-id strong { color: #004A94; font-weight: 700; }
        .badge { display: inline-block; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; color: white; }
        .badge.success { background: #12b86f; }
        .badge.danger { background: #ef4444; }
        .tender-body { padding: 1.5rem; border-bottom: 1px solid #eee; }
        .tender-grid { display: grid; gap: 1rem; margin-bottom: 1rem; }
        .tender-info { display: grid; gap: 1rem; grid-template-columns: repeat(3, 1fr); }
        .info-item { display: grid; gap: 0.25rem; }
        .info-item .label { font-size: 0.8rem; font-weight: 600; color: #666; text-transform: uppercase; }
        .info-item .value { font-size: 1rem; color: #333; font-weight: 500; }
        .info-item .deadline { color: #f59e0b; }
        .info-item .days { font-size: 0.85rem; color: #666; }
        .tender-cta { margin-bottom: 0; }
        .btn-link { display: inline-block; padding: 0.75rem 1.5rem; background: #004A94; color: white; border-radius: 6px; text-decoration: none; font-weight: 600; transition: all 0.2s; font-size: 0.9rem; border: none; cursor: pointer; }
        .btn-link:hover { background: #003370; transform: translateY(-2px); }
        .tender-actions { display: flex; gap: 0.75rem; padding: 1rem; background: #f9fafb; border-top: 1px solid #eee; border-radius: 0 0 8px 8px; }
        .action-btn { flex: 1; padding: 0.75rem; border: 2px solid transparent; border-radius: 6px; background: #f3f4f6; color: #333; cursor: pointer; font-weight: 600; transition: all 0.2s; }
        .action-btn.success { color: #12b86f; }
        .action-btn.success.active { background: #12b86f; color: white; }
        .action-btn.danger { color: #ef4444; }
        .action-btn.danger.active { background: #ef4444; color: white; }
        .loading { text-align: center; padding: 4rem 2rem; }
        .loading-spinner { width: 40px; height: 40px; border: 4px solid #ddd; border-top-color: #004A94; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
        .empty-state { padding: 4rem 2rem; text-align: center; }
        .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
        .empty-content h3 { color: #333; margin-bottom: 0.5rem; }
        .empty-content p { color: #666; }
        .activas-section { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .activas-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
        .activas-header h2 { font-family: 'Oswald', sans-serif; font-size: 1.5rem; color: #004A94; margin: 0 0 0.5rem 0; }
        .activas-header p { color: #666; margin: 0; }
        .btn-export { padding: 0.75rem 1.5rem; background: #12b86f; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-export:hover { background: #10a55f; transform: translateY(-2px); }
        .activas-list { display: grid; gap: 1rem; }
        .activa-card { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); border-left: 4px solid #12b86f; overflow: hidden; }
        .activa-header { padding: 1.5rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: flex-start; }
        .activa-header h3 { font-family: 'Oswald', sans-serif; font-size: 1.1rem; margin: 0; color: #333; }
        .activa-body { padding: 1.5rem; }
        .activa-grid { display: grid; gap: 0.75rem; }
        .info-row { display: grid; grid-template-columns: 150px 1fr; gap: 1rem; }
        .info-row .label { font-weight: 600; color: #666; font-size: 0.9rem; }
        .info-row .value { color: #333; }
        .info-row .deadline { color: #f59e0b; }
        .activa-actions { display: flex; gap: 1rem; padding: 1rem; background: #f9fafb; border-top: 1px solid #eee; border-radius: 0 0 8px 8px; }
        .btn-view { flex: 1; padding: 0.75rem 1rem; background: #004A94; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-view:hover { background: #003370; }
        .btn-remove { flex: 1; padding: 0.75rem 1rem; background: #f3f4f6; color: #ef4444; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .btn-remove:hover { background: #ef4444; color: white; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          .view-switcher { flex-direction: column; }
          .view-btn { border-bottom: none; border-right: 3px solid transparent; text-align: left; }
          .view-btn.active { border-right-color: #004A94; border-bottom: none; }
          .activas-header { flex-direction: column; }
          .btn-export { width: 100%; }
          .info-row { grid-template-columns: 1fr; }
          .tender-info { grid-template-columns: 1fr; }
          .activa-actions { flex-direction: column; }
        }
      `}</style>
    </main>
  );
}
