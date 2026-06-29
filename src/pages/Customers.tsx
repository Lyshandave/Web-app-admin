import { useState } from "react";
import { Search, Users } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import StatusBadge from "@/components/StatusBadge";

export default function Customers() {
  const { state } = useAdmin();
  const [search, setSearch] = useState("");

  const filtered = state.customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search),
  );

  return (
    <div className={["p-6", "space-y-5"].join(" ")}>
      {/* Header */}
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
            placeholder="Search customers..."
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
        <div className={["flex", "items-center", "gap-3"].join(" ")}>
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
            <Users size={16} className={["text-[#007AFF]"].join(" ")} />
            <div>
              <span className={["text-xs", "text-gray-400"].join(" ")}>
                Total
              </span>
              <p
                className={[
                  "text-lg",
                  "font-bold",
                  "text-gray-900",
                  "leading-none",
                ].join(" ")}
              >
                {state.customers.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
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
                  "Contact",
                  "Orders",
                  "Total Spent",
                  "Joined",
                  "Status",
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
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className={[
                    "border-b",
                    "border-gray-50",
                    "last:border-0",
                    "hover:bg-gray-50/40",
                    "transition-colors",
                  ].join(" ")}
                >
                  <td className={["py-3.5", "px-5"].join(" ")}>
                    <div
                      className={["flex", "items-center", "gap-3"].join(" ")}
                    >
                      <div
                        className={[
                          "w-9",
                          "h-9",
                          "rounded-full",
                          "bg-[#007AFF]/10",
                          "flex",
                          "items-center",
                          "justify-center",
                          "text-[#007AFF]",
                          "font-bold",
                          "text-sm",
                          "flex-shrink-0",
                        ].join(" ")}
                      >
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p
                          className={[
                            "text-sm",
                            "font-semibold",
                            "text-gray-900",
                          ].join(" ")}
                        >
                          {c.name}
                        </p>
                        <p className={["text-xs", "text-gray-400"].join(" ")}>
                          {c.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={["py-3.5", "px-5"].join(" ")}>
                    <p className={["text-sm", "text-gray-600"].join(" ")}>
                      {c.phone}
                    </p>
                    <p className={["text-xs", "text-gray-400"].join(" ")}>
                      {c.email}
                    </p>
                  </td>
                  <td
                    className={[
                      "py-3.5",
                      "px-5",
                      "text-sm",
                      "font-semibold",
                      "text-gray-900",
                    ].join(" ")}
                  >
                    {c.orders}
                  </td>
                  <td
                    className={[
                      "py-3.5",
                      "px-5",
                      "text-sm",
                      "font-semibold",
                      "text-gray-900",
                    ].join(" ")}
                  >
                    ₱{c.totalSpent.toLocaleString()}
                  </td>
                  <td
                    className={[
                      "py-3.5",
                      "px-5",
                      "text-sm",
                      "text-gray-500",
                    ].join(" ")}
                  >
                    {c.joined}
                  </td>
                  <td className={["py-3.5", "px-5"].join(" ")}>
                    <StatusBadge status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
