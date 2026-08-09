import { API_URL, getAuthToken } from "./client";

export interface Announcement {
  id: number;
  title: string;
  description: string;
  classId?: number | null;
  class?: {
    id: number;
    name: string;
  } | null;
  publishDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAnnouncementDto {
  title: string;
  description: string;
  classId?: number | null;
}

export interface UpdateAnnouncementDto {
  title?: string;
  description?: string;
  classId?: number | null;
}

// Get all announcements
export async function getAnnouncements(): Promise<Announcement[]> {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/announcement`, {
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

// Get announcement by id
export async function getAnnouncement(id: number): Promise<Announcement> {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/announcement/${id}`, {
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

// Create announcement
export async function createAnnouncement(
  data: CreateAnnouncementDto
): Promise<Announcement> {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/announcement`, {
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

// Update announcement
export async function updateAnnouncement(
  id: number,
  data: UpdateAnnouncementDto
): Promise<Announcement> {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/announcement/${id}`, {
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

// Delete announcement
export async function deleteAnnouncement(id: number) {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/announcement/${id}`, {
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