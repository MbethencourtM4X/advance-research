'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';

export default function Nav() {
  const pathname = usePathname();
  const { language, switchLanguage } = useLanguage();
  const t = translations[language];

  return (
    <nav style={{
      background: '#1a1a1a',
      color: 'white',
      padding: '0.75rem 2rem',
      display: 'flex',
      gap: '2rem',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
        {t.nav.brand}
      </Link>
      
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link 
          href="/" 
          style={{ 
            color: pathname === '/' ? '#00a3e0' : 'white', 
            textDecoration: 'none',
            fontWeight: pathname === '/' ? 'bold' : 'normal'
          }}
        >
          {t.nav.home}
        </Link>
        <Link 
          href="/tenders" 
          style={{ 
            color: pathname === '/tenders' ? '#00a3e0' : 'white', 
            textDecoration: 'none',
            fontWeight: pathname === '/tenders' ? 'bold' : 'normal'
          }}
        >
          {t.nav.tenders}
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
        <button
          onClick={() => switchLanguage('es')}
          style={{
            background: language === 'es' ? '#0066cc' : '#444',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: language === 'es' ? 'bold' : 'normal',
            fontSize: '0.9rem'
          }}
        >
          Español
        </button>
        <button
          onClick={() => switchLanguage('en')}
          style={{
            background: language === 'en' ? '#0066cc' : '#444',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: language === 'en' ? 'bold' : 'normal',
            fontSize: '0.9rem'
          }}
        >
          English
        </button>
      </div>
    </nav>
  );
}
