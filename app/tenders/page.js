'use client';

import { useState, useEffect } from 'react';

export default function TendersPage() {
  const [tenders, setTenders] = useState([]);
  const [decisions, setDecisions] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/idan-tenders-live.json')
      .then(res => res.json())
      .then(data => {
        setTenders(data.tenders || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });

    const saved = localStorage.getItem('tender-decisions');
    if (saved) setDecisions(JSON.parse(saved));
  }, []);

  const toggleDecision = (id, decision) => {
    const updated = { ...decisions };
    updated[id] = updated[id] === decision ? null : decision;
    setDecisions(updated);
    localStorage.setItem('tender-decisions', JSON.stringify(updated));
  };

  const filtered = tenders.filter(t => {
    if (filter === 'yes') return decisions[t.id] === 'yes';
    if (filter === 'no') return decisions[t.id] === 'no';
    if (filter === 'pending') return !decisions[t.id];
    return true;
  });

  const stats = {
    total: tenders.length,
    interested: Object.values(decisions).filter(d => d === 'yes').length,
    notInterested: Object.values(decisions).filter(d => d === 'no').length,
    pending: tenders.length - Object.keys(decisions).length
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{
        background: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h1>📋 IDAN Panama Water Tenders</h1>
        <p>All active opportunities • Real-time data • Track your decisions</p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #28a745', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Total</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>{stats.total}</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #1976d2', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Interested</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>{stats.interested}</div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #d32f2f', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Not Interested</div>
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
        <h3>Filter:</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { v: 'all', l: 'All', c: '#666' },
            { v: 'pending', l: 'Pending', c: '#ff9800' },
            { v: 'yes', l: 'Interested ✅', c: '#28a745' },
            { v: 'no', l: 'Not Interested ❌', c: '#d32f2f' }
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
              borderLeft: decisions[tender.id] === 'yes' ? '4px solid #28a745' : decisions[tender.id] === 'no' ? '4px solid #d32f2f' : '4px solid #ddd'
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
                      <div style={{ fontWeight: 'bold', color: '#ff9800' }}>{tender.deadline}</div>
                    </div>
                  </div>
                  {tender.url && (
                    <a href={tender.url} target="_blank" rel="noopener noreferrer" style={{
                      display: 'inline-block',
                      padding: '0.5rem 1rem',
                      background: '#1976d2',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '4px',
                      fontSize: '0.9rem'
                    }}>
                      → View on IDAN Portal
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                  <button
                    onClick={() => toggleDecision(tender.id, 'yes')}
                    style={{
                      padding: '0.75rem 1rem',
                      background: decisions[tender.id] === 'yes' ? '#28a745' : '#f1f1f1',
                      color: decisions[tender.id] === 'yes' ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ✅ Yes
                  </button>
                  <button
                    onClick={() => toggleDecision(tender.id, 'no')}
                    style={{
                      padding: '0.75rem 1rem',
                      background: decisions[tender.id] === 'no' ? '#d32f2f' : '#f1f1f1',
                      color: decisions[tender.id] === 'no' ? 'white' : '#333',
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
    </main>
  );
}
