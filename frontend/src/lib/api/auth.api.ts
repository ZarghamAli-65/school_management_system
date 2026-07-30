import { API_URL } from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export async function login(
  credentials: LoginRequest
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
}

//logout funtion
export async function logout() {
  // Clear local storage
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  // Clear cookies
  document.cookie = "accessToken=; path=/; max-age=0";
  document.cookie = "role=; path=/; max-age=0";
  // Redirect to sign‑in (use router in a client component, or window.location)
  window.location.href = "/sign-in";
}
