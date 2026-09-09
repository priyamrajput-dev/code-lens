const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ success: boolean; message?: string; data?: T }> {
  const url = endpoint.startsWith("http") ? endpoint : `${SERVER_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}
