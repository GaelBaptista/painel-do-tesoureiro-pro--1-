import React, { useState } from "react"
import {
  Church,
  User as UserIcon,
  Mail,
  ShieldCheck,
  ArrowRight,
  Wallet,
  Briefcase,
} from "lucide-react"
import { User } from "../types"
import { api } from "@/lib/api"
import { saveAuth, clearAuth } from "@/lib/authStorage"

interface SignupProps {
  onSignup: (user: User) => void
  onToggleLogin: () => void
}

const Signup: React.FC<SignupProps> = ({ onSignup, onToggleLogin }) => {
  const [formData, setFormData] = useState({
    churchName: "",
    pastorName: "",
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    if (!formData.username || !formData.password || !formData.churchName) {
      setError("Preencha todos os campos obrigatórios")
      return
    }

    setLoading(true)

    try {
      const response = await api.post<{ token: string; user: User }>(
        "/auth/register",
        {
          username: formData.username,
          password: formData.password,
          name: formData.name,
          email: formData.email,
          churchName: formData.churchName,
          pastorName: formData.pastorName,
        }
      )

      if (!response || !response.token || !response.user) {
        setError("Erro ao registrar usuário")
        return
      }

      saveAuth(response.token, response.user)
      onSignup(response.user)
    } catch (err) {
      clearAuth()
      const message = err instanceof Error ? err.message : "Erro ao registrar"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <div className="w-full max-w-2xl animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/10">
          <div className="bg-blue-600 md:w-1/3 p-8 text-white flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Wallet size={24} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Cadastro</h1>
              <p className="text-blue-100 text-sm mt-2 opacity-80 leading-relaxed">
                Comece a gerir as finanças da sua igreja com transparência e
                agilidade.
              </p>
            </div>

            <div className="hidden md:block">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-200 uppercase tracking-widest mb-4">
                <ShieldCheck size={14} /> Segurança Total
              </div>
              <p className="text-[10px] text-blue-100/60 leading-tight">
                Seus dados são protegidos e seguem as melhores práticas de
                segurança.
              </p>
            </div>
          </div>

          <div className="md:w-2/3 p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Church size={12} /> Nome da Igreja
                  </label>
                  <input
                    required
                    name="churchName"
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all disabled:opacity-50"
                    placeholder="Ex: Igreja Central"
                    value={formData.churchName}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Briefcase size={12} /> Nome do Pastor
                  </label>
                  <input
                    required
                    name="pastorName"
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all disabled:opacity-50"
                    placeholder="Ex: Pr. João Silva"
                    value={formData.pastorName}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <UserIcon size={12} /> Nome do Tesoureiro
                </label>
                <input
                  required
                  name="name"
                  type="text"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all disabled:opacity-50"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Mail size={12} /> Email
                </label>
                <input
                  required
                  name="email"
                  type="email"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all disabled:opacity-50"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <UserIcon size={12} /> Usuário
                  </label>
                  <input
                    required
                    name="username"
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all disabled:opacity-50"
                    placeholder="usuario"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck size={12} /> Senha
                  </label>
                  <input
                    required
                    name="password"
                    type="password"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all disabled:opacity-50"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck size={12} /> Confirmar Senha
                </label>
                <input
                  required
                  name="confirmPassword"
                  type="password"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all disabled:opacity-50"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {error && (
                <p className="text-rose-500 text-xs font-bold text-center p-3 bg-rose-50 rounded-lg border border-rose-200">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 group mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Cadastrando..." : "Criar Conta"}
                {!loading && (
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onToggleLogin}
                  disabled={loading}
                  className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                >
                  Já tem uma conta? Faça login aqui.
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
