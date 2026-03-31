import axios from "axios"

// O ambiente deve ser controlado por .env.development e .env.production.
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3333/api"

const httpClient = axios.create({
  baseURL: API_URL,
  // headers: {
  //   "ngrok-skip-browser-warning": "any",
  // },
})

// Injeta o token JWT em todas as requisições autenticadas
httpClient.interceptors.request.use(config => {
  const token = localStorage.getItem("tesouraria_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Trata erros de resposta de forma centralizada
httpClient.interceptors.response.use(
  response => response,
  error => {
    const message =
      error.response?.data?.message || `Erro HTTP ${error.response?.status}`
    return Promise.reject(new Error(message))
  }
)

export default httpClient
