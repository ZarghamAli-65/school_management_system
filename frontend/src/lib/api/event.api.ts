// lib/api/event.api.ts
import { API_URL, getAuthToken } from './client';

export type CreateEventData = {
  title: string;
  description?: string;
  classId?: number;
  eventDate: string;      // ISO date string
  startTime: string;      // ISO datetime string
  endTime: string;        // ISO datetime string
  venue?: string;
};

export type UpdateEventData = Partial<CreateEventData>;

export async function getEvents() {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/events`, {
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

export async function getEvent(id: number) {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/events/${id}`, {
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

export async function createEvent(data: CreateEventData) {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/events`, {
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

export async function updateEvent(id: number, data: UpdateEventData) {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/events/${id}`, {
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

export async function deleteEvent(id: number) {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/events/${id}`, {
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