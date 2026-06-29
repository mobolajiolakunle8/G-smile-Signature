/**
 * G-Smile Signature — Secure Email Serverless Function
 *
 * This runs on the server (Vercel/Netlify/Cloudflare Workers).
 * The RESEND_API_KEY lives ONLY here — never in the browser.
 *
 * Deploy to Vercel: Environment Variables → RESEND_API_KEY
 * Deploy to Netlify: Site settings → Environment Variables → RESEND_API_KEY
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_ADDRESS   = 'G-Smile Signature <orders@g-smile-signature.com>';

export default async function handler(req: Request): Promise<Response> {
  /* ── only POST allowed ── */
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /* ── guard: key must be configured ── */
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set on the server.');
    return new Response(JSON.stringify({ error: 'Email service not configured on server.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { to: string; subject: string; html: string };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { to, subject, html } = body;

  if (!to || !subject || !html) {
    return new Response(JSON.stringify({ error: 'Missing required fields: to, subject, html.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [to],
        subject,
        html,
      }),
    });

    const data = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend API error:', data);
      return new Response(JSON.stringify({ error: data }), {
        status: resendResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Unexpected error sending email:', err);
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
