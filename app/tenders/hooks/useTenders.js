'use client';
import { useState, useEffect } from 'react';
import { NATIONAL_PORTAL_KEYS } from '../../../config/advance-keywords';

function computeDaysRemaining(deadline) {
  if (!deadline) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const part = deadline.split(' ')[0];
  let date;
  if (part.includes('/')) {
    const [d, m, y] = part.split('/');
    date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  } else {
    date = new Date(part);
  }
  if (isNaN(date.getTime())) return null;
  return Math.ceil((date - today) / (1000 * 60 * 60 * 24));
}

export function useTenders() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/central-america-tenders-live.json');
        const data = await res.json();
        const all = [];

        Object.entries(data.countries).forEach(([key, country]) => {
          if (!country.tenders || !Array.isArray(country.tenders)) return;
          country.tenders.forEach((tender, idx) => {
            const dias =
              tender.dias_restantes != null
                ? tender.dias_restantes
                : computeDaysRemaining(tender.deadline);
            all.push({
              ...tender,
              pais: key,
              flag: country.flag,
              dias_restantes: dias,
              source_type: NATIONAL_PORTAL_KEYS.has(key) ? 'national' : 'municipal',
              _idx: idx,
            });
          });
        });

        setTenders(all);
        setLastUpdated(data.timestamp);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { tenders, loading, error, lastUpdated };
}
