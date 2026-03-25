import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { signVendorToken } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const supabase = createServerSupabase();
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data: vendor } = await supabase
      .from('vendors')
      .select('id, phone, business_name, password_hash, onboarding_step')
      .eq('business_name', normalizedEmail)
      .eq('password_hash', passwordHash)
      .single();

    if (!vendor) {
      return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 });
    }

    const token = await signVendorToken({ vendorId: vendor.id, phone: vendor.phone });

    const redirectTo = vendor.onboarding_step < 4 ? '/auth/onboarding' : '/vendor/dashboard';
    const response = NextResponse.json({ success: true, redirectTo });
    response.cookies.set('bizpilot_token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
