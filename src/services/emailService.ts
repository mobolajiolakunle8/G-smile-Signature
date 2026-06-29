/**
 * G-Smile Signature — Transactional Email Service
 *
 * SECURITY: The Resend API key never lives in the browser.
 * All emails are sent through a tiny serverless function
 * that lives at /api/send-email  (see api/send-email.ts).
 */

export type EmailType =
  | 'order-confirmation'
  | 'payment-received'
  | 'order-shipped'
  | 'password-reset';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/* ── Brand tokens ──────────────────────────────────────── */
const GOLD   = '#D4A24A';
const INK    = '#111111';
const CREAM  = '#F6F2E8';
const WHITE  = '#ffffff';
const GREY   = '#888888';

/* ── Base email shell ──────────────────────────────────── */
function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>G-Smile Signature</title>
</head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background:${CREAM};color:${INK};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:48px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:${WHITE};border-radius:8px;overflow:hidden;">

          <!-- HEADER -->
          <tr>
            <td style="padding:28px 40px;text-align:center;border-bottom:3px solid ${GOLD};">
              <p style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:bold;color:${INK};">
                G-Smile <span style="color:${GOLD};">Signature</span>
              </p>
              <p style="margin:6px 0 0;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${GREY};">
                Premium Luxury Bags
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px;">
              ${body}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:24px 40px;background:#f9f9f9;text-align:center;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:12px;color:${GREY};">
                &copy; ${new Date().getFullYear()} G-Smile Signature. All rights reserved.
              </p>
              <p style="margin:6px 0 0;font-size:12px;color:${GREY};">
                Lagos, Nigeria &nbsp;|&nbsp; gsmilebags@gmail.com &nbsp;|&nbsp; +234 806 565 3384
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ── Gold CTA button ───────────────────────────────────── */
function btn(href: string, label: string, bg = GOLD, color = INK): string {
  return `<a href="${href}"
    style="display:inline-block;margin-top:24px;padding:14px 28px;
           background:${bg};color:${color};font-size:13px;font-weight:bold;
           text-decoration:none;border-radius:4px;letter-spacing:1px;">
    ${label}
  </a>`;
}

/* ── Divider ───────────────────────────────────────────── */
const divider = `<hr style="border:none;border-top:1px solid #eeeeee;margin:28px 0;" />`;

/* ── Email generators ──────────────────────────────────── */
export function generateEmail(type: EmailType, data: any): EmailPayload {
  let subject = '';
  let body    = '';

  switch (type) {

    /* ── 1. Order Confirmation ── */
    case 'order-confirmation': {
      subject = `Your order is confirmed — ${data.orderId}`;
      body = `
        <h2 style="margin:0 0 16px;font-size:22px;color:${INK};">
          Thank you for your order, ${data.customerName}!
        </h2>
        <p style="margin:0;font-size:15px;line-height:1.7;color:#444;">
          We have received your order <strong style="color:${INK};">#${data.orderId}</strong> and are holding it while we await your bank transfer.
        </p>

        ${divider}

        <!-- Order summary box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};border-radius:6px;padding:20px;margin:0;">
          <tr>
            <td style="font-size:13px;color:#555;padding:6px 0;">Order Number</td>
            <td align="right" style="font-size:13px;font-weight:bold;color:${INK};padding:6px 0;">#${data.orderId}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#555;padding:6px 0;">Total Amount</td>
            <td align="right" style="font-size:16px;font-weight:bold;color:${GOLD};padding:6px 0;">${data.total}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#555;padding:6px 0;">Items</td>
            <td align="right" style="font-size:13px;color:${INK};padding:6px 0;">${data.itemCount} item(s)</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#555;padding:6px 0;">Payment</td>
            <td align="right" style="font-size:13px;color:${INK};padding:6px 0;">Bank Transfer</td>
          </tr>
        </table>

        ${divider}

        <p style="font-size:14px;line-height:1.7;color:#555;margin:0;">
          Please complete your bank transfer using the account details provided at checkout.
          Once we receive your payment, we will begin processing your order immediately.
        </p>

        ${btn(data.trackUrl, 'Track Your Order')}
        ${btn('https://wa.me/2348065653384?text=Hello+G-Smile+Signature,+I+just+placed+order+' + data.orderId, 'Confirm via WhatsApp', INK, WHITE)}
      `;
      break;
    }

    /* ── 2. Payment Received ── */
    case 'payment-received': {
      subject = `Payment received — Order #${data.orderId} is being prepared`;
      body = `
        <h2 style="margin:0 0 16px;font-size:22px;color:${INK};">
          Payment Confirmed! 🎉
        </h2>
        <p style="margin:0;font-size:15px;line-height:1.7;color:#444;">
          Hello <strong>${data.customerName}</strong>, your payment for order
          <strong style="color:${INK};">#${data.orderId}</strong> has been confirmed.
        </p>

        ${divider}

        <p style="margin:0;font-size:14px;line-height:1.7;color:#555;">
          Our team is now carefully preparing your luxury bag for shipment.
          You will receive another email with your tracking details as soon
          as your order leaves our facility.
        </p>

        <p style="margin:20px 0 0;font-size:14px;line-height:1.7;color:#555;">
          We appreciate your trust in G-Smile Signature and cannot wait
          for you to receive your piece.
        </p>

        ${btn(data.trackUrl, 'View Order Status')}
      `;
      break;
    }

    /* ── 3. Order Shipped ── */
    case 'order-shipped': {
      subject = `Your order is on its way — #${data.orderId}`;
      body = `
        <h2 style="margin:0 0 16px;font-size:22px;color:${INK};">
          Your order has shipped! 🚀
        </h2>
        <p style="margin:0;font-size:15px;line-height:1.7;color:#444;">
          Hello <strong>${data.customerName}</strong>,
          your G-Smile Signature bag is on its way to you!
        </p>

        ${divider}

        <!-- Tracking box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};border-radius:6px;padding:20px;margin:0;">
          <tr>
            <td style="font-size:13px;color:#555;padding:6px 0;">Order Number</td>
            <td align="right" style="font-size:13px;font-weight:bold;color:${INK};padding:6px 0;">#${data.orderId}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#555;padding:6px 0;">Tracking Number</td>
            <td align="right" style="font-size:13px;font-weight:bold;color:${GOLD};padding:6px 0;">
              ${data.trackingNumber || 'To be updated'}
            </td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#555;padding:6px 0;">Estimated Delivery</td>
            <td align="right" style="font-size:13px;color:${INK};padding:6px 0;">2–5 business days</td>
          </tr>
        </table>

        ${divider}

        <p style="margin:0;font-size:14px;line-height:1.7;color:#555;">
          Please note that delivery times may vary based on your location.
          If you have any questions, don't hesitate to reach out via WhatsApp.
        </p>

        ${btn(data.trackUrl, 'Track My Delivery', GOLD, INK)}
        ${btn('https://wa.me/2348065653384', 'Contact Support', INK, WHITE)}
      `;
      break;
    }

    /* ── 4. Password Reset ── */
    case 'password-reset': {
      subject = 'Reset your G-Smile Signature password';
      body = `
        <h2 style="margin:0 0 16px;font-size:22px;color:${INK};">
          Password Reset Request
        </h2>
        <p style="margin:0;font-size:15px;line-height:1.7;color:#444;">
          We received a request to reset your G-Smile Signature account password.
          Click the button below to set a new password.
        </p>
        <p style="margin:12px 0 0;font-size:13px;color:#888;">
          This link expires in <strong>1 hour</strong>. If you did not make
          this request, you can safely ignore this email.
        </p>

        ${btn(data.resetUrl, 'Reset My Password', INK, WHITE)}

        ${divider}

        <p style="margin:0;font-size:12px;color:#aaa;">
          For security, never share this link with anyone.
          G-Smile Signature will never ask for your password.
        </p>
      `;
      break;
    }
  }

  return {
    to: data.email,
    subject,
    html: layout(body),
  };
}

/**
 * sendTransactionalEmail
 *
 * Calls the secure serverless endpoint /api/send-email
 * which holds the Resend API key server-side.
 * The key is NEVER exposed to the browser.
 */
export async function sendTransactionalEmail(payload: EmailPayload): Promise<void> {
  if (!payload.to) {
    console.warn('sendTransactionalEmail: No recipient email address provided. Skipping.');
    return;
  }

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Email send failed:', err);
      return;
    }

    console.log('Email sent successfully to', payload.to);
  } catch (err) {
    console.error('Network error sending email:', err);
  }
}
