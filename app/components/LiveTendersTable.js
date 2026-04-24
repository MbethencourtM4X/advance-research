'use client';

import { useEffect, useState } from 'react';

export default function LiveTendersTable() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/idan-tenders-live.json')
      .then(res => res.json())
      .then(data => {
        setTenders(data.tenders || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading tenders:', err);
        setLoading(false);
      });
  }, []);

  return (
    <section className="section" style={{ backgroundColor: '#e8f5e9', borderLeft: '4px solid #28a745' }}>
      <h2>🟢 LIVE: IDAN Panama Water Tenders (Real-time)</h2>
      
      <div className="highlight" style={{ backgroundColor: '#c8e6c9' }}>
        <p><strong>✅ Status:</strong> <span className="badge success">LIVE DATA</span></p>
        <p><strong>Found:</strong> {tenders.length} active tenders</p>
        <p><strong>Last Updated:</strong> Today</p>
      </div>

      {loading ? (
        <p style={{ color: '#666' }}>Loading tenders...</p>
      ) : tenders.length > 0 ? (
        <>
          <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.9rem'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#28a745', color: 'white' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>ID</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>Tender Title</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>Value</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>Deadline</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tenders.map((tender, idx) => (
                  <tr key={tender.id} style={{
                    backgroundColor: idx % 2 === 0 ? '#f1f8f6' : 'white',
                    borderBottom: '1px solid #ddd'
                  }}>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#333' }}>
                      {tender.id}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#333' }}>
                      {tender.title}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: '#28a745', fontWeight: 'bold' }}>
                      {tender.estimated_value || tender.value}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: '#666' }}>
                      {tender.deadline}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <span style={{
                        backgroundColor: '#c8e6c9',
                        color: '#28a745',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                      }}>
                        {tender.status || 'ABIERTA'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fff9c4', borderRadius: '4px' }}>
            <p style={{ margin: '0.5rem 0', color: '#333', fontWeight: 'bold' }}>
              🎯 Ready to Bid?
            </p>
            <ul style={{ margin: '0.5rem 0 0 1.5rem', color: '#666' }}>
              <li>Click any tender ID to view full requirements</li>
              <li>Dates are deadlines for bid submission</li>
              <li>Values are estimated contract amounts (Panamanian Balboas)</li>
              <li>Dashboard updates daily with new opportunities</li>
            </ul>
          </div>
        </>
      ) : (
        <p style={{ color: '#d32f2f' }}>No active tenders found</p>
      )}
    </section>
  );
}
