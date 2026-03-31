import httpClient from "../services/api"

export const api = {
  get: <T>(path: string) => httpClient.get<T>(path).then(r => r.data),

  post: <T>(path: string, body?: any) =>
    httpClient.post<T>(path, body).then(r => r.data),

  put: <T>(path: string, body?: any) =>
    httpClient.put<T>(path, body).then(r => r.data),

  patch: <T>(path: string, body?: any) =>
    httpClient.patch<T>(path, body).then(r => r.data),

  del: <T>(path: string) => httpClient.delete<T>(path).then(r => r.data),

  // upload de comprovante
  upload: async (file: File) => {
    const form = new FormData()
    form.append("file", file)
    const r = await httpClient.post<{ filename: string; url: string }>(
      "/uploads",
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    )
    return r.data
  },
}
