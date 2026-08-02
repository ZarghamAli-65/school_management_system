"use client";

import { useRouter } from "next/navigation";
import { useNotification } from "@/components/NotificationProvider";
import { logout as logoutApi } from "@/lib/api/auth.api";

export default function LogoutButton() {
  const router = useRouter();
  const { showNotification } = useNotification();

  const handleLogout = () => {
    logoutApi(); // Clears tokens & cookies
    showNotification("Logged out successfully", "success");
    setTimeout(() => router.push("/sign-in"), 1500);
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      Logout
    </button>
  );
}
