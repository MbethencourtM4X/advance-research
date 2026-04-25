'use client';

export default function TenderCard({ tender, isSaved, onToggleSave, onOpenModal, strings }) {
  const isUrgent = tender.dias_restantes != null && tender.dias_restantes < 7;
  const isExpired = tender.dias_restantes != null && tender.dias_restantes < 0;

  const valorDisplay =
    tender.valor && tender.valor !== 'N/A'
      ? `${tender.moneda === 'CRC' ? '₡' : '$'}${parseFloat(tender.valor).toLocaleString()}`
      : '—';

  return (
    <article
      onClick={() => onOpenModal(tender)}
      style={{
        backgroundColor: '#222d47',
        border: isUrgent ? '2px solid #ff4444' : '1px solid #334466',
        borderRadius: '10px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid #334466',
          backgroundColor: isUrgent ? 'rgba(255,68,68,0.08)' : 'transparent',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', margin: 0, lineHeight: '1.4', color: '#e8eaf0' }}>
            {tender.titulo?.length > 70
              ? tender.titulo.substring(0, 70) + '…'
              : tender.titulo}
          </h3>
          {isUrgent && !isExpired && (
            <span style={{
              backgroundColor: '#ff4444',
              color: '#fff',
              padding: '2px 7px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              ⚠ {strings.urgent}
            </span>
          )}
          {isExpired && (
            <span style={{
              backgroundColor: '#555',
              color: '#aaa',
              padding: '2px 7px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              {strings.expired || 'VENCIDO'}
            </span>
          )}
        </div>
        <p style={{ fontSize: '11px', color: '#6b7a99', margin: 0 }}>
          {tender.flag} {tender.numero}
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 14px', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <div>
            <p style={{ fontSize: '10px', color: '#6b7a99', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {strings.value}
            </p>
            <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#3b9eff', margin: 0 }}>
              {valorDisplay}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '10px', color: '#6b7a99', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {strings.deadline}
            </p>
            <p style={{ fontSize: '12px', fontWeight: '600', margin: 0, color: '#e8eaf0' }}>
              {tender.deadline?.split(' ')[0]}
            </p>
            {tender.dias_restantes != null && (
              <p style={{
                fontSize: '11px',
                color: isExpired ? '#888' : isUrgent ? '#ff6666' : '#7ec89e',
                margin: '2px 0 0',
              }}>
                {isExpired
                  ? `${Math.abs(tender.dias_restantes)}d ago`
                  : `${tender.dias_restantes} ${strings.days}`}
              </p>
            )}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #2a3550', paddingTop: '8px' }}>
          <p style={{ fontSize: '10px', color: '#6b7a99', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {strings.entity}
          </p>
          <p style={{ fontSize: '12px', margin: 0, color: '#b0bbd4', lineHeight: '1.3' }}>
            {tender.entidad?.length > 55 ? tender.entidad.substring(0, 55) + '…' : tender.entidad}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{ padding: '10px 14px', borderTop: '1px solid #2a3550', backgroundColor: '#1a1f36', display: 'flex', gap: '8px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onToggleSave(tender.numero)}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: isSaved ? '#f59e0b' : '#2a3550',
            border: 'none',
            borderRadius: '6px',
            color: isSaved ? '#1a1f36' : '#9ba8c0',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '12px',
            transition: 'background-color 0.15s ease',
          }}
        >
          {isSaved ? '⭐ ' : '☆ '}{isSaved ? strings.remove : strings.save}
        </button>

        {tender.url && tender.url !== 'javascript:void(0)' ? (
          <a
            href={tender.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: '#0055b3',
              borderRadius: '6px',
              color: '#fff',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: '600',
              fontSize: '12px',
              display: 'block',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0066cc')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0055b3')}
          >
            🔗 {strings.view}
          </a>
        ) : (
          <button
            disabled
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: '#2a3550',
              border: 'none',
              borderRadius: '6px',
              color: '#4a5568',
              cursor: 'not-allowed',
              fontWeight: '600',
              fontSize: '12px',
            }}
          >
            {strings.view}
          </button>
        )}
      </div>
    </article>
  );
}
