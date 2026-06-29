import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  LogOut,
  User,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Settings,
  RefreshCw,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { PAGE_TITLES } from "@/data/mockData";
import type { PageKey } from "@/types";

const NAV_ITEMS: { key: PageKey; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", icon: LayoutDashboard },
  { key: "orders", icon: ShoppingBag },
  { key: "products", icon: Package },
  { key: "customers", icon: Users },
  { key: "subscriptions", icon: RefreshCw },
  { key: "reports", icon: BarChart3 },
];

export default function Sidebar() {
  const { state, dispatch } = useAdmin();
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pendingCount = state.orders.filter(
    (o) => o.status === "Pending",
  ).length;

  return (
    <aside
      className={`
        ${collapsed ? "w-16" : "w-56"}
        bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0
        flex-shrink-0 transition-all duration-300 z-40
      `}
    >
      {/* Logo */}
      <div
        className={[
          "h-16",
          "flex",
          "items-center",
          "gap-3",
          "px-4",
          "border-b",
          "border-gray-100",
          "flex-shrink-0",
        ].join(" ")}
      >
        <div
          className={[
            "w-9",
            "h-9",
            "rounded-xl",
            "bg-gradient-to-br",
            "from-[#007AFF]",
            "to-[#0055CC]",
            "flex",
            "items-center",
            "justify-center",
            "flex-shrink-0",
          ].join(" ")}
        >
          <Droplets size={18} className={["text-white"].join(" ")} />
        </div>
        {!collapsed && (
          <span
            className={[
              "font-bold",
              "text-lg",
              "text-gray-900",
              "truncate",
            ].join(" ")}
          >
            Pure Safe
          </span>
        )}
      </div>

      {/* Nav */}
      <nav
        className={[
          "flex-1",
          "py-4",
          "px-2.5",
          "space-y-1",
          "overflow-y-auto",
          "no-scrollbar",
        ].join(" ")}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = state.activePage === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => dispatch({ type: "SET_PAGE", page: item.key })}
              className={`
                w-full flex items-center gap-3 h-10 rounded-lg px-2.5
                transition-all text-sm font-medium
                ${isActive ? "bg-[#007AFF] text-white shadow-md shadow-blue-500/20" : "text-gray-600 hover:bg-gray-100"}
                ${collapsed ? "justify-center px-0" : ""}
              `}
              title={collapsed ? PAGE_TITLES[item.key] : undefined}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
              {!collapsed && (
                <>
                  <span
                    className={["flex-1", "text-left", "truncate"].join(" ")}
                  >
                    {PAGE_TITLES[item.key]}
                  </span>
                  {item.key === "orders" && pendingCount > 0 && (
                    <span
                      className={[
                        "bg-red-500",
                        "text-white",
                        "text-[10px]",
                        "font-bold",
                        "rounded-full",
                        "min-w-[18px]",
                        "h-[18px]",
                        "flex",
                        "items-center",
                        "justify-center",
                        "px-1",
                      ].join(" ")}
                    >
                      {pendingCount}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className={["px-3", "pb-2", "flex-shrink-0"].join(" ")}>
        <button
          onClick={() => {
            setCollapsed(!collapsed);
            setShowUserMenu(false);
          }}
          className={`
            w-full flex items-center gap-2 h-9 rounded-lg text-gray-400
            hover:bg-gray-100 transition-colors text-xs
            ${collapsed ? "justify-center" : "px-2.5"}
          `}
        >
          {collapsed ? (
            <ChevronRight size={14} />
          ) : (
            <>
              <ChevronLeft size={14} /> <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* Admin User Dropdown */}
      <div className={["px-3", "pb-3", "flex-shrink-0", "relative"].join(" ")}>
        <button
          onClick={() => !collapsed && setShowUserMenu(!showUserMenu)}
          className={`
            w-full flex items-center gap-3 p-2.5 rounded-xl
            hover:bg-gray-100 transition-colors
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <div
            className={[
              "w-9",
              "h-9",
              "rounded-full",
              "bg-gradient-to-br",
              "from-[#007AFF]",
              "to-[#0055CC]",
              "flex",
              "items-center",
              "justify-center",
              "text-white",
              "text-sm",
              "font-bold",
              "flex-shrink-0",
            ].join(" ")}
          >
            {state.profile.avatar?.startsWith("data:") ||
            state.profile.avatar?.startsWith("http") ? (
              <img
                src={state.profile.avatar}
                alt={state.profile.name}
                className={[
                  "w-full",
                  "h-full",
                  "rounded-full",
                  "object-cover",
                ].join(" ")}
              />
            ) : (
              state.profile.avatar || state.profile.name.charAt(0)
            )}
          </div>
          {!collapsed && (
            <>
              <div className={["flex-1", "min-w-0", "text-left"].join(" ")}>
                <p
                  className={[
                    "text-sm",
                    "font-semibold",
                    "text-gray-900",
                    "truncate",
                  ].join(" ")}
                >
                  {state.profile.name}
                </p>
                <p className={["text-xs", "text-gray-400"].join(" ")}>
                  {state.profile.role}
                </p>
              </div>
              <ChevronUp
                size={14}
                className={`text-gray-400 transition-transform ${showUserMenu ? "" : "rotate-180"}`}
              />
            </>
          )}
        </button>

        {/* Dropdown Menu */}
        {showUserMenu && !collapsed && (
          <>
            <div
              className={["fixed", "inset-0", "z-40"].join(" ")}
              onClick={() => setShowUserMenu(false)}
            />
            <div
              className={[
                "absolute",
                "left-3",
                "right-3",
                "bottom-full",
                "mb-2",
                "bg-white",
                "rounded-xl",
                "shadow-xl",
                "border",
                "border-gray-100",
                "overflow-hidden",
                "z-50",
              ].join(" ")}
            >
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  dispatch({ type: "SET_PAGE", page: "profile" });
                }}
                className={[
                  "w-full",
                  "flex",
                  "items-center",
                  "gap-3",
                  "px-4",
                  "py-3",
                  "text-sm",
                  "text-gray-700",
                  "hover:bg-gray-50",
                  "transition-colors",
                  "text-left",
                ].join(" ")}
              >
                <User size={16} className={["text-gray-400"].join(" ")} />
                <span>Profile</span>
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  dispatch({ type: "SET_PAGE", page: "settings" });
                }}
                className={[
                  "w-full",
                  "flex",
                  "items-center",
                  "gap-3",
                  "px-4",
                  "py-3",
                  "text-sm",
                  "text-gray-700",
                  "hover:bg-gray-50",
                  "transition-colors",
                  "text-left",
                  "border-t",
                  "border-gray-50",
                ].join(" ")}
              >
                <Settings size={16} className={["text-gray-400"].join(" ")} />
                <span>Settings</span>
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  dispatch({ type: "LOGOUT" });
                }}
                className={[
                  "w-full",
                  "flex",
                  "items-center",
                  "gap-3",
                  "px-4",
                  "py-3",
                  "text-sm",
                  "text-red-500",
                  "hover:bg-red-50",
                  "transition-colors",
                  "text-left",
                  "border-t",
                  "border-gray-50",
                ].join(" ")}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
