import { API_URL, getAuthToken } from "./client";

export interface ClassPayload {
  name: string;
  capacity: number;
  grade: number;
  supervisor: string;
  studentIds?: number[];
  teacherIds?: number[];
  lessonIds?: number[];
}

const getHeaders = () => {
  const token = getAuthToken();

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// =========================
// Get All Classes
// =========================
export async function getClasses() {
  const res = await fetch(`${API_URL}/classes`, {
    cache: "no-store",
    headers: getHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();

    console.error("Error response:", text);

    if (res.status === 401) {
      throw new Error("401 - Unauthorized. Please login again.");
    }

    throw new Error(`Status: ${res.status} - ${text}`);
  }

  return res.json();
}

// =========================
// Get Single Class
// =========================
export async function getClass(id: number) {
  const res = await fetch(`${API_URL}/classes/${id}`, {
    cache: "no-store",
    headers: getHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();

    console.error("Error response:", text);

    if (res.status === 401) {
      throw new Error("401 - Unauthorized. Please login again.");
    }

    if (res.status === 404) {
      throw new Error(`Class with ID ${id} not found.`);
    }

    throw new Error(`Status: ${res.status} - ${text}`);
  }

  return res.json();
}

// =========================
// Create Class
// =========================
export async function createClass(data: ClassPayload) {
  const res = await fetch(`${API_URL}/classes`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorText = await res.text();

    try {
      const json = JSON.parse(errorText);
      errorText = json.message || json.error || JSON.stringify(json);
    } catch {}

    throw new Error(`Server error (${res.status}): ${errorText}`);
  }

  return res.json();
}

// =========================
// Update Class
// =========================
export async function updateClass(
  id: number,
  data: Partial<ClassPayload>
) {
  const res = await fetch(`${API_URL}/classes/${id}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorText = await res.text();

    try {
      const json = JSON.parse(errorText);
      errorText = json.message || json.error || JSON.stringify(json);
    } catch {}

    throw new Error(`Server error (${res.status}): ${errorText}`);
  }

  return res.json();
}

// =========================
// Delete Class
// =========================
export async function deleteClass(id: number) {
  const res = await fetch(`${API_URL}/classes/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Status ${res.status}: ${text}`);
  }

  return res.json();
}