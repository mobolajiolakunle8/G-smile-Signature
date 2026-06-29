/**
 * Transactional Email Service
 * 
 * CRITICAL SECURITY FIX: 
 * Resend API does not support browser-side calls (CORS). 
 * Directly calling it from the frontend leaks your API Key.
 * 
 * PRO FIX: Call a secure backend endpoint (/api/send-email).
 */

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

export function generateEmail(type: EmailType, data: any): EmailPayload & { customerName?: string } {
  let subject = '';
  let content = '';

  switch (type) {
    case 'order-confirmation':
      subject = `Order Received: ${data.orderId}`;
      content = `
        <h2 style="margin-top: 0; font-size: 22px;">Thank you for your order!</h2>
        <p style="font-size: 16px; line-height: 1.6;">Hello ${data.customerName},</p>
        <p style="font-size: 16px; line-height: 1.6;">We have received your order <strong>#${data.orderId}</strong> and are awaiting your bank transfer.</p>
        <div style="background-color: ${BG_COLOR}; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Order Total:</strong> ${data.total}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Items:</strong> ${data.itemCount} item(s)</p>
        </div>
        <p style="font-size: 16px; line-height: 1.6;">Please complete your transfer to the bank account provided at checkout.</p>
        <a href="${data.trackUrl}" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin-top: 10px;">Track Your Order</a>
      `;
      break;

    case 'payment-received':
      subject = `Payment Confirmed: ${data.orderId}`;
      content = `
        <h2 style="margin-top: 0; font-size: 22px;">Payment Confirmed!</h2>
        <p style="font-size: 16px; line-height: 1.6;">Hello ${data.customerName},</p>
        <p style="font-size: 16px; line-height: 1.6;">We have received your payment for order <strong>#${data.orderId}</strong>.</p>
        <p style="font-size: 16px; line-height: 1.6;">Our team is now preparing your items. You will receive an update once they are shipped.</p>
        <a href="${data.trackUrl}" style="display: inline-block; background-color: ${TEXT_COLOR}; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin-top: 10px;">View Order</a>
      `;
      break;

    case 'order-shipped':
      subject = `Your Order Has Shipped: ${data.orderId}`;
      content = `
        <h2 style="margin-top: 0; font-size: 22px;">Order Shipped! 🚀</h2>
        <p style="font-size: 16px; line-height: 1.6;">Hello ${data.customerName},</p>
        <p style="font-size: 16px; line-height: 1.6;">Your order <strong>#${data.orderId}</strong> has been shipped and is on its way.</p>
        <div style="background-color: ${BG_COLOR}; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px;"><strong>Tracking Number:</strong> ${data.trackingNumber || 'N/A'}</p>
        </div>
        <a href="${data.trackUrl}" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin-top: 10px;">Track Shipment</a>
      `;
      break;

    case 'password-reset':
      subject = 'Reset Your Password';
      content = `
        <h2 style="margin-top: 0; font-size: 22px;">Password Reset</h2>
        <p style="font-size: 16px; line-height: 1.6;">Hello,</p>
        <p style="font-size: 16px; line-height: 1.6;">Click the button below to reset your password.</p>
        <a href="${data.resetUrl}" style="display: inline-block; background-color: ${TEXT_COLOR}; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin-top: 10px;">Reset Password</a>
      `;
      break;
  }

  return {
    to: data.email,
    subject,
    html: getBaseLayout(content),
    customerName: data.customerName,
  };
}

/**
 * Sends an email via your backend secure endpoint.
 */
import { dispatchEmail } from '../utils/secureEmail';

/**
 * Sends a transactional email securely.
 */
export async function sendTransactionalEmail(payload: EmailPayload) {
  // Fixes the key leak issue by strictly defining the payload schema
  // and handling the Authorization header safely in the utility.
  await dispatchEmail(payload);
}
