'use client';

export default function EmptyState({ mode, strings }) {
  const isSavedMode = mode === 'saved';
  return (
    <div style={{
      textAlign: 'center',
      padding: '48px 24px',
      color: '#6b7a99',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.6 }}>
        {isSavedMode ? '⭐' : '🔍'}
      </div>
      <p style={{ fontSize: '16px', fontWeight: '600', color: '#9ba8c0', margin: '0 0 8px' }}>
        {isSavedMode
          ? (strings.noSaved || 'No hay guardados')
          : (strings.noResults || 'Sin resultados')}
      </p>
      <p style={{ fontSize: '13px', margin: 0, maxWidth: '280px', display: 'inline-block', lineHeight: '1.5' }}>
        {isSavedMode
          ? (strings.noSavedHint || 'Guarda licitaciones con ☆ para verlas aquí')
          : (strings.noResultsHint || 'Intenta ampliar los filtros o cambiar la búsqueda')}
      </p>
    </div>
  );
}
