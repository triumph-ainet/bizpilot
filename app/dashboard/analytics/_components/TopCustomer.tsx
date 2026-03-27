type Props = {
  name: string;
  totalSpent: number;
};

export default function TopCustomer({ name, totalSpent }: Props) {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm">
      <h3 className="text-sm font-semibold mb-2">Top Customer</h3>
      <div className="text-lg font-bold">{name}</div>
      <div className="text-xs text-muted mt-1">Total spent: ₦ {totalSpent.toLocaleString()}</div>
    </div>
  );
}
