import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params;
    const body = await req.json();
    const email = body?.email;
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from('sessions')
      .update({ customer_email: email, last_accessed: new Date().toISOString() })
      .eq('token', token)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ session: data });
  } catch (e) {
    console.error('[session update]', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
