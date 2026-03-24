import { NextRequest, NextResponse } from 'next/server';
import { verifyBankAccount } from '@/lib/services/payment.service';

export async function POST(req: NextRequest) {
  try {
    const { accountNumber, bankCode } = await req.json();
    const result = await verifyBankAccount(accountNumber, bankCode);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Account verification failed' }, { status: 500 });
  }
}
