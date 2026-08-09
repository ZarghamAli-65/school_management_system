// lib/api/result.api.ts
import { API_URL, getAuthToken } from './client';

export type ResultType = 'exam' | 'assignment'; // adjust as needed

export type CreateResultData = {
  studentId: number;
  subjectId: number;
  classId: number;
  teacherId: number;
  type: ResultType;
  examId?: number;
  assignmentId?: number;
  obtainedMarks: number;
  remarks?: string;
};

export type UpdateResultData = Partial<CreateResultData>;

export async function getResults() {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/results`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Status ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getResult(id: number) {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/results/${id}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Status ${res.status}: ${text}`);
  }
  return res.json();
}

export async function createResult(data: CreateResultData) {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/results`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
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

export async function updateResult(id: number, data: UpdateResultData) {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/results/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
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

export async function deleteResult(id: number) {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/results/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Status ${res.status}: ${text}`);
  }
  return res.json();
}