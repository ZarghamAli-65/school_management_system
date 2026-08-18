import { API_URL } from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
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

  const { accessToken, user } = data;

  // Store authentication data
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("user", JSON.stringify(user));

  // Middleware uses these cookies for route protection
  document.cookie = `accessToken=${accessToken}; path=/;`;
  document.cookie = `role=${user.role}; path=/;`;

  return data;
}

// Logout
export async function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");

  document.cookie = "accessToken=; path=/; max-age=0";
  document.cookie = "role=; path=/; max-age=0";

  window.location.href = "/sign-in";
}