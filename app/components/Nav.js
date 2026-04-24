'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav style={{
      background: '#1a1a1a',
      color: 'white',
      padding: '0.75rem 2rem',
      display: 'flex',
      gap: '2rem',
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
        🌊 Advance IDAN
      </Link>
      <div style={{ display: 'flex', gap: '1.5rem', marginLeft: 'auto' }}>
        <Link 
          href="/" 
          style={{ 
            color: pathname === '/' ? '#00a3e0' : 'white', 
            textDecoration: 'none',
            fontWeight: pathname === '/' ? 'bold' : 'normal'
          }}
        >
          Overview
        </Link>
        <Link 
          href="/tenders" 
          style={{ 
            color: pathname === '/tenders' ? '#00a3e0' : 'white', 
            textDecoration: 'none',
            fontWeight: pathname === '/tenders' ? 'bold' : 'normal'
          }}
        >
          All Tenders
        </Link>
      </div>
    </nav>
  );
}
