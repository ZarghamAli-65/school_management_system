import { API_URL, getAuthToken } from "./client";

// get all students
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
    console.log("Error response:", text);

    if (res.status === 401) {
      throw new Error("401 - Unauthorized. Please login again.");
    }

    throw new Error(`Status: ${res.status} - ${text}`);
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

// Update Student
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



// delete student by id
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