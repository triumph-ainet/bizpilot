type Insight = {
  title: string;
  detail: string;
};

type Props = {
  insights: Insight[];
};

export default function AIInsights({ insights }: Props) {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm">
      <h3 className="text-sm font-semibold mb-2">AI Insights & Recommendations</h3>
      <div className="space-y-3">
        {insights.length === 0 && <div className="text-sm text-muted">No insights available</div>}
        {insights.map((ins, i) => (
          <div key={i} className="p-2 border rounded">
            <div className="font-semibold text-sm">{ins.title}</div>
            <div className="text-xs text-muted">{ins.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
