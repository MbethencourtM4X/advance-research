import * as XLSX from 'xlsx';

const COUNTRY_NAMES = {
  panama: 'Panamá 🇵🇦',
  costa_rica: 'Costa Rica 🇨🇷',
  nicaragua: 'Nicaragua 🇳🇮',
  el_salvador: 'El Salvador 🇸🇻',
};

export function exportTendersXLSX(tenders, language = 'es') {
  const headers =
    language === 'es'
      ? ['País', 'ID Licitación', 'Título', 'Entidad', 'Valor', 'Moneda', 'Fecha Límite', 'Días Restantes', 'Estado', 'Categoría', 'URL']
      : ['Country', 'Tender ID', 'Title', 'Entity', 'Value', 'Currency', 'Deadline', 'Days Remaining', 'Status', 'Category', 'URL'];

  const rows = tenders.map((t) => [
    COUNTRY_NAMES[t.pais] || t.pais,
    t.numero,
    t.titulo,
    t.entidad,
    t.valor && t.valor !== 'N/A' ? parseFloat(t.valor) : '',
    t.moneda || 'USD',
    t.deadline,
    t.dias_restantes ?? '',
    t.estado || '',
    t.categoria || '',
    t.url || '',
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Column widths
  ws['!cols'] = [
    { wch: 16 },  // País
    { wch: 28 },  // ID
    { wch: 55 },  // Título
    { wch: 35 },  // Entidad
    { wch: 14 },  // Valor
    { wch: 8 },   // Moneda
    { wch: 18 },  // Fecha
    { wch: 14 },  // Días
    { wch: 12 },  // Estado
    { wch: 20 },  // Categoría
    { wch: 60 },  // URL
  ];

  // Freeze first row
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };

  // Style header row (bold + background) — SheetJS Community only supports basic styles
  const headerRange = XLSX.utils.decode_range(ws['!ref']);
  for (let c = headerRange.s.c; c <= headerRange.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws[addr]) continue;
    ws[addr].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '004A94' } },
      alignment: { horizontal: 'center' },
    };
  }

  // Mark value column as number format
  const valueColIdx = 4;
  for (let r = 1; r <= rows.length; r++) {
    const addr = XLSX.utils.encode_cell({ r, c: valueColIdx });
    if (ws[addr] && typeof ws[addr].v === 'number') {
      ws[addr].z = '#,##0.00';
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, language === 'es' ? 'Licitaciones' : 'Tenders');

  // Metadata sheet
  const metaData = [
    [language === 'es' ? 'Generado' : 'Generated', new Date().toISOString()],
    [language === 'es' ? 'Total' : 'Total tenders', tenders.length],
    [language === 'es' ? 'Fuente' : 'Source', 'Advance IDAN Portal — advance-idan-research.vercel.app'],
  ];
  const metaWs = XLSX.utils.aoa_to_sheet(metaData);
  metaWs['!cols'] = [{ wch: 18 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, metaWs, 'Info');

  const filename = `licitaciones-agua-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
}
