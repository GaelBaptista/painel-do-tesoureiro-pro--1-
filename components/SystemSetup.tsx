
import React, { useState } from 'react';
import { Church, Wallet, Landmark, Target, ArrowRight, ArrowLeft, CheckCircle2, PiggyBank } from 'lucide-react';
import { AppData, User, BankAccount } from '../types';

interface SystemSetupProps {
  currentUser: User;
  onComplete: (setupData: Partial<AppData>) => void;
}

const SystemSetup: React.FC<SystemSetupProps> = ({ currentUser, onComplete }) => {
  const [step, setStep] = useState(1);
  const [initialCash, setInitialCash] = useState<number>(0);
  const [bankAccounts, setBankAccounts] = useState<Partial<BankAccount>[]>([
    { id: 'bank-1', name: 'Conta Principal', bankName: '', type: 'Conta Corrente', initialBalance: 0 }
  ]);
  const [missionTarget, setMissionTarget] = useState<number>(2000);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const addBankAccount = () => {
    setBankAccounts([...bankAccounts, { 
      id: `bank-${Date.now()}`, 
      name: `Conta ${bankAccounts.length + 1}`, 
      bankName: '', 
      type: 'Conta Corrente', 
      initialBalance: 0 
    }]);
  };

  const updateBankAccount = (id: string, field: keyof BankAccount, value: any) => {
    setBankAccounts(bankAccounts.map(acc => acc.id === id ? { ...acc, [field]: value } : acc));
  };

  const handleFinish = () => {
    const cashAccount: BankAccount = {
      id: 'cash-main',
      name: 'Caixa Local (Físico)',
      type: 'Caixa Físico',
      initialBalance: initialCash
    };

    const formattedBankAccounts = bankAccounts.map(acc => ({
      ...acc,
      id: acc.id || Math.random().toString(36).substr(2, 9),
      name: acc.name || 'Conta Bancária',
      type: acc.type || 'Conta Corrente',
      initialBalance: Number(acc.initialBalance || 0)
    })) as BankAccount[];

    onComplete({
      accounts: [cashAccount, ...formattedBankAccounts],
      missionTarget: missionTarget,
      isConfigured: true
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-100 flex">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`flex-1 transition-all duration-500 ${step >= i ? 'bg-blue-600' : 'bg-transparent'}`}
            />
          ))}
        </div>

        <div className="p-10">
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Church size={32} />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                Bem-vindo à sua nova Tesouraria!
              </h1>
              <p className="text-slate-500 leading-relaxed">
                Olá, <span className="text-slate-900 font-bold">{currentUser.name}</span>. 
                Estamos felizes em ajudar na gestão da <span className="text-blue-600 font-bold">{currentUser.churchName}</span>.
                <br /><br />
                Para começarmos, precisamos configurar os saldos iniciais do seu caixa e contas bancárias. Isso levará apenas 2 minutos.
              </p>
              <button 
                onClick={nextStep}
                className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
              >
                Vamos Começar
                <ArrowRight size={20} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <PiggyBank size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Saldo do Caixa Local</h2>
              </div>
              <p className="text-sm text-slate-500">
                Quanto dinheiro físico (em mãos/cofre) a igreja possui hoje para iniciar o sistema?
              </p>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valor em Espécie (R$)</label>
                <input 
                  type="number" 
                  autoFocus
                  className="w-full text-4xl font-extrabold text-slate-800 border-b-2 border-slate-100 focus:border-blue-600 outline-none py-2 transition-all"
                  placeholder="0,00"
                  value={initialCash || ''}
                  onChange={(e) => setInitialCash(Number(e.target.value))}
                />
              </div>
              <div className="pt-8 flex gap-3">
                <button onClick={prevStep} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Voltar</button>
                <button onClick={nextStep} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md">Próximo</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Landmark size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Contas Bancárias</h2>
              </div>
              <p className="text-sm text-slate-500">
                Adicione as contas bancárias que a igreja utiliza.
              </p>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {bankAccounts.map((acc, idx) => (
                  <div key={acc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Apelido/Nome</label>
                        <input 
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm"
                          value={acc.name}
                          onChange={(e) => updateBankAccount(acc.id!, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Saldo Inicial (R$)</label>
                        <input 
                          type="number"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                          value={acc.initialBalance || ''}
                          onChange={(e) => updateBankAccount(acc.id!, 'initialBalance', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={addBankAccount}
                className="w-full py-2 border-2 border-dashed border-slate-200 text-slate-400 rounded-xl text-sm font-bold hover:border-blue-300 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Adicionar outra conta
              </button>

              <div className="pt-4 flex gap-3">
                <button onClick={prevStep} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Voltar</button>
                <button onClick={nextStep} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md">Próximo</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fadeIn text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Meta de Missões</h2>
              <p className="text-sm text-slate-500">
                Qual o alvo mensal de arrecadação para missões? 
                (Você poderá mudar isso depois).
              </p>
              
              <div className="max-w-[200px] mx-auto">
                <input 
                  type="number" 
                  className="w-full text-center text-4xl font-extrabold text-blue-600 border-b-2 border-slate-100 focus:border-blue-600 outline-none py-2 transition-all"
                  value={missionTarget}
                  onChange={(e) => setMissionTarget(Number(e.target.value))}
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3 text-left">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={18} />
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tudo pronto! Ao clicar em concluir, você será levado ao dashboard principal onde poderá realizar seu primeiro lançamento.
                </p>
              </div>

              <div className="pt-8 flex gap-3">
                <button onClick={prevStep} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Voltar</button>
                <button 
                  onClick={handleFinish}
                  className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  Concluir Configuração
                  <CheckCircle2 size={24} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Plus = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default SystemSetup;
