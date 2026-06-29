export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  status: "Active" | "Low Stock" | "Out of Stock";
  image: string;
  rating?: number;
  features?: string;
}

export interface Order {
  id: string;
  customer: string;
  phone: string;
  email_or_phone?: string;
  items: { product: string; quantity: number; price: number }[] | string;
  total: number;
  status: "Pending" | "Processing" | "Delivered" | "Cancelled";
  date: string;
  address: string;
  paymentMethod?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  orders: number;
  totalSpent: number;
  joined: string;
  status: "Active" | "Inactive";
}

export interface SubscriptionPlan {
  id: string;
  customer: string;
  email: string;
  phone: string;
  planName: string;
  frequency: string;
  deliveryDay: string;
  deliveryTime: string;
  price: number;
  paymentMethod: string;
  startDate: string;
  endDate: string;
  duration: string;
}

export interface Notification {
  id: string;
  title: string;
  time: string;
  read: boolean;
}

export interface SalesChartPoint {
  name: string;
  sales: number;
  orders: number;
}

export interface PieDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface WeeklyOrderPoint {
  day: string;
  orders: number;
}

export type PageKey =
  | "dashboard"
  | "orders"
  | "products"
  | "customers"
  | "subscriptions"
  | "reports"
  | "settings"
  | "profile";

export interface AdminProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  joined: string;
}

export interface AppPreferences {
  pushNotifications: boolean;
  smsNotifications: boolean;
  emailAlerts: boolean;
  darkMode: boolean;
  autoTranslate: boolean;
  twoFactorAuth: boolean;
}
