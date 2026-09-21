// src/components/DeleteModal.jsx
import { useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function DeleteModal({ grupoId, setIdExclusaoConfirmar, ejecutarExclusao }) {
  const [apagarEmLote, setApagarEmLote] = useState(false);
  
  const backdropRef = useRef(null);
  const modalBoxRef = useRef(null);

  // 🌟 GSAP: Entrada do modal com slide-down elástico e opacidade
  useGSAP(() => {
    gsap.fromTo(
      backdropRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: 'power2.out' }
    );

    gsap.fromTo(
      modalBoxRef.current,
      { y: -40, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.3)' }
    );
  }, { scope: backdropRef });

  // Interceptador para fechar com animação suave de saída
  const fecharComAnimacao = (callbackAcao) => {
    gsap.to(modalBoxRef.current, {
      y: -25,
      opacity: 0,
      scale: 0.95,
      duration: 0.2,
      ease: 'power2.in',
    });

    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        if (callbackAcao) {
          callbackAcao();
        } else {
          setIdExclusaoConfirmar(null);
        }
      },
    });
  };

  return (
    <div 
      ref={backdropRef}
      className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-hidden font-sans"
    >
      <div 
        ref={modalBoxRef}
        className="p-6 rounded-3xl border shadow-2xl w-full max-w-sm space-y-4 text-center transition-colors duration-200 bg-white dark:bg-[#161e18] border-gray-200 dark:border-[#273C2C] text-gray-900 dark:text-[#FFE2FE]"
      >
        
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-500 dark:text-rose-400">
            <Trash2 className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-base text-gray-900 dark:text-[#FFE2FE]">Confirmar Exclusão</h2>
          <p className="text-xs font-medium leading-relaxed text-gray-500 dark:text-[#939196]">
            Tem certeza de que deseja apagar permanentemente este lançamento? Esta ação não pode ser desfeita.
          </p>
        </div>

        {/* Caixa de seleção condicional para exclusão em grupo */}
        {grupoId && (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl border text-left bg-gray-50 dark:bg-[#273C2C]/25 border-gray-200 dark:border-[#626868]">
            <input
              type="checkbox"
              id="apagarLoteCheck"
              checked={apagarEmLote}
              onChange={(e) => setApagarEmLote(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-[#626868] focus:ring-0 cursor-pointer accent-[#273C2C] dark:accent-[#D3C1D2]"
            />
            <label 
              htmlFor="apagarLoteCheck" 
              className="text-xs font-medium cursor-pointer select-none leading-snug text-gray-700 dark:text-[#D3C1D2]"
            >
              Apagar também todos os pagamentos futuros desta mesma série/grupo.
            </label>
          </div>
        )}

        <div className="flex justify-center gap-2 pt-3 border-t border-gray-200 dark:border-[#273C2C]">
          <button 
            type="button" 
            onClick={() => fecharComAnimacao(null)} 
            className="px-4 py-2.5 rounded-xl text-xs font-bold transition-opacity hover:opacity-80 w-full cursor-pointer bg-gray-200 dark:bg-[#273C2C] text-gray-700 dark:text-[#D3C1D2]"
          >
            Cancelar
          </button>
          
          <button 
            type="button" 
            onClick={() => fecharComAnimacao(() => ejecutarExclusao(apagarEmLote))} 
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md w-full active:scale-[0.98] cursor-pointer"
          >
            Excluir
          </button>
        </div>

      </div>
    </div>
  );
}