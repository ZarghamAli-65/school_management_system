import { API_URL, getAuthToken } from "./client";

export type StudentPayload = {
  studentId: string;
  email: string;
  password?: string;
  username?: string;

  firstName: string;
  lastName: string;
  fatherName: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth?: string;
  bloodType?: string;
  placeOfBirth?: string;
  nationality?: string;
  religion?: string;
  language?: string;

  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  photo?: string;

  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;

  classId?: number;
  section?: string;
  rollNumber?: number;
  academicYear?: string;

  enrollmentDate?: string;
  admissionYear?: number;
  previousSchool?: string;
  status?:
    | "ACTIVE"
    | "GRADUATED"
    | "TRANSFERRED"
    | "WITHDRAWN"
    | "SUSPENDED";

  parentId?: number;
  guardianRelation?:
    | "FATHER"
    | "MOTHER"
    | "GUARDIAN"
    | "OTHER";
};

// Get all students
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
      throw new Error(
        "401 - Unauthorized. Please login again."
      );
    }

    throw new Error(`Status: ${res.status} - ${text}`);
  }

  return res.json();
}

// Create student
export async function createStudent(
  data: StudentPayload
) {
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
    let errorText = await res.text();

    try {
      const json = JSON.parse(errorText);

      errorText =
        json.message ||
        json.error ||
        JSON.stringify(json);
    } catch {
      // Keep raw response
    }

    throw new Error(
      `Server error (${res.status}): ${errorText}`
    );
  }

  return res.json();
}

// Update student
export async function updateStudent(
  id: number,
  data: Partial<StudentPayload>
) {
  const token = getAuthToken();

  const res = await fetch(
    `${API_URL}/students/${id}`,
    {
      method: "PUT",
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
    } catch {
      // Keep raw response
    }

    throw new Error(
      `Server error (${res.status}): ${errorText}`
    );
  }

  return res.json();
}

// Delete student
export async function deleteStudent(id: number) {
  const token = getAuthToken();

  const res = await fetch(
    `${API_URL}/students/${id}`,
    {
      method: "DELETE",
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

    throw new Error(
      `Status ${res.status}: ${text}`
    );
  }

  return res.json();
}

