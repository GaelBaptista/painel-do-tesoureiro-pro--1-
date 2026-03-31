import { AppData, UserRole } from "./types"

export const INCOME_CATEGORIES = [
  "Dízimos",
  "Ofertas",
  "Campanhas",
  "Doações",
  "Eventos",
  "Missões (Entrada)",
  "Outros",
]

export const EXPENSE_CATEGORIES = [
  "Água",
  "Luz",
  "Internet",
  "Aluguel",
  "Manutenção",
  "Materiais",
  "Ajuda Social",
  "Missões (Saída)",
  "Outros",
]

export const APP_STORAGE_KEY = "tesouraria_pro_data_v3"

export const INITIAL_DATA: AppData = {
  users: [
    {
      id: "u1",
      name: "Administrador Demo",
      username: "admin",
      password: "admin",
      role: UserRole.ADMIN,
      churchName: "Igreja Sede Demo",
      pastorName: "Pastor Exemplo",
      email: "admin@exemplo.com",
    },
  ],
  accounts: [], // Start empty to trigger setup
  transactions: [],
  bills: [],
  closings: [],
  missionTarget: 0,
  missionProjects: [],
  missionCampaigns: [],
  missionIncomes: [],
  isConfigured: false,
}
