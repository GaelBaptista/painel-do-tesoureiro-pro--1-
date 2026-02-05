export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  TRANSFER = "TRANSFER",
}

export enum AccountType {
  CASH = "Caixa",
  BANK = "Banco",
}

export enum BillStatus {
  PENDING = "Pendente",
  PAID = "Pago",
  OVERDUE = "Atrasado",
}

export enum UserRole {
  ADMIN = "Administrador",
  TREASURER = "Tesoureiro",
  VIEWER = "Observador",
}

export interface User {
  id: string
  name: string // This will be the Treasurer's Name
  username: string
  password?: string
  role: UserRole
  churchName?: string
  pastorName?: string
  email?: string
}

export interface BankAccount {
  id: string
  name: string
  bankName?: string
  type: string // Corrente, Poupança, Caixa Físico
  initialBalance: number
}

export interface Transaction {
  id: string
  type: TransactionType
  value: number
  date: string
  description: string
  category: string
  accountId: string // Reference to BankAccount.id
  attachment?: string
  isRecurring?: boolean
  toAccountId?: string // Used for Transfers
  userId?: string // Who made the entry
}

export interface Bill {
  id: string
  description: string
  value: number
  dueDate: number
  category: string
  isRecurring: boolean
  status: BillStatus
  lastPaymentDate?: string
}

export interface MonthlyClosing {
  month: number
  year: number
  isClosed: boolean
  closedAt?: string
}

export interface MissionProject {
  name: string
  value: number // Valor fixo em reais, não porcentagem
}

export interface MissionCampaign {
  id: string
  name: string
  target: number
  startDate: string
  endDate?: string
  status: "active" | "completed"
}

export interface MissionIncome {
  id: string
  campaignId: string // ID da campanha associada
  source: "Ofertas" | "Cantina" | "Bazzar" | "Outro"
  value: number
  date: string
  description?: string
}

export interface MissionReport {
  source: string
  value: number
  percentage: string
}

export interface MissionProgress {
  currentProgress: number
  missionTarget: number
  percentage: string
  remaining: number
}

export interface AppData {
  users: User[]
  accounts: BankAccount[]
  transactions: Transaction[]
  bills: Bill[]
  closings: MonthlyClosing[]
  missionTarget: number
  missionProjects: MissionProject[] // Customizable mission projects
  missionCampaigns: MissionCampaign[] // Campanhas de missões
  missionIncomes: MissionIncome[]
  missionProgress?: MissionProgress
  isConfigured: boolean // Flag for first-time setup
}
