const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return ""; // Relative path to use current host + Vite /api proxy
  }
  return import.meta.env.VITE_SERVER_URL || "http://localhost:8080";
};

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ success: boolean; message?: string; data?: T }> {
  const baseUrl = getBaseUrl();
  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;
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
