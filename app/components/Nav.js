'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav style={{
      background: '#333',
      color: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      gap: '2rem',
      alignItems: 'center'
    }}>
      <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
        Advance IDAN
      </Link>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link 
          href="/" 
          style={{ 
            color: pathname === '/' ? '#28a745' : 'white', 
            textDecoration: 'none',
            borderBottom: pathname === '/' ? '2px solid #28a745' : 'none',
            paddingBottom: '0.5rem'
          }}
        >
          Overview
        </Link>
        <Link 
          href="/tenders" 
          style={{ 
            color: pathname === '/tenders' ? '#28a745' : 'white', 
            textDecoration: 'none',
            borderBottom: pathname === '/tenders' ? '2px solid #28a745' : 'none',
            paddingBottom: '0.5rem'
          }}
        >
          All Tenders
        </Link>
      </div>
    </nav>
  );
}
