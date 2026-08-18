import { API_URL, getAuthToken } from "./client";

export type StudentAttendanceStatus = "PRESENT" | "ABSENT" | "LEAVE";
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
    throw new Error(text || "Attendance request failed");
  }

  return res.json();
}

export async function markStudentAttendance(
  payload: MarkStudentAttendancePayload,
) {
  return request(`${API_URL}/attendance/students/mark`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function markTeacherAttendance(
  payload: MarkTeacherAttendancePayload,
) {
  return request(`${API_URL}/attendance/teachers/mark`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

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
    `${API_URL}/attendance/students${queryString ? `?${queryString}` : ""}`,
  );
}

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
    `${API_URL}/attendance/teachers${queryString ? `?${queryString}` : ""}`,
  );
}