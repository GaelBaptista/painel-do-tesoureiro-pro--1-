const API_URL =
  (import.meta as any).env.VITE_API_URL ||
  "https://backend-tesouraria.onrender.com/api"

function getToken() {
  return localStorage.getItem("tesouraria_token")
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }

  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const msg = await res.json().catch(() => ({}))
    throw new Error(msg?.message || `Erro HTTP ${res.status}`)
  }

  // 204 no content
  if (res.status === 204) return undefined as unknown as T

  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: any) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: any) =>
    request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: any) =>
    request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),

  // upload de comprovante
  upload: async (file: File) => {
    const token = getToken()
    const form = new FormData()
    form.append("file", file)

    const res = await fetch(`${API_URL}/uploads`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    })

    if (!res.ok) {
      const msg = await res.json().catch(() => ({}))
      throw new Error(msg?.message || `Erro upload ${res.status}`)
    }
    return res.json() as Promise<{ filename: string; url: string }>
  },
}
