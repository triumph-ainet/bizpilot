import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { generateProductSuggestions } from '@/lib/services/ai.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vendor_id, intent } = body;
    if (!vendor_id || !intent) return NextResponse.json({ error: 'vendor_id and intent required' }, { status: 400 });

    const supabase = createServerSupabase();
    const { data: catalog } = await supabase.from('products').select('*').eq('vendor_id', vendor_id);

    const suggestions = await generateProductSuggestions(intent, catalog || []);
    return NextResponse.json({ suggestions });
  } catch (e) {
    console.error('[suggestions POST]', e);
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}
