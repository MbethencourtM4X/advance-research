'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';

export default function TendersPage() {
  const [tenders, setTenders] = useState([]);
  const [decisions, setDecisions] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    fetch('/idan-tenders-live.json')
      .then(res => res.json())
      .then(data => {
        setTenders((data.tenders || []).map(tender => ({
          ...tender,
          url: generateTenderUrl(tender.id)
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

  const toggleDecision = (id, decision) => {
    const updated = { ...decisions };
    if (updated[id] === decision) {
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
      
      if (filter === 'yes') {
        return decision?.choice === 'yes';
      }
      if (filter === 'no') {
        return decision?.choice === 'no';
      }
      if (filter === 'pending') {
        return !decision || !decision.choice;
      }
      
      // 'all' - show everything except those marked 'no'
      return !decision || decision.choice !== 'no';
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
          <div style={{ color: '#666', fontSize: '0.9rem' }}>{t.tenders.total}</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0066cc' }}>{stats.total}</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #28a745', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>{t.tenders.interested}</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>{stats.interested}</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #d32f2f', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>{t.tenders.notInterested}</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d32f2f' }}>{stats.notInterested}</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #ff9800', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>{t.tenders.pending}</div>
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
        <h3>{t.tenders.filterBy}</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { v: 'all', l: t.tenders.all, c: '#666' },
            { v: 'pending', l: t.tenders.pending, c: '#ff9800' },
            { v: 'yes', l: t.tenders.yes, c: '#28a745' },
            { v: 'no', l: t.tenders.no, c: '#d32f2f' }
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
              {f.l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length > 0 ? (
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
                      <div style={{ color: '#999', fontSize: '0.85rem' }}>{t.tenders.value}</div>
                      <div style={{ fontWeight: 'bold', color: '#28a745' }}>{tender.estimated_value}</div>
                    </div>
                    <div>
                      <div style={{ color: '#999', fontSize: '0.85rem' }}>{t.tenders.deadline}</div>
                      <div style={{ fontWeight: 'bold', color: '#ff9800' }}>{tender.deadline}</div>
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
                    {t.tenders.viewOnIDAN}
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
      ) : (
        <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No tenders match filter</p>
      )}

      <div style={{ marginTop: '3rem', padding: '1rem', background: '#f0f7ff', borderRadius: '8px', borderLeft: '4px solid #0066cc' }}>
        <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
          💡 {t.tenders.readyToBidDesc1}
        </p>
      </div>
    </main>
  );
}
