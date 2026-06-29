import { useState } from "react";
import { Smartphone, Bell, Mail, Moon, Shield, RotateCcw } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

const PREF_ITEMS = [
  {
    key: "pushNotifications" as const,
    label: "Push Notifications",
    desc: "Receive order and delivery alerts",
    icon: Smartphone,
    color: "#007AFF",
  },
  {
    key: "smsNotifications" as const,
    label: "SMS Notifications",
    desc: "Send SMS alerts to customers",
    icon: Bell,
    color: "#34C759",
  },
  {
    key: "emailAlerts" as const,
    label: "Email Alerts",
    desc: "Receive low stock and system alerts",
    icon: Mail,
    color: "#FF9500",
  },
  {
    key: "darkMode" as const,
    label: "Dark Mode",
    desc: "Switch dashboard to dark theme",
    icon: Moon,
    color: "#5856D6",
  },
  {
    key: "twoFactorAuth" as const,
    label: "Two-Factor Auth",
    desc: "Add extra security layer",
    icon: Shield,
    color: "#FF3B30",
  },
];

export default function Settings() {
  const { state, dispatch } = useAdmin();
  const { preferences } = state;

  const [storeInfo, setStoreInfo] = useState(() => {
    try {
      const stored = localStorage.getItem("adminStoreInfo");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      name: "Pure Safe Water Station",
      address: "123 Main Street, Barangay San Jose, Manila, Philippines",
      phone: "09123456789",
      email: "lyshandavet@gmail.com",
      businessHours: "7:00 AM - 8:00 PM",
      currency: "PHP",
    };
  });

  const toggle = async (key: keyof typeof preferences) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    dispatch({ type: "UPDATE_PREFERENCES", preferences: newPrefs });
    localStorage.setItem("adminPreferences", JSON.stringify(newPrefs));
    try {
      const token = sessionStorage.getItem("adminToken");
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ storeInfo, preferences: newPrefs }),
      });
    } catch (e) {}
  };

  const saveStoreInfo = async () => {
    localStorage.setItem("adminStoreInfo", JSON.stringify(storeInfo));
    try {
      const token = sessionStorage.getItem("adminToken");
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ storeInfo, preferences }),
      });
    } catch (e) {}
  };

  const handleReset = () => {
    if (
      window.confirm("Are you sure you want to clear all data and settings?")
    ) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className={["p-6", "space-y-6"].join(" ")}>
      {/* TOP ROW: Store Info (left) + Preferences (right) */}
      <div
        className={[
          "grid",
          "grid-cols-1",
          "lg:grid-cols-2",
          "gap-6",
          "items-start",
        ].join(" ")}
      >
        {/* Store Information */}
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
            Store Information
          </h3>
          <div className={["space-y-4"].join(" ")}>
            <div className={["grid", "grid-cols-2", "gap-4"].join(" ")}>
              <div>
                <label
                  className={[
                    "text-xs",
                    "text-gray-500",
                    "mb-1.5",
                    "block",
                  ].join(" ")}
                >
                  Store Name
                </label>
                <input
                  type="text"
                  value={storeInfo.name}
                  onChange={(e) =>
                    setStoreInfo({ ...storeInfo, name: e.target.value })
                  }
                  onBlur={saveStoreInfo}
                  className={[
                    "w-full",
                    "h-10",
                    "border",
                    "border-gray-200",
                    "rounded-xl",
                    "px-4",
                    "outline-none",
                    "focus:border-[#007AFF]",
                    "text-sm",
                  ].join(" ")}
                />
              </div>
              <div>
                <label
                  className={[
                    "text-xs",
                    "text-gray-500",
                    "mb-1.5",
                    "block",
                  ].join(" ")}
                >
                  Phone
                </label>
                <input
                  type="text"
                  value={storeInfo.phone}
                  onChange={(e) =>
                    setStoreInfo({ ...storeInfo, phone: e.target.value })
                  }
                  onBlur={saveStoreInfo}
                  className={[
                    "w-full",
                    "h-10",
                    "border",
                    "border-gray-200",
                    "rounded-xl",
                    "px-4",
                    "outline-none",
                    "focus:border-[#007AFF]",
                    "text-sm",
                  ].join(" ")}
                />
              </div>
            </div>
            <div>
              <label
                className={["text-xs", "text-gray-500", "mb-1.5", "block"].join(
                  " ",
                )}
              >
                Address
              </label>
              <input
                type="text"
                value={storeInfo.address}
                onChange={(e) =>
                  setStoreInfo({ ...storeInfo, address: e.target.value })
                }
                onBlur={saveStoreInfo}
                className={[
                  "w-full",
                  "h-10",
                  "border",
                  "border-gray-200",
                  "rounded-xl",
                  "px-4",
                  "outline-none",
                  "focus:border-[#007AFF]",
                  "text-sm",
                ].join(" ")}
              />
            </div>
            <div className={["grid", "grid-cols-2", "gap-4"].join(" ")}>
              <div>
                <label
                  className={[
                    "text-xs",
                    "text-gray-500",
                    "mb-1.5",
                    "block",
                  ].join(" ")}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={storeInfo.email}
                  onChange={(e) =>
                    setStoreInfo({ ...storeInfo, email: e.target.value })
                  }
                  onBlur={saveStoreInfo}
                  className={[
                    "w-full",
                    "h-10",
                    "border",
                    "border-gray-200",
                    "rounded-xl",
                    "px-4",
                    "outline-none",
                    "focus:border-[#007AFF]",
                    "text-sm",
                  ].join(" ")}
                />
              </div>
              <div>
                <label
                  className={[
                    "text-xs",
                    "text-gray-500",
                    "mb-1.5",
                    "block",
                  ].join(" ")}
                >
                  Business Hours
                </label>
                <input
                  type="text"
                  value={storeInfo.businessHours}
                  onChange={(e) =>
                    setStoreInfo({
                      ...storeInfo,
                      businessHours: e.target.value,
                    })
                  }
                  onBlur={saveStoreInfo}
                  className={[
                    "w-full",
                    "h-10",
                    "border",
                    "border-gray-200",
                    "rounded-xl",
                    "px-4",
                    "outline-none",
                    "focus:border-[#007AFF]",
                    "text-sm",
                  ].join(" ")}
                />
              </div>
            </div>
            <div>
              <label
                className={["text-xs", "text-gray-500", "mb-1.5", "block"].join(
                  " ",
                )}
              >
                Currency
              </label>
              <input
                type="text"
                value={storeInfo.currency}
                onChange={(e) =>
                  setStoreInfo({ ...storeInfo, currency: e.target.value })
                }
                onBlur={saveStoreInfo}
                className={[
                  "w-full",
                  "h-10",
                  "border",
                  "border-gray-200",
                  "rounded-xl",
                  "px-4",
                  "outline-none",
                  "focus:border-[#007AFF]",
                  "text-sm",
                  "max-w-[calc(50%-8px)]",
                ].join(" ")}
              />
            </div>
          </div>
        </div>

        {/* Preferences - SIDE BY SIDE */}
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
            Preferences
          </h3>
          <div className={["space-y-1"].join(" ")}>
            {PREF_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              const isOn = preferences[item.key];
              return (
                <div
                  key={item.key}
                  className={`flex items-center justify-between py-3 ${idx < PREF_ITEMS.length - 1 ? "border-b border-gray-50" : "border-b border-gray-50"}`}
                >
                  <div className={["flex", "items-center", "gap-3"].join(" ")}>
                    <div
                      className={[
                        "w-9",
                        "h-9",
                        "rounded-xl",
                        "flex",
                        "items-center",
                        "justify-center",
                      ].join(" ")}
                      style={{ backgroundColor: `${item.color}10` }}
                    >
                      <Icon size={16} style={{ color: item.color }} />
                    </div>
                    <div>
                      <p
                        className={[
                          "text-sm",
                          "font-semibold",
                          "text-gray-900",
                        ].join(" ")}
                      >
                        {item.label}
                      </p>
                      <p className={["text-xs", "text-gray-400"].join(" ")}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggle(item.key)}
                    className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${isOn ? "bg-[#34C759]" : "bg-gray-300"}`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${isOn ? "left-[22px]" : "left-0.5"}`}
                    />
                  </button>
                </div>
              );
            })}

            {/* Danger Zone moved here */}
            <div
              className={[
                "flex",
                "items-center",
                "justify-between",
                "py-3",
              ].join(" ")}
            >
              <div className={["flex", "items-center", "gap-3"].join(" ")}>
                <div
                  className={[
                    "w-9",
                    "h-9",
                    "rounded-xl",
                    "flex",
                    "items-center",
                    "justify-center",
                  ].join(" ")}
                  style={{ backgroundColor: "#FF3B3010" }}
                >
                  <RotateCcw size={16} style={{ color: "#FF3B30" }} />
                </div>
                <div>
                  <p
                    className={[
                      "text-sm",
                      "font-semibold",
                      "text-gray-900",
                    ].join(" ")}
                  >
                    Reset All Data
                  </p>
                  <p className={["text-xs", "text-gray-400"].join(" ")}>
                    Clear all orders, products, and customer data
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className={[
                  "h-9",
                  "px-4",
                  "bg-red-50",
                  "text-red-500",
                  "text-xs",
                  "font-semibold",
                  "rounded-lg",
                  "hover:bg-red-100",
                  "transition-colors",
                  "flex",
                  "items-center",
                  "gap-1.5",
                  "border",
                  "border-red-200",
                ].join(" ")}
              >
                <RotateCcw size={13} /> Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
