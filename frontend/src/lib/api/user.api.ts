// lib/api/user.api.ts
import { cookies } from 'next/headers';
import { API_URL } from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
}

/**
 * Fetches the current user from the backend using the access token stored in cookies.
 * Designed to work in Server Components (uses `next/headers`).
 * Returns `null` if no token is present or the request fails.
 */
export async function getCurrentUser(): Promise<User | null> {
  // 1. Read the access token from the request cookies
  const cookieStore = await cookies(); // `await` required in Next.js 15+
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    return null;
  }

  try {
    // 2. Call your NestJS `/auth/me` endpoint (or similar)
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // Optional: Add cache control to avoid stale data
      // cache: 'no-store',  // or use next: { revalidate: 0 }
    });

    if (!response.ok) {
      // If token is invalid, clear the cookie on the client side later
      return null;
    }

    const data = await response.json();
    // Assuming your backend returns the user object directly or under a `user` field
    return data.user || data;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return null;
  }
}

/**
 * Client‑side helper to get the user from localStorage (for client components).
 * Useful if you need the user in a client component without refetching.
 */
export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}