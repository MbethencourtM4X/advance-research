'use client';
import { useEffect } from 'react';

export default function TenderModal({ tender, onClose, isSaved, onToggleSave, strings }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!tender) return null;

  const isUrgent = tender.dias_restantes != null && tender.dias_restantes < 7;
  const isExpired = tender.dias_restantes != null && tender.dias_restantes < 0;
  const valorDisplay =
    tender.valor && tender.valor !== 'N/A'
      ? `${tender.moneda === 'CRC' ? '₡' : '$'}${parseFloat(tender.valor).toLocaleString()} ${tender.moneda || 'USD'}`
      : strings.noValue || 'No disponible';

  const countryNames = {
    panama: '🇵🇦 Panamá',
    costa_rica: '🇨🇷 Costa Rica',
    nicaragua: '🇳🇮 Nicaragua',
    el_salvador: '🇸🇻 El Salvador',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#1e2640',
          border: '1px solid #2e3d5e',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #2e3d5e',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
          position: 'sticky',
          top: 0,
          backgroundColor: '#1e2640',
          zIndex: 1,
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '11px', color: '#6b7a99', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {countryNames[tender.pais] || tender.pais} · {tender.numero}
            </p>
            <h2 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#e8eaf0', lineHeight: '1.4' }}>
              {tender.titulo}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7a99',
              cursor: 'pointer',
              fontSize: '20px',
              lineHeight: 1,
              padding: '0',
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Status banner */}
        {(isUrgent || isExpired) && (
          <div style={{
            padding: '8px 20px',
            backgroundColor: isExpired ? 'rgba(100,100,100,0.2)' : 'rgba(255,68,68,0.1)',
            borderBottom: '1px solid #2e3d5e',
            fontSize: '12px',
            color: isExpired ? '#888' : '#ff7777',
            fontWeight: '600',
          }}>
            {isExpired ? '⏰ Esta licitación ya venció' : `⚠ ${strings.urgent} — cierra en ${tender.dias_restantes} ${strings.days}`}
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <InfoBlock label={strings.value} value={valorDisplay} highlight />
            <InfoBlock
              label={strings.deadline}
              value={tender.deadline}
              sub={tender.dias_restantes != null
                ? isExpired
                  ? `Venció hace ${Math.abs(tender.dias_restantes)}d`
                  : `${tender.dias_restantes} ${strings.days}`
                : null}
              subColor={isExpired ? '#888' : isUrgent ? '#ff7777' : '#7ec89e'}
            />
            <InfoBlock label={strings.entity} value={tender.entidad} colSpan />
            {tender.categoria && <InfoBlock label={strings.category || 'Categoría'} value={tender.categoria} />}
            {tender.estado && <InfoBlock label={strings.status || 'Estado'} value={tender.estado} />}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={() => onToggleSave(tender.numero)}
              style={{
                flex: 1,
                padding: '11px',
                backgroundColor: isSaved ? '#f59e0b' : '#2a3550',
                border: 'none',
                borderRadius: '8px',
                color: isSaved ? '#1a1f36' : '#9ba8c0',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '14px',
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
                  padding: '11px',
                  backgroundColor: '#0055b3',
                  borderRadius: '8px',
                  color: '#fff',
                  textDecoration: 'none',
                  textAlign: 'center',
                  fontWeight: '700',
                  fontSize: '14px',
                  display: 'block',
                }}
              >
                🔗 {strings.view}
              </a>
            ) : (
              <button
                disabled
                style={{
                  flex: 1,
                  padding: '11px',
                  backgroundColor: '#2a3550',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#4a5568',
                  cursor: 'not-allowed',
                  fontWeight: '700',
                  fontSize: '14px',
                }}
              >
                {strings.noLink || 'Sin enlace'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value, sub, subColor, highlight, colSpan }) {
  return (
    <div style={colSpan ? { gridColumn: '1 / -1' } : {}}>
      <p style={{ fontSize: '10px', color: '#6b7a99', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </p>
      <p style={{ fontSize: highlight ? '18px' : '13px', fontWeight: highlight ? 'bold' : '500', color: highlight ? '#3b9eff' : '#e8eaf0', margin: 0, lineHeight: '1.3' }}>
        {value || '—'}
      </p>
      {sub && (
        <p style={{ fontSize: '11px', color: subColor || '#aaa', margin: '3px 0 0' }}>
          {sub}
        </p>
      )}
    </div>
  );
}
