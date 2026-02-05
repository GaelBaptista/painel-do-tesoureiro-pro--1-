import { api } from "./api"
import type {
  AppData,
  BankAccount,
  Bill,
  MonthlyClosing,
  Transaction,
  User,
  MissionProject,
  MissionIncome,
  MissionProgress,
  MissionCampaign,
} from "../types"

export async function fetchAppData(): Promise<AppData> {
  const [
    users,
    accounts,
    bills,
    closings,
    settings,
    transactions,
    missionIncomes,
    missionCampaigns,
  ] = await Promise.all([
    api.get<User[]>("/users").catch(() => []),
    api.get<BankAccount[]>("/accounts").catch(() => []),
    api.get<Bill[]>("/bills").catch(() => []),
    api.get<MonthlyClosing[]>("/closings").catch(() => []),
    api
      .get<{
        missionTarget: number
        missionProjects: MissionProject[]
      }>("/settings")
      .catch(() => ({ missionTarget: 2000, missionProjects: [] })),
    api.get<Transaction[]>("/transactions").catch(() => []),
    api.get<MissionIncome[]>("/missoes").catch(() => []), // Fallback para array vazio se endpoint não existir
    api.get<MissionCampaign[]>("/missoes/campaigns").catch(() => []), // Buscar campanhas
  ])

  // Garantir que missionIncomes e missionCampaigns sejam arrays
  const safeIncomes = Array.isArray(missionIncomes) ? missionIncomes : []
  const safeCampaigns = Array.isArray(missionCampaigns) ? missionCampaigns : []

  // Tentar carregar progresso de missões
  let missionProgress: MissionProgress | undefined
  try {
    missionProgress = await api.get<MissionProgress>("/missoes/progress")
  } catch {
    // Calcular localmente se API falhar
    const currentProgress = safeIncomes.reduce((sum, m) => sum + m.value, 0)
    const missionTarget = settings.missionTarget || 5000
    missionProgress = {
      currentProgress,
      missionTarget,
      percentage:
        missionTarget > 0
          ? ((currentProgress / missionTarget) * 100).toFixed(2)
          : "0.00",
      remaining: Math.max(0, missionTarget - currentProgress),
    }
  }

  return {
    users,
    accounts,
    transactions,
    bills,
    closings,
    missionTarget: settings.missionTarget || 2000,
    missionProjects: settings.missionProjects || [
      { name: "EBF", value: 500 },
      { name: "Missões Mundiais", value: 800 },
      { name: "Ação Social Local", value: 600 },
    ],
    missionCampaigns: safeCampaigns,
    missionIncomes: safeIncomes,
    missionProgress,
    isConfigured: true,
  }
}
