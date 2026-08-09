// lib/api/exam.api.ts
import { API_URL, getAuthToken } from './client';

export type CreateExamData = {
  title: string;
  description?: string;
  subjectId: number;
  classId: number;
  teacherId: number;
  examDate: string;
  durationMinutes?: number;
  totalMarks: number;
  passingMarks: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';
};

export type UpdateExamData = Partial<CreateExamData>;

export async function getExams() {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/exams`, {
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return res.json();
}

export async function getExam(id: number) {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/exams/${id}`, {
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return res.json();
}

export async function createExam(data: CreateExamData) {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/exams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server error (${res.status}): ${text}`);
  }
  return res.json();
}

export async function updateExam(id: number, data: UpdateExamData) {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/exams/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server error (${res.status}): ${text}`);
  }
  return res.json();
}

export async function deleteExam(id: number) {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/exams/${id}`, {
    method: 'DELETE',
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return res.json();
}