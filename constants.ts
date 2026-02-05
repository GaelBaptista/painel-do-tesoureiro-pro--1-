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
  bills: [
    {
      id: "b1",
      description: "Energia Elétrica",
      value: 350,
      dueDate: 10,
      category: "Luz",
      isRecurring: true,
      status: "Pendente" as any,
    },
    {
      id: "b2",
      description: "Internet Fibra",
      value: 120,
      dueDate: 5,
      category: "Internet",
      isRecurring: true,
      status: "Pendente" as any,
    },
  ],
  closings: [],
  missionTarget: 2000,
  missionProjects: [
    { name: "EBF", value: 500 },
    { name: "Missões Mundiais", value: 800 },
    { name: "Ação Social Local", value: 600 },
  ],
  missionCampaigns: [],
  missionIncomes: [],
  isConfigured: false,
}
