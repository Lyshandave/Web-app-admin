import { useEffect, useState, useRef, useMemo } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Pencil,
  Save,
  X,
  Camera,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function Profile() {
  const { state, dispatch } = useAdmin();
  const { profile } = state;
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const hasChanges = useMemo(() => {
    return (
      form.name !== profile.name ||
      form.email !== profile.email ||
      form.phone !== profile.phone ||
      avatar !== null
    );
  }, [form, profile, avatar]);

  useEffect(() => {
    if (!isEditing) {
      setForm({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      });
    }
  }, [profile, isEditing]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const nextProfile = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      avatar: avatar || profile.avatar,
    };
    try {
      const token = sessionStorage.getItem("adminToken");
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(nextProfile),
      });
      const saved = res.ok ? await res.json() : nextProfile;
      dispatch({ type: "UPDATE_PROFILE", profile: saved });
      setIsEditing(false);
      setAvatar(null);
    } catch {
      dispatch({ type: "UPDATE_PROFILE", profile: nextProfile });
      setIsEditing(false);
      setAvatar(null);
    }
  };

  const handleCancel = () => {
    setForm({ name: profile.name, email: profile.email, phone: profile.phone });
    setAvatar(null);
    setIsEditing(false);
  };

  return (
    <div className={["p-6", "space-y-6"].join(" ")}>
      {/* TOP ROW */}
      <div
        className={["grid", "grid-cols-1", "lg:grid-cols-2", "gap-6"].join(" ")}
      >
        {/* LEFT: Avatar + Stats */}
        <div className={["space-y-6"].join(" ")}>
          {/* Avatar Card */}
          <div
            className={[
              "bg-white",
              "rounded-2xl",
              "p-8",
              "shadow-sm",
              "border",
              "border-gray-100",
              "text-center",
            ].join(" ")}
          >
            <div className={["relative", "inline-block", "mx-auto"].join(" ")}>
              <div
                className={[
                  "w-24",
                  "h-24",
                  "rounded-full",
                  "bg-[#007AFF]",
                  "flex",
                  "items-center",
                  "justify-center",
                  "text-white",
                  "text-3xl",
                  "font-medium",
                  "mx-auto",
                  "cursor-pointer",
                  "hover:opacity-90",
                  "transition-opacity",
                  "shadow-lg",
                ].join(" ")}

                onClick={() => isEditing && fileRef.current?.click()}
              >
                {avatar ||
                profile.avatar?.startsWith("data:") ||
                profile.avatar?.startsWith("http") ? (
                  <img
                    src={avatar || profile.avatar}
                    alt="avatar"
                    className={[
                      "w-full",
                      "h-full",
                      "rounded-full",
                      "object-cover",
                    ].join(" ")}
                  />
                ) : (
                  profile.avatar
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => fileRef.current?.click()}
                  className={[
                    "absolute",
                    "bottom-0",
                    "right-0",
                    "w-8",
                    "h-8",
                    "bg-white",
                    "rounded-full",
                    "shadow-md",
                    "border",
                    "border-gray-200",
                    "flex",
                    "items-center",
                    "justify-center",
                    "hover:bg-gray-50",
                    "transition-colors",
                  ].join(" ")}
                >
                  <Camera size={14} className={["text-gray-600"].join(" ")} />
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className={["hidden"].join(" ")}
              />
            </div>

            <h2
              className={["text-lg", "font-bold", "text-gray-900", "mt-4"].join(
                " ",
              )}
            >
              {profile.name}
            </h2>
            <p className={["text-sm", "text-gray-400"].join(" ")}>
              {profile.role}
            </p>
            <p
              className={[
                "text-xs",
                "text-gray-400",
                "mt-1",
                "flex",
                "items-center",
                "justify-center",
                "gap-1",
              ].join(" ")}
            >
              <Calendar size={12} />
              Joined{" "}
              {new Date(profile.joined).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>

            {/* Buttons: Edit → Cancel only → Cancel + Save when changed */}
            <div
              className={[
                "flex",
                "items-center",
                "justify-center",
                "gap-3",
                "mt-5",
              ].join(" ")}
            >
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className={[
                    "h-10",
                    "px-6",
                    "bg-[#007AFF]",
                    "text-white",
                    "font-medium",
                    "rounded-xl",
                    "hover:bg-blue-600",
                    "transition-colors",
                    "flex",
                    "items-center",
                    "gap-2",
                    "text-sm",
                  ].join(" ")}
                >
                  <Pencil size={14} /> Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className={[
                      "h-10",
                      "px-6",
                      "bg-gray-100",
                      "text-gray-600",
                      "font-medium",
                      "rounded-xl",
                      "hover:bg-gray-200",
                      "transition-colors",
                      "flex",
                      "items-center",
                      "gap-2",
                      "text-sm",
                    ].join(" ")}
                  >
                    <X size={14} /> Cancel
                  </button>
                  {hasChanges && (
                    <button
                      onClick={handleSave}
                      className={[
                        "h-10",
                        "px-6",
                        "bg-[#007AFF]",
                        "text-white",
                        "font-medium",
                        "rounded-xl",
                        "hover:bg-blue-600",
                        "transition-colors",
                        "flex",
                        "items-center",
                        "gap-2",
                        "text-sm",
                      ].join(" ")}
                    >
                      <Save size={14} /> Save
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className={["grid", "grid-cols-3", "gap-4"].join(" ")}>
            <div
              className={[
                "bg-white",
                "rounded-2xl",
                "p-4",
                "shadow-sm",
                "border",
                "border-gray-100",
                "text-center",
              ].join(" ")}
            >
              <p
                className={["text-xl", "font-bold", "text-gray-900"].join(" ")}
              >
                {state.orders.length}
              </p>
              <p className={["text-xs", "text-gray-400", "mt-0.5"].join(" ")}>
                Orders
              </p>
            </div>
            <div
              className={[
                "bg-white",
                "rounded-2xl",
                "p-4",
                "shadow-sm",
                "border",
                "border-gray-100",
                "text-center",
              ].join(" ")}
            >
              <p
                className={["text-xl", "font-bold", "text-gray-900"].join(" ")}
              >
                {state.customers.length}
              </p>
              <p className={["text-xs", "text-gray-400", "mt-0.5"].join(" ")}>
                Customers
              </p>
            </div>
            <div
              className={[
                "bg-white",
                "rounded-2xl",
                "p-4",
                "shadow-sm",
                "border",
                "border-gray-100",
                "text-center",
              ].join(" ")}
            >
              <p
                className={["text-xl", "font-bold", "text-gray-900"].join(" ")}
              >
                {state.products.length}
              </p>
              <p className={["text-xs", "text-gray-400", "mt-0.5"].join(" ")}>
                Products
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Account Information */}
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
            Account Information
          </h3>
          <div className={["space-y-4"].join(" ")}>
            <div>
              <label
                className={[
                  "text-xs",
                  "text-gray-500",
                  "mb-2",
                  "flex",
                  "items-center",
                  "gap-1.5",
                ].join(" ")}
              >
                <User size={12} /> Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
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
              ) : (
                <div
                  className={[
                    "w-full",
                    "h-10",
                    "bg-gray-50",
                    "rounded-xl",
                    "px-4",
                    "flex",
                    "items-center",
                    "text-sm",
                    "font-medium",
                    "text-gray-900",
                  ].join(" ")}
                >
                  {profile.name}
                </div>
              )}
            </div>
            <div>
              <label
                className={[
                  "text-xs",
                  "text-gray-500",
                  "mb-2",
                  "flex",
                  "items-center",
                  "gap-1.5",
                ].join(" ")}
              >
                <Mail size={12} /> Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              ) : (
                <div
                  className={[
                    "w-full",
                    "h-10",
                    "bg-gray-50",
                    "rounded-xl",
                    "px-4",
                    "flex",
                    "items-center",
                    "text-sm",
                    "font-medium",
                    "text-gray-900",
                  ].join(" ")}
                >
                  {profile.email}
                </div>
              )}
            </div>
            <div>
              <label
                className={[
                  "text-xs",
                  "text-gray-500",
                  "mb-2",
                  "flex",
                  "items-center",
                  "gap-1.5",
                ].join(" ")}
              >
                <Phone size={12} /> Phone Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
              ) : (
                <div
                  className={[
                    "w-full",
                    "h-10",
                    "bg-gray-50",
                    "rounded-xl",
                    "px-4",
                    "flex",
                    "items-center",
                    "text-sm",
                    "font-medium",
                    "text-gray-900",
                  ].join(" ")}
                >
                  {profile.phone}
                </div>
              )}
            </div>
            <div>
              <label
                className={[
                  "text-xs",
                  "text-gray-500",
                  "mb-2",
                  "flex",
                  "items-center",
                  "gap-1.5",
                ].join(" ")}
              >
                <Shield size={12} /> Role
              </label>
              <div
                className={[
                  "w-full",
                  "h-10",
                  "bg-gray-50",
                  "rounded-xl",
                  "px-4",
                  "flex",
                  "items-center",
                  "text-sm",
                  "font-medium",
                  "text-gray-900",
                ].join(" ")}
              >
                {profile.role}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
