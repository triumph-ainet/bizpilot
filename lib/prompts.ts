import { Product } from './types';

// ─── Order Parser ─────────────────────────────────────────────────────────────
export function orderParserPrompt(catalog: Product[]) {
  const catalogList = catalog
    .map((p) => `- ${p.name} (₦${p.price}, ${p.quantity} in stock)`)
    .join('\n');

  return `You are an order parser for a Nigerian SME store. 
Parse the customer's message and extract what they want to order.

STORE CATALOG:
${catalogList}

RULES:
- Match items to the catalog using fuzzy matching (e.g. "pepsi" matches "Pepsi 60cl")
- If an item is unclear or not in catalog, add it to "unclear"
- Return ONLY valid JSON with no preamble or markdown

RESPONSE FORMAT:
{
  "items": [{ "name": "exact catalog name", "quantity": 2 }],
  "unclear": ["item not understood"]
}`;
}

export const imageExtractorPrompt = `You are a product extraction AI for a Nigerian SME.
Look at this image and extract product details.
Return ONLY valid JSON with no preamble or markdown.

RESPONSE FORMAT:
{
  "name": "product name",
  "estimated_price": 300,
  "quantity": 24
}

If you cannot determine price or quantity, use null.
For Nigerian products, assume prices are in Naira (₦).`;

export function orderConfirmationPrompt(
  items: { name: string; quantity: number; price: number }[],
  total: number,
  paymentUrl: string,
  invoiceNumber?: string | null
) {
  const itemsList = items
    .map((i) => `${i.quantity}× ${i.name} = ₦${i.price * i.quantity}`)
    .join('\n');

  const invoiceLine = invoiceNumber ? `Invoice: ${invoiceNumber}\n` : '';

  return `You are a friendly Nigerian business assistant for a WhatsApp store.
Write a short order confirmation message (max 4 lines).
Be warm, use natural Nigerian English. Include the payment link.

ORDER:
${itemsList}
Total: ₦${total}
${invoiceLine}Payment link: ${paymentUrl}

Keep it concise. End with the payment link clearly labeled.`;
}

export function receiptPrompt(customerName: string, total: number, reference: string) {
  return `Write a short WhatsApp payment receipt message for a Nigerian store.
Customer: ${customerName}
Amount paid: ₦${total}
Reference: ${reference}

Be warm and thankful. 2-3 lines max. Include the reference number.`;
}

export function lowStockAlertPrompt(productName: string, currentQty: number, threshold: number) {
  return `Write a short low stock alert for a Nigerian vendor dashboard.
Product: ${productName}
Current stock: ${currentQty} units
Threshold: ${threshold} units

One sentence. Friendly but urgent. No emoji needed.`;
}

export function orderSuggestionPrompt(intentText: string, catalog: Product[], maxSuggestions = 5) {
  const catalogList = catalog.map((p) => `- ${p.name} (₦${p.price})`).join('\n');

  return `You are an assistant that suggests products from a vendor catalog based on customer intent.
Customer intent: "${intentText}"

CATALOG:
${catalogList}

RULES:
- Suggest up to ${maxSuggestions} items that best match the customer's intent.
- For each suggestion return name, short_reason and estimated_price (from the catalog price).
- Return ONLY valid JSON array with no preamble or markdown.

RESPONSE FORMAT:
[ { "name": "catalog name", "short_reason": "why this fits", "estimated_price": 123 } ]`;
}
