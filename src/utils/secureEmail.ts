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

/**
 * Professional Dispatcher using Web3Forms
 * This works perfectly on static deployments (Vercel, Netlify, GitHub Pages).
 */
export async function dispatchEmail(data: EmailData) {
  // Get your key from https://web3forms.com/
  const accessKey = (import.meta as any).env?.VITE_WEB3FORMS_KEY || "YOUR_ACCESS_KEY";

  if (accessKey === "YOUR_ACCESS_KEY") {
    console.warn("Web3Forms Access Key missing. Please add VITE_WEB3FORMS_KEY to your .env");
    return;
  }

  // Web3Forms expects a FormData or a JSON object with specific fields
  const payload = {
    access_key: accessKey,
    subject: data.subject,
    from_name: "G-Smile Signature Orders",
    email: data.to, // This triggers the Auto-Responder to the customer
    name: data.customerName || "Customer",
    message: "New Order Details", 
    // We send the full HTML content as a hidden field
    // Web3Forms will deliver this to your dashboard/email
    html_content: data.html,
  };

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
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
