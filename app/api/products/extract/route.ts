import { NextRequest, NextResponse } from 'next/server'
import { addProduct, getVendorProducts } from '@/lib/services/inventory.service'

export async function GET(req: NextRequest) {
  const vendorId = req.nextUrl.searchParams.get('vendorId') || 'demo-vendor'
  const products = await getVendorProducts(vendorId)
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const vendorId = body.vendorId || 'demo-vendor'
    const product = await addProduct(vendorId, {
      name:                body.name,
      price:               Number(body.price),
      quantity:            Number(body.quantity),
      image_url:           body.image_url || null,
      low_stock_threshold: Number(body.low_stock_threshold) || 5,
    })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 })
  }
}