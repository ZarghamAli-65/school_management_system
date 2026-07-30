import { API_URL, getAuthToken } from "./client";

export async function getClasses() {
  const token = getAuthToken();

  const res = await fetch(`${API_URL}/classes`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch classes: ${res.status} - ${text}`);
  }

  return res.json();
}