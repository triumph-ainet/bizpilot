import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import crypto from 'crypto';
import { buildPasswordResetHtml, sendInvoiceEmail } from '@/lib/services/email.service';

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
      .select('id, business_name, email')
      .eq('email', normalizedEmail)
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

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
    const resetPath = `/auth/reset-password?token=${resetToken}`;
    const resetUrl = appUrl ? `${appUrl}${resetPath}` : resetPath;

    if (vendor?.id && vendor.email) {
      const html = buildPasswordResetHtml({
        resetUrl,
        ttlMinutes: RESET_TOKEN_TTL_MINUTES,
      });
      await sendInvoiceEmail(vendor.email, 'Reset your BizPilot password', html).catch((err) => {
        console.warn('[forgot-password] failed to send reset email', err);
      });
    }

    return NextResponse.json({
      success: true,
      message: 'If this account exists, a reset link has been generated.',
      resetUrl,
    });
  } catch {
    return NextResponse.json({ error: 'Could not process reset request' }, { status: 500 });
  }
}
