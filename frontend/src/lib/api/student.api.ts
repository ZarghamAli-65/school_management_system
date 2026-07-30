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


// create student
export async function createStudent(data: {
  studentId: string;
  name: string;
  email: string;
  grade: number;
  phone?: string;
  address?: string;
  photo?: string;
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
    const text = await res.text();
    throw new Error(`Status: ${res.status} - ${text}`);
  }

  return res.json();
}


// update student
export async function updateStudent(id: number, data: any) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/students/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Status: ${res.status} - ${text}`);
  }

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
    throw new Error(`Status: ${res.status} - ${text}`);
  }

  return res.json();
}