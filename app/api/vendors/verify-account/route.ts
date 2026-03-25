import { NextRequest, NextResponse } from 'next/server';
import { verifyBankAccount } from '@/lib/services/payment.service';
import { getVendorSessionFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getVendorSessionFromRequest(req);
    if (!session?.vendorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accountNumber, bankCode } = await req.json();
    const result = await verifyBankAccount(accountNumber, bankCode);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error verifying bank account:', error);
    return NextResponse.json({ error: 'Account verification failed' }, { status: 500 });
  }
}
