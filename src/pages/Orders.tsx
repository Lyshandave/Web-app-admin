import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  MoreVertical,
  Trash2,
  PackageCheck,
  Truck,
  XCircle,
  X,
} from "lucide-react";
import type { Order } from "@/types";
import { useAdmin } from "@/context/AdminContext";
import StatusBadge from "@/components/StatusBadge";

const FILTERS = [
  "All",
  "Pending",
  "Processing",
  "Delivered",
  "Cancelled",
] as const;

interface OpenMenu {
  orderId: string;
  top?: number;
  bottom?: number;
  right: number;
}

export default function Orders() {
  const { state, dispatch, refreshData } = useAdmin();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<OpenMenu | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // We will listen to state.viewOrderId from AdminContext instead
  useEffect(() => {
    if (state.viewOrderId && state.orders.length > 0) {
      const order = state.orders.find(
        (o) =>
          o.id === state.viewOrderId || o.id === `ORD-${state.viewOrderId}`,
      );
      if (order && order.id !== viewingOrder?.id) {
        setViewingOrder(order);
      }
    }
  }, [state.viewOrderId, state.orders]);

  const closeView = () => {
    setViewingOrder(null);
    if (state.viewOrderId) {
      dispatch({ type: "SET_VIEW_ORDER_ID", orderId: null });
    }
  };

  const filtered = useMemo(() => {
    let data = [...state.orders];
    if (filter !== "All") data = data.filter((o) => o.status === filter);
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(
        (o) =>
          o.customer.toLowerCase().includes(s) ||
          o.id.toLowerCase().includes(s),
      );
    }
    return data;
  }, [state.orders, filter, search]);

  const handleMenuClick = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (openMenu?.orderId === orderId) {
      setOpenMenu(null);
    } else {
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 200) {
        // Open upwards if near the bottom
        setOpenMenu({
          orderId,
          bottom: window.innerHeight - rect.bottom + 16,
          right: window.innerWidth - rect.right,
        });
      } else {
        // Open downwards normally
        setOpenMenu({
          orderId,
          top: rect.top + 16,
          right: window.innerWidth - rect.right,
        });
      }
    }
  };

  const handleAction = async (action: string, orderId: string) => {
    try {
      if (action === "view") {
        const order = state.orders.find((o) => o.id === orderId);
        if (order) setViewingOrder(order);
        setOpenMenu(null);
        return;
      }
      const token = sessionStorage.getItem("adminToken");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      if (action === "process") {
        dispatch({
          type: "UPDATE_ORDER_STATUS",
          orderId,
          status: "Processing",
        });
        await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders/${orderId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ status: "Processing" }),
        });
      }
      if (action === "deliver") {
        dispatch({ type: "UPDATE_ORDER_STATUS", orderId, status: "Delivered" });
        await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders/${orderId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ status: "Delivered" }),
        });
      }
      if (action === "cancel") {
        dispatch({ type: "UPDATE_ORDER_STATUS", orderId, status: "Cancelled" });
        await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders/${orderId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ status: "Cancelled" }),
        });
      }
      if (action === "delete") {
        dispatch({ type: "DELETE_ORDER", orderId });
        await fetch(`${import.meta.env.VITE_API_URL || ''}/api/orders/${orderId}`, {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
      }
      await refreshData();
    } catch (err) {
      console.error("Failed to update order", err);
    }
    setOpenMenu(null);
  };

  const getMenuItems = (status: string) => {
    const items: {
      label: string;
      action: string;
      icon: React.ElementType;
      color: string;
    }[] = [];
    if (status === "Pending")
      items.push({
        label: "Process",
        action: "process",
        icon: PackageCheck,
        color: "text-blue-600",
      });
    if (status === "Processing")
      items.push({
        label: "Deliver",
        action: "deliver",
        icon: Truck,
        color: "text-green-600",
      });
    if (status !== "Cancelled") {
      items.push({
        label: "Cancel",
        action: "cancel",
        icon: XCircle,
        color: "text-amber-500",
      });
    }
    items.push({
      label: "Delete",
      action: "delete",
      icon: Trash2,
      color: "text-red-500",
    });
    return items;
  };

  return (
    <div
      className={["p-6", "space-y-5"].join(" ")}
      onClick={() => openMenu && setOpenMenu(null)}
    >
      {/* Toolbar */}
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
            placeholder="Search orders..."
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
          className={["flex", "items-center", "gap-2", "flex-wrap"].join(" ")}
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`h-9 px-4 rounded-lg text-sm font-medium transition-all ${filter === f ? "bg-[#007AFF] text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
            >
              {f}
            </button>
          ))}
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
                  "Order ID",
                  "Customer",
                  "Items",
                  "Total",
                  "Status",
                  "Date",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className={`text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider py-3 px-5 ${h === "Actions" ? "w-16" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className={[
                    "border-b",
                    "border-gray-50",
                    "last:border-0",
                    "hover:bg-gray-50/40",
                    "transition-colors",
                    "cursor-pointer",
                  ].join(" ")}
                  onClick={() => setViewingOrder(order)}
                >
                  <td
                    className={[
                      "py-3.5",
                      "px-5",
                      "text-sm",
                      "font-bold",
                      "text-gray-900",
                    ].join(" ")}
                  >
                    {order.id}
                  </td>
                  <td className={["py-3.5", "px-5"].join(" ")}>
                    <p
                      className={[
                        "text-sm",
                        "font-semibold",
                        "text-gray-900",
                      ].join(" ")}
                    >
                      {order.customer}
                    </p>
                  </td>
                  <td
                    className={[
                      "py-3.5",
                      "px-5",
                      "text-sm",
                      "text-gray-600",
                      "max-w-[150px]",
                      "truncate",
                    ].join(" ")}
                  >
                    {Array.isArray(order.items)
                      ? order.items
                          .map((i) => `${i.quantity}x ${i.product}`)
                          .join(", ")
                      : order.items}
                  </td>
                  <td
                    className={[
                      "py-3.5",
                      "px-5",
                      "text-sm",
                      "font-bold",
                      "text-gray-900",
                    ].join(" ")}
                  >
                    ₱{order.total.toLocaleString()}
                  </td>
                  <td className={["py-3.5", "px-5"].join(" ")}>
                    <StatusBadge status={order.status} />
                  </td>
                  <td
                    className={[
                      "py-3.5",
                      "px-5",
                      "text-sm",
                      "text-gray-500",
                    ].join(" ")}
                  >
                    {order.date}
                  </td>
                  <td className={["py-3.5", "px-5", "text-right"].join(" ")}>
                    <button
                      onClick={(e) => handleMenuClick(e, order.id)}
                      className={[
                        "w-8",
                        "h-8",
                        "rounded-lg",
                        "hover:bg-gray-100",
                        "flex",
                        "items-center",
                        "justify-center",
                        "transition-colors",
                        "ml-auto",
                      ].join(" ")}
                    >
                      <MoreVertical
                        size={16}
                        className={["text-gray-400"].join(" ")}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dropdown Menu — opens to the LEFT */}
      {openMenu && (
        <>
          <div
            className={["fixed", "inset-0", "z-40"].join(" ")}
            onClick={() => setOpenMenu(null)}
          />
          <div
            className={[
              "fixed",
              "z-50",
              "bg-white",
              "rounded-xl",
              "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]",
              "border",
              "border-gray-100",
              "overflow-hidden",
              "min-w-[110px]",
            ].join(" ")}
            style={{
              ...(openMenu.top ? { top: openMenu.top } : {}),
              ...(openMenu.bottom ? { bottom: openMenu.bottom } : {}),
              right: openMenu.right,
            }}
          >
            {getMenuItems(
              state.orders.find((o) => o.id === openMenu.orderId)?.status || "",
            ).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.action}
                  onClick={() => handleAction(item.action, openMenu.orderId)}
                  className={[
                    "w-full",
                    "flex",
                    "items-center",
                    "gap-2.5",
                    "px-3",
                    "py-2",
                    "text-[13px]",
                    "text-gray-700",
                    "hover:bg-gray-50",
                    "transition-colors",
                    "text-left",
                    "font-medium",
                  ].join(" ")}
                >
                  <Icon size={14} className={item.color} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* View Order Modal */}
      {viewingOrder &&
        createPortal(
          <div
            className={[
              "fixed",
              "inset-0",
              "z-50",
              "flex",
              "items-center",
              "justify-center",
              "p-4",
            ].join(" ")}
          >
            <div
              className={[
                "absolute",
                "inset-0",
                "bg-black/40",
                "backdrop-blur-sm",
              ].join(" ")}
              onClick={closeView}
            />
            <div
              className={[
                "relative",
                "bg-white",
                "rounded-2xl",
                "shadow-xl",
                "w-full",
                "max-w-md",
                "p-6",
                "max-h-[90vh]",
                "overflow-y-auto",
                "no-scrollbar",
              ].join(" ")}
            >
              <div
                className={[
                  "flex",
                  "items-center",
                  "justify-between",
                  "mb-5",
                ].join(" ")}
              >
                <h3
                  className={["text-lg", "font-bold", "text-gray-900"].join(
                    " ",
                  )}
                >
                  Order Details
                </h3>
                <button
                  onClick={closeView}
                  className={[
                    "p-2",
                    "text-gray-400",
                    "hover:text-gray-600",
                    "hover:bg-gray-100",
                    "rounded-lg",
                    "transition-colors",
                  ].join(" ")}
                >
                  <X size={16} />
                </button>
              </div>

              <div className={["space-y-4"].join(" ")}>
                <div
                  className={[
                    "flex",
                    "justify-between",
                    "items-center",
                    "pb-3",
                    "border-b",
                    "border-gray-100",
                  ].join(" ")}
                >
                  <div>
                    <p
                      className={[
                        "text-xs",
                        "font-semibold",
                        "text-gray-500",
                        "uppercase",
                        "tracking-wider",
                        "mb-1",
                      ].join(" ")}
                    >
                      Order ID
                    </p>
                    <p
                      className={["text-sm", "font-bold", "text-gray-900"].join(
                        " ",
                      )}
                    >
                      {viewingOrder.id}
                    </p>
                  </div>
                  <div className={["text-right"].join(" ")}>
                    <p
                      className={[
                        "text-xs",
                        "font-semibold",
                        "text-gray-500",
                        "uppercase",
                        "tracking-wider",
                        "mb-1",
                      ].join(" ")}
                    >
                      Date
                    </p>
                    <p className={["text-sm", "text-gray-600"].join(" ")}>
                      {viewingOrder.date}
                    </p>
                  </div>
                </div>

                <div>
                  <p
                    className={[
                      "text-xs",
                      "font-semibold",
                      "text-gray-500",
                      "uppercase",
                      "tracking-wider",
                      "mb-1",
                    ].join(" ")}
                  >
                    Customer Info
                  </p>
                  <p
                    className={["text-sm", "font-bold", "text-gray-900"].join(
                      " ",
                    )}
                  >
                    {viewingOrder.customer}
                  </p>
                  <p className={["text-sm", "text-gray-600"].join(" ")}>
                    {viewingOrder.phone || "No phone number"}
                  </p>
                </div>

                <div>
                  <p
                    className={[
                      "text-xs",
                      "font-semibold",
                      "text-gray-500",
                      "uppercase",
                      "tracking-wider",
                      "mb-1",
                    ].join(" ")}
                  >
                    Delivery Address
                  </p>
                  <p className={["text-sm", "text-gray-600"].join(" ")}>
                    {viewingOrder.address || "No address provided"}
                  </p>
                </div>

                <div>
                  <p
                    className={[
                      "text-xs",
                      "font-semibold",
                      "text-gray-500",
                      "uppercase",
                      "tracking-wider",
                      "mb-1",
                    ].join(" ")}
                  >
                    Payment Method
                  </p>
                  <p
                    className={[
                      "text-sm",
                      "font-semibold",
                      "text-gray-900",
                    ].join(" ")}
                  >
                    {viewingOrder.paymentMethod || "Not specified"}
                  </p>
                </div>

                <div className={["pt-2"].join(" ")}>
                  <p
                    className={[
                      "text-xs",
                      "font-semibold",
                      "text-gray-500",
                      "uppercase",
                      "tracking-wider",
                      "mb-2",
                    ].join(" ")}
                  >
                    Order Items
                  </p>
                  <div
                    className={[
                      "space-y-2",
                      "bg-gray-50",
                      "rounded-xl",
                      "p-4",
                      "border",
                      "border-gray-100",
                    ].join(" ")}
                  >
                    {Array.isArray(viewingOrder.items) ? (
                      viewingOrder.items.map((i, idx) => (
                        <div
                          key={idx}
                          className={[
                            "flex",
                            "justify-between",
                            "items-center",
                            "text-sm",
                          ].join(" ")}
                        >
                          <span
                            className={["text-gray-700", "font-medium"].join(
                              " ",
                            )}
                          >
                            <span
                              className={["text-gray-400", "mr-2"].join(" ")}
                            >
                              {i.quantity}x
                            </span>
                            {i.product}
                          </span>
                          <span
                            className={["font-bold", "text-gray-900"].join(" ")}
                          >
                            ₱{(i.quantity * i.price).toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className={["text-sm", "text-gray-600"].join(" ")}>
                        {viewingOrder.items}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={[
                    "pt-4",
                    "flex",
                    "justify-between",
                    "items-center",
                  ].join(" ")}
                >
                  <p className={["font-bold", "text-gray-900"].join(" ")}>
                    Total Amount
                  </p>
                  <p
                    className={["text-xl", "font-black", "text-[#007AFF]"].join(
                      " ",
                    )}
                  >
                    ₱{viewingOrder.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
