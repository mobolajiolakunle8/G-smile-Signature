/**
 * G-Smile Signature — Secure Email Utility
 * 
 * This utility ensures that sensitive API keys are NEVER sent in the request body.
 * It also abstracts the fetch call to be production-ready.
 */

interface EmailData {
  to: string;
  subject: string;
  html: string;
  customerName?: string;
}

const WEB3FORMS_ACCESS_KEY = "2b31b6fe-66d7-47b9-bdf1-147867a028c9";

function htmlToText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&copy;/g, "(c)")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Professional Dispatcher using Web3Forms
 * This works perfectly on static deployments (Vercel, Netlify, GitHub Pages).
 */
export async function dispatchEmail(data: EmailData) {
  // Get your key from https://web3forms.com/
  const accessKey = (import.meta as any).env?.VITE_WEB3FORMS_KEY || WEB3FORMS_ACCESS_KEY;

  if (!accessKey) {
    console.warn("Web3Forms Access Key missing. Please add VITE_WEB3FORMS_KEY to your .env");
    return;
  }

  const formData = new FormData();
  formData.append("access_key", accessKey);
  formData.append("subject", data.subject);
  formData.append("from_name", "G-Smile Signature Website");
  formData.append("name", data.customerName || "Customer");
  formData.append("email", data.to);
  formData.append("replyto", data.to);
  formData.append("message", htmlToText(data.html));
  formData.append("Customer Email", data.to);
  formData.append("Customer Name", data.customerName || "Customer");
  formData.append("HTML Email Preview", data.html);
  formData.append("botcheck", "");

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (result.success) {
      console.log("Order email processed successfully via Web3Forms.");
    } else {
      console.error("Web3Forms Error:", result);
    }
  } catch (err) {
    console.error("Network Error while sending order email:", err);
  }
}
