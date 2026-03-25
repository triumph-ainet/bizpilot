import { NextResponse } from 'next/server';
import { getAvailableBank } from '@/lib/services/payment.service';

export async function GET() {
  try {
    const res = await getAvailableBank();
    const data = res?.data || [];
    const banks = data.map((b: any) => ({ name: b.name, code: b.code }));
    return NextResponse.json({ success: true, data: banks });
  } catch (err) {
    console.error('Failed to fetch banks', err);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
