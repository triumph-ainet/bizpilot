const MAILERLITE_API_URL =
  process.env.MAILERLITE_API_URL || 'https://api.mailerlite.com/api/v2/email/send';
const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;

export async function sendInvoiceEmail(to: string, subject: string, html: string) {
  if (!MAILERLITE_API_KEY) {
    throw new Error('Missing MAILERLITE_API_KEY');
  }

  const res = await fetch(MAILERLITE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MAILERLITE_API_KEY}`,
    },
    body: JSON.stringify({
      to: [{ email: to }],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`MailerLite send failed: ${res.status} ${text}`);
  }

  return res.json();
}
