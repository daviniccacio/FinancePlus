// src/components/DeleteModal.jsx
import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function DeleteModal({ grupoId, setIdExclusaoConfirmar, ejecutarExclusao }) {
  // Estado local para controlar se o utilizador marcou a opção de apagar a série inteira
  const [apagarEmLote, setApagarEmLote] = useState(false);

  return (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl w-full max-w-sm space-y-4 text-center transition-colors duration-200">
        
        <div className="flex flex-col items-center gap-2">
          <div className="bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-100 dark:border-red-900/40 text-red-500">
            <Trash2 className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-sm text-neutral-800 dark:text-zinc-100">Confirmar Exclusão</h2>
          <p className="text-xs text-neutral-500 dark:text-zinc-400">
            Tem certeza de que deseja apagar permanentemente este lançamento? Esta ação não pode ser desfeita.
          </p>
        </div>

        {/* 🌟 Caixa de seleção condicional: só aparece se o lançamento pertencer a um grupo/série */}
        {grupoId && (
          <div className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-zinc-800/60 rounded-xl border border-gray-100 dark:border-zinc-800 text-left">
            <input
              type="checkbox"
              id="apagarLoteCheck"
              checked={apagarEmLote}
              onChange={(e) => setApagarEmLote(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="apagarLoteCheck" className="text-xs text-neutral-600 dark:text-zinc-300 font-medium cursor-pointer select-none">
              Apagar também todos os pagamentos futuros desta mesma série/grupo.
            </label>
          </div>
        )}

        <div className="flex justify-center gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
          <button 
            type="button" 
            onClick={() => setIdExclusaoConfirmar(null)} 
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-600 dark:text-zinc-300 rounded-xl text-xs font-semibold transition-colors w-full cursor-pointer"
          >
            Cancelar
          </button>
          
          <button 
            type="button" 
            onClick={() => ejecutarExclusao(apagarEmLote)} 
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition-all shadow-sm w-full active:scale-[0.99] cursor-pointer"
          >
            Excluir
          </button>
        </div>

      </div>
    </div>
  );
}