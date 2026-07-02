import { Trash2 } from 'lucide-react';

export default function DeleteModal({ setIdExclusaoConfirmar, ejecutarExclusao }) {
  return (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xl w-full max-w-sm space-y-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-red-50 p-2.5 rounded-xl border border-red-100 text-red-500">
            <Trash2 className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-sm text-neutral-800">Confirmar Exclusão</h2>
          <p className="text-xs text-neutral-500">
            Tem certeza de que deseja apagar permanentemente este lançamento? Esta ação não pode ser desfeita.
          </p>
        </div>
        <div className="flex justify-center gap-2 pt-2 border-t border-gray-100">
          <button type="button" onClick={() => setIdExclusaoConfirmar(null)} className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-xl text-xs font-semibold transition-colors w-full">Cancelar</button>
          <button type="button" onClick={ejecutarExclusao} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition-all shadow-sm w-full active:scale-[0.99]">Excluir</button>
        </div>
      </div>
    </div>
  );
}