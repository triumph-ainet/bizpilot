type Props = {
  inventoryValue: number;
  cash: number;
};

export default function Financials({ inventoryValue, cash }: Props) {
  const assets = inventoryValue + cash;
  const liabilities = 0;
  const equity = assets - liabilities;

  return (
    <div className="bg-white p-4 rounded-md shadow-sm">
      <h3 className="text-sm font-semibold mb-2">Balance Sheet (summary)</h3>
      <div className="flex justify-between text-sm py-1"> <span>Inventory</span> <span>₦ {inventoryValue.toLocaleString()}</span></div>
      <div className="flex justify-between text-sm py-1"> <span>Cash</span> <span>₦ {cash.toLocaleString()}</span></div>
      <div className="border-t my-2" />
      <div className="flex justify-between font-bold"> <span>Assets</span> <span>₦ {assets.toLocaleString()}</span></div>
      <div className="flex justify-between font-bold"> <span>Equity</span> <span>₦ {equity.toLocaleString()}</span></div>
    </div>
  );
}
