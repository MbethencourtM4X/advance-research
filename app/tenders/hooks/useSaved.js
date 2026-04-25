'use client';
import { useState, useEffect } from 'react';

export function useSaved() {
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('savedTenderIds') || '[]');
    setSaved(stored);
  }, []);

  const toggleSave = (numero) => {
    setSaved((prev) => {
      const next = prev.includes(numero)
        ? prev.filter((id) => id !== numero)
        : [...prev, numero];
      localStorage.setItem('savedTenderIds', JSON.stringify(next));
      return next;
    });
    return !saved.includes(numero);
  };

  const isSaved = (numero) => saved.includes(numero);

  return { saved, toggleSave, isSaved };
}
