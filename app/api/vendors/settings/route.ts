import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { getVendorSessionFromRequest } from '@/lib/auth';
import { buildSettingsUpdatedHtml, sendInvoiceEmail } from '@/lib/services/email.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getVendorSessionFromRequest(req);
    const vendorId = session?.vendorId;

    if (!vendorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from('vendors')
      .select(
        'id, business_name, phone, store_slug, bank_name, bank_code, account_number, account_name, account_verified_at, city, category, low_stock_threshold'
      )
      .eq('id', vendorId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({
      businessName: data.business_name,
      phone: data.phone,
      storeSlug: data.store_slug,
      bankName: data.bank_name,
      bankCode: data.bank_code,
      accountNumber: data.account_number,
      accountName: data.account_name,
      accountVerified: !!data.account_verified_at,
      city: data.city,
      category: data.category,
      lowStockThreshold: data.low_stock_threshold || 5,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getVendorSessionFromRequest(req);
    const vendorId = session?.vendorId;

    if (!vendorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      businessName,
      phone,
      bankName,
      bankCode,
      accountNumber,
      accountName,
      lowStockThreshold,
    } = body;

    const updates: Record<string, unknown> = {};
    const changedFields = Object.keys(body).filter((key) => body[key] !== undefined);

    // Only allow updating specific fields
    if (businessName !== undefined) updates.business_name = businessName;
    if (phone !== undefined) updates.phone = phone;
    if (bankName !== undefined) updates.bank_name = bankName;
    if (bankCode !== undefined) updates.bank_code = bankCode;
    if (accountNumber !== undefined) updates.account_number = accountNumber;
    if (accountName !== undefined) updates.account_name = accountName;
    if (lowStockThreshold !== undefined) updates.low_stock_threshold = lowStockThreshold;

    // If bank details are provided, mark as verified
    if (bankName && bankCode && accountNumber && accountName) {
      updates.account_verified_at = new Date().toISOString();
    }

    const supabase = createServerSupabase();
    const { error } = await supabase.from('vendors').update(updates).eq('id', vendorId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (changedFields.length > 0) {
      const { data: vendor } = await supabase
        .from('vendors')
        .select('business_name, email')
        .eq('id', vendorId)
        .single();

      if (vendor?.email) {
        const html = buildSettingsUpdatedHtml({
          vendorName: vendor.business_name || 'Vendor',
          changedFields,
        });
        await sendInvoiceEmail(vendor.email, 'Your settings were updated', html).catch((err) => {
          console.warn('[vendors/settings] failed to send settings update email', err);
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
