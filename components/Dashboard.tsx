import React, { useMemo, useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Church,
  User as UserIcon,
  AlertTriangle,
  Clock,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { AppData, TransactionType, User, BillStatus } from "../types"

interface DashboardProps {
  data: AppData
  currentUser: User
  onUpdate?: (data: Partial<AppData>) => void
}

const months = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
]

const Dashboard: React.FC<DashboardProps> = ({
  data,
  currentUser,
  onUpdate,
}) => {
  const [editingBalance, setEditingBalance] = useState(false)
  const [newBalance, setNewBalance] = useState("")

  const now = new Date()
  const todayDay = now.getDate()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const stats = useMemo(() => {
    let consolidated = data.accounts.reduce(
      (sum, acc) => sum + acc.initialBalance,
      0
    )
    let monthIn = 0
    let monthOut = 0
    let monthInCount = 0
    let monthOutCount = 0

    data.transactions.forEach(t => {
      const tDate = new Date(t.date)
      const isCurrentMonth =
        tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear

      if (t.type === TransactionType.INCOME) {
        consolidated += t.value
        if (isCurrentMonth) {
          monthIn += t.value
          monthInCount++
        }
      } else if (t.type === TransactionType.EXPENSE) {
        consolidated -= t.value
        if (isCurrentMonth) {
          monthOut += t.value
          monthOutCount++
        }
      }
    })

    return {
      total: consolidated,
      monthIn,
      monthOut,
      monthBalance: monthIn - monthOut,
      monthInCount,
      monthOutCount,
    }
  }, [data, currentMonth, currentYear])

  const alerts = useMemo(() => {
    return data.bills
      .filter(bill => bill.status !== BillStatus.PAID)
      .map(bill => {
        const daysUntil = bill.dueDate - todayDay
        let color = ""
        let label = ""

        if (daysUntil < 0) {
          color = "text-rose-600 bg-rose-50 border-rose-100"
          label = "Atrasada"
        } else if (daysUntil <= 1) {
          color = "text-rose-600 bg-rose-50 border-rose-100"
          label = daysUntil === 0 ? "Vence HOJE" : "Vence AMANHÃ"
        } else if (daysUntil <= 3) {
          color = "text-amber-600 bg-amber-50 border-amber-100"
          label = `Vence em ${daysUntil} dias`
        } else if (daysUntil <= 10) {
          color = "text-emerald-600 bg-emerald-50 border-emerald-100"
          label = `Vence em ${daysUntil} dias`
        } else {
          return null // Não mostra se faltar mais de 10 dias
        }

        return { ...bill, alertColor: color, alertLabel: label, daysUntil }
      })
      .filter(Boolean)
      .sort((a, b) => (a?.daysUntil || 0) - (b?.daysUntil || 0))
  }, [data.bills, todayDay])

  const chartData = useMemo(() => {
    const last6 = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const m = d.getMonth()
      const y = d.getFullYear()

      const inVal = data.transactions
        .filter(
          t =>
            t.type === TransactionType.INCOME &&
            new Date(t.date).getMonth() === m &&
            new Date(t.date).getFullYear() === y
        )
        .reduce((sum, t) => sum + t.value, 0)

      const outVal = data.transactions
        .filter(
          t =>
            t.type === TransactionType.EXPENSE &&
            new Date(t.date).getMonth() === m &&
            new Date(t.date).getFullYear() === y
        )
        .reduce((sum, t) => sum + t.value, 0)

      last6.push({ name: months[m], Entradas: inVal, Saídas: outVal })
    }
    return last6
  }, [data])

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600">
            <Church size={20} />
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              {currentUser.churchName}
            </h1>
          </div>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <UserIcon size={14} className="text-slate-400" />
            Olá,{" "}
            <span className="text-slate-700 font-bold">{currentUser.name}</span>
            ! Veja o resumo financeiro atual.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <Calendar size={18} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-600">
            {new Intl.DateTimeFormat("pt-BR", {
              month: "long",
              year: "numeric",
            }).format(now)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <EditableStatCard
          title="Saldo Consolidado"
          value={stats.total}
          icon={Wallet}
          color="blue"
          subText="Soma de todas as contas"
          isEditing={editingBalance}
          onEdit={() => {
            setEditingBalance(true)
            setNewBalance(stats.total.toString())
          }}
          onCancel={() => setEditingBalance(false)}
          onSave={() => {
            const value = parseFloat(newBalance)
            if (!isNaN(value) && onUpdate) {
              // Atualiza a primeira conta com a diferença
              const difference = value - stats.total
              const newAccounts =
                data.accounts.length > 0
                  ? data.accounts.map((acc, idx) =>
                      idx === 0
                        ? {
                            ...acc,
                            initialBalance: acc.initialBalance + difference,
                          }
                        : acc
                    )
                  : [
                      {
                        id: "main",
                        name: "Saldo Principal",
                        type: "Caixa",
                        initialBalance: value,
                      },
                    ]

              onUpdate({ accounts: newAccounts })
              setEditingBalance(false)
            }
          }}
          editValue={newBalance}
          onEditChange={setNewBalance}
        />
        {/* <StatCard
          title="Saldo Consolidado"
          value={stats.total}
          icon={Wallet}
          color="blue"
          subText="Soma de todas as contas"
        /> */}
        <StatCard
          title="Entradas do Mês"
          value={stats.monthIn}
          icon={TrendingUp}
          color="emerald"
          subText={`${stats.monthInCount} lançamentos`}
        />
        <StatCard
          title="Saídas do Mês"
          value={stats.monthOut}
          icon={TrendingDown}
          color="rose"
          subText={`${stats.monthOutCount} lançamentos`}
        />
        <StatCard
          title="Saldo do Mês"
          value={stats.monthBalance}
          icon={CheckCircle2}
          color={stats.monthBalance >= 0 ? "indigo" : "amber"}
          subText={
            stats.monthBalance >= 0 ? "Superavitário" : "Déficit no período"
          }
        />
      </div>

      {/* Seção de Alertas Rápidos */}
      {alerts.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={20} className="text-blue-600" />
            <h3 className="text-lg font-bold text-slate-800">
              Alertas de Vencimento
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.map((alert: any) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between p-3 rounded-xl border ${alert.alertColor} transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/50 rounded-lg">
                    {alert.daysUntil < 0 || alert.daysUntil <= 1 ? (
                      <AlertTriangle size={18} />
                    ) : (
                      <Clock size={18} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold truncate max-w-[120px]">
                      {alert.description}
                    </p>
                    <p className="text-[10px] font-bold uppercase opacity-80">
                      {alert.alertLabel}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    R$ {alert.value.toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">
            Fluxo de Caixa (Últimos 6 meses)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Saídas" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Informações Gerais
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Pastor Responsável
                </p>
                <p className="text-sm font-bold text-slate-700">
                  {currentUser.pastorName || "N/A"}
                </p>
              </div>
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">
                  Tesoureiro Ativo
                </p>
                <p className="text-sm font-bold text-blue-700">
                  {currentUser.name}
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-semibold text-sm">Gestão Ativa</p>
                  <p className="text-xs opacity-90">
                    Você está gerindo {data.accounts.length} contas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const EditableStatCard = ({
  title,
  value,
  icon: Icon,
  color,
  subText,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  editValue,
  onEditChange,
}: any) => {
  const colorClasses: any = {
    blue: "bg-blue-600 text-white",
    emerald: "bg-emerald-600 text-white",
    rose: "bg-rose-600 text-white",
    amber: "bg-amber-500 text-white",
    indigo: "bg-indigo-600 text-white",
  }

  if (isEditing) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-blue-300 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-slate-500">{title}</span>
          <div
            className={`p-2 rounded-xl ${colorClasses[color]} shadow-lg shadow-current/20`}
          >
            <Icon size={20} />
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">
              Novo Valor
            </label>
            <input
              type="number"
              value={editValue}
              onChange={e => onEditChange(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
              placeholder="0.00"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
            >
              Salvar
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onEdit}
      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-slate-500">{title}</span>
        <div
          className={`p-2 rounded-xl ${colorClasses[color]} shadow-lg shadow-current/20`}
        >
          <Icon size={20} />
        </div>
      </div>
      <div>
        <h4 className="text-2xl font-extrabold text-slate-800">
          R$ {value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </h4>
        <p className="text-xs text-slate-400 mt-1 font-medium">{subText}</p>
        <p className="text-xs text-blue-500 mt-2 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
          Clique para editar
        </p>
      </div>
    </div>
  )
}

const StatCard = ({ title, value, icon: Icon, color, subText }: any) => {
  const colorClasses: any = {
    blue: "bg-blue-600 text-white",
    emerald: "bg-emerald-600 text-white",
    rose: "bg-rose-600 text-white",
    amber: "bg-amber-500 text-white",
    indigo: "bg-indigo-600 text-white",
  }
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-slate-500">{title}</span>
        <div
          className={`p-2 rounded-xl ${colorClasses[color]} shadow-lg shadow-current/20`}
        >
          <Icon size={20} />
        </div>
      </div>
      <div>
        <h4 className="text-2xl font-extrabold text-slate-800">
          R$ {value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </h4>
        <p className="text-xs text-slate-400 mt-1 font-medium">{subText}</p>
      </div>
    </div>
  )
}

export default Dashboard
