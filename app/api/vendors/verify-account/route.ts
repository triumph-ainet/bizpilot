import { NextRequest, NextResponse } from 'next/server';
import { verifyBankAccount } from '@/lib/services/payment.service';
import { getVendorSessionFromRequest } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';
import { buildAccountVerificationHtml, sendInvoiceEmail } from '@/lib/services/email.service';

export async function POST(req: NextRequest) {
  try {
    const session = await getVendorSessionFromRequest(req);
    if (!session?.vendorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accountNumber, bankCode } = await req.json();
    const result = await verifyBankAccount(accountNumber, bankCode);

    const supabase = createServerSupabase();
    const { data: vendor } = await supabase
      .from('vendors')
      .select('business_name, email')
      .eq('id', session.vendorId)
      .single();

    if (vendor?.email && result?.accountName && result?.accountNumber && result?.bankCode) {
      const html = buildAccountVerificationHtml({
        vendorName: vendor.business_name || 'Vendor',
        accountName: result.accountName,
        accountNumber: result.accountNumber,
        bankCode: result.bankCode,
      });
      await sendInvoiceEmail(vendor.email, 'Bank account verified', html).catch((err) => {
        console.warn('[vendors/verify-account] failed to send verification email', err);
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error verifying bank account:', error);
    return NextResponse.json({ error: 'Account verification failed' }, { status: 500 });
  }
}
