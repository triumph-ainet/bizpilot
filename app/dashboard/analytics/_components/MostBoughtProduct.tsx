type Props = {
  name: string;
  quantity: number;
};

export default function MostBoughtProduct({ name, quantity }: Props) {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm">
      <h3 className="text-sm font-semibold mb-2">Most Bought Product</h3>
      <div className="text-lg font-bold">{name}</div>
      <div className="text-xs text-muted mt-1">Total sold: {quantity}</div>
    </div>
  );
}
