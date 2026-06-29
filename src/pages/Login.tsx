import { useState } from "react";
import { Droplets, Eye, EyeOff } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function Login() {
  const { dispatch } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSplitting, setIsSplitting] = useState(false);

  const handleSignIn = async () => {
    let hasError = false;
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Please enter your email");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Please enter your password");
      hasError = true;
    }

    if (hasError) return;

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setPasswordError("Invalid email or password");
        return;
      }

      const data = await res.json();
      if (data.profile)
        dispatch({ type: "UPDATE_PROFILE", profile: data.profile });

      setIsSplitting(true);
      setTimeout(() => {
        dispatch({ type: "LOGIN", token: data.token });
      }, 700);
    } catch {
      setPasswordError("Unable to sign in right now");
    }
  };

  return (
    <div
      className={[
        "h-screen",
        "w-full",
        "bg-white",
        "relative",
        "overflow-hidden",
      ].join(" ")}
    >
      {/* LEFT: Video */}
      <div
        className={`hidden lg:block absolute top-0 left-0 w-1/2 h-full transition-transform duration-700 ease-in-out ${
          isSplitting ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className={[
            "absolute",
            "inset-0",
            "w-full",
            "h-full",
            "object-cover",
          ].join(" ")}
        >
          <source src="/videos/water-hero.mp4" type="video/mp4" />
        </video>

        {/* Light gradient at bottom for text readability */}
        <div
          className={[
            "absolute",
            "bottom-0",
            "left-0",
            "right-0",
            "h-48",
            "bg-gradient-to-t",
            "from-white/80",
            "via-white/40",
            "to-transparent",
          ].join(" ")}
        />

        {/* Text at bottom of video — NO "Pure Safe", only Admin Dashboard + tagline */}
        <div
          className={[
            "absolute",
            "bottom-0",
            "left-0",
            "right-0",
            "z-10",
            "px-8",
            "pb-14",
            "text-center",
          ].join(" ")}
        >
          <p
            className={[
              "text-xl",
              "text-gray-800",
              "font-semibold",
              "tracking-wide",
            ].join(" ")}
            style={{ textShadow: "0 1px 3px rgba(255,255,255,0.9)" }}
          >
            Admin Dashboard
          </p>
          <p
            className={["text-sm", "text-gray-600", "mt-2"].join(" ")}
            style={{ textShadow: "0 1px 2px rgba(255,255,255,0.8)" }}
          >
            Manage your water refilling station with ease
          </p>
        </div>
      </div>

      {/* RIGHT: Sign In Form */}
      <div
        className={`absolute top-0 right-0 w-full lg:w-1/2 h-full flex items-center justify-center p-6 bg-white transition-transform duration-700 ease-in-out ${
          isSplitting ? "translate-x-full" : "translate-x-0"
        }`}
      >
        <div
          className={["w-full", "max-w-sm"].join(" ")}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSignIn();
          }}
        >
          {/* Logo + Pure Safe */}
          <div
            className={["flex", "flex-col", "items-center", "mb-8"].join(" ")}
          >
            <div
              className={[
                "w-14",
                "h-14",
                "rounded-xl",
                "bg-gradient-to-br",
                "from-[#007AFF]",
                "to-[#0055CC]",
                "flex",
                "items-center",
                "justify-center",
                "mb-3",
                "shadow-lg",
                "shadow-blue-500/20",
              ].join(" ")}
            >
              <Droplets size={28} className={["text-white"].join(" ")} />
            </div>
            <h1 className={["text-xl", "font-bold", "text-gray-900"].join(" ")}>
              Pure Safe
            </h1>
          </div>

          <h2
            className={["text-2xl", "font-bold", "text-gray-900", "mb-1"].join(
              " ",
            )}
          >
            Sign In
          </h2>
          <p className={["text-sm", "text-gray-400", "mb-8"].join(" ")}>
            Enter your credentials to access the admin panel
          </p>

          {/* Email */}
          <div className={["mb-5"].join(" ")}>
            <label
              className={[
                "text-sm",
                "font-semibold",
                "text-gray-700",
                "mb-1.5",
                "block",
              ].join(" ")}
            >
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              className={[
                "w-full",
                "h-12",
                "border-2",
                "border-gray-200",
                "rounded-xl",
                "px-4",
                "outline-none",
                "focus:border-[#007AFF]",
                "text-sm",
                "transition-all",
              ].join(" ")}
            />

            {emailError && (
              <p
                className={["text-xs", "text-red-500", "mt-1.5", "ml-1"].join(
                  " ",
                )}
              >
                {emailError}
              </p>
            )}
          </div>

          {/* Password */}
          <div className={["mb-6"].join(" ")}>
            <label
              className={[
                "text-sm",
                "font-semibold",
                "text-gray-700",
                "mb-1.5",
                "block",
              ].join(" ")}
            >
              Password
            </label>
            <div className={["relative"].join(" ")}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                className={[
                  "w-full",
                  "h-12",
                  "border-2",
                  "border-gray-200",
                  "rounded-xl",
                  "px-4",
                  "outline-none",
                  "focus:border-[#007AFF]",
                  "text-sm",
                  "transition-all",
                  "pr-12",
                ].join(" ")}
              />

              {password.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={[
                    "absolute",
                    "right-3",
                    "top-1/2",
                    "-translate-y-1/2",
                    "w-8",
                    "h-8",
                    "flex",
                    "items-center",
                    "justify-center",
                    "text-gray-400",
                    "hover:text-gray-600",
                    "transition-colors",
                  ].join(" ")}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            </div>
            {passwordError && (
              <p
                className={["text-xs", "text-red-500", "mt-1.5", "ml-1"].join(
                  " ",
                )}
              >
                {passwordError}
              </p>
            )}
          </div>

          {/* Sign In button */}
          <button
            onClick={handleSignIn}
            className={[
              "w-full",
              "h-12",
              "bg-[#007AFF]",
              "text-white",
              "font-semibold",
              "rounded-xl",
              "shadow-lg",
              "shadow-blue-500/25",
              "hover:bg-blue-600",
              "transition-colors",
              "active:scale-[0.98]",
            ].join(" ")}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
