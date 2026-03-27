import ChatSessionClient from "../../_components/ChatSessionClient";

export default function Page({ params }: { params: { vendor: string; customer: string } }) {
  const vendor = params.vendor;
  const customer = decodeURIComponent(params.customer);

  return <ChatSessionClient vendor={vendor} customer={customer} />;
}
