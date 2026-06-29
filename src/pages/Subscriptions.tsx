import { useMemo, useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function Subscriptions() {
  const { state } = useAdmin();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return state.subscriptions.filter(
      (sub) =>
        sub.customer.toLowerCase().includes(q) ||
        sub.email.toLowerCase().includes(q) ||
        sub.planName.toLowerCase().includes(q),
    );
  }, [state.subscriptions, search]);

  return (
    <div className={["p-6", "space-y-5"].join(" ")}>
      <div
        className={[
          "flex",
          "flex-col",
          "sm:flex-row",
          "sm:items-center",
          "justify-between",
          "gap-4",
        ].join(" ")}
      >
        <div
          className={[
            "flex",
            "items-center",
            "gap-2",
            "bg-gray-50",
            "rounded-xl",
            "px-4",
            "h-10",
            "flex-1",
            "max-w-sm",
            "border",
            "border-gray-200",
          ].join(" ")}
        >
          <Search size={16} className={["text-gray-400"].join(" ")} />
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={[
              "bg-transparent",
              "outline-none",
              "text-sm",
              "flex-1",
            ].join(" ")}
          />
        </div>
        <div
          className={[
            "bg-white",
            "rounded-xl",
            "px-4",
            "py-2",
            "border",
            "border-gray-200",
            "flex",
            "items-center",
            "gap-2",
          ].join(" ")}
        >
          <RefreshCw size={16} className={["text-[#007AFF]"].join(" ")} />
          <div>
            <span className={["text-xs", "text-gray-400"].join(" ")}>
              Active Plans
            </span>
            <p
              className={[
                "text-lg",
                "font-bold",
                "text-gray-900",
                "leading-none",
              ].join(" ")}
            >
              {state.subscriptions.length}
            </p>
          </div>
        </div>
      </div>

      <div
        className={[
          "bg-white",
          "rounded-2xl",
          "shadow-sm",
          "border",
          "border-gray-100",
          "overflow-hidden",
        ].join(" ")}
      >
        <div className={["overflow-x-auto"].join(" ")}>
          <table className={["w-full"].join(" ")}>
            <thead>
              <tr
                className={[
                  "border-b",
                  "border-gray-100",
                  "bg-gray-50/50",
                ].join(" ")}
              >
                {[
                  "Customer",
                  "Plan",
                  "Schedule",
                  "Price",
                  "Start Date",
                  "Expiration",
                ].map((h) => (
                  <th
                    key={h}
                    className={[
                      "text-left",
                      "text-[11px]",
                      "font-semibold",
                      "text-gray-400",
                      "uppercase",
                      "tracking-wider",
                      "py-3",
                      "px-5",
                    ].join(" ")}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <tr
                  key={sub.id}
                  className={[
                    "border-b",
                    "border-gray-50",
                    "last:border-0",
                    "hover:bg-gray-50/40",
                    "transition-colors",
                  ].join(" ")}
                >
                  <td className={["py-3.5", "px-5"].join(" ")}>
                    <p
                      className={[
                        "text-sm",
                        "font-semibold",
                        "text-gray-900",
                      ].join(" ")}
                    >
                      {sub.customer}
                    </p>
                    <p className={["text-xs", "text-gray-400"].join(" ")}>
                      {sub.email}
                    </p>
                  </td>
                  <td className={["py-3.5", "px-5"].join(" ")}>
                    <p
                      className={["text-sm", "font-bold", "text-gray-900"].join(
                        " ",
                      )}
                    >
                      {sub.planName}
                    </p>
                    <p className={["text-xs", "text-gray-400"].join(" ")}>
                      {sub.duration}
                    </p>
                  </td>
                  <td
                    className={[
                      "py-3.5",
                      "px-5",
                      "text-sm",
                      "text-gray-600",
                    ].join(" ")}
                  >
                    {sub.frequency} / {sub.deliveryDay}s @ {sub.deliveryTime}
                  </td>
                  <td
                    className={[
                      "py-3.5",
                      "px-5",
                      "text-sm",
                      "font-bold",
                      "text-[#007AFF]",
                    ].join(" ")}
                  >
                    ₱{sub.price.toLocaleString()}
                  </td>
                  <td
                    className={[
                      "py-3.5",
                      "px-5",
                      "text-sm",
                      "text-gray-500",
                    ].join(" ")}
                  >
                    {sub.startDate}
                  </td>
                  <td
                    className={[
                      "py-3.5",
                      "px-5",
                      "text-sm",
                      "text-gray-500",
                    ].join(" ")}
                  >
                    {sub.endDate}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className={[
                      "py-10",
                      "text-center",
                      "text-sm",
                      "text-gray-400",
                    ].join(" ")}
                  >
                    No active subscription plans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
