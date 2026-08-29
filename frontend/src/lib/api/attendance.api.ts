import { API_URL, getAuthToken } from "./client";

export type StudentAttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LEAVE";

export type TeacherAttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "HALF_DAY"
  | "LEAVE";

export interface MarkStudentAttendanceItem {
  studentId: number;
  status: StudentAttendanceStatus;
  remarks?: string;
}

export interface MarkStudentAttendancePayload {
  classId: number;
  date: string;
  students: MarkStudentAttendanceItem[];
}

export interface MarkTeacherAttendancePayload {
  teacherId: number;
  date: string;
  status: TeacherAttendanceStatus;
  remarks?: string;
}

export interface AttendanceQuery {
  classId?: number;
  studentId?: number;
  teacherId?: number;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}

async function request(
  url: string,
  options: RequestInit = {},
) {
  const token = getAuthToken();

  const res = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();

    let message = "Attendance request failed";

    try {
      const errorData = JSON.parse(text);

      if (Array.isArray(errorData?.message)) {
        message = errorData.message.join(", ");
      } else if (errorData?.message) {
        message = errorData.message;
      } else if (text) {
        message = text;
      }
    } catch {
      if (text) {
        message = text;
      }
    }

    throw new Error(message);
  }

  return res.json();
}

// ============================================================
// MARK STUDENT ATTENDANCE
//
// ADMIN  -> allowed
// TEACHER -> allowed for assigned classes
// STUDENT -> blocked by backend
// PARENT  -> blocked by backend
// ============================================================

export async function markStudentAttendance(
  payload: MarkStudentAttendancePayload,
) {
  return request(`${API_URL}/attendance/students/mark`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ============================================================
// MARK TEACHER ATTENDANCE
//
// ADMIN -> allowed
// TEACHER -> blocked by backend
// STUDENT -> blocked by backend
// PARENT -> blocked by backend
// ============================================================

export async function markTeacherAttendance(
  payload: MarkTeacherAttendancePayload,
) {
  return request(`${API_URL}/attendance/teachers/mark`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ============================================================
// GET STUDENT ATTENDANCE
//
// ADMIN   -> all / filtered attendance
// TEACHER -> assigned classes only
// STUDENT -> own attendance
// PARENT  -> children's attendance
// ============================================================

export async function getStudentAttendance(
  query: AttendanceQuery = {},
) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();

  return request(
    `${API_URL}/attendance/students${
      queryString ? `?${queryString}` : ""
    }`,
  );
}

// ============================================================
// GET TEACHER ATTENDANCE
//
// ADMIN   -> all teacher attendance
// TEACHER -> own attendance only
// STUDENT -> blocked by backend
// PARENT  -> blocked by backend
// ============================================================

export async function getTeacherAttendance(
  query: AttendanceQuery = {},
) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();

  return request(
    `${API_URL}/attendance/teachers${
      queryString ? `?${queryString}` : ""
    }`,
  );
}