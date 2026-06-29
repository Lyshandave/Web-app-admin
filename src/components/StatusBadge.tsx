const STYLES: Record<string, string> = {
  Pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  Processing: "bg-blue-50 text-blue-700 border border-blue-200",
  Delivered: "bg-green-50 text-green-700 border border-green-200",
  Cancelled: "bg-red-50 text-red-700 border border-red-200",
  Active: "bg-green-50 text-green-700 border border-green-200",
  "Low Stock": "bg-yellow-50 text-yellow-700 border border-yellow-200",
  "Out of Stock": "bg-red-50 text-red-700 border border-red-200",
  Inactive: "bg-gray-100 text-gray-500 border border-gray-200",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STYLES[status] || STYLES["Pending"]}`}
    >
      {status}
    </span>
  );
}
