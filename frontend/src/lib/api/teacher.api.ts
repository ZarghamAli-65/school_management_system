import { API_URL, getAuthToken } from "./client";

// Get all teachers
export async function getTeachers() {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/teachers`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
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

// Create teacher
export async function createTeacher(data: {
  teacherId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  bloodType: string;
  birthday: string;
  gender: "MALE" | "FEMALE";
  photo?: string;
}) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/teachers`, {
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
      // Ignore if not JSON
    }

    throw new Error(`Server error (${res.status}): ${errorText}`);
  }

  return res.json();
}

// Update teacher
export async function updateTeacher(id: number, data: any) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/teachers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

// Delete teacher
export async function deleteTeacher(id: number) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/teachers/${id}`, {
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