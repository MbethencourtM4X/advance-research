import './globals.css';
import Nav from './components/Nav';
import { LanguageProvider } from './context/LanguageContext';

export const metadata = {
  title: 'Advance — IDAN Panama Research',
  description: 'Dashboard para rastrear licitaciones de agua del gobierno en Panama. Real-time data, decision tracker, filtros avanzados.',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=5.0',
  icons: {
    icon: '🌊',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" style={{ scrollBehavior: 'smooth' }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0066cc" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ overscrollBehavior: 'none' }}>
        <LanguageProvider>
          <Nav />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
