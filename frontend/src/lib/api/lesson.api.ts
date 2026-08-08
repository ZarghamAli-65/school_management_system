import { API_URL, getAuthToken } from "./client";

export interface Lesson {
  id: number;
  subjectId: number;
  classId: number;
  teacherId: number;
  day:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY";
  startTime: string;
  endTime: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLessonDto {
  subjectId: number;
  classId: number;
  teacherId: number;
  day:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY";
  startTime: string;
  endTime: string;
}

export interface UpdateLessonDto {
  subjectId?: number;
  classId?: number;
  teacherId?: number;
  day?:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY";
  startTime?: string;
  endTime?: string;
}

// Get all lessons
export async function getLessons(): Promise<Lesson[]> {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/lessons`, {
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

// Get lesson by id
export async function getLesson(id: number): Promise<Lesson> {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/lessons/${id}`, {
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

// Create lesson
export async function createLesson(
  data: CreateLessonDto
): Promise<Lesson> {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/lessons`, {
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
    } catch {}

    throw new Error(`Server error (${res.status}): ${errorText}`);
  }

  return res.json();
}

// Update lesson
export async function updateLesson(
  id: number,
  data: UpdateLessonDto
): Promise<Lesson> {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/lessons/${id}`, {
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

// Delete lesson
export async function deleteLesson(id: number) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/lessons/${id}`, {
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