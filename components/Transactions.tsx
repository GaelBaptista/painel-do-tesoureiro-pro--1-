import React, { useState } from "react"
import {
  Plus,
  Search,
  Filter,
  ArrowUpCircle,
  ArrowDownCircle,
  Repeat,
  Trash2,
  FileImage,
  X,
} from "lucide-react"
import { AppData, Transaction, TransactionType, User } from "../types"
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "../constants"
import { api } from "../lib/api"

interface TransactionsProps {
  data: AppData
  onUpdate: (data: Partial<AppData>) => void
  currentUser: User
  onDataChange?: () => Promise<void>
}

const Transactions: React.FC<TransactionsProps> = ({
  data,
  onUpdate,
  currentUser,
  onDataChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    type: TransactionType.INCOME,
    date: new Date().toISOString().split("T")[0],
    accountId: data.accounts[0]?.id || "",
    category: INCOME_CATEGORIES[0],
  })

  const filteredTransactions = data.transactions
    .filter(
      t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTx.value || !newTx.description || !newTx.accountId) return

    const transaction: Omit<Transaction, "id"> = {
      type: newTx.type!,
      value: Number(newTx.value),
      date: newTx.date!,
      description: newTx.description!,
      category: newTx.category!,
      accountId: newTx.accountId!,
      toAccountId: newTx.toAccountId,
      isRecurring: newTx.isRecurring,
      userId: currentUser.id,
    }

    try {
      setLoading(true)
      const created = await api.post<Transaction>("/transactions", transaction)
      onUpdate({ transactions: [...data.transactions, created] })
      if (onDataChange) await onDataChange()
      setIsModalOpen(false)
      setNewTx({
        type: TransactionType.INCOME,
        date: new Date().toISOString().split("T")[0],
        accountId: data.accounts[0]?.id || "",
        category: INCOME_CATEGORIES[0],
      })
    } catch (err: any) {
      alert("Erro ao criar lançamento: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteTransaction = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este lançamento?")) {
      try {
        setLoading(true)
        await api.del(`/transactions/${id}`)
        onUpdate({ transactions: data.transactions.filter(t => t.id !== id) })
        if (onDataChange) await onDataChange()
      } catch (err: any) {
        alert("Erro ao excluir lançamento: " + err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const getAccountName = (id: string) =>
    data.accounts.find(a => a.id === id)?.name || "Desconhecida"

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lançamentos</h1>
          <p className="text-slate-500">
            Gestão de todas as entradas, saídas e transferências.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Novo Lançamento
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Pesquisar por descrição ou categoria..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Conta</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(t => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(t.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {t.type === TransactionType.INCOME && (
                          <ArrowUpCircle
                            className="text-emerald-500 shrink-0"
                            size={20}
                          />
                        )}
                        {t.type === TransactionType.EXPENSE && (
                          <ArrowDownCircle
                            className="text-rose-500 shrink-0"
                            size={20}
                          />
                        )}
                        {t.type === TransactionType.TRANSFER && (
                          <Repeat
                            className="text-blue-500 shrink-0"
                            size={20}
                          />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            {t.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {getAccountName(t.accountId)}{" "}
                      {t.toAccountId
                        ? `→ ${getAccountName(t.toAccountId)}`
                        : ""}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-bold text-right ${
                        t.type === TransactionType.INCOME
                          ? "text-emerald-600"
                          : t.type === TransactionType.EXPENSE
                            ? "text-rose-600"
                            : "text-blue-600"
                      }`}
                    >
                      {t.type === TransactionType.EXPENSE ? "-" : ""}
                      R${" "}
                      {t.value.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => deleteTransaction(t.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                Novo Lançamento
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() =>
                    setNewTx({
                      ...newTx,
                      type: TransactionType.INCOME,
                      category: INCOME_CATEGORIES[0],
                    })
                  }
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${newTx.type === TransactionType.INCOME ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}
                >
                  Entrada
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setNewTx({
                      ...newTx,
                      type: TransactionType.EXPENSE,
                      category: EXPENSE_CATEGORIES[0],
                    })
                  }
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${newTx.type === TransactionType.EXPENSE ? "bg-white text-rose-600 shadow-sm" : "text-slate-500"}`}
                >
                  Saída
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setNewTx({
                      ...newTx,
                      type: TransactionType.TRANSFER,
                      category: "Transferência",
                    })
                  }
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${newTx.type === TransactionType.TRANSFER ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
                >
                  Transf.
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                    Valor (R$)
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-lg"
                    value={newTx.value || ""}
                    onChange={e =>
                      setNewTx({ ...newTx, value: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                    Data
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full px-4 py-2 border rounded-lg"
                    value={newTx.date}
                    onChange={e => setNewTx({ ...newTx, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                  Descrição
                </label>
                <input
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Ex: Oferta de Culto"
                  value={newTx.description || ""}
                  onChange={e =>
                    setNewTx({ ...newTx, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                    Conta de Origem
                  </label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg"
                    value={newTx.accountId}
                    onChange={e =>
                      setNewTx({ ...newTx, accountId: e.target.value })
                    }
                  >
                    {data.accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
                {newTx.type === TransactionType.TRANSFER ? (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                      Conta de Destino
                    </label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg"
                      value={newTx.toAccountId}
                      onChange={e =>
                        setNewTx({ ...newTx, toAccountId: e.target.value })
                      }
                    >
                      <option value="">Selecione...</option>
                      {data.accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                      Categoria
                    </label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg"
                      value={newTx.category}
                      onChange={e =>
                        setNewTx({ ...newTx, category: e.target.value })
                      }
                    >
                      {(newTx.type === TransactionType.INCOME
                        ? INCOME_CATEGORIES
                        : EXPENSE_CATEGORIES
                      ).map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Salvando..." : "Salvar Lançamento"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions
