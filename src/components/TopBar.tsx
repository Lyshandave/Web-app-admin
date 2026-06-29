import { useState } from "react";
import { Bell, X } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

interface Props {
  page: string;
}

const HEADER_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  orders: "Orders Management",
  products: "Products",
  customers: "Customers",
  subscriptions: "Subscription Plan",
  reports: "Reports",
  settings: "Settings",
  profile: "My Profile",
};

export default function TopBar({ page }: Props) {
  const { state, dispatch } = useAdmin();
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return (
    <header
      className={[
        "h-16",
        "bg-white",
        "border-b",
        "border-gray-200",
        "flex",
        "items-center",
        "justify-between",
        "px-6",
        "sticky",
        "top-0",
        "z-30",
      ].join(" ")}
    >
      <h1 className={["text-xl", "font-bold", "text-gray-900"].join(" ")}>
        {HEADER_TITLES[page] || "Dashboard"}
      </h1>

      {/* Notification - positioned with margin from right edge */}
      <div className={["relative", "mr-4"].join(" ")}>
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className={[
            "w-10",
            "h-10",
            "rounded-full",
            "bg-gray-50",
            "flex",
            "items-center",
            "justify-center",
            "hover:bg-gray-100",
            "transition-colors",
            "relative",
          ].join(" ")}
        >
          <Bell size={18} className={["text-gray-500"].join(" ")} />
          {unreadCount > 0 && (
            <span
              className={[
                "absolute",
                "-top-1",
                "-right-1",
                "bg-red-500",
                "text-white",
                "text-[10px]",
                "font-bold",
                "rounded-full",
                "w-[18px]",
                "h-[18px]",
                "flex",
                "items-center",
                "justify-center",
                "border-2",
                "border-white",
              ].join(" ")}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifs && (
          <>
            <div
              className={["fixed", "inset-0", "z-40"].join(" ")}
              onClick={() => setShowNotifs(false)}
            />
            <div
              className={[
                "absolute",
                "right-0",
                "top-12",
                "w-80",
                "bg-white",
                "rounded-2xl",
                "shadow-xl",
                "border",
                "border-gray-100",
                "z-50",
                "overflow-hidden",
              ].join(" ")}
            >
              <div
                className={[
                  "px-4",
                  "py-3",
                  "border-b",
                  "border-gray-100",
                  "flex",
                  "items-center",
                  "justify-between",
                ].join(" ")}
              >
                <p
                  className={["font-semibold", "text-sm", "text-gray-900"].join(
                    " ",
                  )}
                >
                  Notifications
                </p>
                <div className={["flex", "items-center", "gap-2"].join(" ")}>
                  {unreadCount > 0 && (
                    <button
                      onClick={() =>
                        dispatch({ type: "READ_ALL_NOTIFICATIONS" })
                      }
                      className={[
                        "text-xs",
                        "text-[#007AFF]",
                        "font-semibold",
                        "hover:underline",
                      ].join(" ")}
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifs(false)}
                    className={[
                      "w-6",
                      "h-6",
                      "flex",
                      "items-center",
                      "justify-center",
                      "rounded-lg",
                      "hover:bg-gray-100",
                    ].join(" ")}
                  >
                    <X size={14} className={["text-gray-400"].join(" ")} />
                  </button>
                </div>
              </div>
              <div
                className={[
                  "max-h-[400px]",
                  "overflow-y-auto",
                  "no-scrollbar",
                ].join(" ")}
              >
                {state.notifications.length === 0 ? (
                  <div
                    className={[
                      "py-8",
                      "px-4",
                      "text-center",
                      "flex",
                      "flex-col",
                      "items-center",
                      "justify-center",
                    ].join(" ")}
                  >
                    <Bell
                      className={["w-8", "h-8", "text-gray-200", "mb-2"].join(
                        " ",
                      )}
                    />
                    <p
                      className={[
                        "text-sm",
                        "font-medium",
                        "text-gray-500",
                      ].join(" ")}
                    >
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  state.notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        dispatch({ type: "READ_NOTIFICATION", id: n.id });
                        const match = n.title.match(/(ORD-\d+)/);
                        if (match) {
                          dispatch({ type: "SET_PAGE", page: "orders" });
                          dispatch({
                            type: "SET_VIEW_ORDER_ID",
                            orderId: match[1],
                          });
                        }
                      }}
                      className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer group relative ${!n.read ? "bg-blue-50/30" : ""}`}
                    >
                      <div
                        className={["flex", "items-start", "gap-2.5"].join(" ")}
                      >
                        {!n.read && (
                          <span
                            className={[
                              "w-2",
                              "h-2",
                              "rounded-full",
                              "bg-[#007AFF]",
                              "mt-1.5",
                              "flex-shrink-0",
                            ].join(" ")}
                          />
                        )}
                        <div className={["flex-1", "pr-6"].join(" ")}>
                          <p
                            className={`text-sm ${!n.read ? "font-semibold text-gray-900" : "text-gray-600"}`}
                          >
                            {n.title}
                          </p>
                          <p
                            className={[
                              "text-xs",
                              "text-gray-400",
                              "mt-0.5",
                            ].join(" ")}
                          >
                            {n.time}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({ type: "DELETE_NOTIFICATION", id: n.id });
                        }}
                        className={[
                          "absolute",
                          "right-4",
                          "top-1/2",
                          "-translate-y-1/2",
                          "p-1.5",
                          "text-gray-400",
                          "hover:text-red-500",
                          "hover:bg-red-50",
                          "rounded-lg",
                          "opacity-0",
                          "group-hover:opacity-100",
                          "transition-all",
                        ].join(" ")}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
