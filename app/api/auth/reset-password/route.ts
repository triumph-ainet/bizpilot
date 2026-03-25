import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    const resetToken = String(token || '').trim();
    const nextPassword = String(password || '').trim();

    if (!resetToken || !nextPassword) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    if (nextPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    const { data: vendor } = await supabase
      .from('vendors')
      .select('id, password_reset_expires_at')
      .eq('password_reset_token', resetToken)
      .single();

    if (!vendor?.id) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    const expiresAt = vendor.password_reset_expires_at
      ? new Date(vendor.password_reset_expires_at).getTime()
      : 0;

    if (!expiresAt || Date.now() > expiresAt) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    const passwordHash = crypto.createHash('sha256').update(nextPassword).digest('hex');

    const { error } = await supabase
      .from('vendors')
      .update({
        password_hash: passwordHash,
        password_reset_token: null,
        password_reset_expires_at: null,
      })
      .eq('id', vendor.id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true, redirectTo: '/auth/login' });
  } catch {
    return NextResponse.json({ error: 'Could not reset password' }, { status: 500 });
  }
}
