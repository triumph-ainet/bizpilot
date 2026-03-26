import { Hand } from 'lucide-react';

type Props = {
  vendorName: string;
  initials: string;
  todayRevenue: number;
  revenueChange: number;
};

export default function DashboardHeader({
  vendorName,
  initials,
  todayRevenue,
  revenueChange,
}: Props) {
  return (
    <div className="bg-green px-6 pt-14 pb-20 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-cream rounded-t-[50%]" />
      <div className="flex justify-between items-start mb-5">
        <div>
          <p className="text-white/60 text-[13px]">Good morning,</p>
          <h1 className="font-fraunces text-[22px] font-bold text-white inline-flex items-center gap-1.5">
            {vendorName} <Hand className="w-5 h-5 text-amber" />
          </h1>
        </div>
        <div className="w-10 h-10 bg-amber rounded-full flex items-center justify-center font-fraunces font-black text-lg text-green">
          {initials}
        </div>
      </div>
      <p className="text-white/50 text-xs mb-1.5">Today's Revenue</p>
      <div className="font-fraunces text-[40px] font-black text-white tracking-tight leading-none">
        <span className="text-xl font-semibold opacity-70">₦ </span>
        {todayRevenue.toLocaleString()}
      </div>
      <div className="inline-flex items-center gap-1.5 bg-green-bright/20 text-green-bright text-xs font-semibold px-3 py-1 rounded-full mt-3">
        ↑ {revenueChange}% from yesterday
      </div>
    </div>
  );
}
