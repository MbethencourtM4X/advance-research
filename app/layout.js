import './globals.css';

export const metadata = {
  title: 'Advance — IDAN Panama Research',
  description: 'Complete analysis for Advance IDAN procurement dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
