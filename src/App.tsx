import { useEffect } from "react";
import { AdminProvider, useAdmin } from "@/context/AdminContext";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Orders from "@/pages/Orders";
import Products from "@/pages/Products";
import Customers from "@/pages/Customers";
import Subscriptions from "@/pages/Subscriptions";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";

function Layout() {
  const { state } = useAdmin();

  useEffect(() => {
    if (state.preferences.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state.preferences.darkMode]);

  if (!state.isAuthenticated) {
    return <Login />;
  }

  return (
    <div
      className={["flex", "h-screen", "bg-gray-100", "overflow-hidden"].join(
        " ",
      )}
    >
      <Sidebar />
      <div
        className={[
          "flex-1",
          "flex",
          "flex-col",
          "min-w-0",
          "overflow-hidden",
        ].join(" ")}
      >
        <TopBar page={state.activePage} />
        <main className={["flex-1", "overflow-y-scroll"].join(" ")}>
          {state.activePage === "dashboard" && <Dashboard />}
          {state.activePage === "orders" && <Orders />}
          {state.activePage === "products" && <Products />}
          {state.activePage === "customers" && <Customers />}
          {state.activePage === "subscriptions" && <Subscriptions />}
          {state.activePage === "reports" && <Reports />}
          {state.activePage === "settings" && <Settings />}
          {state.activePage === "profile" && <Profile />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AdminProvider>
      <Layout />
    </AdminProvider>
  );
}
