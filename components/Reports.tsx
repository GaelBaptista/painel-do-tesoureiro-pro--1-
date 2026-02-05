import React, { useState } from "react"
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Search,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react"
import { AppData, TransactionType } from "../types"

interface ReportsProps {
  data: AppData
}

const Reports: React.FC<ReportsProps> = ({ data }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  // Gerar lista de anos dinamicamente baseado nas transações
  const availableYears = React.useMemo(() => {
    if (data.transactions.length === 0) {
      return [new Date().getFullYear()]
    }
    const years = data.transactions.map(t => new Date(t.date).getFullYear())
    const minYear = Math.min(...years)
    const maxYear = Math.max(new Date().getFullYear(), Math.max(...years))
    const yearsArray = []
    for (let i = minYear; i <= maxYear + 1; i++) {
      yearsArray.push(i)
    }
    return yearsArray
  }, [data.transactions])

  const reportData = React.useMemo(() => {
    const monthTx = data.transactions.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
    })

    const income = monthTx.filter(t => t.type === TransactionType.INCOME)
    const expenses = monthTx.filter(t => t.type === TransactionType.EXPENSE)

    const catsIn: any = {}
    income.forEach(
      t => (catsIn[t.category] = (catsIn[t.category] || 0) + t.value)
    )

    const catsOut: any = {}
    expenses.forEach(
      t => (catsOut[t.category] = (catsOut[t.category] || 0) + t.value)
    )

    const totalIn = income.reduce((s, t) => s + t.value, 0)
    const totalOut = expenses.reduce((s, t) => s + t.value, 0)

    return {
      totalIn,
      totalOut,
      balance: totalIn - totalOut,
      catsIn,
      catsOut,
      count: monthTx.length,
    }
  }, [data, selectedMonth, selectedYear])

  // Função para exportar Excel (CSV compatível)
  const handleExportExcel = () => {
    // Obter todas as transações do mês selecionado
    const monthTx = data.transactions.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
    })

    // Separar por tipo e categoria
    const dizimos = monthTx.filter(
      t => t.type === TransactionType.INCOME && t.category === "Dízimos"
    )
    const ofertas = monthTx.filter(
      t => t.type === TransactionType.INCOME && t.category === "Ofertas"
    )
    const outrasEntradas = monthTx.filter(
      t =>
        t.type === TransactionType.INCOME &&
        t.category !== "Dízimos" &&
        t.category !== "Ofertas"
    )
    const saidas = monthTx.filter(t => t.type === TransactionType.EXPENSE)

    // Calcular saldos
    const totalDizimos = dizimos.reduce((s, t) => s + t.value, 0)
    const totalOfertas = ofertas.reduce((s, t) => s + t.value, 0)
    const totalOutrasEntradas = outrasEntradas.reduce((s, t) => s + t.value, 0)
    const totalSaidas = saidas.reduce((s, t) => s + t.value, 0)
    const totalEntradas = totalDizimos + totalOfertas + totalOutrasEntradas

    // Calcular saldo consolidado anterior: initialBalance das contas + transações antes do mês selecionado
    const initialBalance = data.accounts.reduce(
      (sum, acc) => sum + acc.initialBalance,
      0
    )

    const previousMonthTx = data.transactions.filter(t => {
      const d = new Date(t.date)
      const currentDate = new Date(selectedYear, selectedMonth, 1)
      return d < currentDate
    })

    const previousBalance = previousMonthTx.reduce((s, t) => {
      return t.type === TransactionType.INCOME ? s + t.value : s - t.value
    }, 0)

    const saldoConsolidado = initialBalance + previousBalance

    // Saldo para próximo mês = entradas - saídas do mês
    const saldoProximoMes = totalEntradas - totalSaidas

    // Saldo atual = saldo consolidado + saldo para próximo mês
    const saldoAtual = saldoConsolidado + saldoProximoMes

    // Cabeçalho do relatório
    const rows: string[][] = [
      ["RELATÓRIO FINANCEIRO - " + months[selectedMonth] + " " + selectedYear],
      [""],
      ["ENTRADAS"],
      [""],
      ["DÍZIMOS"],
      ["Pessoa/Descrição", "Valor (R$)"],
    ]

    // Adicionar dízimos com descrição (nome da pessoa)
    dizimos.forEach(t => {
      rows.push([t.description, t.value.toFixed(2)])
    })
    rows.push(["TOTAL DE DÍZIMOS", totalDizimos.toFixed(2)])
    rows.push([""])

    // Ofertas
    rows.push(["OFERTAS"])
    ofertas.forEach(t => {
      rows.push([t.description, t.value.toFixed(2)])
    })
    rows.push(["TOTAL DE OFERTAS", totalOfertas.toFixed(2)])
    rows.push([""])

    // Outras entradas (se houver)
    if (outrasEntradas.length > 0) {
      rows.push(["OUTRAS ENTRADAS"])
      outrasEntradas.forEach(t => {
        rows.push([t.description + " (" + t.category + ")", t.value.toFixed(2)])
      })
      rows.push(["TOTAL OUTRAS ENTRADAS", totalOutrasEntradas.toFixed(2)])
      rows.push([""])
    }

    rows.push(["TOTAL DE ENTRADAS", totalEntradas.toFixed(2)])
    rows.push([""])
    rows.push([""])

    // Saídas
    rows.push(["SAÍDAS"])
    rows.push(["Descrição", "Valor (R$)"])
    saidas.forEach(t => {
      rows.push([t.description + " (" + t.category + ")", t.value.toFixed(2)])
    })
    rows.push(["TOTAL DE SAÍDAS", totalSaidas.toFixed(2)])
    rows.push([""])
    rows.push([""])

    // Saldos
    rows.push([
      "SALDO ANTERIOR (Saldo Consolidado)",
      saldoConsolidado.toFixed(2),
    ])
    rows.push(["SALDO PARA PRÓXIMO MÊS", saldoProximoMes.toFixed(2)])
    rows.push(["SALDO CONSOLIDADO", saldoConsolidado.toFixed(2)])
    rows.push(["SALDO ATUAL", saldoAtual.toFixed(2)])

    // Converter para CSV
    const csvContent = rows
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n")

    // Download
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `relatorio_${selectedYear}_${String(selectedMonth + 1).padStart(2, "0")}.csv`
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Função para imprimir/exportar PDF (usando a funcionalidade nativa do navegador)
  const handlePrintPDF = () => {
    // Obter dados do mês selecionado
    const monthTx = data.transactions.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
    })

    const dizimos = monthTx.filter(
      t => t.type === TransactionType.INCOME && t.category === "Dízimos"
    )
    const ofertas = monthTx.filter(
      t => t.type === TransactionType.INCOME && t.category === "Ofertas"
    )
    const outrasEntradas = monthTx.filter(
      t =>
        t.type === TransactionType.INCOME &&
        t.category !== "Dízimos" &&
        t.category !== "Ofertas"
    )
    const saidas = monthTx.filter(t => t.type === TransactionType.EXPENSE)

    const totalDizimos = dizimos.reduce((s, t) => s + t.value, 0)
    const totalOfertas = ofertas.reduce((s, t) => s + t.value, 0)
    const totalOutrasEntradas = outrasEntradas.reduce((s, t) => s + t.value, 0)
    const totalSaidas = saidas.reduce((s, t) => s + t.value, 0)
    const totalEntradas = totalDizimos + totalOfertas + totalOutrasEntradas

    // Calcular saldo consolidado anterior
    const initialBalance = data.accounts.reduce(
      (sum, acc) => sum + acc.initialBalance,
      0
    )

    const previousMonthTx = data.transactions.filter(t => {
      const d = new Date(t.date)
      const currentDate = new Date(selectedYear, selectedMonth, 1)
      return d < currentDate
    })

    const previousBalance = previousMonthTx.reduce((s, t) => {
      return t.type === TransactionType.INCOME ? s + t.value : s - t.value
    }, 0)

    const saldoConsolidado = initialBalance + previousBalance

    const saldoProximoMes = totalEntradas - totalSaidas
    const saldoAtual = saldoConsolidado + saldoProximoMes

    // Criar uma janela de impressão com o conteúdo estilizado
    const printWindow = window.open("", "", "width=900,height=700")
    if (!printWindow) {
      alert("Por favor, permita pop-ups para imprimir o relatório")
      return
    }

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório ${months[selectedMonth]} ${selectedYear}</title>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; padding: 30px; background: white; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1e293b; padding-bottom: 15px; }
          .header h1 { font-size: 24px; color: #1e293b; margin-bottom: 5px; }
          .header p { font-size: 12px; color: #64748b; }
          .section { margin-bottom: 25px; }
          .section-title { background-color: #f1f5f9; padding: 10px 15px; border-left: 4px solid #0ea5e9; font-weight: bold; font-size: 13px; margin-bottom: 10px; color: #1e293b; }
          .section.income .section-title { border-left-color: #10b981; }
          .section.expense .section-title { border-left-color: #ef4444; }
          .section.summary .section-title { border-left-color: #6366f1; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 15px; }
          th { background-color: #e2e8f0; padding: 8px 10px; text-align: left; font-weight: bold; color: #1e293b; border-bottom: 2px solid #cbd5e1; }
          td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .total-row { background-color: #f1f5f9; font-weight: bold; border-top: 2px solid #cbd5e1; }
          .total-row td { border-bottom: 2px solid #cbd5e1; }
          .text-right { text-align: right; }
          .value-column { text-align: right; font-weight: 500; }
          .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px; }
          .summary-card { background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; }
          .summary-card .label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 4px; }
          .summary-card .value { font-size: 16px; font-weight: bold; color: #1e293b; }
          .summary-card.positive .value { color: #10b981; }
          .summary-card.negative .value { color: #ef4444; }
          .summary-card.neutral .value { color: #0ea5e9; }
          @media print { body { padding: 15px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RELATÓRIO FINANCEIRO</h1>
          <p>${months[selectedMonth]} de ${selectedYear}</p>
        </div>

        <div class="section income">
          <div class="section-title">ENTRADAS - DÍZIMOS</div>
          <table>
            <thead><tr><th>Pessoa/Descrição</th><th class="text-right">Valor (R$)</th></tr></thead>
            <tbody>
              ${
                dizimos.length > 0
                  ? dizimos
                      .map(
                        t =>
                          `<tr><td>${t.description}</td><td class="value-column">R$ ${t.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td></tr>`
                      )
                      .join("")
                  : '<tr><td colspan="2" style="text-align:center; color:#94a3b8;">Sem dízimos neste período</td></tr>'
              }
              <tr class="total-row"><td>TOTAL DE DÍZIMOS</td><td class="value-column">R$ ${totalDizimos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td></tr>
            </tbody>
          </table>
        </div>

        <div class="section income">
          <div class="section-title">ENTRADAS - OFERTAS</div>
          <table>
            <thead><tr><th>Descrição</th><th class="text-right">Valor (R$)</th></tr></thead>
            <tbody>
              ${
                ofertas.length > 0
                  ? ofertas
                      .map(
                        t =>
                          `<tr><td>${t.description}</td><td class="value-column">R$ ${t.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td></tr>`
                      )
                      .join("")
                  : '<tr><td colspan="2" style="text-align:center; color:#94a3b8;">Sem ofertas neste período</td></tr>'
              }
              <tr class="total-row"><td>TOTAL DE OFERTAS</td><td class="value-column">R$ ${totalOfertas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td></tr>
            </tbody>
          </table>
        </div>

        ${
          outrasEntradas.length > 0
            ? `
        <div class="section income">
          <div class="section-title">ENTRADAS - OUTRAS</div>
          <table>
            <thead><tr><th>Descrição</th><th class="text-right">Valor (R$)</th></tr></thead>
            <tbody>
              ${outrasEntradas
                .map(
                  t =>
                    `<tr><td>${t.description} (${t.category})</td><td class="value-column">R$ ${t.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td></tr>`
                )
                .join("")}
              <tr class="total-row"><td>TOTAL OUTRAS ENTRADAS</td><td class="value-column">R$ ${totalOutrasEntradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td></tr>
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        <div class="section income">
          <div class="section-title">RESUMO - TOTAL DE ENTRADAS</div>
          <table>
            <tbody>
              <tr class="total-row" style="font-size: 14px;"><td>TOTAL DE ENTRADAS</td><td class="value-column">R$ ${totalEntradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td></tr>
            </tbody>
          </table>
        </div>

        <div class="section expense">
          <div class="section-title">SAÍDAS</div>
          <table>
            <thead><tr><th>Descrição</th><th class="text-right">Valor (R$)</th></tr></thead>
            <tbody>
              ${
                saidas.length > 0
                  ? saidas
                      .map(
                        t =>
                          `<tr><td>${t.description} (${t.category})</td><td class="value-column">R$ ${t.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td></tr>`
                      )
                      .join("")
                  : '<tr><td colspan="2" style="text-align:center; color:#94a3b8;">Sem saídas neste período</td></tr>'
              }
              <tr class="total-row"><td>TOTAL DE SAÍDAS</td><td class="value-column">R$ ${totalSaidas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td></tr>
            </tbody>
          </table>
        </div>

        <div class="section summary">
          <div class="section-title">RESUMO FINANCEIRO</div>
          <div class="summary-grid">
            <div class="summary-card neutral">
              <div class="label">Saldo Anterior (Consolidado)</div>
              <div class="value">R$ ${saldoConsolidado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card ${saldoProximoMes >= 0 ? "positive" : "negative"}">
              <div class="label">Saldo Para Próximo Mês</div>
              <div class="value">R$ ${saldoProximoMes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card neutral">
              <div class="label">Saldo Consolidado</div>
              <div class="value">R$ ${saldoConsolidado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card ${saldoAtual >= 0 ? "positive" : "negative"}">
              <div class="label">Saldo Atual</div>
              <div class="value">R$ ${saldoAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #cbd5e1; text-align: center; font-size: 10px; color: #94a3b8;">
          <p>Relatório gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
          <p>${monthTx.length} transações processadas</p>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(content)
    printWindow.document.close()

    // Aguardar o carregamento e imprimir
    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Relatórios</h1>
          <p className="text-slate-500">
            Gere prestações de contas mensais e anuais completas.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-emerald-200 transition-colors"
          >
            <FileSpreadsheet size={18} /> Exportar Excel
          </button>
          <button
            onClick={handlePrintPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Printer size={18} /> Imprimir PDF
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 max-w-xs">
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
              Selecione o Mês
            </label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {months.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
              Ano
            </label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {availableYears.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          id="report-content"
          className="grid grid-cols-1 md:grid-cols-2 gap-12"
        >
          {/* Entradas */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-emerald-600 uppercase tracking-tighter">
                Entradas Detalhadas
              </h3>
              <span className="text-xl font-bold text-slate-800">
                R$ {reportData.totalIn.toLocaleString()}
              </span>
            </div>
            <div className="space-y-4">
              {Object.entries(reportData.catsIn).map(([cat, val]: any) => (
                <div
                  key={cat}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-slate-500 font-medium">{cat}</span>
                  <span className="text-slate-700 font-bold">
                    R$ {val.toLocaleString()}
                  </span>
                </div>
              ))}
              {Object.keys(reportData.catsIn).length === 0 && (
                <p className="text-center text-slate-400 text-sm py-4">
                  Sem entradas este mês.
                </p>
              )}
            </div>
          </div>

          {/* Saídas */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-rose-600 uppercase tracking-tighter">
                Saídas Detalhadas
              </h3>
              <span className="text-xl font-bold text-slate-800">
                R$ {reportData.totalOut.toLocaleString()}
              </span>
            </div>
            <div className="space-y-4">
              {Object.entries(reportData.catsOut).map(([cat, val]: any) => (
                <div
                  key={cat}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-slate-500 font-medium">{cat}</span>
                  <span className="text-slate-700 font-bold text-rose-600">
                    R$ {val.toLocaleString()}
                  </span>
                </div>
              ))}
              {Object.keys(reportData.catsOut).length === 0 && (
                <p className="text-center text-slate-400 text-sm py-4">
                  Sem saídas este mês.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-slate-900 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`p-4 rounded-xl ${reportData.balance >= 0 ? "bg-emerald-500" : "bg-rose-500"}`}
            >
              <CheckCircle size={32} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Resultado Líquido do Mês
              </p>
              <h4 className="text-3xl font-extrabold">
                R${" "}
                {reportData.balance.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </h4>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400 font-medium">
              {reportData.count} transações processadas
            </p>
            <p className="text-xs text-slate-500 uppercase font-bold mt-1">
              Status: Período Aberto
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
