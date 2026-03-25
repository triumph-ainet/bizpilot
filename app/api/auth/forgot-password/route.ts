import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import crypto from 'crypto';

const RESET_TOKEN_TTL_MINUTES = 30;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const normalizedEmail = String(email || '')
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000).toISOString();

    const { data: vendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('business_name', normalizedEmail)
      .single();

    if (vendor?.id) {
      await supabase
        .from('vendors')
        .update({
          password_reset_token: resetToken,
          password_reset_expires_at: resetExpiresAt,
        })
        .eq('id', vendor.id);
    }

    const resetUrl = `/auth/reset-password?token=${resetToken}`;

    return NextResponse.json({
      success: true,
      message: 'If this account exists, a reset link has been generated.',
      resetUrl,
    });
  } catch {
    return NextResponse.json({ error: 'Could not process reset request' }, { status: 500 });
  }
}
