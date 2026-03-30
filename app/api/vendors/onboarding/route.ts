import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { getVendorSessionFromRequest } from '@/lib/auth';
import { buildOnboardingCompletedHtml, sendInvoiceEmail } from '@/lib/services/email.service';

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 40);
}

export async function GET(req: NextRequest) {
  try {
    const session = await getVendorSessionFromRequest(req);
    const vendorId = session?.vendorId;
    if (!vendorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawSlug = req.nextUrl.searchParams.get('slug') || '';
    const slug = normalizeSlug(rawSlug);

    if (slug.length < 3) {
      return NextResponse.json(
        { available: false, error: 'Store link must be at least 3 characters' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from('vendors')
      .select('id')
      .eq('store_slug', slug)
      .neq('id', vendorId)
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ available: (data?.length || 0) === 0, slug });
  } catch {
    return NextResponse.json({ error: 'Failed to validate store link' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getVendorSessionFromRequest(req);
    const vendorId = session?.vendorId;
    if (!vendorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug, bankCode, bankName, accountNumber, accountName, step } = await req.json();

    const updates: {
      onboarding_step: number;
      store_slug?: string;
      bank_code?: string;
      bank_name?: string;
      account_number?: string;
      account_name?: string;
      account_verified_at?: string;
    } = {
      onboarding_step: Number(step) === 4 ? 4 : 1,
    };

    if (slug && typeof slug === 'string') {
      updates.store_slug = normalizeSlug(slug);
    }

    if (bankCode && bankName && accountNumber && accountName) {
      updates.bank_code = String(bankCode);
      updates.bank_name = String(bankName);
      updates.account_number = String(accountNumber);
      updates.account_name = String(accountName);
      updates.account_verified_at = new Date().toISOString();
    }

    const supabase = createServerSupabase();
    const { error } = await supabase.from('vendors').update(updates).eq('id', vendorId);

    if (error) {
      if (error.code === '23505' && updates.store_slug) {
        return NextResponse.json({ error: 'Store link is already taken' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (updates.onboarding_step === 4) {
      const { data: vendor } = await supabase
        .from('vendors')
        .select('business_name, email')
        .eq('id', vendorId)
        .single();

      if (vendor?.email) {
        const html = buildOnboardingCompletedHtml({
          vendorName: vendor.business_name || 'Vendor',
        });
        await sendInvoiceEmail(vendor.email, 'Onboarding completed', html).catch((err) => {
          console.warn('[vendors/onboarding] failed to send completion email', err);
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Onboarding update failed' }, { status: 500 });
  }
}
