// src/components/common/CustomToast.jsx
import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Componente visual do Toast Personalizado.
 * Renderiza o cartão de notificação flutuante sem borda lateral espessa e com temporizador autónomo.
 */
export default function CustomToast({ t, mensagem, tipo = 'success', duracao = 3500 }) {
  const [visivel, setVisivel] = useState(true);

  // Configuração de ícones e paleta de cores segundo o tipo de alerta
  const configuracoes = {
    success: {
      icone: CheckCircle2,
      corIcone: 'text-[#10B981]',
      bgIcone: 'bg-[#10B981]/10 border-[#10B981]/20',
    },
    error: {
      icone: AlertCircle,
      corIcone: 'text-rose-500',
      bgIcone: 'bg-rose-500/10 border-rose-500/20',
    },
    info: {
      icone: Info,
      corIcone: 'text-sky-500',
      bgIcone: 'bg-sky-500/10 border-sky-500/20',
    },
  };

  const config = configuracoes[tipo] || configuracoes.success;
  const IconeComponente = config.icone;

  // 🌟 useCallback resolve o aviso do ESLint (react-hooks/exhaustive-deps)
  const fechar = useCallback(() => {
    setVisivel(false);
    setTimeout(() => {
      toast.dismiss(t.id);
      toast.remove(t.id);
    }, 200);
  }, [t.id]);

  // Temporizador automático para fechar o toast após a duração estipulada
  useEffect(() => {
    const timer = setTimeout(() => {
      fechar();
    }, duracao);

    return () => clearTimeout(timer);
  }, [duracao, fechar]);

  return (
    <div
      className={`max-w-md w-full font-sans flex items-center justify-between p-3.5 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 ease-in-out bg-white dark:bg-[#161e18] border-gray-200 dark:border-[#273C2C] text-gray-900 dark:text-[#FFE2FE] pointer-events-auto ${
        visivel && t.visible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Ícone com destaque de fundo */}
        <div className={`p-2 rounded-xl border shrink-0 ${config.bgIcone}`}>
          <IconeComponente className={`w-4 h-4 ${config.corIcone}`} />
        </div>

        {/* Texto do alerta */}
        <p className="text-xs font-semibold leading-relaxed text-gray-800 dark:text-[#FFE2FE]">
          {mensagem}
        </p>
      </div>

      {/* Botão de encerramento manual */}
      <button
        type="button"
        onClick={fechar}
        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#273C2C] text-gray-400 dark:text-[#939196] transition-colors cursor-pointer shrink-0 ml-3"
        title="Fechar notificação"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}