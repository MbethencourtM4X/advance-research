import './globals.css';
import Nav from './components/Nav';
import { LanguageProvider } from './context/LanguageContext';

export const metadata = {
  title: 'Advance — IDAN Panama Research',
  description: 'Dashboard para rastrear licitaciones de agua del gobierno en Panama. Datos en tiempo real, filtros avanzados, rastreo de decisiones.',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=5.0',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" style={{ scrollBehavior: 'smooth' }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#004A94" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LanguageProvider>
          <Nav />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
