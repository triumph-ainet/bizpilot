import { SignJWT, jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';

type VendorJwtPayload = {
  vendorId: string;
  phone?: string;
};

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

export async function signVendorToken(payload: VendorJwtPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyVendorToken(token?: string) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      vendorId: payload.vendorId as string,
      phone: payload.phone as string | undefined,
    };
  } catch {
    return null;
  }
}

export async function getVendorSessionFromCookies() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get('bizpilot_token')?.value;
  return verifyVendorToken(token);
}

export async function getVendorSessionFromRequest(req: NextRequest) {
  const token = req.cookies.get('bizpilot_token')?.value;
  return verifyVendorToken(token);
}
