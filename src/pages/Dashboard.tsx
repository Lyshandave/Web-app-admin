import { useMemo } from "react";
import { DollarSign, ShoppingBag, Users, AlertCircle } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAdmin } from "@/context/AdminContext";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";

export default function Dashboard() {
  const { state, dispatch } = useAdmin();
  const revenue = state.orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + o.total, 0);
  const pending = state.orders.filter((o) => o.status === "Pending").length;

  const { chartData, pieData, weeklyData } = useMemo(() => {
    // Chart Data (Monthly Revenue & Orders)
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyAcc: Record<string, { sales: number; orders: number }> = {};

    // Weekly Data
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyAcc: Record<string, number> = {};
    days.forEach((d) => (weeklyAcc[d] = 0));

    // Category Data
    const categoryAcc: Record<string, number> = {};

    state.orders
      .filter((o) => o.status !== "Cancelled")
      .forEach((order) => {
        const d = new Date(order.date);
        const month = months[d.getMonth()] || "Jan";
        const day = days[d.getDay()] || "Mon";

        if (!monthlyAcc[month]) monthlyAcc[month] = { sales: 0, orders: 0 };
        monthlyAcc[month].sales += order.total;
        monthlyAcc[month].orders += 1;

        // We only want weekly data for the last 7 days roughly, but for now we'll just map by day of week
        weeklyAcc[day] += 1;

        // Category pie
        if (Array.isArray(order.items)) {
          order.items.forEach((item) => {
            const product = state.products.find((p) => p.name === item.product);
            const category = product?.category || "Others";
            if (!categoryAcc[category]) categoryAcc[category] = 0;
            categoryAcc[category] += item.price * item.quantity;
          });
        }
      });

    const chartData = Object.keys(monthlyAcc).map((name) => ({
      name,
      sales: monthlyAcc[name].sales,
      orders: monthlyAcc[name].orders,
    }));

    const colors = [
      "#007AFF",
      "#5856D6",
      "#FF9500",
      "#34C759",
      "#FF2D55",
      "#BF5AF2",
    ];
    const pieTotal = Object.values(categoryAcc).reduce((a, b) => a + b, 0);
    const pieData = Object.keys(categoryAcc)
      .map((name, i) => ({
        name,
        value:
          pieTotal > 0 ? Math.round((categoryAcc[name] / pieTotal) * 100) : 0,
        color: colors[i % colors.length],
      }))
      .sort((a, b) => b.value - a.value);

    const weeklyData = days.map((day) => ({
      day,
      orders: weeklyAcc[day],
    }));

    return { chartData, pieData, weeklyData };
  }, [state.orders, state.products]);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let currRev = 0,
      prevRev = 0;
    let currOrd = 0,
      prevOrd = 0;
    let currCust = 0,
      prevCust = 0;
    let currPend = 0,
      prevPend = 0;

    state.orders.forEach((o) => {
      const d = new Date(o.date);
      const isCurrent =
        d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      let prevM = currentMonth - 1,
        prevY = currentYear;
      if (prevM < 0) {
        prevM = 11;
        prevY--;
      }
      const isPrev = d.getMonth() === prevM && d.getFullYear() === prevY;

      if (isCurrent) {
        if (o.status !== "Cancelled") currRev += o.total;
        if (o.status === "Pending") currPend++;
        currOrd++;
      } else if (isPrev) {
        if (o.status !== "Cancelled") prevRev += o.total;
        if (o.status === "Pending") prevPend++;
        prevOrd++;
      }
    });

    state.customers.forEach((c) => {
      const d = new Date(c.joined);
      const isCurrent =
        d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      let prevM = currentMonth - 1,
        prevY = currentYear;
      if (prevM < 0) {
        prevM = 11;
        prevY--;
      }
      const isPrev = d.getMonth() === prevM && d.getFullYear() === prevY;

      if (isCurrent) currCust++;
      else if (isPrev) prevCust++;
    });

    const calcChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    const formatChange = (val: number) =>
      `${val > 0 ? "+" : ""}${val.toFixed(1)}%`;
    const getChangeType = (val: number) => (val >= 0 ? "up" : "down");

    return {
      revChange: formatChange(calcChange(currRev, prevRev)),
      revType: getChangeType(calcChange(currRev, prevRev)),
      ordChange: formatChange(calcChange(currOrd, prevOrd)),
      ordType: getChangeType(calcChange(currOrd, prevOrd)),
      custChange: formatChange(calcChange(currCust, prevCust)),
      custType: getChangeType(calcChange(currCust, prevCust)),
      pendChange: formatChange(calcChange(currPend, prevPend)),
      pendType: getChangeType(calcChange(currPend, prevPend)),
    };
  }, [state.orders, state.customers]);

  return (
    <div className={["p-6", "space-y-6"].join(" ")}>
      {/* Stats */}
      <div
        className={[
          "grid",
          "grid-cols-1",
          "sm:grid-cols-2",
          "lg:grid-cols-4",
          "gap-4",
        ].join(" ")}
      >
        <StatCard
          title="Total Revenue"
          value={`₱${revenue.toLocaleString()}`}
          change={stats.revChange}
          changeType={stats.revType as any}
          icon={DollarSign}
        />
        <StatCard
          title="Total Orders"
          value={state.orders.length.toString()}
          change={stats.ordChange}
          changeType={stats.ordType as any}
          icon={ShoppingBag}
        />
        <StatCard
          title="Customers"
          value={state.customers.length.toString()}
          change={stats.custChange}
          changeType={stats.custType as any}
          icon={Users}
        />
        <StatCard
          title="Pending Orders"
          value={pending.toString()}
          change={stats.pendChange}
          changeType={stats.pendType as any}
          icon={AlertCircle}
        />
      </div>

      {/* Charts */}
      <div
        className={["grid", "grid-cols-1", "lg:grid-cols-3", "gap-6"].join(" ")}
      >
        {/* Sales Area Chart */}
        <div
          className={[
            "lg:col-span-2",
            "bg-white",
            "rounded-2xl",
            "p-6",
            "shadow-sm",
            "border",
            "border-gray-100",
            "flex",
            "flex-col",
          ].join(" ")}
        >
          <h3
            className={["text-base", "font-bold", "text-gray-900", "mb-4"].join(
              " ",
            )}
          >
            Sales Overview
          </h3>
          <div className={["flex-1", "min-h-[260px]"].join(" ")}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#007AFF"
                  strokeWidth={2}
                  fill="url(#sg)"
                  name="Revenue (₱)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie */}
        <div
          className={[
            "bg-white",
            "rounded-2xl",
            "p-6",
            "shadow-sm",
            "border",
            "border-gray-100",
          ].join(" ")}
        >
          <h3
            className={["text-base", "font-bold", "text-gray-900", "mb-4"].join(
              " ",
            )}
          >
            Sales by Category
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div
            className={[
              "space-y-2",
              "overflow-y-auto",
              "max-h-[120px]",
              "no-scrollbar",
            ].join(" ")}
          >
            {pieData.map((d) => (
              <div
                key={d.name}
                className={["flex", "items-center", "justify-between"].join(
                  " ",
                )}
              >
                <div className={["flex", "items-center", "gap-2"].join(" ")}>
                  <span
                    className={["w-2.5", "h-2.5", "rounded-full"].join(" ")}
                    style={{ backgroundColor: d.color }}
                  />
                  <span className={["text-xs", "text-gray-600"].join(" ")}>
                    {d.name}
                  </span>
                </div>
                <span
                  className={["text-xs", "font-bold", "text-gray-900"].join(
                    " ",
                  )}
                >
                  {d.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly + Recent Orders */}
      <div
        className={["grid", "grid-cols-1", "lg:grid-cols-3", "gap-6"].join(" ")}
      >
        <div
          className={[
            "bg-white",
            "rounded-2xl",
            "p-6",
            "shadow-sm",
            "border",
            "border-gray-100",
            "flex",
            "flex-col",
          ].join(" ")}
        >
          <h3
            className={["text-base", "font-bold", "text-gray-900", "mb-4"].join(
              " ",
            )}
          >
            This Week&apos;s Orders
          </h3>
          <div className={["flex-1", "min-h-[200px]"].join(" ")}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                    fontSize: 12,
                  }}
                  cursor={{ fill: "#F9FAFB" }}
                />
                <Bar dataKey="orders" fill="#007AFF" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          className={[
            "lg:col-span-2",
            "bg-white",
            "rounded-2xl",
            "p-6",
            "shadow-sm",
            "border",
            "border-gray-100",
          ].join(" ")}
        >
          <div
            className={["flex", "items-center", "justify-between", "mb-4"].join(
              " ",
            )}
          >
            <h3
              className={["text-base", "font-bold", "text-gray-900"].join(" ")}
            >
              Recent Orders
            </h3>
            <button
              onClick={() => dispatch({ type: "SET_PAGE", page: "orders" })}
              className={[
                "text-xs",
                "text-[#007AFF]",
                "font-semibold",
                "hover:underline",
              ].join(" ")}
            >
              View All
            </button>
          </div>
          <div
            className={[
              "overflow-y-auto",
              "max-h-[220px]",
              "no-scrollbar",
            ].join(" ")}
          >
            <table className={["w-full"].join(" ")}>
              <thead
                className={["sticky", "top-0", "bg-white", "z-10"].join(" ")}
              >
                <tr className={["border-b", "border-gray-100"].join(" ")}>
                  {["Order ID", "Customer", "Amount", "Status"].map((h) => (
                    <th
                      key={h}
                      className={[
                        "text-left",
                        "text-[11px]",
                        "font-semibold",
                        "text-gray-400",
                        "uppercase",
                        "tracking-wider",
                        "pb-2.5",
                        "pr-4",
                      ].join(" ")}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.orders.slice(0, 15).map((o) => (
                  <tr
                    key={o.id}
                    className={[
                      "border-b",
                      "border-gray-50",
                      "last:border-0",
                      "hover:bg-gray-50/40",
                      "transition-colors",
                    ].join(" ")}
                  >
                    <td
                      className={[
                        "py-2.5",
                        "pr-4",
                        "text-sm",
                        "font-bold",
                        "text-gray-900",
                      ].join(" ")}
                    >
                      {o.id}
                    </td>
                    <td
                      className={[
                        "py-2.5",
                        "pr-4",
                        "text-sm",
                        "text-gray-600",
                      ].join(" ")}
                    >
                      {o.customer}
                    </td>
                    <td
                      className={[
                        "py-2.5",
                        "pr-4",
                        "text-sm",
                        "font-semibold",
                        "text-gray-900",
                      ].join(" ")}
                    >
                      ₱{o.total.toLocaleString()}
                    </td>
                    <td className={["py-2.5"].join(" ")}>
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
