import React, { useState } from "react"
import {
  Users as UsersIcon,
  Plus,
  Shield,
  UserPlus,
  Trash2,
  X,
} from "lucide-react"
import { AppData, User, UserRole } from "../types"
import { api } from "../lib/api"

interface UsersProps {
  data: AppData
  onUpdate: (data: Partial<AppData>) => void
  currentUser: User
  onDataChange?: () => Promise<void>
}

const Users: React.FC<UsersProps> = ({
  data,
  onUpdate,
  currentUser,
  onDataChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newUser, setNewUser] = useState<Partial<User>>({
    role: UserRole.TREASURER,
  })

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.name || !newUser.username || !newUser.password) return

    const user: Omit<User, "id"> = {
      name: newUser.name,
      username: newUser.username,
      password: newUser.password,
      role: newUser.role as UserRole,
    }

    try {
      setLoading(true)
      const created = await api.post<User>("/users", user)
      onUpdate({ users: [...data.users, created] })
      if (onDataChange) await onDataChange()
      setIsModalOpen(false)
      setNewUser({ role: UserRole.TREASURER })
    } catch (err: any) {
      alert("Erro ao criar usuário: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (id: string) => {
    if (id === currentUser.id) {
      alert("Você não pode excluir a si mesmo.")
      return
    }
    if (window.confirm("Deseja realmente excluir este usuário?")) {
      try {
        setLoading(true)
        await api.del(`/users/${id}`)
        onUpdate({ users: data.users.filter(u => u.id !== id) })
        if (onDataChange) await onDataChange()
      } catch (err: any) {
        alert("Erro ao excluir usuário: " + err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  if (currentUser.role !== UserRole.ADMIN) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <Shield size={48} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Acesso Restrito</h2>
        <p className="text-slate-500">
          Apenas administradores podem gerenciar usuários.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Gestão de Usuários
          </h1>
          <p className="text-slate-500">
            Adicione ou remova tesoureiros com acesso ao sistema.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700"
        >
          <UserPlus size={20} />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Usuário</th>
              <th className="px-6 py-4">Nível de Acesso</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50 group">
                <td className="px-6 py-4 font-semibold text-slate-700">
                  {u.name}
                </td>
                <td className="px-6 py-4 text-slate-500">{u.username}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.role === UserRole.ADMIN
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Adicionar Usuário</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">
                  Nome Completo
                </label>
                <input
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  value={newUser.name || ""}
                  onChange={e =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">
                  Nome de Usuário (Login)
                </label>
                <input
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  value={newUser.username || ""}
                  onChange={e =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">
                  Senha
                </label>
                <input
                  required
                  type="password"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={newUser.password || ""}
                  onChange={e =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">
                  Nível de Acesso
                </label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={newUser.role}
                  onChange={e =>
                    setNewUser({ ...newUser, role: e.target.value as UserRole })
                  }
                >
                  <option value={UserRole.TREASURER}>Tesoureiro</option>
                  <option value={UserRole.ADMIN}>Administrador</option>
                  <option value={UserRole.VIEWER}>Apenas Leitura</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Salvando..." : "Salvar Usuário"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
