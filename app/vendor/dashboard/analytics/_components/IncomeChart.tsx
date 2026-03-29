type Props = {
  series: { date: string; total: number }[];
  width?: number;
  height?: number;
};

function normalize(series: number[], height: number) {
  const max = Math.max(...series, 1);
  return series.map((v) => (v / max) * height);
}

export default function IncomeChart({ series, width = 600, height = 100 }: Props) {
  const points = series.map((s) => s.total);
  const normalized = normalize(points, height - 10);
  const step = series.length > 1 ? width / (series.length - 1) : width;

  const path = normalized
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${height - v}`)
    .join(' ');

  return (
    <div className="bg-white p-4 rounded-md shadow-sm">
      <h3 className="text-sm font-semibold mb-2">Income (Last {series.length} days)</h3>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <path d={path} fill="none" stroke="#16a34a" strokeWidth={2} strokeLinecap="round" />
        {normalized.map((v, i) => (
          <circle key={i} cx={i * step} cy={height - v} r={1.5} fill="#16a34a" />
        ))}
      </svg>
    </div>
  );
}
