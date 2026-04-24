'use client';

import Link from 'next/link';
import { useLanguage } from './context/LanguageContext';
import { translations } from './translations';

export default function Home() {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-text">Advance</span>
            <span className="logo-subtext">Research</span>
          </div>
          <div className="nav-center">
            <Link href="/" className="nav-link active">Home</Link>
            <Link href="/tenders" className="nav-link">Licitaciones</Link>
            <Link href="/analytics" className="nav-link">Analytics</Link>
          </div>
          <button onClick={toggleLanguage} className="lang-toggle">
            {language === 'es' ? 'EN' : 'ES'}
          </button>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-container">
          <h1 className="hero-title">Sistema de Rastreo de Licitaciones IDAN</h1>
          <p className="hero-subtitle">Descubre y rastrea oportunidades de agua del gobierno de Panamá en tiempo real</p>
          <div className="hero-cta">
            <Link href="/tenders" className="btn btn-primary">Explorar Licitaciones</Link>
            <Link href="#features" className="btn btn-secondary">Conocer Más</Link>
          </div>
        </div>
      </header>

      <main>
        <section id="features" className="section">
          <h2>Por Qué Advance Research</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Datos en Tiempo Real</h3>
              <p>Actualización diaria de todas las licitaciones IDAN del gobierno de Panamá. Nunca pierdas una oportunidad.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Filtros Inteligentes</h3>
              <p>Filtra por valor, deadline, tipo de proyecto. Encuentra exactamente lo que buscas en segundos.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h3>Rastreo de Decisiones</h3>
              <p>Marca licitaciones como interesantes o descartadas. Tus decisiones se guardan automáticamente.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3>Links Directos</h3>
              <p>Acceso directo a panamacompra.gob.pa. Todo lo que necesitas en un solo lugar.</p>
            </div>
          </div>
        </section>

        <section className="section">
          <h2>Categorías de Licitaciones</h2>
          <div className="categories-grid">
            <div className="category-badge infrastructure">
              <div className="category-label">Infraestructura</div>
              <div className="category-desc">Construcción, rehabilitación, sistemas</div>
            </div>
            <div className="category-badge equipment">
              <div className="category-label">Equipos</div>
              <div className="category-desc">Medidores, válvulas, bombas, repuestos</div>
            </div>
            <div className="category-badge services">
              <div className="category-label">Servicios</div>
              <div className="category-desc">Limpieza, mantenimiento, desinfección</div>
            </div>
            <div className="category-badge consulting">
              <div className="category-label">Consultoría</div>
              <div className="category-desc">Auditoría, certificación, optimización</div>
            </div>
          </div>
        </section>

        <section className="section stats">
          <h2>Estadísticas</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">18+</div>
              <div className="stat-label">Licitaciones Activas</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">B/. 2.5M</div>
              <div className="stat-label">Valor Total</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">30 días</div>
              <div className="stat-label">Promedio de Deadline</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24h</div>
              <div className="stat-label">Actualización de Datos</div>
            </div>
          </div>
        </section>

        <section className="section cta-section">
          <h2>Listo para Empezar?</h2>
          <p>Accede al dashboard completo con filtros avanzados, rastreo de decisiones y análisis detallado.</p>
          <Link href="/tenders" className="btn btn-primary btn-large">Ir al Dashboard de Licitaciones</Link>
        </section>

        <footer className="footer">
          <div className="footer-container">
            <div className="footer-section">
              <h4>Advance</h4>
              <p>Sistema de investigación de licitaciones IDAN para contratistas y proveedores del sector agua en Panamá.</p>
            </div>
            <div className="footer-section">
              <h4>Enlaces</h4>
              <ul>
                <li><Link href="/tenders">Licitaciones</Link></li>
                <li><Link href="#features">Características</Link></li>
                <li><a href="https://panamacompra.gob.pa" target="_blank" rel="noopener noreferrer">Panamá Compra</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacidad</a></li>
                <li><a href="#">Términos</a></li>
                <li><a href="#">Contacto</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Somos Advance S.A. | Sistema de Investigación de Licitaciones IDAN</p>
            <p className="last-update">Datos actualizados diariamente a las 6:00 AM</p>
          </div>
        </footer>
      </main>

      <style jsx>{`
        .navbar {
          background: var(--dark);
          color: white;
          padding: 1rem 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .logo {
          font-weight: 700;
          font-size: 1.5rem;
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .logo-text {
          font-family: 'Oswald', sans-serif;
          font-size: 1.5rem;
          color: white;
        }

        .logo-subtext {
          font-size: 0.75rem;
          color: #00a3e0;
          font-weight: 400;
        }

        .nav-center {
          display: flex;
          gap: 2rem;
          flex: 1;
        }

        .nav-link {
          color: white;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .nav-link:hover,
        .nav-link.active {
          color: #00a3e0;
        }

        .lang-toggle {
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .lang-toggle:hover {
          background: #003370;
        }

        .hero {
          background: linear-gradient(135deg, var(--primary) 0%, #0066cc 100%);
          color: white;
          padding: 4rem 2rem;
          text-align: center;
        }

        .hero-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          font-family: 'Oswald', sans-serif;
          font-weight: 700;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          opacity: 0.95;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-cta {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          padding: 0.875rem 1.75rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          cursor: pointer;
          font-size: 1rem;
        }

        .btn-primary {
          background: white;
          color: var(--primary);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        .btn-secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        .btn-secondary:hover {
          background: white;
          color: var(--primary);
        }

        .btn-large {
          padding: 1rem 2rem;
          font-size: 1.1rem;
        }

        main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .section {
          background: white;
          padding: 3rem 2rem;
          margin-bottom: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          border-top: 4px solid var(--primary);
          animation: slideIn 0.3s ease-out;
        }

        .section h2 {
          font-family: 'Oswald', sans-serif;
          font-size: 1.75rem;
          color: var(--primary);
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--primary);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .feature-card {
          padding: 1.5rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          text-align: center;
          transition: all 0.2s;
        }

        .feature-card:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 16px rgba(0, 74, 148, 0.15);
          transform: translateY(-2px);
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .feature-card p {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .category-badge {
          padding: 2rem;
          border-radius: 8px;
          text-align: center;
          color: white;
          transition: all 0.2s;
        }

        .category-badge:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .category-badge.infrastructure {
          background: linear-gradient(135deg, #0066cc, #00a3e0);
        }

        .category-badge.equipment {
          background: linear-gradient(135deg, #0B8C5B, #12b86f);
        }

        .category-badge.services {
          background: linear-gradient(135deg, #D97706, #f59e0b);
        }

        .category-badge.consulting {
          background: linear-gradient(135deg, #004A94, #0066cc);
        }

        .category-label {
          font-family: 'Oswald', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .category-desc {
          font-size: 0.9rem;
          opacity: 0.95;
        }

        .stats {
          background: linear-gradient(135deg, var(--primary) 0%, #0066cc 100%);
          color: white;
          border-top: none;
        }

        .stats h2 {
          color: white;
          border-bottom-color: rgba(255, 255, 255, 0.2);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 2rem;
          text-align: center;
        }

        .stat-item {
          padding: 1.5rem;
        }

        .stat-number {
          font-family: 'Oswald', sans-serif;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.95rem;
          opacity: 0.9;
        }

        .cta-section {
          text-align: center;
        }

        .cta-section p {
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .footer {
          background: var(--dark);
          color: white;
          padding: 3rem 2rem 1rem;
          margin-top: 3rem;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .footer-section h4 {
          font-family: 'Oswald', sans-serif;
          margin-bottom: 1rem;
        }

        .footer-section ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .footer-section li {
          margin-bottom: 0.5rem;
        }

        .footer-section a {
          color: #00a3e0;
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer-section a:hover {
          color: white;
        }

        .footer-bottom {
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 1rem;
          color: #999;
          font-size: 0.9rem;
        }

        .last-update {
          margin: 0.5rem 0 0 0 !important;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 1rem;
          }

          .nav-container {
            flex-direction: column;
            gap: 1rem;
          }

          .nav-center {
            width: 100%;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
          }

          .hero-title {
            font-size: 1.75rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .hero-cta {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }

          .section {
            padding: 1.5rem 1rem;
          }
        }
      `}</style>
    </>
  );
}
