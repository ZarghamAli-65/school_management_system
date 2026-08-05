// api/classes.ts
import { API_URL, getAuthToken } from "./client";

// Get all classes
export async function getClasses() {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/classes`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
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

// Get a single class by ID
export async function getClass(id: number) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/classes/${id}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Error response:", text);

    if (res.status === 401) {
      throw new Error("401 - Unauthorized. Please login again.");
    }
    if (res.status === 404) {
      throw new Error(`Class with ID ${id} not found`);
    }

    throw new Error(`Status: ${res.status} - ${text}`);
  }

  return res.json();
}

// Create a new class
export async function createClass(data: {
  name: string;
  capacity: number;
  grade: number;
  supervisor: string;
  // optional relations if needed
  studentIds?: number[];
  teacherIds?: number[];
  lessonIds?: number[];
}) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/classes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorText = await res.text();
    try {
      const json = JSON.parse(errorText);
      errorText = json.message || json.error || JSON.stringify(json);
    } catch {
      // not JSON, keep raw text
    }
    throw new Error(`Server error (${res.status}): ${errorText}`);
  }

  return res.json();
}

// Update an existing class
export async function updateClass(id: number, data: {
  name?: string;
  capacity?: number;
  grade?: number;
  supervisor?: string;
  studentIds?: number[];
  teacherIds?: number[];
  lessonIds?: number[];
}) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/classes/${id}`, {
    method: "PUT", // same as parents – adjust if your backend uses PATCH
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorText = await res.text();
    try {
      const json = JSON.parse(errorText);
      errorText = json.message || json.error || JSON.stringify(json);
    } catch {
      // not JSON
    }
    throw new Error(`Server error (${res.status}): ${errorText}`);
  }

  return res.json();
}

// Delete a class by ID
export async function deleteClass(id: number) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/classes/${id}`, {
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