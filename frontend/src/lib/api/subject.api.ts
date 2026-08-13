import { API_URL, getAuthToken } from "./client";

// =========================
// Teacher Relation
// =========================

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

// =========================
// Subject Relations
// =========================

export interface SubjectClassSchedule {
  id: number;
  subjectId: number;
  classId: number;
  teacherId: number;
  day: string;
  startTime: string;
  endTime: string;
}

export interface SubjectExam {
  id: number;
  title: string;
  subjectId: number;
  classId: number;
  teacherId: number;
  examDate: string;
  totalMarks: number;
  passingMarks: number;
  status?: string;
}

export interface SubjectAssignment {
  id: number;
  title: string;
  description?: string;
  subjectId: number;
  classId: number;
  teacherId: number;
  dueDate: string;
}

export interface SubjectResult {
  id: number;
  studentId: number;
  subjectId: number;
  classId: number;
  teacherId: number;
  type: string;
  obtainedMarks: number;
  remarks?: string;
}

// =========================
// Subject
// =========================

export interface Subject {
  id: number;

  code: string;
  name: string;
  shortName?: string;
  description?: string;
  gradeLevel?: string;
  category?: string;

  teachers?: SubjectTeacher[];

  classSchedules?: SubjectClassSchedule[];
  exams?: SubjectExam[];
  assignments?: SubjectAssignment[];
  results?: SubjectResult[];

  deletedAt?: string;

  createdAt?: string;
  updatedAt?: string;
}

// =========================
// Create DTO
// =========================

export interface CreateSubjectDto {
  code: string;
  name: string;

  shortName?: string;
  description?: string;
  gradeLevel?: string;
  category?: string;

  teacherIds?: number[];
}

// =========================
// Update DTO
// =========================

export interface UpdateSubjectDto {
  code?: string;
  name?: string;

  shortName?: string;
  description?: string;
  gradeLevel?: string;
  category?: string;

  teacherIds?: number[];
}

// =========================
// Headers
// =========================

const getHeaders = () => {
  const token = getAuthToken();

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// =========================
// Get All Subjects
// =========================

export async function getSubjects(): Promise<Subject[]> {
  const res = await fetch(`${API_URL}/subjects`, {
    cache: "no-store",
    headers: getHeaders(),
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
// Get Single Subject
// =========================

export async function getSubject(
  id: number
): Promise<Subject> {
  const res = await fetch(
    `${API_URL}/subjects/${id}`,
    {
      cache: "no-store",
      headers: getHeaders(),
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
        `Subject with ID ${id} not found.`
      );
    }

    throw new Error(
      `Status: ${res.status} - ${text}`
    );
  }

  return res.json();
}

// =========================
// Create Subject
// =========================

export async function createSubject(
  data: CreateSubjectDto
): Promise<Subject> {
  const res = await fetch(
    `${API_URL}/subjects`,
    {
      method: "POST",
      headers: getHeaders(),
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
// Update Subject
// =========================

export async function updateSubject(
  id: number,
  data: UpdateSubjectDto
): Promise<Subject> {
  const res = await fetch(
    `${API_URL}/subjects/${id}`,
    {
      method: "PATCH",
      headers: getHeaders(),
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
// Delete Subject
// =========================

export async function deleteSubject(
  id: number
) {
  const res = await fetch(
    `${API_URL}/subjects/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(),
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