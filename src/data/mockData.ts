import type {
  Product,
  Order,
  Customer,
  Notification,
  SalesChartPoint,
  PieDataPoint,
  WeeklyOrderPoint,
} from "@/types";

export const PRODUCTS: Product[] = [
  {
    id: "P001",
    name: "Purified Water 500ml",
    description:
      "Premium purified drinking water in a convenient 500ml bottle. Triple-filtered and UV-treated for maximum purity.",
    category: "Bottled Water",
    price: 15,
    stock: 250,
    sold: 1200,
    status: "Active",
    image: "/images/bottle-500ml.jpg",
  },
  {
    id: "P002",
    name: "Purified Water 1L",
    description:
      "Large 1-liter bottle of our signature purified water. Multi-stage filtration process ensures crisp, clean taste.",
    category: "Bottled Water",
    price: 25,
    stock: 180,
    sold: 950,
    status: "Active",
    image: "/images/bottle-1L.jpg",
  },
  {
    id: "P003",
    name: "5-Gallon Water Jug",
    description:
      "Large 5-gallon (18.9L) water container for home and office dispensers. Refillable BPA-free bottle.",
    category: "Bottled Water",
    price: 80,
    stock: 45,
    sold: 320,
    status: "Low Stock",
    image: "/images/bottle-5gal.jpg",
  },
  {
    id: "P004",
    name: "Modern Water Dispenser",
    description:
      "Sleek floor-standing water dispenser with hot and cold options. Energy-efficient compressor cooling.",
    category: "Dispensers",
    price: 4500,
    stock: 12,
    sold: 28,
    status: "Active",
    image: "/images/dispenser.jpg",
  },
  {
    id: "P005",
    name: "Filter Pitcher",
    description:
      "Advanced 4-stage filter pitcher that reduces chlorine, lead, and other contaminants. 2.5L capacity.",
    category: "Accessories",
    price: 850,
    stock: 8,
    sold: 45,
    status: "Low Stock",
    image: "/images/filter-pitcher.jpg",
  },
  {
    id: "P006",
    name: "Glass Bottle Set (3pcs)",
    description:
      "Set of 3 reusable glass water bottles with protective silicone sleeves and bamboo lids. Eco-friendly.",
    category: "Accessories",
    price: 650,
    stock: 30,
    sold: 67,
    status: "Active",
    image: "/images/glass-bottles.jpg",
  },
  {
    id: "P007",
    name: "Faucet Water Filter",
    description:
      "Easy-install faucet mount filter with 6-stage purification. Removes 99% of contaminants.",
    category: "New Arrivals",
    price: 1200,
    stock: 0,
    sold: 15,
    status: "Out of Stock",
    image: "/images/faucet-filter.jpg",
  },
];

export const ORDERS: Order[] = [
  {
    id: "ORD-001",
    customer: "Juan Dela Cruz",
    phone: "09123456789",
    items: "5-Gallon x2, 500ml x5",
    total: 235,
    status: "Delivered",
    date: "2026-06-22",
    address: "123 Main St, Manila",
  },
  {
    id: "ORD-002",
    customer: "Maria Santos",
    phone: "09987654321",
    items: "Purified 1L x3",
    total: 75,
    status: "Processing",
    date: "2026-06-22",
    address: "456 Rizal Ave, Quezon City",
  },
  {
    id: "ORD-003",
    customer: "Pedro Reyes",
    phone: "09112223344",
    items: "Dispenser x1",
    total: 4500,
    status: "Pending",
    date: "2026-06-21",
    address: "789 Mabini St, Makati",
  },
  {
    id: "ORD-004",
    customer: "Ana Lim",
    phone: "09334445566",
    items: "Filter Pitcher x2, Glass Set x1",
    total: 2350,
    status: "Processing",
    date: "2026-06-21",
    address: "321 Bonifacio, Taguig",
  },
  {
    id: "ORD-005",
    customer: "Carlos Tan",
    phone: "09556667788",
    items: "500ml x20",
    total: 300,
    status: "Delivered",
    date: "2026-06-20",
    address: "654 Taft Ave, Pasay",
  },
  {
    id: "ORD-006",
    customer: "Lisa Garcia",
    phone: "09778889900",
    items: "5-Gallon x1, 1L x10",
    total: 330,
    status: "Cancelled",
    date: "2026-06-20",
    address: "987 Quezon Blvd, Caloocan",
  },
  {
    id: "ORD-007",
    customer: "Miguel Cruz",
    phone: "09113334455",
    items: "Faucet Filter x1",
    total: 1200,
    status: "Pending",
    date: "2026-06-19",
    address: "147 Luna St, Paranaque",
  },
  {
    id: "ORD-008",
    customer: "Sarah Lee",
    phone: "09224446688",
    items: "500ml x50",
    total: 750,
    status: "Delivered",
    date: "2026-06-19",
    address: "258 Pedro St, Mandaluyong",
  },
];

export const CUSTOMERS: Customer[] = [
  {
    id: "C001",
    name: "Juan Dela Cruz",
    phone: "09123456789",
    email: "juan@email.com",
    orders: 12,
    totalSpent: 3450,
    joined: "2025-12-01",
    status: "Active",
  },
  {
    id: "C002",
    name: "Maria Santos",
    phone: "09987654321",
    email: "maria@email.com",
    orders: 8,
    totalSpent: 2100,
    joined: "2026-01-15",
    status: "Active",
  },
  {
    id: "C003",
    name: "Pedro Reyes",
    phone: "09112223344",
    email: "pedro@email.com",
    orders: 5,
    totalSpent: 5600,
    joined: "2026-02-20",
    status: "Active",
  },
  {
    id: "C004",
    name: "Ana Lim",
    phone: "09334445566",
    email: "ana@email.com",
    orders: 15,
    totalSpent: 4200,
    joined: "2025-11-10",
    status: "Active",
  },
  {
    id: "C005",
    name: "Carlos Tan",
    phone: "09556667788",
    email: "carlos@email.com",
    orders: 3,
    totalSpent: 890,
    joined: "2026-04-05",
    status: "Inactive",
  },
  {
    id: "C006",
    name: "Lisa Garcia",
    phone: "09778889900",
    email: "lisa@email.com",
    orders: 7,
    totalSpent: 1850,
    joined: "2026-03-12",
    status: "Active",
  },
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "New order received: ORD-007",
    time: "5 min ago",
    read: false,
  },
  {
    id: "2",
    title: "Low stock alert: 5-Gallon Jug",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    title: "Order ORD-002 status updated",
    time: "2 hours ago",
    read: true,
  },
  {
    id: "4",
    title: "New customer registered",
    time: "3 hours ago",
    read: true,
  },
];

export const CHART_DATA: SalesChartPoint[] = [
  { name: "Jan", sales: 4200, orders: 35 },
  { name: "Feb", sales: 3800, orders: 28 },
  { name: "Mar", sales: 5100, orders: 42 },
  { name: "Apr", sales: 4600, orders: 38 },
  { name: "May", sales: 6200, orders: 52 },
  { name: "Jun", sales: 7800, orders: 64 },
];

export const PIE_DATA: PieDataPoint[] = [
  { name: "Bottled Water", value: 55, color: "#007AFF" },
  { name: "Dispensers", value: 15, color: "#5856D6" },
  { name: "Accessories", value: 22, color: "#FF9500" },
  { name: "New Arrivals", value: 8, color: "#34C759" },
];

export const WEEKLY_DATA: WeeklyOrderPoint[] = [
  { day: "Mon", orders: 12 },
  { day: "Tue", orders: 19 },
  { day: "Wed", orders: 15 },
  { day: "Thu", orders: 22 },
  { day: "Fri", orders: 28 },
  { day: "Sat", orders: 35 },
  { day: "Sun", orders: 18 },
];

export const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  orders: "Orders",
  products: "Products",
  customers: "Customers",
  subscriptions: "Subscription Plan",
  reports: "Reports",
  settings: "Settings",
  profile: "My Profile",
};

export const HEADER_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  orders: "Orders Management",
  products: "Products",
  customers: "Customers",
  subscriptions: "Subscription Plan",
  reports: "Reports",
  settings: "Settings",
  profile: "My Profile",
};

export const ADMIN_PROFILE = {
  name: "Admin User",
  email: "lyshandavet@gmail.com",
  phone: "09123456789",
  role: "Super Admin",
  avatar: "A",
  joined: "2025-01-15",
};

export const CATEGORIES = [
  "Bottled Water",
  "Dispensers",
  "Accessories",
  "New Arrivals",
];
