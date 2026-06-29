/**
 * G-Smile Signature — Transactional Email Service
 * Powered by Web3Forms (https://web3forms.com)
 *
 * ✅ Works directly from the browser — no backend needed
 * ✅ Access key is safe to be public (Web3Forms design)
 * ✅ Free plan: unlimited submissions
 * ✅ Emails go to gsmilebags@gmail.com (configured in Web3Forms dashboard)
 *
 * HOW TO GET YOUR ACCESS KEY:
 * 1. Go to https://web3forms.com
 * 2. Enter your email: gsmilebags@gmail.com
 * 3. Click "Create Access Key"
 * 4. Check your email inbox for the key
 * 5. Replace WEB3FORMS_ACCESS_KEY below with your key
 */

const WEB3FORMS_ACCESS_KEY: string = "2b31b6fe-66d7-47b9-bdf1-147867a028c9";
const WEB3FORMS_API        = "https://api.web3forms.com/submit";

export type EmailType =
  | "order-confirmation"
  | "payment-received"
  | "order-shipped"
  | "password-reset";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/* ── Brand tokens ─────────────────────────────────────── */
const GOLD  = "#D4A24A";
const INK   = "#111111";
const CREAM = "#F6F2E8";
const WHITE = "#ffffff";

/* ── Layout wrapper ───────────────────────────────────── */
function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>G-Smile Signature</title>
</head>
<body style="margin:0;padding:0;background:${CREAM};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${INK};">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CREAM};padding:48px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:${WHITE};border-radius:10px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:${INK};padding:28px 40px;text-align:center;border-bottom:4px solid ${GOLD};">
            <p style="margin:0;font-family:Georgia,serif;font-size:28px;color:${WHITE};">
              G-Smile <span style="color:${GOLD};">Signature</span>
            </p>
            <p style="margin:6px 0 0;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.5);">
              Premium Luxury Bags
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:44px 40px;">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;background:#f8f8f8;border-top:1px solid #eeeeee;text-align:center;">
            <p style="margin:0;font-size:12px;color:#999;">
              &copy; ${new Date().getFullYear()} G-Smile Signature &nbsp;·&nbsp; Lagos, Nigeria
            </p>
            <p style="margin:6px 0 0;font-size:12px;color:#999;">
              gsmilebags@gmail.com &nbsp;·&nbsp; +234 806 565 3384
            </p>
            <p style="margin:10px 0 0;font-size:11px;color:#bbb;">
              You received this email because you placed an order with G-Smile Signature.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ── Reusable gold CTA button ─────────────────────────── */
function btn(href: string, label: string, bg = GOLD, color = INK): string {
  return `<a href="${href}" style="display:inline-block;margin-top:24px;padding:14px 32px;background:${bg};color:${color};font-size:13px;font-weight:bold;text-decoration:none;border-radius:6px;letter-spacing:1px;">
    ${label}
  </a>`;
}

/* ── Info box ─────────────────────────────────────────── */
function infoBox(rows: { label: string; value: string }[]): string {
  const cells = rows.map(
    (r) => `
    <tr>
      <td style="font-size:13px;color:#666;padding:8px 0;border-bottom:1px solid #eeeeee;">${r.label}</td>
      <td align="right" style="font-size:13px;font-weight:bold;color:${INK};padding:8px 0;border-bottom:1px solid #eeeeee;">${r.value}</td>
    </tr>`
  ).join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CREAM};border-radius:8px;padding:20px;margin:24px 0;">
    ${cells}
  </table>`;
}

/* ── Email template generators ────────────────────────── */
export function generateEmail(type: EmailType, data: any): EmailPayload {
  let subject = "";
  let body    = "";

  switch (type) {

    /* ── 1. Order Confirmation ─────────────────────────── */
    case "order-confirmation": {
      subject = `✅ Order Confirmed — #${data.orderId}`;
      body = `
        <h2 style="margin:0 0 12px;font-size:22px;font-family:Georgia,serif;color:${INK};">
          Thank you for your order!
        </h2>
        <p style="margin:0;font-size:15px;line-height:1.8;color:#444;">
          Hello <strong>${data.customerName}</strong>, we have received your order and
          are holding it while we await your bank transfer payment.
        </p>

        ${infoBox([
          { label: "Order Number",   value: `#${data.orderId}` },
          { label: "Total Amount",   value: data.total        },
          { label: "Items",          value: `${data.itemCount} item(s)` },
          { label: "Payment Method", value: "Bank Transfer"   },
        ])}

        <p style="margin:0;font-size:14px;line-height:1.8;color:#555;">
          Once we confirm your bank transfer, we will begin preparing your luxury bag immediately.
          You can also send us your payment proof on WhatsApp for faster processing.
        </p>

        <div>
          ${btn(data.trackUrl, "Track Your Order")}
          &nbsp;&nbsp;
          ${btn(
            `https://wa.me/2348065653384?text=Hello+G-Smile,+I+just+placed+order+%23${data.orderId}+and+would+like+to+confirm+my+payment.`,
            "Confirm via WhatsApp",
            "#25D366",
            WHITE
          )}
        </div>
      `;
      break;
    }

    /* ── 2. Payment Received ───────────────────────────── */
    case "payment-received": {
      subject = `🎉 Payment Received — Order #${data.orderId} is being prepared`;
      body = `
        <h2 style="margin:0 0 12px;font-size:22px;font-family:Georgia,serif;color:${INK};">
          Payment Confirmed!
        </h2>
        <p style="margin:0;font-size:15px;line-height:1.8;color:#444;">
          Hello <strong>${data.customerName}</strong>, we have successfully confirmed your
          payment for order <strong>#${data.orderId}</strong>.
        </p>

        <div style="margin:24px 0;padding:20px;background:${CREAM};border-left:4px solid ${GOLD};border-radius:4px;">
          <p style="margin:0;font-size:14px;color:#555;line-height:1.8;">
            Our team is now carefully preparing your luxury bag for shipment.
            You will receive another email with tracking details once your order ships.
          </p>
        </div>

        <p style="margin:0;font-size:14px;line-height:1.8;color:#555;">
          Thank you for your trust in G-Smile Signature. We cannot wait for you to receive your piece.
        </p>

        ${btn(data.trackUrl, "View Order Status")}
      `;
      break;
    }

    /* ── 3. Order Shipped ──────────────────────────────── */
    case "order-shipped": {
      subject = `🚀 Your Order Has Shipped — #${data.orderId}`;
      body = `
        <h2 style="margin:0 0 12px;font-size:22px;font-family:Georgia,serif;color:${INK};">
          Your order is on its way!
        </h2>
        <p style="margin:0;font-size:15px;line-height:1.8;color:#444;">
          Hello <strong>${data.customerName}</strong>, great news — your G-Smile Signature
          bag has been dispatched!
        </p>

        ${infoBox([
          { label: "Order Number",       value: `#${data.orderId}`                    },
          { label: "Tracking Number",    value: data.trackingNumber || "To be updated" },
          { label: "Estimated Delivery", value: "2 – 5 business days"                 },
        ])}

        <p style="margin:0;font-size:14px;line-height:1.8;color:#555;">
          Use the button below to track your shipment. If you have any questions,
          our team is available on WhatsApp 7 days a week.
        </p>

        <div>
          ${btn(data.trackUrl, "Track My Delivery")}
          &nbsp;&nbsp;
          ${btn("https://wa.me/2348065653384", "Chat with Us", INK, WHITE)}
        </div>
      `;
      break;
    }

    /* ── 4. Password Reset ─────────────────────────────── */
    case "password-reset": {
      subject = "🔐 Reset Your G-Smile Signature Password";
      body = `
        <h2 style="margin:0 0 12px;font-size:22px;font-family:Georgia,serif;color:${INK};">
          Password Reset Request
        </h2>
        <p style="margin:0;font-size:15px;line-height:1.8;color:#444;">
          We received a request to reset your G-Smile Signature account password.
          Click the button below to set a new password. This link expires in 1 hour.
        </p>

        ${btn(data.resetUrl, "Reset My Password", INK, WHITE)}

        <p style="margin:28px 0 0;font-size:13px;line-height:1.8;color:#999;">
          If you did not request this, you can safely ignore this email.
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

/* ── Send email via Web3Forms ─────────────────────────── */
export async function sendTransactionalEmail(payload: EmailPayload): Promise<void> {
  if (!payload.to) {
    console.warn("[Email] No recipient address. Skipping.");
    return;
  }

  if (WEB3FORMS_ACCESS_KEY === "YOUR_WEB3FORMS_ACCESS_KEY") {
    console.warn("[Email] Web3Forms access key not set. Visit https://web3forms.com to get your free key.");
    return;
  }

  try {
    const formData = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject:    payload.subject,
      from_name:  "G-Smile Signature",
      to_email:   payload.to,      // forwards to recipient
      replyto:    payload.to,
      botcheck:   false,
      /* Pass the HTML body as the "message" field —
         Web3Forms will embed it in the notification email */
      message:    payload.html,
    };

    const response = await fetch(WEB3FORMS_API, {
      method:  "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body:    JSON.stringify(formData),
    });

    const result = await response.json();

    if (result.success) {
      console.log(`[Email] Sent successfully → ${payload.to} | Subject: ${payload.subject}`);
    } else {
      console.error("[Email] Web3Forms error:", result.message || result);
    }
  } catch (err) {
    console.error("[Email] Network error:", err);
  }
}
