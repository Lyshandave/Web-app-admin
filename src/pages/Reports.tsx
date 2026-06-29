import { useMemo } from "react";
import { DollarSign, ShoppingBag, UserCheck, Star } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import StatCard from "@/components/StatCard";
import { Store } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function Reports() {
  const { state } = useAdmin();

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

        weeklyAcc[day] += 1;

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
    let currRet = 0,
      prevRet = 0;
    let currRep = 0,
      prevRep = 0;

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
        if (o.status === "Cancelled" || (o.status as string) === "Returned")
          currRet++;
        currOrd++;
      } else if (isPrev) {
        if (o.status !== "Cancelled") prevRev += o.total;
        if (o.status === "Cancelled" || (o.status as string) === "Returned")
          prevRet++;
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

      if (isCurrent && c.orders > 1) currRep++;
      else if (isPrev && c.orders > 1) prevRep++;
    });

    const currAOV = currOrd > 0 ? currRev / currOrd : 0;
    const prevAOV = prevOrd > 0 ? prevRev / prevOrd : 0;
    const currRetRate = currOrd > 0 ? (currRet / currOrd) * 100 : 0;
    const prevRetRate = prevOrd > 0 ? (prevRet / prevOrd) * 100 : 0;

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
      aovChange: formatChange(calcChange(currAOV, prevAOV)),
      aovType: getChangeType(calcChange(currAOV, prevAOV)),
      repChange: formatChange(calcChange(currRep, prevRep)),
      repType: getChangeType(calcChange(currRep, prevRep)),
      retChange: formatChange(calcChange(currRetRate, prevRetRate)),
      retType: getChangeType(calcChange(currRetRate, prevRetRate)),
    };
  }, [state.orders, state.customers]);

  const totalRevenue = state.orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((a, o) => a + o.total, 0);
  const avgOrderValue =
    state.orders.length > 0 ? totalRevenue / state.orders.length : 0;
  const repeatCustomers =
    state.customers.length > 0
      ? Math.round(
          (state.customers.filter((c) => c.orders > 1).length /
            state.customers.length) *
            100,
        )
      : 0;

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
          title="Monthly Revenue"
          value={`₱${totalRevenue.toLocaleString()}`}
          change={stats.revChange}
          changeType={stats.revType as any}
          icon={DollarSign}
        />
        <StatCard
          title="Avg. Order Value"
          value={`₱${Math.round(avgOrderValue).toLocaleString()}`}
          change={stats.aovChange}
          changeType={stats.aovType as any}
          icon={ShoppingBag}
        />
        <StatCard
          title="Repeat Customers"
          value={`${repeatCustomers}%`}
          change={stats.repChange}
          changeType={stats.repType as any}
          icon={UserCheck}
        />
        <StatCard
          title="Return Rate"
          value="2.1%"
          change={stats.retChange}
          changeType={stats.retType as any}
          icon={Star}
        />
      </div>

      <div
        className={["grid", "grid-cols-1", "lg:grid-cols-2", "gap-6"].join(" ")}
      >
        {/* Revenue Trend */}
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
            Monthly Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34C759" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#34C759" stopOpacity={0} />
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
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                name="Revenue (₱)"
                stroke="#34C759"
                strokeWidth={2}
                fill="url(#rg)"
              />
              <Area
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#007AFF"
                strokeWidth={2}
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Volume */}
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
            Weekly Order Volume
          </h3>
          <ResponsiveContainer width="100%" height={280}>
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
                  borderRadius: 10,
                  border: "1px solid #E5E7EB",
                  fontSize: 12,
                }}
                cursor={{ fill: "#F9FAFB" }}
              />
              <Bar
                dataKey="orders"
                name="Orders"
                fill="#5856D6"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Performance */}
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
          className={["text-base", "font-bold", "text-gray-900", "mb-5"].join(
            " ",
          )}
        >
          Category Performance
        </h3>
        <div
          className={[
            "grid",
            "grid-cols-1",
            "sm:grid-cols-2",
            "lg:grid-cols-4",
            "gap-4",
          ].join(" ")}
        >
          {pieData.map((cat) => (
            <div
              key={cat.name}
              className={[
                "p-4",
                "rounded-xl",
                "border",
                "border-gray-100",
                "hover:shadow-md",
                "transition-shadow",
              ].join(" ")}
            >
              <div
                className={["flex", "items-center", "gap-3", "mb-3"].join(" ")}
              >
                <div
                  className={[
                    "w-10",
                    "h-10",
                    "rounded-xl",
                    "flex",
                    "items-center",
                    "justify-center",
                  ].join(" ")}
                  style={{ backgroundColor: `${cat.color}12` }}
                >
                  <Store size={18} style={{ color: cat.color }} />
                </div>
                <div>
                  <p
                    className={["text-sm", "font-bold", "text-gray-900"].join(
                      " ",
                    )}
                  >
                    {cat.name}
                  </p>
                  <p className={["text-xs", "text-gray-400"].join(" ")}>
                    {cat.value}% of sales
                  </p>
                </div>
              </div>
              <div
                className={[
                  "h-2",
                  "bg-gray-100",
                  "rounded-full",
                  "overflow-hidden",
                ].join(" ")}
              >
                <div
                  className={["h-full", "rounded-full"].join(" ")}
                  style={{ width: `${cat.value}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
