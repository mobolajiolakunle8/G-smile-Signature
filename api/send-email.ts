import { Resend } from 'resend';

// NOTE: This file should be placed in the /api folder of your project root
// if you are using Vercel, or handled by your backend server.

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'G-Smile Signature <orders@gsmilesignature.com>', // MUST BE A VERIFIED DOMAIN IN RESEND
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      return res.status(500).json({ error });
    }

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
