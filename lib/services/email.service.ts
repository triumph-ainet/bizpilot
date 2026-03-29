const RESEND_API_URL = process.env.RESEND_API_URL || 'https://api.resend.com/emails';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const RESEND_FROM_NAME = process.env.RESEND_FROM_NAME || 'BizPilot';

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendInvoiceEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    throw new Error('Missing RESEND_API_KEY');
  }

  if (!RESEND_FROM_EMAIL) {
    throw new Error('Missing RESEND_FROM_EMAIL');
  }

  const from = RESEND_FROM_NAME ? `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>` : RESEND_FROM_EMAIL;

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Resend send failed: ${res.status} ${text}`);
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

export function buildReceiptHtml({
  vendorName,
  receiptText,
  sessionUrl,
}: {
  vendorName: string;
  receiptText: string;
  sessionUrl?: string;
}) {
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial; color:#111;">
    <div style="background:#0f766e;color:white;padding:16px;border-radius:8px 8px 0 0">
      <h1 style="margin:0;font-size:18px">${vendorName} — Receipt</h1>
    </div>
    <div style="padding:16px;background:#fff;border:1px solid #eee;border-top:0;border-radius:0 0 8px 8px;">
      <p style="white-space:pre-wrap;font-family:monospace;background:#f7f7f7;padding:12px;border-radius:6px">${receiptText}</p>
      ${sessionUrl ? `<p>You can view your order: <a href="${sessionUrl}">${sessionUrl}</a></p>` : ''}
      <p style="font-size:12px;color:#666;margin-top:12px">Thanks for your purchase — ${vendorName}</p>
    </div>
  </div>
  `;
}

export function buildInvoiceHtml({
  vendorName,
  invoiceNumber,
  itemsHtml,
  total,
}: {
  vendorName: string;
  invoiceNumber?: string | null;
  itemsHtml: string;
  total: number;
}) {
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial; color:#111;">
    <div style="background:#0f766e;color:white;padding:16px;border-radius:8px 8px 0 0">
      <h1 style="margin:0;font-size:18px">${vendorName} — Invoice ${invoiceNumber || ''}</h1>
    </div>
    <div style="padding:16px;background:#fff;border:1px solid #eee;border-top:0;border-radius:0 0 8px 8px;">
      ${itemsHtml}
      <p style="font-weight:bold">Total: ₦${total.toLocaleString()}</p>
      <p style="font-size:12px;color:#666;margin-top:12px">Thank you for your business.</p>
    </div>
  </div>
  `;
}

export function buildPasswordResetHtml({
  resetUrl,
  ttlMinutes,
}: {
  resetUrl: string;
  ttlMinutes: number;
}) {
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial; color:#111;">
    <h2 style="color:#0f766e;">Reset your BizPilot password</h2>
    <p>We received a request to reset your password.</p>
    <p><a href="${escapeHtml(resetUrl)}">Reset your password</a></p>
    <p style="font-size:12px;color:#666;">This link expires in ${ttlMinutes} minutes. If you did not request this change, you can ignore this email.</p>
  </div>
  `;
}

export function buildWelcomeEmailHtml({
  businessName,
  storeUrl,
}: {
  businessName: string;
  storeUrl?: string;
}) {
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial; color:#111;">
    <h2 style="color:#0f766e;">Welcome to BizPilot, ${escapeHtml(businessName)}!</h2>
    <p>Your account is ready. You can start receiving and processing orders immediately.</p>
    ${storeUrl ? `<p>Your store: <a href="${escapeHtml(storeUrl)}">${escapeHtml(storeUrl)}</a></p>` : ''}
    <p style="font-size:12px;color:#666;">Need help? Reply to this email and our team will assist you.</p>
  </div>
  `;
}

export function buildFeedbackAlertHtml({
  vendorName,
  rating,
  comment,
  customerIdentifier,
}: {
  vendorName: string;
  rating?: number | null;
  comment?: string | null;
  customerIdentifier?: string | null;
}) {
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial; color:#111;">
    <h2 style="color:#0f766e;">New feedback for ${escapeHtml(vendorName)}</h2>
    <p><strong>Rating:</strong> ${rating ?? 'Not provided'}</p>
    <p><strong>Customer:</strong> ${customerIdentifier ? escapeHtml(customerIdentifier) : 'Anonymous'}</p>
    <p><strong>Comment:</strong></p>
    <p style="white-space:pre-wrap;">${comment ? escapeHtml(comment) : 'No comment provided.'}</p>
  </div>
  `;
}

export function buildLowStockAlertHtml({
  vendorName,
  alerts,
}: {
  vendorName: string;
  alerts: Array<{ productName: string; quantity: number; threshold: number }>;
}) {
  const rows = alerts
    .map(
      (alert) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(alert.productName)}</td><td style="padding:8px;border-bottom:1px solid #eee;">${alert.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;">${alert.threshold}</td></tr>`
    )
    .join('');

  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial; color:#111;">
    <h2 style="color:#b45309;">Low stock alert for ${escapeHtml(vendorName)}</h2>
    <table style="border-collapse:collapse;width:100%;max-width:560px;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px;border-bottom:2px solid #ddd;">Product</th>
          <th style="text-align:left;padding:8px;border-bottom:2px solid #ddd;">Qty left</th>
          <th style="text-align:left;padding:8px;border-bottom:2px solid #ddd;">Threshold</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  `;
}

export function buildOnboardingCompletedHtml({ vendorName }: { vendorName: string }) {
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial; color:#111;">
    <h2 style="color:#0f766e;">Onboarding complete</h2>
    <p>${escapeHtml(vendorName)}, your BizPilot onboarding is complete and your store is ready for transactions.</p>
  </div>
  `;
}

export function buildSettingsUpdatedHtml({
  vendorName,
  changedFields,
}: {
  vendorName: string;
  changedFields: string[];
}) {
  const list = changedFields.map((field) => `<li>${escapeHtml(field)}</li>`).join('');
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial; color:#111;">
    <h2 style="color:#0f766e;">Settings updated</h2>
    <p>Hi ${escapeHtml(vendorName)}, the following settings were updated:</p>
    <ul>${list || '<li>No specific fields listed</li>'}</ul>
  </div>
  `;
}

export function buildAccountVerificationHtml({
  vendorName,
  accountName,
  accountNumber,
  bankCode,
}: {
  vendorName: string;
  accountName: string;
  accountNumber: string;
  bankCode: string;
}) {
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial; color:#111;">
    <h2 style="color:#0f766e;">Bank account verified</h2>
    <p>${escapeHtml(vendorName)}, your account verification was successful.</p>
    <p><strong>Account name:</strong> ${escapeHtml(accountName)}</p>
    <p><strong>Account number:</strong> ${escapeHtml(accountNumber)}</p>
    <p><strong>Bank code:</strong> ${escapeHtml(bankCode)}</p>
  </div>
  `;
}
