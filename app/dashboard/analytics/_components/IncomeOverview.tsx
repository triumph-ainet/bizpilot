type Props = {
  total: number;
  periodLabel: string;
};

export default function IncomeOverview({ total, periodLabel }: Props) {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm">
      <h3 className="text-sm font-semibold mb-2">Income ({periodLabel})</h3>
      <div className="text-2xl font-bold">₦ {total.toLocaleString()}</div>
    </div>
  );
}
