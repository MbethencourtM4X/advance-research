/**
 * Email alert templates for Advance IDAN Portal
 *
 * Integration point: replace the stub sendEmail() in app/api/alerts/route.js
 * with a real provider. Recommended: Resend (resend.com) — Vercel-native,
 * generous free tier (3,000 emails/mo), excellent Next.js support.
 *
 * Install: npm install resend
 * Env var: RESEND_API_KEY (add via Vercel dashboard or `vercel env add`)
 */

export function deadlineAlertEmail({ tender, daysLeft, language = 'es' }) {
  const isES = language === 'es';
  const urgency = daysLeft <= 1 ? '🔴' : daysLeft <= 3 ? '🟠' : '🟡';
  const valor =
    tender.valor && tender.valor !== 'N/A'
      ? `${tender.moneda === 'CRC' ? '₡' : '$'}${parseFloat(tender.valor).toLocaleString()}`
      : isES ? 'No disponible' : 'Not available';

  const subject = isES
    ? `${urgency} Licitación vence en ${daysLeft} día${daysLeft !== 1 ? 's' : ''} — ${tender.numero}`
    : `${urgency} Tender closes in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} — ${tender.numero}`;

  const html = `
<!DOCTYPE html>
<html lang="${language}">
<head><meta charset="UTF-8"><style>
  body { font-family: Inter, Arial, sans-serif; background: #f9fafb; margin: 0; padding: 24px; color: #111; }
  .card { background: #fff; border-radius: 10px; padding: 24px; max-width: 560px; margin: 0 auto; border: 1px solid #e5e7eb; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
  .urgent { background: #fee2e2; color: #991b1b; }
  .warning { background: #fef3c7; color: #92400e; }
  .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px; }
  .value { font-size: 15px; font-weight: 600; margin: 0 0 16px; }
  .btn { display: inline-block; padding: 10px 20px; background: #004A94; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 14px; }
  .footer { font-size: 11px; color: #9ca3af; margin-top: 24px; text-align: center; }
</style></head>
<body>
  <div class="card">
    <p class="badge ${daysLeft <= 3 ? 'urgent' : 'warning'}">
      ${urgency} ${isES ? `Vence en ${daysLeft} día${daysLeft !== 1 ? 's' : ''}` : `Closes in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
    </p>
    <h2 style="margin: 16px 0 8px; font-size: 18px;">${tender.titulo}</h2>
    <p class="label">${isES ? 'Número' : 'ID'}</p>
    <p class="value">${tender.numero}</p>
    <p class="label">${isES ? 'Entidad' : 'Entity'}</p>
    <p class="value">${tender.entidad}</p>
    <div style="display: flex; gap: 24px;">
      <div>
        <p class="label">${isES ? 'Valor' : 'Value'}</p>
        <p class="value" style="color: #004A94;">${valor}</p>
      </div>
      <div>
        <p class="label">${isES ? 'Fecha límite' : 'Deadline'}</p>
        <p class="value">${tender.deadline}</p>
      </div>
    </div>
    ${tender.url ? `<a href="${tender.url}" class="btn">${isES ? '→ Ver Licitación' : '→ View Tender'}</a>` : ''}
    <div class="footer">
      ${isES ? 'Advance IDAN Portal · Darse de baja: ' : 'Advance IDAN Portal · Unsubscribe: '}
      <a href="{{unsubscribe_url}}" style="color: #9ca3af;">${isES ? 'aquí' : 'here'}</a>
    </div>
  </div>
</body>
</html>`;

  const text = `${subject}\n\n${tender.titulo}\nID: ${tender.numero}\nEntidad: ${tender.entidad}\nValor: ${valor}\nFecha: ${tender.deadline}\n${tender.url || ''}`;

  return { subject, html, text };
}

export function weeklyDigestEmail({ newTenders, country = null, language = 'es' }) {
  const isES = language === 'es';
  const subject = isES
    ? `📋 ${newTenders.length} nuevas licitaciones esta semana — Advance IDAN`
    : `📋 ${newTenders.length} new tenders this week — Advance IDAN`;

  const tenderRows = newTenders
    .slice(0, 10)
    .map(
      (t) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${t.flag || ''} ${t.pais}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px;">${t.numero}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${t.titulo?.substring(0, 50)}${t.titulo?.length > 50 ? '…' : ''}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; white-space: nowrap;">${t.deadline?.split(' ')[0] || ''}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${t.dias_restantes != null ? `${t.dias_restantes}d` : ''}</td>
    </tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="${language}">
<head><meta charset="UTF-8"><style>
  body { font-family: Inter, Arial, sans-serif; background: #f9fafb; margin: 0; padding: 24px; color: #111; }
  .card { background: #fff; border-radius: 10px; padding: 24px; max-width: 640px; margin: 0 auto; border: 1px solid #e5e7eb; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { padding: 8px; background: #004A94; color: #fff; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  .btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #004A94; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 700; }
  .footer { font-size: 11px; color: #9ca3af; margin-top: 24px; text-align: center; }
</style></head>
<body>
  <div class="card">
    <h2 style="margin: 0 0 4px;">${isES ? 'Nuevas Licitaciones' : 'New Tenders'}</h2>
    <p style="color: #6b7280; margin: 0 0 20px; font-size: 14px;">
      ${isES ? `${newTenders.length} oportunidades encontradas esta semana` : `${newTenders.length} opportunities found this week`}
    </p>
    <table>
      <thead>
        <tr>
          <th>${isES ? 'País' : 'Country'}</th>
          <th>ID</th>
          <th>${isES ? 'Descripción' : 'Description'}</th>
          <th>${isES ? 'Plazo' : 'Deadline'}</th>
          <th>${isES ? 'Días' : 'Days'}</th>
        </tr>
      </thead>
      <tbody>${tenderRows}</tbody>
    </table>
    ${newTenders.length > 10 ? `<p style="color: #6b7280; font-size: 12px; margin-top: 8px;">+${newTenders.length - 10} más…</p>` : ''}
    <a href="https://advance-idan-research.vercel.app/tenders" class="btn">
      ${isES ? '→ Ver todas en el portal' : '→ View all in portal'}
    </a>
    <div class="footer">
      Advance IDAN Portal · <a href="{{unsubscribe_url}}" style="color: #9ca3af;">${isES ? 'Darse de baja' : 'Unsubscribe'}</a>
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}
