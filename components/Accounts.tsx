import React, { useState } from "react"
import {
  Building2,
  Plus,
  Landmark,
  PiggyBank,
  MoreVertical,
  X,
  Trash2,
} from "lucide-react"
import { AppData, BankAccount, TransactionType } from "../types"
import { api } from "../lib/api"

interface AccountsProps {
  data: AppData
  onUpdate: (data: Partial<AppData>) => void
  onDataChange?: () => Promise<void>
}

const Accounts: React.FC<AccountsProps> = ({
  data,
  onUpdate,
  onDataChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newAcc, setNewAcc] = useState<Partial<BankAccount>>({
    type: "Conta Corrente",
  })

  const getAccountBalance = (accountId: string, initial: number) => {
    return data.transactions.reduce((bal, t) => {
      if (t.accountId === accountId) {
        if (t.type === TransactionType.INCOME) return bal + t.value
        if (t.type === TransactionType.EXPENSE) return bal - t.value
        if (t.type === TransactionType.TRANSFER) return bal - t.value
      }
      if (t.type === TransactionType.TRANSFER && t.toAccountId === accountId) {
        return bal + t.value
      }
      return bal
    }, initial)
  }

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAcc.name) return

    const acc: Omit<BankAccount, "id"> = {
      name: newAcc.name,
      bankName: newAcc.bankName,
      type: newAcc.type || "Conta Corrente",
      initialBalance: Number(newAcc.initialBalance || 0),
    }

    try {
      setLoading(true)
      const created = await api.post<BankAccount>("/accounts", acc)
      onUpdate({ accounts: [...data.accounts, created] })
      if (onDataChange) await onDataChange()
      setIsModalOpen(false)
      setNewAcc({ type: "Conta Corrente" })
    } catch (err: any) {
      alert("Erro ao criar conta: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteAccount = async (id: string) => {
    if (
      data.transactions.some(t => t.accountId === id || t.toAccountId === id)
    ) {
      alert("Não é possível excluir uma conta que possui lançamentos.")
      return
    }
    if (window.confirm("Deseja excluir esta conta?")) {
      try {
        setLoading(true)
        await api.del(`/accounts/${id}`)
        onUpdate({ accounts: data.accounts.filter(a => a.id !== id) })
        if (onDataChange) await onDataChange()
      } catch (err: any) {
        alert("Erro ao excluir conta: " + err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Contas Bancárias
          </h1>
          <p className="text-slate-500">
            Gerencie onde o recurso da igreja está armazenado.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 shadow-sm"
        >
          <Plus size={20} />
          Nova Conta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.accounts.map(acc => {
          const balance = getAccountBalance(acc.id, acc.initialBalance)
          return (
            <div
              key={acc.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors group relative"
            >
              <button
                onClick={() => deleteAccount(acc.id)}
                className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>

              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  {acc.type === "Caixa Físico" ? (
                    <PiggyBank size={24} />
                  ) : (
                    <Landmark size={24} />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{acc.name}</h3>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter">
                    {acc.bankName || "Local"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Saldo Atual
                </p>
                <p
                  className={`text-2xl font-extrabold ${balance >= 0 ? "text-slate-800" : "text-rose-600"}`}
                >
                  R${" "}
                  {balance.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full mt-2 inline-block">
                  {acc.type}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Nova Conta / Caixa</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddAccount} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">
                  Apelido da Conta
                </label>
                <input
                  required
                  placeholder="Ex: Conta Principal Bradesco"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={newAcc.name || ""}
                  onChange={e => setNewAcc({ ...newAcc, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">
                  Banco (Opcional)
                </label>
                <input
                  placeholder="Ex: Bradesco"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={newAcc.bankName || ""}
                  onChange={e =>
                    setNewAcc({ ...newAcc, bankName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">
                  Tipo de Conta
                </label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={newAcc.type}
                  onChange={e => setNewAcc({ ...newAcc, type: e.target.value })}
                >
                  <option value="Conta Corrente">Conta Corrente</option>
                  <option value="Conta Poupança">Conta Poupança</option>
                  <option value="Caixa Físico">
                    Caixa Físico (Dinheiro em mãos)
                  </option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">
                  Saldo Inicial (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={newAcc.initialBalance || ""}
                  onChange={e =>
                    setNewAcc({ ...newAcc, initialBalance: e.target.value })
                  }
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Salvando..." : "Salvar Conta"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Accounts
