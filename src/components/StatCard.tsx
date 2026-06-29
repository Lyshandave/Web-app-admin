import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down";
  icon: LucideIcon;
}

export default function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
}: Props) {
  return (
    <div
      className={[
        "bg-white",
        "rounded-2xl",
        "p-5",
        "shadow-sm",
        "border",
        "border-gray-100",
        "hover:shadow-md",
        "transition-shadow",
      ].join(" ")}
    >
      <div
        className={["flex", "items-start", "justify-between", "mb-3"].join(" ")}
      >
        <div
          className={[
            "w-10",
            "h-10",
            "rounded-xl",
            "bg-[#007AFF]/10",
            "flex",
            "items-center",
            "justify-center",
          ].join(" ")}
        >
          <Icon size={18} className={["text-[#007AFF]"].join(" ")} />
        </div>
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${changeType === "up" ? "text-green-600 bg-green-50" : "text-red-500 bg-red-50"}`}
        >
          {changeType === "up" ? (
            <TrendingUp size={12} />
          ) : (
            <TrendingDown size={12} />
          )}
          {change}
        </span>
      </div>
      <p className={["text-2xl", "font-bold", "text-gray-900"].join(" ")}>
        {value}
      </p>
      <p className={["text-xs", "text-gray-400", "mt-0.5"].join(" ")}>
        {title}
      </p>
    </div>
  );
}
