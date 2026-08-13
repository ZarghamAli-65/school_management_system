import { API_URL, getAuthToken } from "./client";

export type Day =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

export interface LessonSubject {
  id: number;
  code?: string;
  name: string;
}

export interface LessonClass {
  id: number;
  section?: string;
  grade: number;
  academicYear?: string;
  roomNo?: string;
  capacity: number;
  enrolledCount?: number;
  supervisor?: string;
  isActive?: boolean;
}

export interface LessonTeacher {
  id: number;
  teacherId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface Lesson {
  id: number;

  subjectId: number;
  classId: number;
  teacherId: number;

  subject?: LessonSubject;

  class?: LessonClass;

  teacher?: LessonTeacher;

  day: Day;

  startTime: string;
  endTime: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLessonDto {
  subjectId: number;
  classId: number;
  teacherId: number;
  day: Day;
  startTime: string;
  endTime: string;
}

export interface UpdateLessonDto {
  subjectId?: number;
  classId?: number;
  teacherId?: number;
  day?: Day;
  startTime?: string;
  endTime?: string;
}

// =========================
// Get All Class Schedules
// =========================

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
      throw new Error(
        "401 - Unauthorized. Please login again."
      );
    }

    throw new Error(
      `Status: ${res.status} - ${text}`
    );
  }

  return res.json();
}

// =========================
// Get Single Class Schedule
// =========================

export async function getLesson(
  id: number
): Promise<Lesson> {
  const token = getAuthToken();

  const res = await fetch(
    `${API_URL}/lessons/${id}`,
    {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
          ? `Bearer ${token}`
          : "",
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();

    if (res.status === 401) {
      throw new Error(
        "401 - Unauthorized. Please login again."
      );
    }

    if (res.status === 404) {
      throw new Error(
        `Class schedule with ID ${id} not found.`
      );
    }

    throw new Error(
      `Status: ${res.status} - ${text}`
    );
  }

  return res.json();
}

// =========================
// Create Class Schedule
// =========================

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

      errorText =
        json.message ||
        json.error ||
        JSON.stringify(json);
    } catch {}

    throw new Error(
      `Server error (${res.status}): ${errorText}`
    );
  }

  return res.json();
}

// =========================
// Update Class Schedule
// =========================

export async function updateLesson(
  id: number,
  data: UpdateLessonDto
): Promise<Lesson> {
  const token = getAuthToken();

  const res = await fetch(
    `${API_URL}/lessons/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
          ? `Bearer ${token}`
          : "",
      },
      body: JSON.stringify(data),
    }
  );

  if (!res.ok) {
    let errorText = await res.text();

    try {
      const json = JSON.parse(errorText);

      errorText =
        json.message ||
        json.error ||
        JSON.stringify(json);
    } catch {}

    throw new Error(
      `Server error (${res.status}): ${errorText}`
    );
  }

  return res.json();
}

// =========================
// Delete Class Schedule
// =========================

export async function deleteLesson(id: number) {
  const token = getAuthToken();

  const res = await fetch(
    `${API_URL}/lessons/${id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();

    throw new Error(
      `Status ${res.status}: ${text}`
    );
  }

  return res.json();
}