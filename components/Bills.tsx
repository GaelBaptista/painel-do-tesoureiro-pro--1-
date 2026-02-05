import React, { useState } from "react"
import {
  CreditCard,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  X,
  Trash2,
} from "lucide-react"
import {
  AppData,
  Bill,
  BillStatus,
  TransactionType,
  AccountType,
} from "../types"
import { EXPENSE_CATEGORIES } from "../constants"
import { api } from "../lib/api"

interface BillsProps {
  data: AppData
  onUpdate: (data: Partial<AppData>) => void
  onDataChange?: () => Promise<void>
  currentUser?: any
}

const Bills: React.FC<BillsProps> = ({
  data,
  onUpdate,
  onDataChange,
  currentUser,
}) => {
  const [filter, setFilter] = useState<BillStatus | "Tudo">("Tudo")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newBill, setNewBill] = useState<Partial<Bill>>({
    description: "",
    value: 0,
    dueDate: 10,
    category: EXPENSE_CATEGORIES[0],
    isRecurring: true,
    status: BillStatus.PENDING,
  })

  // Fixed: changed 'f' to 'filter' to correctly handle the filtering logic
  const filteredBills = data.bills.filter(
    b => filter === "Tudo" || b.status === filter
  )

  const handlePayBill = async (bill: Bill) => {
    // Check if there's at least one account to pay from
    const defaultAccountId = data.accounts[0]?.id
    if (!defaultAccountId) {
      alert("Nenhuma conta bancária encontrada. Cadastre uma conta primeiro.")
      return
    }

    try {
      setLoading(true)

      // 1. Create transaction
      const transaction = {
        type: TransactionType.EXPENSE,
        value: bill.value,
        date: new Date().toISOString().split("T")[0],
        description: `Pagamento: ${bill.description}`,
        category: bill.category,
        accountId: defaultAccountId,
        userId: currentUser?.id,
      }

      const createdTransaction = await api.post("/transactions", transaction)

      // 2. Update bill status
      const updatedBill = {
        ...bill,
        status: BillStatus.PAID,
        lastPaymentDate: transaction.date,
      }

      await api.put(`/bills/${bill.id}`, updatedBill)

      onUpdate({
        transactions: [...data.transactions, createdTransaction],
        bills: data.bills.map(b => (b.id === bill.id ? updatedBill : b)),
      })

      if (onDataChange) await onDataChange()
      alert("Pagamento registrado com sucesso!")
    } catch (err: any) {
      alert("Erro ao registrar pagamento: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBill.description || !newBill.value || !newBill.dueDate) return

    const bill: Omit<Bill, "id"> = {
      description: newBill.description!,
      value: Number(newBill.value),
      dueDate: Number(newBill.dueDate),
      category: newBill.category || EXPENSE_CATEGORIES[0],
      isRecurring: newBill.isRecurring ?? true,
      status: BillStatus.PENDING,
    }

    try {
      setLoading(true)
      const created = await api.post<Bill>("/bills", bill)
      onUpdate({
        bills: [...data.bills, created],
      })

      if (onDataChange) await onDataChange()
      setIsModalOpen(false)
      setNewBill({
        description: "",
        value: 0,
        dueDate: 10,
        category: EXPENSE_CATEGORIES[0],
        isRecurring: true,
        status: BillStatus.PENDING,
      })
    } catch (err: any) {
      alert("Erro ao criar conta: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteBill = async (id: string) => {
    if (
      window.confirm(
        "Deseja remover esta conta fixa? Isso não apagará os pagamentos já realizados."
      )
    ) {
      try {
        setLoading(true)
        await api.del(`/bills/${id}`)
        onUpdate({ bills: data.bills.filter(b => b.id !== id) })
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Contas a Pagar</h1>
          <p className="text-slate-500">
            Controle as despesas fixas e pendentes da tesouraria.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Nova Conta Fixa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard
          label="Total Pendente"
          value={data.bills
            .filter(b => b.status === BillStatus.PENDING)
            .reduce((s, b) => s + b.value, 0)}
          icon={Clock}
          color="amber"
        />
        <StatusCard
          label="Total em Atraso"
          value={data.bills
            .filter(b => b.status === BillStatus.OVERDUE)
            .reduce((s, b) => s + b.value, 0)}
          icon={AlertTriangle}
          color="rose"
        />
        <StatusCard
          label="Total Pago (Mês)"
          value={data.bills
            .filter(b => b.status === BillStatus.PAID)
            .reduce((s, b) => s + b.value, 0)}
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Listagem de Contas
          </h3>
          <div className="flex gap-2">
            {["Tudo", "Pendente", "Atrasado", "Pago"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Use the already filtered list instead of re-filtering in the render */}
          {filteredBills.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              Nenhuma conta encontrada para este filtro.
            </div>
          ) : (
            filteredBills.map(bill => (
              <div
                key={bill.id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      bill.status === BillStatus.PAID
                        ? "bg-emerald-100 text-emerald-600"
                        : bill.status === BillStatus.OVERDUE
                          ? "bg-rose-100 text-rose-600"
                          : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">
                      {bill.description}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar size={14} /> Todo dia {bill.dueDate}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Clock size={14} /> {bill.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6">
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-800">
                      R${" "}
                      {bill.value.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        bill.status === BillStatus.PAID
                          ? "text-emerald-500"
                          : bill.status === BillStatus.OVERDUE
                            ? "text-rose-500"
                            : "text-amber-500"
                      }`}
                    >
                      {bill.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {bill.status !== BillStatus.PAID && (
                      <button
                        onClick={() => handlePayBill(bill)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Dar Baixa
                        <ArrowRight size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteBill(bill.id)}
                      className="p-2 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for adding a new bill */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                Nova Conta Fixa
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddBill} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                  Descrição da Conta
                </label>
                <input
                  required
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                  placeholder="Ex: Aluguel do Templo"
                  value={newBill.description}
                  onChange={e =>
                    setNewBill({ ...newBill, description: e.target.value })
                  }
                />
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
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={newBill.value || ""}
                    onChange={e =>
                      setNewBill({
                        ...newBill,
                        value: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                    Dia do Vencimento
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="31"
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={newBill.dueDate}
                    onChange={e =>
                      setNewBill({
                        ...newBill,
                        dueDate: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                  Categoria
                </label>
                <select
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
                  value={newBill.category}
                  onChange={e =>
                    setNewBill({ ...newBill, category: e.target.value })
                  }
                >
                  {EXPENSE_CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <input
                  type="checkbox"
                  id="recurring"
                  className="w-4 h-4 text-blue-600 rounded"
                  checked={newBill.isRecurring}
                  onChange={e =>
                    setNewBill({ ...newBill, isRecurring: e.target.checked })
                  }
                />
                <label
                  htmlFor="recurring"
                  className="text-sm font-semibold text-blue-700 cursor-pointer"
                >
                  Gerar automaticamente todo mês
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-colors mt-2"
              >
                Cadastrar Conta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const StatusCard = ({ label, value, icon: Icon, color }: any) => {
  const colors: any = {
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  }

  return (
    <div
      className={`p-4 rounded-xl border flex items-center gap-4 ${colors[color]} shadow-sm`}
    >
      <div className={`p-2 rounded-lg bg-white shadow-sm`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase opacity-60 tracking-widest">
          {label}
        </p>
        <p className="text-xl font-extrabold">
          R$ {value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  )
}

export default Bills
