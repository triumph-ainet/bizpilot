import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { getVendorSessionFromRequest } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const session = await getVendorSessionFromRequest(req);
    const vendorId = session?.vendorId;

    if (!vendorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // Get current vendor password hash
    const { data: vendor, error: fetchError } = await supabase
      .from('vendors')
      .select('password_hash')
      .eq('id', vendorId)
      .single();

    if (fetchError || !vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, vendor.password_hash);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    const { error: updateError } = await supabase
      .from('vendors')
      .update({ password_hash: hashedPassword })
      .eq('id', vendorId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
