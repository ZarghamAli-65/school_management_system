// assignment.ts
import { API_URL, getAuthToken } from "./client";

// ---------- Types ----------
export interface Assignment {
  id: number;
  title: string;
  description?: string;
  subjectId: number;
  classId: number;
  teacherId: number;
  dueDate: string;        // ISO date string
  createdAt: string;
  updatedAt: string;
  // Optional relations (if included)
  subject?: any;
  class?: any;
  teacher?: any;
  results?: any[];
}

export type CreateAssignmentData = {
  title: string;
  description?: string;
  subjectId: number;
  classId: number;
  teacherId: number;
  dueDate: string;        // e.g. "2026-08-10T14:30:00Z"
};

export type UpdateAssignmentData = Partial<CreateAssignmentData>;

// ---------- API Functions ----------

// Get all assignments
export async function getAssignments() {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/assignments`, {
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

// Get a single assignment by ID
export async function getAssignment(id: number) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/assignments/${id}`, {
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
      throw new Error(`Assignment with ID ${id} not found`);
    }

    throw new Error(`Status: ${res.status} - ${text}`);
  }

  return res.json();
}

// Create a new assignment
export async function createAssignment(data: CreateAssignmentData) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/assignments`, {
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

// Update an existing assignment (uses PATCH to match the NestJS controller)
export async function updateAssignment(id: number, data: UpdateAssignmentData) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/assignments/${id}`, {
    method: "PATCH",                // as defined in the controller
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

// Delete an assignment by ID
export async function deleteAssignment(id: number) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/assignments/${id}`, {
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

  return res.json();   // returns 204 No Content, but the backend may send an empty object
}