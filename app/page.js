'use client';

import Link from 'next/link';
import { useLanguage } from './context/LanguageContext';
import { translations } from './translations';

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{
        background: 'linear-gradient(135deg, #0066cc 0%, #00a3e0 100%)',
        color: 'white',
        padding: '3rem 2rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1>{t.home.title}</h1>
        <p>{t.home.subtitle}</p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <Link href="/tenders" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '2px solid #0066cc',
            cursor: 'pointer',
            transition: 'all 0.2s',
            borderTop: '4px solid #0066cc'
          }}>
            <h2 style={{ color: '#0066cc', marginTop: 0 }}>📋 {t.home.allTenders}</h2>
            <p>{t.home.allTendersDesc}</p>
            <button style={{
              background: '#0066cc',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              {t.home.goToTenders}
            </button>
          </div>
        </Link>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '2px solid #28a745',
          borderTop: '4px solid #28a745'
        }}>
          <h2 style={{ color: '#28a745', marginTop: 0 }}>🟢 {t.home.liveData}</h2>
          <p>{t.home.liveDataDesc}</p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>{t.home.lastUpdated}</p>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '2px solid #00a3e0',
          borderTop: '4px solid #00a3e0'
        }}>
          <h2 style={{ color: '#00a3e0', marginTop: 0 }}>✅ {t.home.decisionTracker}</h2>
          <p>{t.home.decisionTrackerDesc}</p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>{t.home.decisionsLocal}</p>
        </div>
      </div>

      <section style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2>{t.home.about}</h2>
        <p>{t.home.aboutDesc}</p>
        <h3>{t.home.features}</h3>
        <ul>
          <li>{t.home.feature1}</li>
          <li>{t.home.feature2}</li>
          <li>{t.home.feature3}</li>
          <li>{t.home.feature4}</li>
          <li>{t.home.feature5}</li>
          <li>{t.home.feature6}</li>
        </ul>
        <h3>{t.home.forTeam}</h3>
        <p>{t.home.forTeamDesc}</p>
      </section>
    </main>
  );
}
