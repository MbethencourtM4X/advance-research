'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';

export default function TendersPage() {
  const [tenders, setTenders] = useState([]);
  const [decisions, setDecisions] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [advancedFilters, setAdvancedFilters] = useState({
    valueMin: 0,
    valueMax: 1000000,
    daysUrgency: 'all',
    projectType: 'all',
    searchQuery: ''
  });
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    fetch('/idan-tenders-live.json')
      .then(res => res.json())
      .then(data => {
        setTenders((data.tenders || []).map(tender => {
          // Use FULL tender ID for URL
          const fullId = tender.id; // e.g., "IDAN-LICIT-2026-0001"
          // Panama Compra URL structure with full ID
          const url = `https://www.panamacompra.gob.pa/licitacion/${fullId}`;
          
          return {
            ...tender,
            fullId: fullId,
            url: url,
            projectType: classifyProjectType(tender.title),
            daysRemaining: calculateDaysRemaining(tender.deadline),
            numericValue: parseValue(tender.estimated_value)
          };
        }));
        setLoading(false);
      })
      .catch(err => console.error('Error:', err));

    const saved = localStorage.getItem('tender-decisions');
    if (saved) setDecisions(JSON.parse(saved));
  }, []);

  const parseValue = (valueStr) => {
    const num = parseFloat(valueStr.replace(/[^\d.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const calculateDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diff = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const classifyProjectType = (title) => {
    const lower = title.toLowerCase();
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

  const getFilteredTenders = () => {
    return tenders.filter(t => {
      const decision = decisions[t.id];
      
      if (filter === 'yes' && decision?.choice !== 'yes') return false;
      if (filter === 'no' && decision?.choice !== 'no') return false;
      if (filter === 'pending' && decision?.choice) return false;
      if (filter === 'all' && decision?.choice === 'no') return false;

      if (t.numericValue < advancedFilters.valueMin || t.numericValue > advancedFilters.valueMax) return false;

      if (advancedFilters.daysUrgency !== 'all') {
        if (advancedFilters.daysUrgency === 'urgent' && t.daysRemaining >= 10) return false;
        if (advancedFilters.daysUrgency === 'soon' && (t.daysRemaining < 10 || t.daysRemaining > 20)) return false;
        if (advancedFilters.daysUrgency === 'later' && t.daysRemaining <= 20) return false;
      }

      if (advancedFilters.projectType !== 'all' && t.projectType !== advancedFilters.projectType) return false;

      if (advancedFilters.searchQuery && !t.title.toLowerCase().includes(advancedFilters.searchQuery.toLowerCase())) return false;

      return true;
    });
  };

  const stats = {
    total: tenders.length,
    interested: Object.values(decisions).filter(d => d?.choice === 'yes').length,
    notInterested: Object.values(decisions).filter(d => d?.choice === 'no').length,
    pending: tenders.length - Object.keys(decisions).length
  };

  const filtered = getFilteredTenders();
  const urgentCount = filtered.filter(t => t.daysRemaining < 7).length;

  return (
    <main className="tenders-page">
      <header className="tenders-header">
        <h1>Dashboard de Licitaciones IDAN</h1>
        <p>Rastreo de oportunidades de agua del gobierno de Panamá</p>
        <div className="tender-count">Total de Licitaciones: <strong>{stats.total}</strong></div>
      </header>

      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-label">Total</div>
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
            <label>Buscar por título</label>
            <input 
              type="text" 
              placeholder="Ej: desinfección, medidores, construcción..."
              value={advancedFilters.searchQuery}
              onChange={(e) => setAdvancedFilters({...advancedFilters, searchQuery: e.target.value})}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>Rango de Valor (B/.)</label>
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
            <label>Urgencia (Deadline)</label>
            <select 
              value={advancedFilters.daysUrgency}
              onChange={(e) => setAdvancedFilters({...advancedFilters, daysUrgency: e.target.value})}
            >
              <option value="all">Todas</option>
              <option value="urgent">Muy Urgente (menos de 10 días)</option>
              <option value="soon">Próximas (10-20 días)</option>
              <option value="later">Con Tiempo (más de 20 días)</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Tipo de Proyecto</label>
            <select 
              value={advancedFilters.projectType}
              onChange={(e) => setAdvancedFilters({...advancedFilters, projectType: e.target.value})}
            >
              <option value="all">Todos los Tipos</option>
              <option value="infrastructure">Infraestructura</option>
              <option value="equipment">Equipos</option>
              <option value="services">Servicios</option>
              <option value="consulting">Consultoría</option>
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
            Mostrando {filtered.length} de {tenders.length} licitaciones
          </div>
          <div className="tenders-list">
            {filtered.map(tender => (
              <article key={tender.id} className={`tender-card ${decisions[tender.id]?.choice ? 'decided-' + decisions[tender.id].choice : 'undecided'}`}>
                <div className="tender-header">
                  <div>
                    <h3>{tender.title}</h3>
                    <div className="tender-id">Licitación: <strong>{tender.fullId}</strong></div>
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
                        <span className="value">{tender.estimated_value}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Deadline</span>
                        <span className="value deadline">{tender.deadline}</span>
                        <span className="days">{tender.daysRemaining} días</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Tipo</span>
                        <span className="value category">{tender.projectType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="tender-cta">
                    <a 
                      href={tender.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-link"
                    >
                      Ver en Panamá Compra: {tender.fullId}
                    </a>
                  </div>
                </div>

                <div className="tender-actions">
                  <button
                    onClick={() => toggleDecision(tender.id, 'yes')}
                    className={`action-btn success ${decisions[tender.id]?.choice === 'yes' ? 'active' : ''}`}
                    title="Marcar como interesante"
                  >
                    Interesante
                  </button>
                  <button
                    onClick={() => toggleDecision(tender.id, 'no')}
                    className={`action-btn danger ${decisions[tender.id]?.choice === 'no' ? 'active' : ''}`}
                    title="Marcar como descartada"
                  >
                    Descartar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="empty-state">
          <div className="empty-content">
            <div className="empty-icon">Búsqueda sin resultados</div>
            <p>No hay licitaciones que coincidan con tus filtros. Intenta ajustar los criterios.</p>
          </div>
        </section>
      )}

      <style jsx>{`
        .tenders-page { background: var(--light); }
        .tenders-header { background: linear-gradient(135deg, var(--primary) 0%, #0066cc 100%); color: white; padding: 3rem 2rem; text-align: center; }
        .tenders-header h1 { font-family: 'Oswald', sans-serif; font-size: 2rem; margin-bottom: 0.5rem; }
        .tenders-header p { font-size: 1.1rem; opacity: 0.95; margin-bottom: 1rem; }
        .tender-count { font-size: 1.2rem; font-weight: 600; }
        .stats-section { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; }
        .stat-card { padding: 1.5rem; border-radius: 8px; color: white; text-align: center; animation: slideIn 0.3s ease-out; }
        .stat-card.primary { background: linear-gradient(135deg, var(--primary), #0066cc); }
        .stat-card.success { background: linear-gradient(135deg, var(--success), #12b86f); }
        .stat-card.warning { background: linear-gradient(135deg, var(--warning), #f59e0b); }
        .stat-card.pending { background: linear-gradient(135deg, #6B7280, #9CA3AF); }
        .stat-card.urgent { background: linear-gradient(135deg, var(--error), #ef4444); }
        .stat-label { font-size: 0.85rem; opacity: 0.9; margin-bottom: 0.5rem; }
        .stat-number { font-family: 'Oswald', sans-serif; font-size: 2rem; font-weight: 700; }
        .filters-section { max-width: 1200px; margin: 0 auto 2rem; padding: 0 2rem; }
        .filters-section h2 { font-family: 'Oswald', sans-serif; font-size: 1.5rem; color: var(--text-primary); margin-bottom: 1.5rem; }
        .filters-container { background: white; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
        .filter-group { display: flex; flex-direction: column; }
        .filter-group label { font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary); font-size: 0.9rem; }
        .search-input { padding: 0.75rem; border: 1px solid var(--border); border-radius: 6px; font-size: 0.95rem; }
        .filter-inputs { display: flex; gap: 0.5rem; align-items: center; }
        .filter-inputs input { flex: 1; padding: 0.5rem; border: 1px solid var(--border); border-radius: 4px; }
        select { padding: 0.75rem; border: 1px solid var(--border); border-radius: 6px; font-size: 0.95rem; background: white; }
        .decision-filter { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
        .decision-filter span { font-weight: 600; margin-right: 1rem; color: var(--text-primary); }
        .filter-buttons { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem; }
        .filter-btn { padding: 0.5rem 1rem; border: 2px solid transparent; border-radius: 6px; background: #f3f4f6; color: var(--text-primary); cursor: pointer; font-weight: 600; transition: all 0.2s; }
        .filter-btn.primary.active { background: var(--primary); color: white; border-color: var(--primary); }
        .filter-btn.success.active { background: var(--success); color: white; border-color: var(--success); }
        .filter-btn.pending.active { background: #9CA3AF; color: white; border-color: #9CA3AF; }
        .filter-btn.danger.active { background: var(--error); color: white; border-color: var(--error); }
        .filter-btn:hover:not(.active) { border-color: var(--border); background: white; }
        .tenders-section { max-width: 1200px; margin: 0 auto; padding: 0 2rem 2rem; }
        .tenders-summary { color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.95rem; }
        .tenders-list { display: grid; gap: 1rem; }
        .tender-card { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); overflow: hidden; transition: all 0.2s; border-left: 4px solid var(--border); animation: slideIn 0.3s ease-out; }
        .tender-card.decided-yes { border-left-color: var(--success); }
        .tender-card.decided-no { border-left-color: var(--error); }
        .tender-card:hover { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); transform: translateY(-2px); }
        .tender-header { padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: flex-start; }
        .tender-header h3 { font-family: 'Oswald', sans-serif; font-size: 1.1rem; margin: 0 0 0.5rem 0; color: var(--text-primary); font-weight: 600; }
        .tender-id { font-size: 0.9rem; color: var(--text-secondary); }
        .tender-id strong { color: var(--primary); font-weight: 700; }
        .tender-decision { display: flex; gap: 0.5rem; }
        .badge { display: inline-block; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; color: white; }
        .badge.success { background: var(--success); }
        .badge.danger { background: var(--error); }
        .tender-body { padding: 1.5rem; }
        .tender-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 1.5rem; }
        .tender-info { display: grid; gap: 1rem; }
        .info-item { display: grid; gap: 0.25rem; }
        .info-item .label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
        .info-item .value { font-size: 1rem; color: var(--text-primary); font-weight: 500; }
        .info-item .deadline { color: var(--warning); }
        .info-item .days { font-size: 0.85rem; color: var(--text-secondary); }
        .info-item .category { text-transform: capitalize; color: var(--primary); font-weight: 600; }
        .tender-cta { margin-bottom: 1rem; }
        .btn-link { display: inline-block; padding: 0.75rem 1.5rem; background: var(--primary); color: white; border-radius: 6px; text-decoration: none; font-weight: 600; transition: all 0.2s; font-size: 0.9rem; }
        .btn-link:hover { background: #003370; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 74, 148, 0.25); }
        .tender-actions { display: flex; gap: 0.75rem; padding: 1rem; background: var(--light); border-top: 1px solid var(--border); border-radius: 0 0 8px 8px; }
        .action-btn { flex: 1; padding: 0.75rem; border: 2px solid transparent; border-radius: 6px; background: #f3f4f6; color: var(--text-primary); cursor: pointer; font-weight: 600; transition: all 0.2s; }
        .action-btn.success { color: var(--success); }
        .action-btn.success.active { background: var(--success); color: white; }
        .action-btn.danger { color: var(--error); }
        .action-btn.danger.active { background: var(--error); color: white; }
        .action-btn:hover { transform: translateY(-2px); }
        .loading { text-align: center; padding: 4rem 2rem; color: var(--text-secondary); }
        .loading-spinner { width: 40px; height: 40px; border: 4px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .empty-state { padding: 4rem 2rem; text-align: center; }
        .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
        .empty-content p { color: var(--text-secondary); font-size: 1rem; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          .tenders-header { padding: 2rem 1rem; }
          .tenders-header h1 { font-size: 1.5rem; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .filters-container { grid-template-columns: 1fr; }
          .tender-grid { grid-template-columns: 1fr; }
          .tender-actions { flex-direction: column; }
          .filter-buttons { flex-direction: column; }
          .filter-btn { width: 100%; }
        }
      `}</style>
    </main>
  );
}
