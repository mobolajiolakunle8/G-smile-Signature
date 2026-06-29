/**
 * Transactional Email Service using Resend REST API
 * The API key is loaded from environment variables.
 */

const env = (import.meta as any).env || {};
const RESEND_API_KEY = env.VITE_RESEND_API_KEY || 're_fBN8xfms_4h8uyeYjYFN7Pd3kaGb6actt';

export type EmailType = 'order-confirmation' | 'payment-received' | 'order-shipped' | 'password-reset';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

const BRAND_COLOR = '#D4A24A'; // Gold
const TEXT_COLOR = '#111111'; // Ink
const BG_COLOR = '#F6F2E8';   // Cream

function getBaseLayout(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>G-Smile Signature</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${BG_COLOR}; color: ${TEXT_COLOR};">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${BG_COLOR}; padding: 40px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <tr>
                <td style="padding: 30px 40px; text-align: center; border-bottom: 2px solid ${BRAND_COLOR};">
                  <h1 style="margin: 0; font-family: 'Georgia', serif; font-size: 24px; color: ${TEXT_COLOR};">G-Smile <span style="color: ${BRAND_COLOR};">Signature</span></h1>
                  <p style="margin: 5px 0 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #888;">Premium Luxury Bags</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px;">
                  ${content}
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 40px; background-color: #fafafa; text-align: center; font-size: 12px; color: #888;">
                  <p style="margin: 0;">&copy; ${new Date().getFullYear()} G-Smile Signature. All rights reserved.</p>
                  <p style="margin: 5px 0 0 0;">Lagos, Nigeria | gsmilebags@gmail.com</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function generateEmail(type: EmailType, data: any): EmailPayload {
  let subject = '';
  let content = '';

  switch (type) {
    case 'order-confirmation':
      subject = `Order Confirmed: ${data.orderId}`;
      content = `
        <h2 style="margin-top: 0; font-size: 22px;">Thank you for your order!</h2>
        <p style="font-size: 16px; line-height: 1.6;">Hello ${data.customerName},</p>
        <p style="font-size: 16px; line-height: 1.6;">We have received your order <strong>#${data.orderId}</strong> and are awaiting your bank transfer.</p>
        <div style="background-color: ${BG_COLOR}; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Order Total:</strong> ${data.total}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Items:</strong> ${data.itemCount} item(s)</p>
        </div>
        <p style="font-size: 16px; line-height: 1.6;">Please complete your transfer to the bank account provided at checkout to avoid delays.</p>
        <a href="${data.trackUrl}" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin-top: 10px;">Track Your Order</a>
      `;
      break;

    case 'payment-received':
      subject = `Payment Received: ${data.orderId}`;
      content = `
        <h2 style="margin-top: 0; font-size: 22px;">Payment Confirmed!</h2>
        <p style="font-size: 16px; line-height: 1.6;">Hello ${data.customerName},</p>
        <p style="font-size: 16px; line-height: 1.6;">We have successfully received your payment for order <strong>#${data.orderId}</strong>.</p>
        <p style="font-size: 16px; line-height: 1.6;">Our team is now preparing your luxury bag for shipment. You will receive another email with tracking details once it leaves our facility.</p>
        <a href="${data.trackUrl}" style="display: inline-block; background-color: ${TEXT_COLOR}; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin-top: 10px;">View Order Status</a>
      `;
      break;

    case 'order-shipped':
      subject = `Your Order Has Shipped: ${data.orderId}`;
      content = `
        <h2 style="margin-top: 0; font-size: 22px;">Your order is on its way!</h2>
        <p style="font-size: 16px; line-height: 1.6;">Hello ${data.customerName},</p>
        <p style="font-size: 16px; line-height: 1.6;">Great news! Your order <strong>#${data.orderId}</strong> has been shipped.</p>
        <div style="background-color: ${BG_COLOR}; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px;"><strong>Tracking Number:</strong> ${data.trackingNumber || 'N/A'}</p>
        </div>
        <p style="font-size: 16px; line-height: 1.6;">You can track your package using the button below.</p>
        <a href="${data.trackUrl}" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin-top: 10px;">Track Shipment</a>
      `;
      break;

    case 'password-reset':
      subject = 'Reset Your Password';
      content = `
        <h2 style="margin-top: 0; font-size: 22px;">Password Reset Request</h2>
        <p style="font-size: 16px; line-height: 1.6;">Hello,</p>
        <p style="font-size: 16px; line-height: 1.6;">We received a request to reset your password for your G-Smile Signature account.</p>
        <p style="font-size: 16px; line-height: 1.6;">Click the button below to create a new password. This link will expire in 1 hour.</p>
        <a href="${data.resetUrl}" style="display: inline-block; background-color: ${TEXT_COLOR}; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin-top: 10px;">Reset Password</a>
        <p style="font-size: 14px; color: #888; margin-top: 20px;">If you did not request this, please ignore this email.</p>
      `;
      break;
  }

  return {
    to: data.email,
    subject,
    html: getBaseLayout(content),
  };
}

/**
 * Sends an email using the Resend REST API.
 * This runs in the browser context.
 */
export async function sendTransactionalEmail(payload: EmailPayload) {
  console.log('--- ATTEMPTING TO SEND EMAIL VIA RESEND ---');
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'G-Smile Signature <orders@g-smile-signature.com>',
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API Error:', data);
      return;
    }

    console.log('Email sent successfully:', data);
  } catch (err) {
    console.error('Failed to send email:', err);
  }
}
