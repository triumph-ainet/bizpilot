import { NextRequest, NextResponse } from 'next/server';
import { extractProductFromImage } from '@/lib/services/ai.service';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();
    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const product = await extractProductFromImage(imageBase64, mimeType || 'image/jpeg');
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Image extraction failed' }, { status: 500 });
  }
}
