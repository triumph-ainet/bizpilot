import { GoogleGenerativeAI } from '@google/generative-ai';
import { Product, ParsedOrder, ExtractedProduct } from '../types';
import {
  orderParserPrompt,
  imageExtractorPrompt,
  orderConfirmationPrompt,
  receiptPrompt,
  lowStockAlertPrompt,
} from '../prompts';

const genai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const MODEL = 'gemini-2.5-flash-lite';

export async function parseOrder(text: string, catalog: Product[]): Promise<ParsedOrder> {
  const model = genai.getGenerativeModel({
    model: MODEL,
    systemInstruction: orderParserPrompt(catalog),
  });
  const response = await model.generateContent(text);

  const raw = response.response.text();
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    return { items: [], unclear: [text] };
  }
}

export async function extractProductFromImage(
  imageBase64: string,
  mimeType: string
): Promise<ExtractedProduct> {
  const model = genai.getGenerativeModel({ model: MODEL });
  const response = await model.generateContent([
    {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    },
    { text: imageExtractorPrompt },
  ]);

  const raw = response.response.text();
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    return { name: 'Unknown Product', estimated_price: null, quantity: null };
  }
}

export async function generateOrderConfirmation(
  items: { name: string; quantity: number; price: number }[],
  total: number,
  paymentUrl: string,
  invoiceNumber?: string | null
): Promise<string> {
  const model = genai.getGenerativeModel({
    model: MODEL,
    systemInstruction: orderConfirmationPrompt(items, total, paymentUrl, invoiceNumber),
  });
  const response = await model.generateContent('Generate the order confirmation.');
  return response.response.text() || `Order confirmed! Total: ₦${total}. Pay here: ${paymentUrl}`;
}

export async function generateReceipt(
  customerName: string,
  total: number,
  reference: string
): Promise<string> {
  const model = genai.getGenerativeModel({
    model: MODEL,
    systemInstruction: receiptPrompt(customerName, total, reference),
  });
  const response = await model.generateContent('Generate receipt.');
  return (
    response.response.text() || `Payment of ₦${total} confirmed! Ref: ${reference}. Thank you!`
  );
}

export async function generateLowStockAlert(
  productName: string,
  currentQty: number,
  threshold: number
): Promise<string> {
  const model = genai.getGenerativeModel({
    model: MODEL,
    systemInstruction: lowStockAlertPrompt(productName, currentQty, threshold),
  });
  const response = await model.generateContent('Generate stock alert.');
  return response.response.text() || `${productName} is running low (${currentQty} left).`;
}
