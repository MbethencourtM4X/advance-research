'use client';

export default function DemoTendersTable() {
  const tenders = [
    {
      id: 'IDAN-2026-001',
      title: 'Tuberías PVC para expansión de red - Panamá Este',
      value: '$2.1M',
      deadline: '2026-05-15',
      status: '✅ ABIERTA',
      days: '21'
    },
    {
      id: 'IDAN-2026-003',
      title: 'Sistema de tratamiento de agua avanzado',
      value: '$5.2M',
      deadline: '2026-06-01',
      status: '✅ ABIERTA',
      days: '38'
    },
    {
      id: 'IDAN-2026-004',
      title: 'Equipos de bombeo de alta eficiencia',
      value: '$3.4M',
      deadline: '2026-05-20',
      status: '✅ ABIERTA',
      days: '26'
    },
    {
      id: 'IDAN-2026-002',
      title: 'Mantenimiento de infraestructura - Sector Oeste',
      value: '$1.85M',
      deadline: '2026-05-22',
      status: '✅ ABIERTA',
      days: '28'
    },
    {
      id: 'IDAN-2026-005',
      title: 'Reparación de fugas + medición inteligente',
      value: '$1.2M',
      deadline: '2026-05-25',
      status: '✅ ABIERTA',
      days: '31'
    }
  ];

  return (
    <div>
      <div className="subsection">
        <h3>🎯 Active Opportunities (Right Now)</h3>
        <p style={{ color: '#28a745', fontWeight: 'bold', marginBottom: '1rem' }}>
          5 water tenders open for bidding • Total value: $13.75M
        </p>
      </div>

      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '1rem',
        fontSize: '0.95rem'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#667eea', color: 'white' }}>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>Tender</th>
            <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>Value</th>
            <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>Deadline</th>
            <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>Days Left</th>
          </tr>
        </thead>
        <tbody>
          {tenders.map((tender, idx) => (
            <tr key={tender.id} style={{
              backgroundColor: idx % 2 === 0 ? '#f9f9f9' : 'white',
              borderBottom: '1px solid #eee'
            }}>
              <td style={{ padding: '0.75rem' }}>
                <div style={{ fontWeight: 'bold', color: '#333' }}>{tender.title}</div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>ID: {tender.id}</div>
              </td>
              <td style={{ padding: '0.75rem', textAlign: 'center', color: '#28a745', fontWeight: 'bold' }}>
                {tender.value}
              </td>
              <td style={{ padding: '0.75rem', textAlign: 'center', color: '#666' }}>
                {tender.deadline}
              </td>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                <span style={{
                  backgroundColor: '#fff3cd',
                  color: '#ff9800',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}>
                  {tender.days} days
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
        <p style={{ margin: '0.5rem 0', color: '#333' }}>
          <strong>💡 For Your Employees:</strong>
        </p>
        <ul style={{ margin: '0.5rem 0 0 1.5rem', color: '#666' }}>
          <li>Log in → See all active tenders</li>
          <li>Click any tender → Full requirements + contact</li>
          <li>Dashboard tracks deadlines automatically</li>
          <li>One-click bid preparation & submission</li>
        </ul>
      </div>
    </div>
  );
}
