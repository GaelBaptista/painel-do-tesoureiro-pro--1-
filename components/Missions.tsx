import React, { useState, useEffect, useMemo } from "react"
import {
  Target,
  Plus,
  Trash2,
  TrendingUp,
  PieChart,
  X,
  DollarSign,
  CheckCircle2,
  Award,
} from "lucide-react"
import {
  AppData,
  MissionIncome,
  MissionReport,
  MissionCampaign,
} from "../types"
import { api } from "../lib/api"

interface MissionsProps {
  data: AppData
  onUpdate: (data: Partial<AppData>) => void
  onDataChange?: () => Promise<void>
}

const MISSION_SOURCES = ["Ofertas", "Cantina", "Bazzar", "Outro"] as const

const Missions: React.FC<MissionsProps> = ({
  data,
  onUpdate,
  onDataChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newIncome, setNewIncome] = useState<Partial<MissionIncome>>({
    source: "Ofertas",
    value: 0,
    date: new Date().toISOString().split("T")[0],
    description: "",
  })
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    target: 0,
  })
  const [report, setReport] = useState<MissionReport[]>([])

  // Campanha ativa
  const activeCampaign = useMemo(() => {
    return data.missionCampaigns?.find(c => c.status === "active")
  }, [data.missionCampaigns])

  // Entradas da campanha ativa
  const activeCampaignIncomes = useMemo(() => {
    if (!activeCampaign) return []
    return data.missionIncomes.filter(i => i.campaignId === activeCampaign.id)
  }, [data.missionIncomes, activeCampaign])

  // Carregar relatório
  useEffect(() => {
    loadReport()
  }, [activeCampaignIncomes])

  const loadReport = async () => {
    if (!activeCampaign) {
      setReport([])
      return
    }

    try {
      const response = await api.get<{
        total: number
        breakdown: MissionReport[]
      }>(`/missoes/report?campaignId=${activeCampaign.id}`)
      setReport(response.breakdown || [])
    } catch (err) {
      calculateLocalReport()
    }
  }

  const calculateLocalReport = () => {
    const total = activeCampaignIncomes.reduce((sum, m) => sum + m.value, 0)
    const breakdown: { [key: string]: number } = {}

    activeCampaignIncomes.forEach(m => {
      breakdown[m.source] = (breakdown[m.source] || 0) + m.value
    })

    const reportData = MISSION_SOURCES.map(source => ({
      source,
      value: breakdown[source] || 0,
      percentage:
        total > 0
          ? (((breakdown[source] || 0) / total) * 100).toFixed(2)
          : "0.00",
    }))

    setReport(reportData)
  }

  const progress = useMemo(() => {
    if (!activeCampaign) {
      return {
        currentProgress: 0,
        missionTarget: 0,
        percentage: "0.00",
        remaining: 0,
      }
    }

    const currentProgress = activeCampaignIncomes.reduce(
      (sum, m) => sum + m.value,
      0
    )
    const missionTarget = activeCampaign.target
    const percentage =
      missionTarget > 0
        ? ((currentProgress / missionTarget) * 100).toFixed(2)
        : "0.00"
    const remaining = Math.max(0, missionTarget - currentProgress)

    return {
      currentProgress,
      missionTarget,
      percentage,
      remaining,
    }
  }, [activeCampaignIncomes, activeCampaign])

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeCampaign) {
      alert("Você precisa criar uma campanha ativa primeiro!")
      return
    }
    if (!newIncome.source || !newIncome.value || !newIncome.date) return

    const income: Omit<MissionIncome, "id"> = {
      campaignId: activeCampaign.id,
      source: newIncome.source as any,
      value: Number(newIncome.value),
      date: newIncome.date,
      description: newIncome.description,
    }

    try {
      setLoading(true)
      const created = await api.post<MissionIncome>("/missoes", income)

      onUpdate({
        missionIncomes: [...data.missionIncomes, created],
      })

      if (onDataChange) await onDataChange()

      setIsModalOpen(false)
      setNewIncome({
        source: "Ofertas",
        value: 0,
        date: new Date().toISOString().split("T")[0],
        description: "",
      })
    } catch (err: any) {
      alert("Erro ao adicionar entrada: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCampaign.name || newCampaign.target <= 0) {
      alert("Preencha todos os campos corretamente")
      return
    }

    const campaign: Omit<MissionCampaign, "id"> = {
      name: newCampaign.name,
      target: newCampaign.target,
      startDate: new Date().toISOString(),
      status: "active",
    }

    try {
      setLoading(true)
      const created = await api.post<MissionCampaign>(
        "/missoes/campaigns",
        campaign
      )

      onUpdate({
        missionCampaigns: [...(data.missionCampaigns || []), created],
      })

      if (onDataChange) await onDataChange()

      setIsCampaignModalOpen(false)
      setNewCampaign({ name: "", target: 0 })
    } catch (err: any) {
      alert("Erro ao criar campanha: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteCampaign = async () => {
    if (!activeCampaign) return
    if (
      !window.confirm(
        `Deseja finalizar a campanha "${activeCampaign.name}"? Esta ação não pode ser desfeita.`
      )
    )
      return

    try {
      setLoading(true)
      const updated: MissionCampaign = {
        ...activeCampaign,
        status: "completed",
        endDate: new Date().toISOString(),
      }

      await api.patch(`/missoes/campaigns/${activeCampaign.id}`, {
        status: "completed",
        endDate: updated.endDate,
      })

      onUpdate({
        missionCampaigns: data.missionCampaigns?.map(c =>
          c.id === activeCampaign.id ? updated : c
        ),
      })

      if (onDataChange) await onDataChange()
    } catch (err: any) {
      alert("Erro ao finalizar campanha: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteIncome = async (id: string) => {
    if (!window.confirm("Deseja excluir esta entrada de missões?")) return

    try {
      setLoading(true)
      await api.del(`/missoes/${id}`)

      onUpdate({
        missionIncomes: data.missionIncomes.filter(m => m.id !== id),
      })

      if (onDataChange) await onDataChange()
    } catch (err: any) {
      alert("Erro ao excluir entrada: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const completedCampaigns = useMemo(() => {
    return (data.missionCampaigns || [])
      .filter(c => c.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.endDate || "").getTime() -
          new Date(a.endDate || "").getTime()
      )
  }, [data.missionCampaigns])

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Missões</h1>
          <p className="text-slate-500">
            Controle separado das entradas para missões da igreja.
          </p>
        </div>
        <div className="flex gap-2">
          {!activeCampaign ? (
            <button
              onClick={() => setIsCampaignModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={20} />
              Nova Campanha
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus size={20} />
                Adicionar Entrada
              </button>
              <button
                onClick={handleCompleteCampaign}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <CheckCircle2 size={20} />
                Finalizar Campanha
              </button>
            </>
          )}
        </div>
      </div>

      {!activeCampaign ? (
        <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-slate-300 text-center">
          <Target size={64} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            Nenhuma Campanha Ativa
          </h3>
          <p className="text-slate-500 mb-6">
            Crie uma nova campanha de missões para começar a registrar as
            entradas.
          </p>
          <button
            onClick={() => setIsCampaignModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold inline-flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            Criar Primeira Campanha
          </button>
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center gap-3 mb-2">
              <Target size={28} />
              <div className="flex-1">
                <h2 className="text-xl font-bold">{activeCampaign.name}</h2>
                <p className="text-sm opacity-80">
                  Iniciada em{" "}
                  {new Date(activeCampaign.startDate).toLocaleDateString(
                    "pt-BR"
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-90">
                  Meta: R${" "}
                  {progress.missionTarget.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <span className="text-2xl font-extrabold">
                  {progress.percentage}%
                </span>
              </div>

              <div className="w-full bg-white/20 rounded-full h-6 overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                  style={{
                    width: `${Math.min(parseFloat(progress.percentage), 100)}%`,
                  }}
                >
                  <span className="text-xs font-bold text-blue-700">
                    {parseFloat(progress.percentage) > 15 &&
                      `${progress.percentage}%`}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white/10 p-3 rounded-lg">
                  <p className="text-xs opacity-80 uppercase font-bold">
                    Arrecadado
                  </p>
                  <p className="text-2xl font-extrabold">
                    R${" "}
                    {progress.currentProgress.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="bg-white/10 p-3 rounded-lg">
                  <p className="text-xs opacity-80 uppercase font-bold">
                    Faltam
                  </p>
                  <p className="text-2xl font-extrabold">
                    R${" "}
                    {progress.remaining.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={18} />
                  Registro de Entradas
                </h3>
              </div>

              <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                {activeCampaignIncomes.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Target size={48} className="mx-auto mb-3 opacity-20" />
                    <p>Nenhuma entrada registrada ainda.</p>
                  </div>
                ) : (
                  activeCampaignIncomes
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map(income => (
                      <div
                        key={income.id}
                        className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <DollarSign size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">
                              {income.source}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(income.date).toLocaleDateString(
                                "pt-BR"
                              )}
                              {income.description && ` • ${income.description}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-slate-800">
                            R${" "}
                            {income.value.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                          <button
                            onClick={() => handleDeleteIncome(income.id)}
                            className="p-2 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                  <PieChart size={18} />
                  Divisão de Entradas
                </h3>
              </div>

              <div className="p-6 space-y-4">
                {report.map(item => {
                  const percentage = parseFloat(item.percentage)
                  return (
                    <div key={item.source}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-700">
                          {item.source}
                        </span>
                        <div className="text-right">
                          <span className="text-lg font-extrabold text-slate-800">
                            R${" "}
                            {item.value.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                          <span className="text-xs text-slate-400 ml-2">
                            ({item.percentage}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}

                {report.length === 0 && (
                  <div className="text-center text-slate-400 py-8">
                    <PieChart size={48} className="mx-auto mb-3 opacity-20" />
                    <p>Nenhum dado disponível</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {completedCampaigns.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
              <Award size={18} />
              Campanhas Finalizadas
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {completedCampaigns.map(campaign => {
              const campaignIncomes = data.missionIncomes.filter(
                i => i.campaignId === campaign.id
              )
              const totalRaised = campaignIncomes.reduce(
                (sum, i) => sum + i.value,
                0
              )
              const percentage =
                campaign.target > 0
                  ? ((totalRaised / campaign.target) * 100).toFixed(1)
                  : "0"

              return (
                <div
                  key={campaign.id}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">
                          {campaign.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(campaign.startDate).toLocaleDateString(
                            "pt-BR"
                          )}{" "}
                          -{" "}
                          {campaign.endDate &&
                            new Date(campaign.endDate).toLocaleDateString(
                              "pt-BR"
                            )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-700">
                        R${" "}
                        {totalRaised.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        / R${" "}
                        {campaign.target.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p
                        className={`text-xs font-bold ${parseFloat(percentage) >= 100 ? "text-emerald-600" : "text-slate-400"}`}
                      >
                        {percentage}% alcançado
                      </p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full transition-all ${parseFloat(percentage) >= 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                      style={{
                        width: `${Math.min(parseFloat(percentage), 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                Nova Campanha de Missões
              </h2>
              <button
                onClick={() => setIsCampaignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                  Nome da Campanha
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                  placeholder="Ex: Missões 2026, Projeto África, etc."
                  value={newCampaign.name}
                  onChange={e =>
                    setNewCampaign({ ...newCampaign, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                  Meta (R$)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="1"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                  placeholder="0.00"
                  value={newCampaign.target || ""}
                  onChange={e =>
                    setNewCampaign({
                      ...newCampaign,
                      target: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-4">
                <p className="text-xs text-blue-700">
                  <strong>Nota:</strong> Apenas uma campanha pode estar ativa
                  por vez. Finalize a campanha atual antes de criar uma nova.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-colors mt-2 disabled:opacity-50"
              >
                {loading ? "Criando..." : "Criar Campanha"}
              </button>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                Nova Entrada de Missões
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddIncome} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                  Fonte da Entrada
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none bg-white"
                  value={newIncome.source}
                  onChange={e =>
                    setNewIncome({
                      ...newIncome,
                      source: e.target.value as any,
                    })
                  }
                >
                  {MISSION_SOURCES.map(source => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
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
                    min="0"
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={newIncome.value || ""}
                    onChange={e =>
                      setNewIncome({
                        ...newIncome,
                        value: parseFloat(e.target.value),
                      })
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
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                    value={newIncome.date}
                    onChange={e =>
                      setNewIncome({ ...newIncome, date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                  Descrição (Opcional)
                </label>
                <input
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
                  placeholder="Ex: Oferta especial dia 15"
                  value={newIncome.description || ""}
                  onChange={e =>
                    setNewIncome({ ...newIncome, description: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-colors mt-2 disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Adicionar Entrada"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Missions
