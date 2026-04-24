import './globals.css';
import Nav from './components/Nav';
import { LanguageProvider } from './context/LanguageContext';

export const metadata = {
  title: 'Advance — IDAN Panama Research',
  description: 'Complete analysis for Advance IDAN procurement dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <LanguageProvider>
          <Nav />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
