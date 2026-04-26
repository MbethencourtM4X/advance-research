export const metadata = {
  title: 'Licitaciones de Agua — Advance IDAN Portal',
  description:
    'Monitorea todas las licitaciones activas de agua potable, acueductos y saneamiento en Panamá, Costa Rica, Nicaragua y El Salvador. Datos en tiempo real del portal IDAAN, SICOP y SISCAE.',
  keywords: [
    'licitaciones agua Panama', 'licitaciones IDAAN', 'SICOP Costa Rica agua',
    'SISCAE Nicaragua', 'procurement water Central America', 'licitaciones acueductos',
    'tender water infrastructure', 'licitacion publica Panama',
  ],
  openGraph: {
    title: 'Licitaciones de Agua Centroamérica — Advance IDAN',
    description: '19+ licitaciones activas de agua potable y saneamiento en Panamá, Costa Rica y Nicaragua.',
    url: 'https://advance-idan-research.vercel.app/tenders',
    siteName: 'Advance IDAN Portal',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Licitaciones de Agua — Advance IDAN',
    description: 'Dashboard de licitaciones de agua en Centroamérica — IDAAN, SICOP, SISCAE.',
  },
  alternates: {
    canonical: 'https://advance-idan-research.vercel.app/tenders',
  },
};

export default function TendersLayout({ children }) {
  return children;
}
