import { NextRequest, NextResponse } from 'next/server';
import { verifyVendorToken } from '@/lib/auth';

const AUTH_PAGES = new Set(['/auth/login', '/auth/register']);

function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith('/vendor') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/auth/onboarding') ||
    pathname.startsWith('/api/vendors') ||
    pathname.startsWith('/api/products') ||
    pathname.startsWith('/api/orders')
  );
}

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const token = req.cookies.get('bizpilot_token')?.value;
  const session = await verifyVendorToken(token);

  if (isProtectedPath(pathname) && !session?.vendorId) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (AUTH_PAGES.has(pathname) && session?.vendorId) {
    return NextResponse.redirect(new URL('/vendor/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/vendor/:path*',
    '/chat/:path*',
    '/auth/:path*',
    '/api/vendors/:path*',
    '/api/products/:path*',
    '/api/orders/:path*',
  ],
};
