
import React from 'react';
import { Settings, Save, Database, Shield, FileDown, FileUp, Key } from 'lucide-react';
import { AppData } from '../types';

interface SettingsProps {
  data: AppData;
  onUpdate: (data: Partial<AppData>) => void;
}

const SettingsView: React.FC<SettingsProps> = ({ data, onUpdate }) => {
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_tesouraria_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    alert('Backup exportado com sucesso!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Configurações</h1>
          <p className="text-slate-500">Ajuste as preferências do sistema e gerencie seus dados.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-blue-100 text-blue-600 font-bold shadow-sm">
            <Shield size={20} /> Segurança
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
            <Database size={20} /> Backup e Restauração
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
            <Settings size={20} /> Categorias e Contas
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Database size={20} className="text-slate-400" />
              Gestão de Dados
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-bold text-slate-700">Exportar Backup</p>
                  <p className="text-sm text-slate-400">Baixe todos os seus dados em um arquivo seguro.</p>
                </div>
                <button 
                  onClick={handleExport}
                  className="p-3 bg-white border border-slate-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                >
                  <FileDown size={24} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-bold text-slate-700">Restaurar Dados</p>
                  <p className="text-sm text-slate-400">Importe um arquivo de backup anterior.</p>
                </div>
                <button className="p-3 bg-white border border-slate-200 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors shadow-sm">
                  <FileUp size={24} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Key size={20} className="text-slate-400" />
              Acesso e Segurança
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Senha de Acesso</label>
                <div className="flex gap-2">
                  <input 
                    type="password" 
                    value="**********" 
                    disabled 
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500"
                  />
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors">
                    Alterar
                  </button>
                </div>
              </div>
              <div className="p-4 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 text-sm">
                A senha é armazenada apenas no seu dispositivo. Caso esqueça, precisará restaurar de um backup.
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-lg">
              <Save size={20} /> Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
