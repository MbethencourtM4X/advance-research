'use client';

function SkeletonCard() {
  return (
    <div style={{
      backgroundColor: '#222d47',
      border: '1px solid #2a3550',
      borderRadius: '10px',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #2a3550' }}>
        <div style={{ height: '12px', backgroundColor: '#2a3550', borderRadius: '4px', marginBottom: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: '12px', backgroundColor: '#2a3550', borderRadius: '4px', width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <div>
            <div style={{ height: '8px', backgroundColor: '#2a3550', borderRadius: '3px', marginBottom: '6px', width: '40%', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ height: '18px', backgroundColor: '#2a3550', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
          <div>
            <div style={{ height: '8px', backgroundColor: '#2a3550', borderRadius: '3px', marginBottom: '6px', width: '40%', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ height: '14px', backgroundColor: '#2a3550', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        </div>
        <div style={{ height: '8px', backgroundColor: '#2a3550', borderRadius: '3px', marginBottom: '6px', width: '30%', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: '12px', backgroundColor: '#2a3550', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
      <div style={{ padding: '10px 14px', borderTop: '1px solid #2a3550', backgroundColor: '#1a1f36', display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, height: '32px', backgroundColor: '#2a3550', borderRadius: '6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ flex: 1, height: '32px', backgroundColor: '#2a3550', borderRadius: '6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ count = 6 }) {
  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
      }}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </>
  );
}
