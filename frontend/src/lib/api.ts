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


const getAuthToken = () => {
  const token = localStorage.getItem("accessToken");
  if (token) return token;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "accessToken") return value;
  }
  return null;
};

// ---------- STUDENTS ----------
export async function getStudents() {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/students`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Status ${res.status}: ${text}`);
  }
  return res.json();
}

export async function deleteStudent(id: number) {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/students/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Status ${res.status}: ${text}`);
  }
  return res.json();
}

export async function createStudent(data: {
  studentId: string;
  name: string;
  email: string;
  photo?: string;
  phone?: string;
  grade: number;
  address: string;
  classId?: number;
}) {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/students`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    // Try to parse JSON error, else fallback to text
    let errorText = await res.text();
    try {
      const json = JSON.parse(errorText);
      errorText = json.message || json.error || JSON.stringify(json);
    } catch (e) {
      // if not JSON, use raw text
    }
    throw new Error(`Server error (${res.status}): ${errorText}`);
  }
  return res.json();
}

export async function updateStudent(id: number, data: any) {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/students/${id}`, {
    method: 'PUT', // or PATCH
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ---------- GENERIC DELETE (for all tables) ----------
export async function deleteResource(table: string, id: number) {
  const token = getAuthToken();
  const endpoints: Record<string, string> = {
    student: "/students",
    teacher: "/teachers",
    parent: "/parents",
    subject: "/subjects",
    class: "/classes",
    lesson: "/lessons",
    exam: "/exams",
    assignment: "/assignments",
    result: "/results",
    attendance: "/attendances",
    event: "/events",
    announcement: "/announcements",
  };
  const endpoint = endpoints[table];
  if (!endpoint) throw new Error(`Unknown table: ${table}`);

  const res = await fetch(`${API_URL}${endpoint}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Status ${res.status}: ${text}`);
  }
  return res.json();
}



export async function getClasses() {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/classes`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch classes: ${res.status} - ${text}`);
  }
  return res.json();
}