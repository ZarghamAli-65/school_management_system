import { API_URL, getAuthToken } from "./client";

export interface SubjectTeacher {
  teacherId: number;
  subjectId: number;
  assignedAt?: string;

  teacher?: {
    id: number;
    teacherId?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  description?: string;

  teachers?: SubjectTeacher[];

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubjectDto {
  code: string;
  name: string;
  description?: string;
  teacherIds?: number[];
}

export interface UpdateSubjectDto {
  code?: string;
  name?: string;
  description?: string;
  teacherIds?: number[];
}

// Get all subjects
export async function getSubjects(): Promise<Subject[]> {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/subjects`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!res.ok) {
    const text = await res.text();

    if (res.status === 401) {
      throw new Error("401 - Unauthorized. Please login again.");
    }

    throw new Error(`Status: ${res.status} - ${text}`);
  }

  return res.json();
}

// Get subject by id
export async function getSubject(id: number): Promise<Subject> {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/subjects/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

// Create subject
export async function createSubject(
  data: CreateSubjectDto
): Promise<Subject> {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/subjects`, {
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
      errorText =
        json.message || json.error || JSON.stringify(json);
    } catch {}

    throw new Error(
      `Server error (${res.status}): ${errorText}`
    );
  }

  return res.json();
}

// Update subject
export async function updateSubject(
  id: number,
  data: UpdateSubjectDto
): Promise<Subject> {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/subjects/${id}`, {
    method: "PATCH",
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

// Delete subject
export async function deleteSubject(id: number) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/subjects/${id}`, {
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