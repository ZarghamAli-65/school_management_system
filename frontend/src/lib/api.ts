const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  // console.log(API_URL);

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

// Helper function to get auth token
const getAuthToken = () => {
  // Try localStorage first
  const token = localStorage.getItem("accessToken");
  if (token) return token;
  
  // Fallback to cookie
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'accessToken') {
      return value;
    }
  }
  return null;
};

// get all students
export async function getStudents() {
  const token = getAuthToken();
  
  const res = await fetch(`${API_URL}/students`, {
    cache: "no-store",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.log("Error response:", text);
    
    if (res.status === 401) {
      throw new Error("401 - Unauthorized. Please login again.");
    }
    
    throw new Error(`Status: ${res.status} - ${text}`);
  }

  return res.json();
}

// delete student by id
export async function deleteStudent(id: number) {
  const token = getAuthToken();
  
  const res = await fetch(`${API_URL}/students/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Status: ${res.status} - ${text}`);
  }

  return res.json();
}