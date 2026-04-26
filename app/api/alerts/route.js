/**
 * Alert subscription API
 *
 * POST /api/alerts        — subscribe email to deadline alerts
 * DELETE /api/alerts      — unsubscribe
 *
 * TODO: Wire up a real email provider before enabling in production.
 * Recommended: Resend (resend.com)
 *   1. npm install resend
 *   2. vercel env add RESEND_API_KEY
 *   3. Replace the stub below with the Resend client
 *
 * Subscription storage: currently in-memory (resets on deploy).
 * For persistence: use Vercel KV / Upstash Redis / Supabase.
 *   - Vercel Marketplace → Storage → add a KV store
 *   - vercel env add KV_REST_API_URL KV_REST_API_TOKEN
 */

import { NextResponse } from 'next/server';
import { deadlineAlertEmail } from '../../../lib/email-templates';

// In-memory store (stub — replace with persistent storage)
const subscriptions = new Map();

async function sendEmail({ to, subject, html, text }) {
  // STUB: log instead of sending
  // Replace this block with real provider:
  //
  // import { Resend } from 'resend';
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({ from: 'alerts@advance-idan.com', to, subject, html, text });

  if (!process.env.RESEND_API_KEY) {
    console.log('[ALERT STUB] Would send email:', { to, subject });
    return { ok: true, stub: true };
  }

  // Real Resend call (uncomment when key is set):
  // const { Resend } = await import('resend');
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // return resend.emails.send({ from: 'alerts@advance-idan.app', to, subject, html, text });
  return { ok: true, stub: false };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, tenderIds, language = 'es', daysThresholds = [7, 3, 1] } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    subscriptions.set(email, {
      email,
      tenderIds: tenderIds || [],
      language,
      daysThresholds,
      subscribedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      message: language === 'es'
        ? `Alertas activadas para ${email}. Recibirás notificaciones 7, 3 y 1 día antes del vencimiento.`
        : `Alerts activated for ${email}. You'll receive notifications 7, 3, and 1 day before deadline.`,
      stub: !process.env.RESEND_API_KEY,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
    subscriptions.delete(email);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/**
 * GET /api/alerts?check=1 — trigger deadline check (call from cron or GitHub Actions)
 * In production wire this to a Vercel Cron job:
 *   vercel.json: { "crons": [{ "path": "/api/alerts?check=1", "schedule": "0 9 * * *" }] }
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('check') !== '1') {
    return NextResponse.json({ subscriptions: subscriptions.size });
  }

  // Load tender data
  const fs = await import('fs');
  const path = await import('path');
  const dataPath = path.join(process.cwd(), 'public', 'central-america-tenders-live.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const today = new Date();

  let sent = 0;
  for (const [email, sub] of subscriptions) {
    const allTenders = Object.values(data.countries).flatMap((c) =>
      (c.tenders || []).map((t) => ({ ...t, flag: c.flag }))
    );
    const watched = sub.tenderIds.length > 0
      ? allTenders.filter((t) => sub.tenderIds.includes(t.numero))
      : allTenders;

    for (const tender of watched) {
      if (tender.dias_restantes == null) continue;
      if (sub.daysThresholds.includes(tender.dias_restantes)) {
        const { subject, html, text } = deadlineAlertEmail({
          tender,
          daysLeft: tender.dias_restantes,
          language: sub.language,
        });
        await sendEmail({ to: email, subject, html, text });
        sent++;
      }
    }
  }

  return NextResponse.json({ ok: true, sent, subscriptions: subscriptions.size });
}
