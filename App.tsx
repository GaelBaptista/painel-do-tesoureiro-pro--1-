import React, { useState, useEffect } from "react"
import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom"
import {
  LayoutDashboard,
  FileText,
  Globe,
  Settings,
  Plus,
  Wallet,
  LogOut,
  Menu,
  CreditCard,
  Users as UsersIcon,
  Building2,
  Church,
} from "lucide-react"

import Dashboard from "./components/Dashboard"
import Transactions from "./components/Transactions"
import Bills from "./components/Bills"
import Missions from "./components/Missions"
import Reports from "./components/Reports"
import SettingsView from "./components/Settings"
import Login from "./components/Login"
import Signup from "./components/Signup"
import Users from "./components/Users"
import Accounts from "./components/Accounts"
import SystemSetup from "./components/SystemSetup"

import { AppData, User } from "./types"
import { loadData, saveData } from "./lib/storage"
import { loadUser, clearAuth, getToken } from "./lib/authStorage"
import { api } from "./lib/api"
import { fetchAppData } from "./lib/loadAppData"

const SidebarItem: React.FC<{
  to: string
  icon: any
  label: string
  active: boolean
  onClick?: () => void
}> = ({ to, icon: Icon, label, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active
        ? "bg-blue-600 text-white shadow-md"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
)

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(loadUser())
  const [data, setData] = useState<AppData>(loadData())
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [loading, setLoading] = useState(false)

  // Carregar dados do backend quando usuário está logado
  useEffect(() => {
    if (currentUser && getToken()) {
      loadAppDataFromBackend()
    }
  }, [currentUser])

  const loadAppDataFromBackend = async () => {
    try {
      setLoading(true)
      const appData = await fetchAppData()
      setData(appData)
      saveData(appData) // Salvar apenas como cache local
    } catch (err) {
      console.error("Erro ao carregar dados:", err)
      // Fallback para dados locais
    } finally {
      setLoading(false)
    }
  }

  // Função para recarregar dados após operações no backend
  const reloadData = async () => {
    try {
      const appData = await fetchAppData()
      setData(appData)
      saveData(appData)
    } catch (err) {
      console.error("Erro ao recarregar dados:", err)
    }
  }

  const updateData = (newData: Partial<AppData>) => {
    setData(prev => {
      const updated = { ...prev, ...newData }
      saveData(updated) // Cache local apenas
      return updated
    })
  }

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    setIsSigningUp(false)
    setData(prev => ({
      ...prev,
      isConfigured: true,
      users: [user],
    }))
  }

  const handleSignup = (user: User) => {
    setCurrentUser(user)
    setIsSigningUp(false)
    setData(prev => ({
      ...prev,
      isConfigured: true,
      users: [user],
      accounts: [],
      transactions: [],
      bills: [],
      closings: [],
    }))
  }

  const handleLogout = () => {
    clearAuth()
    setCurrentUser(null)
    setData(loadData())
  }

  const handleSetupComplete = (setupData: Partial<AppData>) => {
    const newData = {
      ...data,
      ...setupData,
      isConfigured: true,
    }
    setData(newData)
    saveData(newData)
  }

  // Tela de login/signup
  if (!currentUser) {
    if (isSigningUp) {
      return (
        <Signup
          onSignup={handleSignup}
          onToggleLogin={() => setIsSigningUp(false)}
        />
      )
    }
    return (
      <Login
        onLogin={handleLogin}
        onToggleSignup={() => setIsSigningUp(true)}
      />
    )
  }

  // Setup inicial (apenas se estiver sem configuração)
  if (!data.isConfigured && !loading) {
    return (
      <SystemSetup currentUser={currentUser} onComplete={handleSetupComplete} />
    )
  }
  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50">
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <aside
          className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        >
          <div className="h-full flex flex-col p-4">
            <div className="flex items-center gap-3 px-2 mb-8">
              <div className="bg-blue-600 p-2 rounded-xl text-white">
                <Wallet size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">
                Tesouraria<span className="text-blue-600">Pro</span>
              </h1>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto pr-2">
              <NavLinks
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                currentUser={currentUser}
              />
            </nav>

            <div className="pt-4 border-t border-slate-100">
              <div className="px-4 py-2 mb-2 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Igreja
                </p>
                <p className="text-xs font-bold text-slate-800 truncate mb-1">
                  {currentUser.churchName || "N/A"}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Tesoureiro
                </p>
                <p className="text-sm font-semibold text-slate-700 truncate">
                  {currentUser.name}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">Sair do Sistema</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 text-slate-600"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
              <div className="flex items-center gap-2 text-slate-500">
                <Church size={18} />
                <h2 className="text-sm font-bold uppercase tracking-wider hidden sm:block">
                  {currentUser.churchName}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">
                  Tesoureiro(a)
                </p>
                <p className="text-sm font-bold text-slate-700 leading-none">
                  {currentUser.name}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <UsersIcon size={16} />
              </div>
            </div>
          </header>

          <div className="p-6 overflow-x-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-slate-600">Carregando dados...</p>
                </div>
              </div>
            ) : (
              <Routes>
                <Route
                  path="/"
                  element={
                    <Dashboard
                      data={data}
                      currentUser={currentUser}
                      onUpdate={updateData}
                    />
                  }
                />
                <Route
                  path="/lancamentos"
                  element={
                    <Transactions
                      data={data}
                      onUpdate={updateData}
                      currentUser={currentUser}
                      onDataChange={reloadData}
                    />
                  }
                />
                <Route
                  path="/pagamentos"
                  element={
                    <Bills
                      data={data}
                      onUpdate={updateData}
                      onDataChange={reloadData}
                      currentUser={currentUser}
                    />
                  }
                />
                <Route
                  path="/contas"
                  element={
                    <Accounts
                      data={data}
                      onUpdate={updateData}
                      onDataChange={reloadData}
                    />
                  }
                />
                <Route
                  path="/usuarios"
                  element={
                    <Users
                      data={data}
                      onUpdate={updateData}
                      currentUser={currentUser}
                      onDataChange={reloadData}
                    />
                  }
                />
                <Route
                  path="/missoes"
                  element={
                    <Missions
                      data={data}
                      onUpdate={updateData}
                      onDataChange={reloadData}
                    />
                  }
                />
                <Route path="/relatorios" element={<Reports data={data} />} />
                <Route
                  path="/configuracoes"
                  element={<SettingsView data={data} onUpdate={updateData} />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}
          </div>
        </main>
      </div>
    </Router>
  )
}

const NavLinks = ({
  setIsMobileMenuOpen,
  currentUser,
}: {
  setIsMobileMenuOpen: (v: boolean) => void
  currentUser: User
}) => {
  const location = useLocation()
  const links = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/lancamentos", icon: Plus, label: "Lançamentos" },
    { to: "/contas", icon: Building2, label: "Contas Bancárias" },
    { to: "/pagamentos", icon: CreditCard, label: "Contas a Pagar" },
    { to: "/missoes", icon: Globe, label: "Missões" },
    { to: "/relatorios", icon: FileText, label: "Relatórios" },
    { to: "/usuarios", icon: UsersIcon, label: "Usuários" },
    { to: "/configuracoes", icon: Settings, label: "Configurações" },
  ]

  return (
    <>
      {links.map(link => (
        <SidebarItem
          key={link.to}
          to={link.to}
          icon={link.icon}
          label={link.label}
          active={location.pathname === link.to}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      ))}
    </>
  )
}

export default App
