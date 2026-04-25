'use client';
import { useState, useEffect, useCallback } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  return { toasts, addToast };
}

export function ToastContainer({ toasts }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      pointerEvents: 'none',
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            backgroundColor: toast.type === 'success' ? '#0d4f30' : '#4f1111',
            border: `1px solid ${toast.type === 'success' ? '#1a8f57' : '#8f1a1a'}`,
            color: '#e8eaf0',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            animation: 'slideIn 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {toast.message}
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
