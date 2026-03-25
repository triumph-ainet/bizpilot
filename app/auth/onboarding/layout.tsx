import { redirect } from 'next/navigation';
import { getVendorSessionFromCookies } from '@/lib/auth';

export default async function OnboardingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getVendorSessionFromCookies();

  if (!session?.vendorId) {
    redirect('/auth/login');
  }

  return <>{children}</>;
}
