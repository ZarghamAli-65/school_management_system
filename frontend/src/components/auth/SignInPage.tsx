"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/api/auth.api";
import { useNotification } from "@/components/NotificationProvider";

export default function SignInForm() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login({ email, password });

      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("user", JSON.stringify(result.user));
      document.cookie = `accessToken=${result.accessToken}; path=/`;
      document.cookie = `role=${result.user.role}; path=/`;

      showNotification(`Welcome ${result.user.name}!`, "success");

      setTimeout(() => {
        switch (result.user.role) {
          case "ADMIN":
            router.push("/admin");
            break;
          case "TEACHER":
            router.push("/teacher");
            break;
          case "STUDENT":
            router.push("/student");
            break;
          case "PARENT":
            router.push("/parent");
            break;
          default:
            router.push("/");
        }
      }, 1500);
    } catch (error) {
      console.error(error);
      showNotification("Invalid email or password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-gray-200 flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-center text-gray-900">
        <span className="text-purple-400">Welcome back</span>
        <br />
        Z-School Portal
      </h1>

      <p className="text-sm leading-6 text-gray-500 text-center">
        Access to vast collection of resources, and stay updated
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-200"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 pr-12 text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <span className="text-xl">📖</span>
              ) : (
                <span className="text-xl">📕</span>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-purple-400 py-3 text-white font-semibold shadow-lg transition-all duration-300 hover:bg-purple-500 hover:-translate-y-0.5 hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Forget Your Password ?{" "}
        <Link
          href="/sign-up"
          className="inline-flex items-center justify-center gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-sky-300"
        >
          Contact Support
        </Link>
      </p>
    </div>
  );
}
