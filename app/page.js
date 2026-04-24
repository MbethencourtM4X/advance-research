'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '3rem 2rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1>Advance — IDAN Panama Research</h1>
        <p>Dashboard for government water tender tracking</p>
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
            border: '2px solid #667eea',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}>
            <h2 style={{ color: '#667eea', marginTop: 0 }}>📋 All Tenders</h2>
            <p>View all 18 IDAN water tenders with decision tracker</p>
            <button style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Go to Tenders →
            </button>
          </div>
        </Link>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '2px solid #28a745'
        }}>
          <h2 style={{ color: '#28a745', marginTop: 0 }}>🟢 Live Data</h2>
          <p>18 real IDAN tenders updated daily via RPA scraper</p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>Last updated today</p>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '2px solid #1976d2'
        }}>
          <h2 style={{ color: '#1976d2', marginTop: 0 }}>✅ Decision Tracker</h2>
          <p>Mark which tenders Advance wants to bid on</p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>Decisions saved locally</p>
        </div>
      </div>

      <section style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h2>About This Project</h2>
        <p>
          This dashboard aggregates all active water tenders from IDAN (Instituto de Acueductos y Alcantarillados Nacionales) in Panama.
        </p>
        <h3>Features</h3>
        <ul>
          <li>✅ Real-time tender data (18 active opportunities)</li>
          <li>✅ Decision tracker (Interested/Not Interested)</li>
          <li>✅ Direct links to IDAN portal</li>
          <li>✅ Tender values in Panamanian Balboas</li>
          <li>✅ Deadline tracking</li>
          <li>✅ Daily automated scraping</li>
        </ul>
        <h3>For Advance Team</h3>
        <p>
          Use the tenders page to browse all opportunities and mark which ones Advance wants to pursue.
          Your decisions are saved and you can change them anytime.
        </p>
      </section>
    </main>
  );
}
