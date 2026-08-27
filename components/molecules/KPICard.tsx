import { Card } from "@/components/atoms/Card";

interface KPICardProps {
  label: string;
  value: string | number;
  icon: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}

export function KPICard({
  label,
  value,
  icon,
  change,
  changeType = "neutral",
}: KPICardProps) {
  const changeColorMap = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-slate-600",
  };

  return (
    <Card className="hover:shadow-md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-slate-600">{label}</p>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="text-3xl font-bold text-slate-900 mb-2">{value}</div>
        {change && (
          <p className={`text-xs font-medium ${changeColorMap[changeType]}`}>
            {change}
          </p>
        )}
      </div>
    </Card>
  );
}
