import './globals.css';
import Nav from './components/Nav';
import { LanguageProvider } from './context/LanguageContext';

export const metadata = {
  title: {
    default: 'Advance IDAN Portal — Licitaciones de Agua Centroamérica',
    template: '%s — Advance IDAN Portal',
  },
  description:
    'Portal centralizado de licitaciones de agua potable y saneamiento en Panamá, Costa Rica, Nicaragua y El Salvador. Datos en tiempo real del IDAAN, SICOP y SISCAE.',
  keywords: [
    'licitaciones agua Panama IDAAN', 'licitaciones SICOP Costa Rica', 'SISCAE Nicaragua',
    'water tender Central America', 'procurement dashboard', 'licitaciones gobierno',
  ],
  metadataBase: new URL('https://advance-idan-research.vercel.app'),
  openGraph: {
    siteName: 'Advance IDAN Portal',
    type: 'website',
    locale: 'es_PA',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#004A94',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" style={{ scrollBehavior: 'smooth' }}>
      <head>
        <meta charSet="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
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
