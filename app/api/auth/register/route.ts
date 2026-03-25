import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { signVendorToken } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email, phone, businessName, password } = await req.json();
    const supabase = createServerSupabase();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('vendors')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const slugBase = businessName.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').slice(0, 30);
    const slug =
      slugBase
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 30) +
      '-' +
      Math.random().toString(36).slice(2, 6);

    const { data: vendor, error } = await supabase
      .from('vendors')
      .insert({
        email: email.trim().toLowerCase(),
        business_name: businessName,
        phone,
        password_hash: passwordHash,
        store_slug: slug,
        onboarding_step: 1,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    const token = await signVendorToken({ vendorId: vendor.id, phone });

    const response = NextResponse.json({ success: true, vendorId: vendor.id });
    response.cookies.set('bizpilot_token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 500 }
    );
  }
}
