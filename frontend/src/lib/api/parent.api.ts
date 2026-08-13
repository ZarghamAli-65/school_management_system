import { API_URL, getAuthToken } from "./client";

export type ParentGender = "MALE" | "FEMALE" | "OTHER";
export type ParentMaritalStatus = "SINGLE" | "MARRIED";

export interface ParentData {
  username?: string;
  email?: string;
  password?: string;

  firstName: string;
  lastName: string;
  photo?: string;

  gender?: ParentGender;
  dateOfBirth?: string;
  bloodType?: string;
  nationality?: string;
  maritalStatus?: ParentMaritalStatus;

  phone?: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  postalCode?: string;

  cnic?: string;

  qualification?: string;

  occupation?: string;
  employer?: string;
  jobTitle?: string;
}

// Get all parents
export async function getParents() {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/parents`, {
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

// Get a single parent by ID
export async function getParent(id: number) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/parents/${id}`, {
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
      throw new Error(`Parent with ID ${id} not found`);
    }

    throw new Error(`Status: ${res.status} - ${text}`);
  }

  return res.json();
}

// Create a new parent
export async function createParent(data: ParentData) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/parents`, {
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
      // Keep raw text
    }

    throw new Error(`Server error (${res.status}): ${errorText}`);
  }

  return res.json();
}

// Update an existing parent
export async function updateParent(
  id: number,
  data: Partial<ParentData>,
) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/parents/${id}`, {
    method: "PUT",
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
      // Keep raw text
    }

    throw new Error(`Server error (${res.status}): ${errorText}`);
  }

  return res.json();
}

// Delete a parent by ID
export async function deleteParent(id: number) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/parents/${id}`, {
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