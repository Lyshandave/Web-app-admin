import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from "react";
import type {
  Product,
  Order,
  Customer,
  SubscriptionPlan,
  Notification,
  PageKey,
  AdminProfile,
  AppPreferences,
} from "@/types";
import { ADMIN_PROFILE } from "@/data/mockData";

interface AdminState {
  isAuthenticated: boolean;
  activePage: PageKey;
  products: Product[];
  orders: Order[];
  customers: Customer[];
  subscriptions: SubscriptionPlan[];
  notifications: Notification[];
  profile: AdminProfile;
  preferences: AppPreferences;
  viewOrderId: string | null;
  loading: boolean;
}

export type AdminAction =
  | { type: "LOGIN"; token?: string }
  | { type: "LOGOUT" }
  | { type: "SET_PAGE"; page: PageKey }
  | { type: "SET_PRODUCTS"; payload: Product[] }
  | { type: "SET_ORDERS"; payload: Order[] }
  | { type: "SET_CUSTOMERS"; payload: Customer[] }
  | { type: "SET_SUBSCRIPTIONS"; payload: SubscriptionPlan[] }
  | { type: "UPDATE_ORDER_STATUS"; orderId: string; status: Order["status"] }
  | { type: "DELETE_ORDER"; orderId: string }
  | { type: "ADD_PRODUCT"; product: Product }
  | { type: "EDIT_PRODUCT"; product: Product }
  | { type: "DELETE_PRODUCT"; productId: string }
  | { type: "READ_NOTIFICATION"; id: string }
  | { type: "DELETE_NOTIFICATION"; id: string }
  | { type: "READ_ALL_NOTIFICATIONS" }
  | { type: "SET_VIEW_ORDER_ID"; orderId: string | null }
  | { type: "UPDATE_PROFILE"; profile: Partial<AdminProfile> }
  | { type: "UPDATE_PREFERENCES"; preferences: Partial<AppPreferences> };

const getInitialNotifications = (): Notification[] => {
  try {
    const stored = localStorage.getItem("adminNotifications");
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

const getInitialPreferences = (): AppPreferences => {
  try {
    const stored = localStorage.getItem("adminPreferences");
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return {
    pushNotifications: true,
    smsNotifications: true,
    emailAlerts: false,
    darkMode: false,
    autoTranslate: false,
    twoFactorAuth: false,
  };
};

const getInitialProfile = (): AdminProfile => {
  try {
    const stored = localStorage.getItem("adminProfile");
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return { ...ADMIN_PROFILE };
};

const getInitialStateArray = (key: string): any[] => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

const initialState: AdminState = {
  isAuthenticated: sessionStorage.getItem("adminAuthenticated") === "true",
  activePage:
    (localStorage.getItem("adminActivePage") as PageKey) || "dashboard",
  products: getInitialStateArray("adminProducts"),
  orders: getInitialStateArray("adminOrders"),
  customers: getInitialStateArray("adminCustomers"),
  subscriptions: getInitialStateArray("adminSubscriptions"),
  notifications: getInitialNotifications(),
  profile: getInitialProfile(),
  preferences: getInitialPreferences(),
  viewOrderId: null,
  loading: true,
};

function reducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case "LOGIN":
      sessionStorage.setItem("adminAuthenticated", "true");
      if (action.token) sessionStorage.setItem("adminToken", action.token);
      return { ...state, isAuthenticated: true };
    case "LOGOUT":
      sessionStorage.removeItem("adminAuthenticated");
      sessionStorage.removeItem("adminToken");
      return { ...initialState, isAuthenticated: false, loading: false };
    case "SET_PAGE":
      localStorage.setItem("adminActivePage", action.page);
      return { ...state, activePage: action.page };
    case "SET_PRODUCTS":
      return { ...state, products: action.payload };
    case "SET_ORDERS": {
      const existingOrderIds = new Set(state.orders.map((o) => o.id));
      const newOrders = action.payload.filter(
        (o) => !existingOrderIds.has(o.id),
      );

      let newNotifications = [...state.notifications];
      // Only notify if it's not the initial load (where state.orders was empty or something)
      if (state.orders.length > 0 && newOrders.length > 0) {
        newOrders.forEach((no) => {
          newNotifications.unshift({
            id: Date.now().toString() + Math.random(),
            title: `New Order Received: ${no.id} from ${no.customer}`,
            time: "Just now",
            read: false,
          });
        });
      }
      return {
        ...state,
        orders: action.payload,
        notifications: newNotifications.slice(0, 20),
      };
    }
    case "SET_CUSTOMERS":
      return { ...state, customers: action.payload, loading: false };
    case "SET_SUBSCRIPTIONS":
      return { ...state, subscriptions: action.payload };
    case "UPDATE_ORDER_STATUS": {
      const newNotif: Notification = {
        id: Date.now().toString(),
        title: `Order ${action.orderId} is now ${action.status}`,
        time: "Just now",
        read: false,
      };
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId ? { ...o, status: action.status } : o,
        ),
        notifications: [newNotif, ...state.notifications].slice(0, 20),
      };
    }
    case "DELETE_ORDER": {
      const newNotif: Notification = {
        id: Date.now().toString(),
        title: `Order ${action.orderId} has been deleted`,
        time: "Just now",
        read: false,
      };
      return {
        ...state,
        orders: state.orders.filter((o) => o.id !== action.orderId),
        notifications: [newNotif, ...state.notifications].slice(0, 20),
      };
    }
    case "ADD_PRODUCT":
      return { ...state, products: [action.product, ...state.products] };
    case "EDIT_PRODUCT":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.product.id ? action.product : p,
        ),
      };
    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.productId),
      };
    case "READ_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n,
        ),
      };
    case "DELETE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.id),
      };
    case "READ_ALL_NOTIFICATIONS":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    case "SET_VIEW_ORDER_ID":
      return { ...state, viewOrderId: action.orderId };
    case "UPDATE_PROFILE":
      return { ...state, profile: { ...state.profile, ...action.profile } };
    case "UPDATE_PREFERENCES":
      return {
        ...state,
        preferences: { ...state.preferences, ...action.preferences },
      };
    default:
      return state;
  }
}

interface AdminCtxType {
  state: AdminState;
  dispatch: React.Dispatch<AdminAction>;
  refreshData: () => Promise<void>;
}

const AdminContext = createContext<AdminCtxType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshData = async () => {
    const fetchStartTime = Date.now();
    try {
      const token = sessionStorage.getItem("adminToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const [
        productsRes,
        ordersRes,
        customersRes,
        subscriptionsRes,
        profileRes,
      ] = await Promise.all([
        fetch(`/api/products?_t=${fetchStartTime}`, {
          headers,
          cache: "no-store",
        }),
        fetch("/api/orders", { headers }),
        fetch("/api/customers", { headers }),
        fetch("/api/subscriptions", { headers }),
        fetch("/api/admin/profile", { headers }),
      ]);

      if (productsRes.ok) {
        const products = await productsRes.json();
        const mappedProducts = products.map((p: any) => ({
          ...p,
          price: parseFloat(p.price),
          stock: parseInt(p.stock),
          sold: parseInt(p.sold) || 0,
        }));
        if (
          !(window as any).isSavingProduct &&
          !((window as any).lastProductUpdate > fetchStartTime)
        ) {
          dispatch({ type: "SET_PRODUCTS", payload: mappedProducts });
        }
      }
      if (ordersRes.ok) {
        const orders = await ordersRes.json();
        // Backend returns slightly different property names, map them to UI
        const mappedOrders = orders.map((o: any) => ({
          id: o.id,
          customer: o.customer || "Unknown Customer",
          phone: o.phone,
          email_or_phone: o.email_or_phone,
          address: o.address,
          paymentMethod: o.payment_method,
          date: new Date(o.created_at).toLocaleDateString(),
          total: parseFloat(o.total_amount),
          status: o.status,
          items: o.items.map((i: any) => ({
            product: i.product?.name || "Item",
            quantity: i.quantity,
            price: parseFloat(i.price_at_purchase),
          })),
        }));
        dispatch({ type: "SET_ORDERS", payload: mappedOrders });
      }
      if (customersRes.ok) {
        const customers = await customersRes.json();
        const mappedCustomers = customers.map((c: any) => ({
          id: String(c.id),
          name: c.name || "No Name",
          email: c.email,
          orders: parseInt(c.orders) || 0,
          totalSpent: parseFloat(c.totalspent) || 0,
          joined: new Date(c.joined).toLocaleDateString(),
          status: "Active",
        }));
        dispatch({ type: "SET_CUSTOMERS", payload: mappedCustomers });
      }
      if (subscriptionsRes.ok) {
        const subscriptions = await subscriptionsRes.json();
        dispatch({
          type: "SET_SUBSCRIPTIONS",
          payload: subscriptions.map((s: any) => ({
            id: String(s.id),
            customer: s.customer || "Unknown Customer",
            email: s.email || "",
            phone: s.phone || "",
            planName: s.planName || "",
            frequency: s.frequency || "",
            deliveryDay: s.deliveryDay || "",
            deliveryTime: s.deliveryTime || "",
            price: Number(s.price) || 0,
            paymentMethod: s.paymentMethod || "",
            startDate: s.startDate || "",
            endDate: s.endDate || "",
            duration: s.duration || "",
          })),
        });
      }
      if (profileRes.ok) {
        dispatch({ type: "UPDATE_PROFILE", profile: await profileRes.json() });
      }
      // Settings are handled locally via localStorage so we skip fetching them to avoid overwrite
    } catch (err) {
      console.error("Failed to load admin data:", err);
    }
  };

  // Initial load + auto-poll every 1 second for real-time updates
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.isAuthenticated) {
      // Fetch immediately on login
      refreshData();

      // Poll every 1 second for 0-second real-time updates
      intervalRef.current = setInterval(() => {
        refreshData();
      }, 1000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [state.isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(
      "adminNotifications",
      JSON.stringify(state.notifications),
    );
  }, [state.notifications]);

  useEffect(() => {
    localStorage.setItem("adminPreferences", JSON.stringify(state.preferences));
  }, [state.preferences]);

  useEffect(() => {
    localStorage.setItem("adminProfile", JSON.stringify(state.profile));
  }, [state.profile]);

  useEffect(() => {
    localStorage.setItem("adminProducts", JSON.stringify(state.products));
  }, [state.products]);

  useEffect(() => {
    localStorage.setItem("adminOrders", JSON.stringify(state.orders));
  }, [state.orders]);

  useEffect(() => {
    localStorage.setItem("adminCustomers", JSON.stringify(state.customers));
  }, [state.customers]);

  useEffect(() => {
    localStorage.setItem(
      "adminSubscriptions",
      JSON.stringify(state.subscriptions),
    );
  }, [state.subscriptions]);

  return (
    <AdminContext.Provider value={{ state, dispatch, refreshData }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be inside AdminProvider");
  return ctx;
}
