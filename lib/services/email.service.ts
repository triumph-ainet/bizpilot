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

export function buildNotificationHtml({
  vendorName,
  customer,
  message,
  chatUrl,
}: {
  vendorName: string;
  customer: string;
  message: string;
  chatUrl?: string;
}) {
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial; color:#111;">
    <h2 style="color:#0f766e;">New message from ${vendorName}</h2>
    <p><strong>Chat:</strong> ${customer}</p>
    <p style="white-space:pre-wrap;">${message}</p>
    ${chatUrl ? `<p><a href="${chatUrl}">Open chat</a></p>` : ''}
    <hr />
    <p style="font-size:12px;color:#666;">You can reply via the web chat. Reply emails are not monitored.</p>
  </div>
  `;
}

export async function sendNotificationEmail(
  to: string,
  vendorName: string,
  customer: string,
  message: string,
  html?: string
) {
  const subject = `New message from ${vendorName}`;
  const body = html || buildNotificationHtml({ vendorName, customer, message });
  return sendInvoiceEmail(to, subject, body);
}
