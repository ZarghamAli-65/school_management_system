import { API_URL, getAuthToken } from "./client";

export type TeacherPayload = {
  teacherId: string;
  employeeId?: string;
  email: string;
  username?: string;
  password?: string;

  firstName?: string;
  lastName?: string;
  fatherHusbandName?: string;
  photo?: string;

  phone?: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;

  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  maritalStatus?: "SINGLE" | "MARRIED";
  bloodType?: string;
  nationality?: string;

  nationalId?: string;
  passportNo?: string;

  joiningDate?: string;
  employmentType?: "FULL_TIME" | "CONTRACT" | "INTERN";
  employmentStatus?:
    | "ACTIVE"
    | "ON_LEAVE"
    | "RESIGNED"
    | "TERMINATED"
    | "RETIRED";

  designation?: string;

  latestQualification?: string;
  specialization?: string;
  experienceYears?: number;
  experienceField?: string;
  bio?: string;

  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;

  isActive?: boolean;
};

// Get all teachers
export async function getTeachers() {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/teachers`, {
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

// Create teacher
export async function createTeacher(data: TeacherPayload) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/teachers`, {
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
    } catch {
      // Ignore if not JSON
    }

    throw new Error(`Server error (${res.status}): ${errorText}`);
  }

  return res.json();
}

// Update teacher
export async function updateTeacher(
  id: number,
  data: Partial<TeacherPayload>,
) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/teachers/${id}`, {
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
      errorText =
        json.message || json.error || JSON.stringify(json);
    } catch {
      // Ignore if not JSON
    }

    throw new Error(`Server error (${res.status}): ${errorText}`);
  }

  return res.json();
}

// Delete teacher
export async function deleteTeacher(id: number) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/teachers/${id}`, {
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