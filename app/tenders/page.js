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
    daysUrgency: 'all', // all, urgent (< 10 days), soon (10-20 days), later (> 20 days)
    projectType: 'all' // all, infrastructure, equipment, services, consulting
  });
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    fetch('/idan-tenders-live.json')
      .then(res => res.json())
      .then(data => {
        setTenders((data.tenders || []).map(tender => ({
          ...tender,
          url: generateTenderUrl(tender.id),
          projectType: classifyProjectType(tender.title),
          daysRemaining: calculateDaysRemaining(tender.deadline),
          numericValue: parseValue(tender.estimated_value)
        })));
        setLoading(false);
      })
      .catch(err => console.error('Error:', err));

    const saved = localStorage.getItem('tender-decisions');
    if (saved) setDecisions(JSON.parse(saved));
  }, []);

  const generateTenderUrl = (tenderId) => {
    return `https://www.panamacompra.gob.pa/licitacion/${tenderId}`;
  };

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
    if (lower.includes('construcción') || lower.includes('rehabilitación') || lower.includes('línea de conducción')) return 'infrastructure';
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
      
      // Basic filter (yes/no/pending/all)
      if (filter === 'yes' && decision?.choice !== 'yes') return false;
      if (filter === 'no' && decision?.choice !== 'no') return false;
      if (filter === 'pending' && decision?.choice) return false;
      if (filter === 'all' && decision?.choice === 'no') return false;

      // Advanced filters
      if (t.numericValue < advancedFilters.valueMin || t.numericValue > advancedFilters.valueMax) return false;

      if (advancedFilters.daysUrgency !== 'all') {
        if (advancedFilters.daysUrgency === 'urgent' && t.daysRemaining >= 10) return false;
        if (advancedFilters.daysUrgency === 'soon' && (t.daysRemaining < 10 || t.daysRemaining > 20)) return false;
        if (advancedFilters.daysUrgency === 'later' && t.daysRemaining <= 20) return false;
      }

      if (advancedFilters.projectType !== 'all' && t.projectType !== advancedFilters.projectType) return false;

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

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{
        background: 'linear-gradient(135deg, #0066cc 0%, #00a3e0 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h1>📋 {t.tenders.title}</h1>
        <p>{t.tenders.subtitle}</p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #0066cc', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Total</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0066cc' }}>{stats.total}</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #28a745', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Interested</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>{stats.interested}</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #d32f2f', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Not Int.</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d32f2f' }}>{stats.notInterested}</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #ff9800', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Pending</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff9800' }}>{stats.pending}</div>
        </div>
      </div>

      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3>Basic Filter:</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {[
            { v: 'all', l: 'All', c: '#666' },
            { v: 'pending', l: 'Pending', c: '#ff9800' },
            { v: 'yes', l: '✅ Yes', c: '#28a745' },
            { v: 'no', l: '❌ No', c: '#d32f2f' }
          ].map(f => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              style={{
                padding: '0.5rem 1rem',
                border: filter === f.v ? `2px solid ${f.c}` : '1px solid #ddd',
                background: filter === f.v ? f.c : 'white',
                color: filter === f.v ? 'white' : f.c,
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: filter === f.v ? 'bold' : 'normal'
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <h3>Advanced Filters:</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Value Range (B/.)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input 
                type="number" 
                min="0" 
                max="1000000"
                value={advancedFilters.valueMin}
                onChange={(e) => setAdvancedFilters({...advancedFilters, valueMin: parseInt(e.target.value) || 0})}
                style={{ width: '80px', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <span>–</span>
              <input 
                type="number" 
                min="0" 
                max="1000000"
                value={advancedFilters.valueMax}
                onChange={(e) => setAdvancedFilters({...advancedFilters, valueMax: parseInt(e.target.value) || 1000000})}
                style={{ width: '80px', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Deadline Urgency
            </label>
            <select 
              value={advancedFilters.daysUrgency}
              onChange={(e) => setAdvancedFilters({...advancedFilters, daysUrgency: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="all">All</option>
              <option value="urgent">Very Soon (&lt; 10 days)</option>
              <option value="soon">Soon (10-20 days)</option>
              <option value="later">Later (&gt; 20 days)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Project Type
            </label>
            <select 
              value={advancedFilters.projectType}
              onChange={(e) => setAdvancedFilters({...advancedFilters, projectType: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="all">All Types</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="equipment">Equipment</option>
              <option value="services">Services</option>
              <option value="consulting">Consulting</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length > 0 ? (
        <div>
          <p style={{ color: '#666', marginBottom: '1rem' }}>Showing {filtered.length} of {tenders.length} tenders</p>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {filtered.map(tender => (
              <div key={tender.id} style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderLeft: decisions[tender.id]?.choice === 'yes' ? '4px solid #28a745' : decisions[tender.id]?.choice === 'no' ? '4px solid #d32f2f' : '4px solid #ddd'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '1rem', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>{tender.title}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ color: '#999', fontSize: '0.85rem' }}>ID</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{tender.id}</div>
                      </div>
                      <div>
                        <div style={{ color: '#999', fontSize: '0.85rem' }}>Value</div>
                        <div style={{ fontWeight: 'bold', color: '#28a745' }}>{tender.estimated_value}</div>
                      </div>
                      <div>
                        <div style={{ color: '#999', fontSize: '0.85rem' }}>Deadline</div>
                        <div style={{ fontWeight: 'bold', color: '#ff9800' }}>{tender.deadline} ({tender.daysRemaining}d)</div>
                      </div>
                      <div>
                        <div style={{ color: '#999', fontSize: '0.85rem' }}>Type</div>
                        <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{tender.projectType}</div>
                      </div>
                    </div>
                    <a 
                      href={tender.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        background: '#0066cc',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}
                    >
                      → View on IDAN Portal
                    </a>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    <button
                      onClick={() => toggleDecision(tender.id, 'yes')}
                      style={{
                        padding: '0.75rem 1rem',
                        background: decisions[tender.id]?.choice === 'yes' ? '#28a745' : '#f1f1f1',
                        color: decisions[tender.id]?.choice === 'yes' ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      ✅ Sí
                    </button>
                    <button
                      onClick={() => toggleDecision(tender.id, 'no')}
                      style={{
                        padding: '0.75rem 1rem',
                        background: decisions[tender.id]?.choice === 'no' ? '#d32f2f' : '#f1f1f1',
                        color: decisions[tender.id]?.choice === 'no' ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      ❌ No
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No tenders match your filters</p>
      )}
    </main>
  );
}
