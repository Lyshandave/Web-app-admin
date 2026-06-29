import { useState } from "react";
import { createPortal } from "react-dom";
import { Search, Plus, Pencil, Trash2, X } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import StatusBadge from "@/components/StatusBadge";
import { CATEGORIES } from "@/data/mockData";
import type { Product } from "@/types";

export default function Products() {
  const { state, refreshData, dispatch } = useAdmin();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Bottled Water",
    price: "",
    stock: "",
    features: "",
    image: "",
  });

  const filtered = state.products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      category: "Bottled Water",
      price: "",
      stock: "",
      features: "",
      image: "",
    });
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    let initialFeatures = "";
    let parsedFeatures: string[] = [];
    try {
      if (p.features && p.features !== "null" && p.features !== "[]") {
        parsedFeatures = JSON.parse(p.features);
      }
    } catch (e) {
      if (p.features) parsedFeatures = [p.features];
    }

    // Provide realistic default features if none are found in the database
    if (parsedFeatures.length === 0) {
      const cat = (p.category || "").toLowerCase();
      const name = (p.name || "").toLowerCase();
      if (cat.includes("bottled") || cat === "bottled_water") {
        parsedFeatures = [
          "Multi-stage purified",
          "BPA-free bottle",
          "Sealed for freshness",
        ];
        if (name.includes("500ml")) parsedFeatures.unshift("500ml capacity");
        else if (name.includes("350ml"))
          parsedFeatures.unshift("350ml capacity");
        else if (name.includes("1l") || name.includes("1 liter"))
          parsedFeatures.unshift("1 Liter capacity");
      } else if (
        cat.includes("gallon") ||
        cat.includes("slim") ||
        cat.includes("container") ||
        cat === "round"
      ) {
        parsedFeatures = [
          "5 Gallon capacity",
          "Food-grade durable container",
          "Hot & Cold dispenser compatible",
          "Multi-stage purified",
        ];
      } else if (cat.includes("dispenser")) {
        parsedFeatures = [
          "Hot & Cold water output",
          "Energy efficient cooling/heating",
          "Child safety lock for hot water",
          "1-year warranty",
        ];
      } else if (cat.includes("bundle") || cat.includes("family")) {
        parsedFeatures = [
          "Value pack savings",
          "Perfect for family use",
          "Multi-stage purified",
          "Sealed for freshness",
        ];
      } else {
        parsedFeatures = [
          "Premium quality",
          "Guaranteed safe",
          "Excellent value",
        ];
      }
    }

    initialFeatures = parsedFeatures.join(", ");

    setForm({
      name: p.name,
      description: p.description || "",
      category: p.category || "Bottled Water",
      price: p.price.toString(),
      stock: p.stock.toString(),
      features: initialFeatures,
      image: p.image || "",
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name || !form.price || !form.stock) return;
    const price = Number(form.price);
    const stock = Number(form.stock);
    const payload = {
      id: editing ? editing.id : `P${Date.now()}`,
      name: form.name,
      description: form.description,
      category: form.category,
      price,
      stock,
      status: (stock === 0
        ? "Out of Stock"
        : stock < 20
          ? "Low Stock"
          : "Active") as "Out of Stock" | "Low Stock" | "Active",
      image: form.image || (editing ? editing.image : ""),
      features: JSON.stringify(
        form.features
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      ),
      rating: 0,
      volume: "N/A",
    };

    // Optimistic UI Update
    let newProducts = [...state.products];
    const optimisticProduct = {
      ...payload,
      price: Number(payload.price),
      stock: Number(payload.stock),
      sold: editing ? editing.sold : 0,
    };

    if (editing) {
      newProducts = newProducts.map((p) =>
        String(p.id) === String(optimisticProduct.id) ? optimisticProduct : p,
      );
    } else {
      newProducts.unshift(optimisticProduct);
    }

    // Dispatch immediately for 0ms latency UI update
    (window as any).isSavingProduct = true;
    (window as any).lastProductUpdate = Date.now();
    dispatch({ type: "SET_PRODUCTS", payload: newProducts });
    setShowForm(false);

    // Send data to background
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/products/${editing.id}` : "/api/products";
      const token = sessionStorage.getItem("adminToken");

      // We defer the fetch slightly so React can render the optimistic UI immediately
      setTimeout(() => {
        fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        })
          .then((res) => {
            if (res.ok) {
              (window as any).isSavingProduct = false;
              (window as any).lastProductUpdate = Date.now();
              refreshData(); // Silently sync real data when done
            } else {
              (window as any).isSavingProduct = false;
            }
          })
          .catch((err) => {
            (window as any).isSavingProduct = false;
            console.error("Failed to save product", err);
          });
      }, 10);
    } catch (err) {
      console.error("Failed to save product", err);
    }
  };

  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  const handlePreviewProduct = (productId: string | number) => {
    const prod = state.products.find((p) => p.id === productId);
    if (prod) {
      setPreviewProduct(prod);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const token = sessionStorage.getItem("adminToken");
      const res = await fetch(`/api/products/${productToDelete}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        dispatch({
          type: "SET_PRODUCTS",
          payload: state.products.filter((p) => p.id !== productToDelete),
        });
        refreshData();
      }
    } catch (err) {
      console.error("Failed to delete product", err);
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  return (
    <div className={["p-6", "space-y-5"].join(" ")}>
      {/* Header */}
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
            placeholder="Search products..."
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
        <button
          onClick={openAdd}
          className={[
            "h-10",
            "px-4",
            "bg-[#007AFF]",
            "text-white",
            "font-semibold",
            "rounded-xl",
            "shadow-sm",
            "hover:bg-blue-600",
            "transition-colors",
            "flex",
            "items-center",
            "gap-2",
            "text-sm",
          ].join(" ")}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Grid */}
      <div
        className={[
          "grid",
          "grid-cols-1",
          "md:grid-cols-2",
          "xl:grid-cols-3",
          "gap-4",
        ].join(" ")}
      >
        {filtered.map((p) => (
          <div
            key={p.id}
            className={[
              "bg-white",
              "rounded-2xl",
              "p-4",
              "shadow-sm",
              "border",
              "border-gray-100",
              "hover:shadow-md",
              "transition-shadow",
            ].join(" ")}
          >
            <div className={["flex", "items-start", "gap-4"].join(" ")}>
              <img
                src={p.image}
                alt={p.name}
                onClick={() => handlePreviewProduct(p.id)}
                className={[
                  "w-16",
                  "h-16",
                  "rounded-xl",
                  "object-cover",
                  "bg-gray-50",
                  "flex-shrink-0",
                  "cursor-pointer",
                  "hover:opacity-80",
                  "transition-opacity",
                ].join(" ")}
              />
              <div className={["flex-1", "min-w-0"].join(" ")}>
                <div
                  className={["flex", "items-start", "justify-between"].join(
                    " ",
                  )}
                >
                  <h4
                    onClick={() => handlePreviewProduct(p.id)}
                    className={[
                      "text-sm",
                      "font-bold",
                      "text-gray-900",
                      "truncate",
                      "pr-2",
                      "cursor-pointer",
                      "hover:text-blue-600",
                    ].join(" ")}
                  >
                    {p.name}
                  </h4>
                  <div className={["flex", "gap-1", "flex-shrink-0"].join(" ")}>
                    <button
                      onClick={() => openEdit(p)}
                      className={[
                        "w-7",
                        "h-7",
                        "rounded-lg",
                        "hover:bg-gray-100",
                        "flex",
                        "items-center",
                        "justify-center",
                      ].join(" ")}
                    >
                      <Pencil
                        size={12}
                        className={["text-gray-400"].join(" ")}
                      />
                    </button>
                    <button
                      onClick={() => setProductToDelete(p.id)}
                      className={[
                        "w-7",
                        "h-7",
                        "rounded-lg",
                        "hover:bg-red-50",
                        "flex",
                        "items-center",
                        "justify-center",
                      ].join(" ")}
                    >
                      <Trash2
                        size={12}
                        className={["text-gray-400", "hover:text-red-500"].join(
                          " ",
                        )}
                      />
                    </button>
                  </div>
                </div>
                <p className={["text-xs", "text-gray-400"].join(" ")}>
                  {p.category}
                </p>
                <div
                  className={["flex", "items-center", "gap-2", "mt-2"].join(
                    " ",
                  )}
                >
                  <span
                    className={["text-[#007AFF]", "font-bold", "text-sm"].join(
                      " ",
                    )}
                  >
                    ₱{p.price.toLocaleString()}
                  </span>
                  <StatusBadge status={p.status} />
                </div>
                <div
                  className={[
                    "flex",
                    "items-center",
                    "gap-4",
                    "mt-1.5",
                    "text-xs",
                    "text-gray-500",
                  ].join(" ")}
                >
                  <span>
                    Stock:{" "}
                    <strong className={["text-gray-700"].join(" ")}>
                      {p.stock}
                    </strong>
                  </span>
                  <span>
                    Sold:{" "}
                    <strong className={["text-gray-700"].join(" ")}>
                      {p.sold}
                    </strong>
                  </span>
                  <span>
                    Rating:{" "}
                    <strong className={["text-gray-700"].join(" ")}>
                      {Number(p.rating || 0).toFixed(1)}{" "}
                      <span className="text-yellow-500">{"\u2605"}</span>
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showForm &&
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
              onClick={() => setShowForm(false)}
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
                  {editing ? "Edit Product" : "Add New Product"}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className={[
                    "w-8",
                    "h-8",
                    "rounded-lg",
                    "hover:bg-gray-100",
                    "flex",
                    "items-center",
                    "justify-center",
                  ].join(" ")}
                >
                  <X size={16} className={["text-gray-400"].join(" ")} />
                </button>
              </div>
              <div className={["space-y-4"].join(" ")}>
                <div>
                  <label
                    className={[
                      "text-xs",
                      "font-semibold",
                      "text-gray-600",
                      "mb-1.5",
                      "block",
                    ].join(" ")}
                  >
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={[
                      "w-full",
                      "h-11",
                      "border-2",
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
                      "font-semibold",
                      "text-gray-600",
                      "mb-1.5",
                      "block",
                    ].join(" ")}
                  >
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Enter product description..."
                    className={[
                      "w-full",
                      "h-20",
                      "border-2",
                      "border-gray-200",
                      "rounded-xl",
                      "px-4",
                      "py-2",
                      "outline-none",
                      "focus:border-[#007AFF]",
                      "text-sm",
                      "resize-none",
                    ].join(" ")}
                  />
                </div>
                <div>
                  <label
                    className={[
                      "text-xs",
                      "font-semibold",
                      "text-gray-600",
                      "mb-1.5",
                      "block",
                    ].join(" ")}
                  >
                    Features (comma separated)
                  </label>
                  <input
                    type="text"
                    value={form.features}
                    onChange={(e) =>
                      setForm({ ...form, features: e.target.value })
                    }
                    placeholder="e.g. BPA Free, Premium Quality"
                    className={[
                      "w-full",
                      "h-11",
                      "border-2",
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
                      "font-semibold",
                      "text-gray-600",
                      "mb-1.5",
                      "block",
                    ].join(" ")}
                  >
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className={[
                      "w-full",
                      "h-11",
                      "border-2",
                      "border-gray-200",
                      "dark:border-gray-700",
                      "rounded-xl",
                      "px-4",
                      "outline-none",
                      "focus:border-[#007AFF]",
                      "text-sm",
                      "bg-white",
                      "dark:bg-black",
                      "dark:text-white",
                    ].join(" ")}
                    data-ignore-dark="true"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className={[
                      "text-xs",
                      "font-semibold",
                      "text-gray-600",
                      "mb-1.5",
                      "block",
                    ].join(" ")}
                  >
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={form.image}
                    readOnly
                    onClick={() => {
                      const el = document.getElementById("hidden-image-upload");
                      if (el) el.click();
                    }}
                    placeholder="Click to select image..."
                    className={[
                      "w-full",
                      "h-11",
                      "border-2",
                      "border-gray-200",
                      "rounded-xl",
                      "px-4",
                      "outline-none",
                      "focus:border-[#007AFF]",
                      "text-sm",
                      "cursor-pointer",
                    ].join(" ")}
                  />
                  <input
                    type="file"
                    id="hidden-image-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onloadend = async () => {
                          const base64 = reader.result as string;
                          try {
                            const token = sessionStorage.getItem("adminToken");
                            const res = await fetch("/api/upload-image", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                ...(token
                                  ? { Authorization: `Bearer ${token}` }
                                  : {}),
                              },
                              body: JSON.stringify({
                                filename: file.name,
                                imageBase64: base64,
                              }),
                            });
                            const data = await res.json();
                            if (data.success) {
                              setForm({ ...form, image: data.path });
                            }
                          } catch (err) {
                            console.error("Upload failed", err);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <div className={["grid", "grid-cols-2", "gap-3"].join(" ")}>
                  <div>
                    <label
                      className={[
                        "text-xs",
                        "font-semibold",
                        "text-gray-600",
                        "mb-1.5",
                        "block",
                      ].join(" ")}
                    >
                      Price (₱)
                    </label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      className={[
                        "w-full",
                        "h-11",
                        "border-2",
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
                        "font-semibold",
                        "text-gray-600",
                        "mb-1.5",
                        "block",
                      ].join(" ")}
                    >
                      Stock
                    </label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) =>
                        setForm({ ...form, stock: e.target.value })
                      }
                      className={[
                        "w-full",
                        "h-11",
                        "border-2",
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
                <button
                  onClick={save}
                  className={[
                    "w-full",
                    "h-12",
                    "bg-[#007AFF]",
                    "text-white",
                    "font-semibold",
                    "rounded-xl",
                    "shadow-lg",
                    "hover:bg-blue-600",
                    "transition-colors",
                    "mt-2",
                  ].join(" ")}
                >
                  {editing ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Delete Confirmation Modal */}
      {productToDelete &&
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
              onClick={() => setProductToDelete(null)}
            />
            <div
              className={[
                "relative",
                "bg-white",
                "rounded-2xl",
                "shadow-xl",
                "w-full",
                "max-w-sm",
                "p-6",
                "text-center",
              ].join(" ")}
            >
              <div
                className={[
                  "w-12",
                  "h-12",
                  "rounded-full",
                  "bg-red-100",
                  "flex",
                  "items-center",
                  "justify-center",
                  "mx-auto",
                  "mb-4",
                ].join(" ")}
              >
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3
                className={[
                  "text-lg",
                  "font-bold",
                  "text-gray-900",
                  "mb-2",
                ].join(" ")}
              >
                Delete Product?
              </h3>
              <p className={["text-sm", "text-gray-500", "mb-6"].join(" ")}>
                Are you sure you want to delete this product? This action cannot
                be undone.
              </p>
              <div className={["flex", "gap-3"].join(" ")}>
                <button
                  onClick={() => setProductToDelete(null)}
                  disabled={isDeleting}
                  className={[
                    "flex-1",
                    "h-11",
                    "font-semibold",
                    "rounded-xl",
                    "text-gray-700",
                    "bg-gray-100",
                    "hover:bg-gray-200",
                    "transition-colors",
                  ].join(" ")}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={[
                    "flex-1",
                    "h-11",
                    "font-semibold",
                    "rounded-xl",
                    "text-white",
                    "bg-red-500",
                    "hover:bg-red-600",
                    "transition-colors",
                    isDeleting ? "opacity-70 cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Preview Product Modal */}
      {previewProduct &&
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
              "bg-black/50",
              "backdrop-blur-sm",
            ].join(" ")}
          >
            <div
              className={[
                "bg-white",
                "rounded-2xl",
                "w-full",
                "max-w-3xl",
                "max-h-[90vh]",
                "overflow-y-auto",
                "shadow-xl",
                "relative",
                "p-6",
                "md:p-8",
              ].join(" ")}
            >
              <button
                onClick={() => setPreviewProduct(null)}
                className={[
                  "absolute",
                  "top-4",
                  "right-4",
                  "p-2",
                  "text-gray-400",
                  "hover:text-gray-600",
                  "hover:bg-gray-100",
                  "rounded-lg",
                  "transition-colors",
                ].join(" ")}
              >
                <X size={20} />
              </button>

              <div
                className={[
                  "flex",
                  "flex-col",
                  "md:flex-row",
                  "gap-8",
                  "items-start",
                  "mt-2",
                ].join(" ")}
              >
                <div
                  className={[
                    "w-full",
                    "md:w-1/2",
                    "flex",
                    "items-center",
                    "justify-center",
                    "bg-gray-50",
                    "rounded-2xl",
                    "p-6",
                    "md:p-8",
                    "border",
                    "border-gray-100/50",
                  ].join(" ")}
                >
                  <img
                    src={previewProduct.image}
                    alt={previewProduct.name}
                    className={[
                      "max-w-full",
                      "max-h-[300px]",
                      "object-contain",
                      "drop-shadow-sm",
                    ].join(" ")}
                  />
                </div>
                <div className={["w-full", "md:w-1/2", "space-y-4"].join(" ")}>
                  <h1
                    className={[
                      "text-2xl",
                      "font-bold",
                      "text-gray-900",
                      "pr-8",
                    ].join(" ")}
                  >
                    {previewProduct.name}
                  </h1>
                  <div
                    className={[
                      "flex",
                      "items-center",
                      "gap-3",
                      "text-sm",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "text-yellow-600",
                        "font-bold",
                        "bg-yellow-50",
                        "px-2",
                        "py-0.5",
                        "rounded-md",
                        "flex",
                        "items-center",
                        "gap-1",
                      ].join(" ")}
                    >
                      {Number(previewProduct.rating || 0).toFixed(1)}{" "}
                      <span className="text-yellow-500">{"\u2605"}</span>
                    </span>
                    <span className="text-gray-500">
                      | {previewProduct.sold ?? 0} sold
                    </span>
                    <span className={["text-gray-500", "capitalize"].join(" ")}>
                      | {previewProduct.category}
                    </span>
                  </div>
                  <h2
                    className={["text-xl", "font-bold", "text-[#007AFF]"].join(
                      " ",
                    )}
                  >
                    ₱{previewProduct.price.toLocaleString()}
                  </h2>
                  <p
                    className={[
                      "text-gray-600",
                      "text-sm",
                      "leading-relaxed",
                      "pt-1",
                    ].join(" ")}
                  >
                    {previewProduct.description || "No description provided."}
                  </p>
                  <div
                    className={[
                      "pt-4",
                      "mt-2",
                      "border-t",
                      "border-gray-100",
                    ].join(" ")}
                  >
                    <h3
                      className={[
                        "text-sm",
                        "font-semibold",
                        "text-gray-900",
                        "mb-3",
                      ].join(" ")}
                    >
                      Key Features:
                    </h3>
                    <ul className="space-y-2">
                      {(function () {
                        let features = [];
                        try {
                          features = previewProduct.features
                            ? JSON.parse(previewProduct.features)
                            : [];
                        } catch (e) {}
                        if (features.length === 0) {
                          features = [
                            "Premium quality",
                            "Guaranteed safe",
                            "Excellent value",
                          ];
                        }
                        return features.map((f: string, i: number) => (
                          <li
                            key={i}
                            className={[
                              "flex",
                              "items-center",
                              "gap-2",
                              "text-gray-600",
                              "text-sm",
                            ].join(" ")}
                          >
                            <div
                              className={[
                                "w-4",
                                "h-4",
                                "rounded-full",
                                "bg-green-50",
                                "flex",
                                "items-center",
                                "justify-center",
                                "flex-shrink-0",
                              ].join(" ")}
                            >
                              <span
                                className={[
                                  "text-green-500",
                                  "text-[10px]",
                                  "font-bold",
                                ].join(" ")}
                              >
                                ✓
                              </span>
                            </div>
                            {f}
                          </li>
                        ));
                      })()}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
