import React, { useState } from "react"
import { Wallet, ShieldCheck, ArrowRight, User as UserIcon } from "lucide-react"
import { User } from "../types"
import { api } from "@/lib/api"
import { saveAuth, clearAuth } from "@/lib/authStorage"

interface LoginProps {
  onLogin: (user: User) => void
  onToggleSignup: () => void
}

const Login: React.FC<LoginProps> = ({ onLogin, onToggleSignup }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await api.post<{ token: string; user: User }>(
        "/auth/login",
        { username, password }
      )

      if (!response || !response.token || !response.user) {
        setError("Resposta inválida do servidor")
        return
      }

      saveAuth(response.token, response.user)
      onLogin(response.user)
    } catch (err) {
      clearAuth()
      const message = err instanceof Error ? err.message : "Erro ao fazer login"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/10">
          <div className="bg-blue-600 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
              <Wallet size={32} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Painel do Tesoureiro
            </h1>
            <p className="text-blue-100 text-sm mt-1 opacity-80">
              Acesso Restrito à Gestão Financeira
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <UserIcon size={14} /> Usuário
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium disabled:opacity-50"
                placeholder="Seu usuário"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={14} /> Senha
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium disabled:opacity-50"
                placeholder="••••••••"
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  setError("")
                }}
                disabled={loading}
              />
              {error && (
                <p className="text-rose-500 text-xs font-bold text-center mt-2 animate-bounce">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 group mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Carregando..." : "Entrar no Sistema"}
              {!loading && (
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              )}
            </button>

            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={onToggleSignup}
                disabled={loading}
                className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
              >
                Não tem conta? Cadastre sua igreja aqui.
              </button>
            </div>
          </form>
        </div>
        <div className="text-center mt-8 space-y-1">
          <p className="text-slate-500 text-xs font-medium">
            API:{" "}
            {(import.meta as any).env.VITE_API_URL ||
              "https://backend-tesouraria.onrender.com/api"}
          </p>
          <p className="text-slate-600 text-[10px] opacity-50 uppercase tracking-widest">
            Tesouraria Pro &copy; 2025
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
