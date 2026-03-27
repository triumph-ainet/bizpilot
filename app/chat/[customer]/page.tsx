import { getVendorSessionFromCookies } from '@/lib/auth';
import ChatWindow from './_components/ChatWindowClient';

export default async function Page({ params }: { params: { customer: string } }) {
  const session = await getVendorSessionFromCookies();
  if (!session?.vendorId) {
    return <div className="p-6">Unauthorized</div>;
  }

  const customer = decodeURIComponent(params.customer);

  return <ChatWindow vendorId={session.vendorId} customer={customer} />;
}
