import crypto from 'crypto';
import { PaymentInitResponse, AccountVerifyResponse } from '../../types';

const BASE_URL = process.env.INTERSWITCH_BASE_URL!;
const CLIENT_ID = process.env.INTERSWITCH_CLIENT_ID!;
const SECRET_KEY = process.env.INTERSWITCH_SECRET_KEY!;
const MERCHANT_CODE = process.env.INTERSWITCH_MERCHANT_CODE!;
const PAY_ITEM_ID = process.env.INTERSWITCH_PAY_ITEM_ID!;

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${CLIENT_ID}:${SECRET_KEY}`).toString('base64');
  const res = await fetch(`${BASE_URL}/passport/oauth/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=profile',
  });
  const data = await res.json();
  return data.access_token;
}

export async function initializePayment(
  orderId: string,
  amountKobo: number,
  customerEmail: string
): Promise<PaymentInitResponse> {
  const reference = `BIZ-${orderId}-${Date.now()}`;
  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`;

  const hash = crypto
    .createHash('sha512')
    .update(`${reference}${MERCHANT_CODE}${PAY_ITEM_ID}${amountKobo}${redirectUrl}${SECRET_KEY}`)
    .digest('hex');

  const params = new URLSearchParams({
    merchantCode: MERCHANT_CODE,
    payItemID: PAY_ITEM_ID,
    amount: String(amountKobo),
    siteRedirectURL: redirectUrl,
    txnref: reference,
    currency: '566', // NGN
    customerEmail,
    hash,
  });

  const paymentUrl = `${BASE_URL}/collections/api/v1/pay?${params.toString()}`;

  return { paymentUrl, reference };
}

// ─── Verify a payment by reference ───────────────────────────────────────────
export async function verifyPayment(reference: string) {
  const token = await getAccessToken();
  const hash = crypto
    .createHash('sha512')
    .update(`${reference}${MERCHANT_CODE}${PAY_ITEM_ID}${SECRET_KEY}`)
    .digest('hex');

  const res = await fetch(
    `${BASE_URL}/collections/api/v1/gettransaction.json?merchantcode=${MERCHANT_CODE}&transactionreference=${reference}&amount=&hash=${hash}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.json();
}

export async function verifyBankAccount(
  accountNumber: string,
  bankCode: string
): Promise<AccountVerifyResponse> {
  const token = await getAccessToken();

  const res = await fetch(
    `${BASE_URL}/api/v2/quickteller/customers/beneficiaries/banks/accounts?accountIdentifier=${accountNumber}&bankCode=${bankCode}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await res.json();

  return {
    accountName: data.AccountName || data.accountName,
    accountNumber: data.AccountNumber || accountNumber,
    bankCode,
  };
}

export function verifyWebhookSignature(payload: Record<string, string>): boolean {
  const { txnref, amount, resp } = payload;
  const expectedHash = crypto
    .createHash('sha512')
    .update(`${txnref}${MERCHANT_CODE}${PAY_ITEM_ID}${amount}${resp}${SECRET_KEY}`)
    .digest('hex');
  return expectedHash === payload.hash;
}
