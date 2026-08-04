// API Configuration and shared utilities
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Helper function to get auth token
export const getAuthToken = () => {
  // Try localStorage first
  const token = localStorage.getItem("accessToken");
  if (token) return token;
  
  // Fallback to cookie
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'accessToken') {
      return value;
    }
  }
  return null;
};
