import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { SignJWT } from 'jose';
import crypto from 'crypto';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'dev-secret-min-32-chars-long-here'
);

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();
    const supabase = createServerSupabase();
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    const { data: vendor } = await supabase
      .from('vendors')
      .select('id, phone, business_name, password_hash, onboarding_step')
      .eq('phone', phone)
      .eq('password_hash', passwordHash)
      .single();

    if (!vendor) {
      return NextResponse.json({ error: 'Incorrect phone number or password' }, { status: 401 });
    }

    const token = await new SignJWT({ vendorId: vendor.id, phone: vendor.phone })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    const redirectTo = vendor.onboarding_step < 4 ? '/onboarding' : '/vendor/dashboard';
    const response = NextResponse.json({ success: true, redirectTo });
    response.cookies.set('bizpilot_token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
