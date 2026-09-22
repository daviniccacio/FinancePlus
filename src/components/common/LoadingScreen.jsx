// src/components/common/LoadingScreen.jsx

/**
 * Componente da Tela de Loading Animada do FinancePlus.
 * Utiliza a paleta oficial (Verde Evergreen #1b3022 e Rosa Suave #f7dcf2).
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} [props.mensagem="A carregar o FinancePlus..."] - Texto exibido abaixo da animação
 */
export default function LoadingScreen({ mensagem = 'A carregar o FinancePlus...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1b3022] text-white select-none overflow-hidden font-sans">
      
      {/* 🌟 1. ELEMENTOS VISUAIS DE FUNDO (Brilhos de Luz) */}
      <div className="absolute w-96 h-96 bg-[#f7dcf2]/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
      
      {/* 🌟 2. CARTÃO CENTRAL COM O LOGÓTIPO F+ ANIMADO */}
      <div className="relative flex flex-col items-center gap-6 z-10">
        
        {/* Anéis de Expansão (Efeito Ripple) */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-2xl bg-[#f7dcf2]/20 animate-ping duration-1000" />
          <div className="absolute w-24 h-24 rounded-3xl bg-[#f7dcf2]/10 animate-pulse duration-700" />

          {/* Caixa da Logo F+ */}
          <div className="relative w-16 h-16 rounded-2xl bg-[#f7dcf2] text-[#1b3022] font-black text-2xl flex items-center justify-center shadow-2xl transition-transform hover:scale-105">
            F+
          </div>
        </div>

        {/* Nome da Aplicação */}
        <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-white pt-2">
          <span>Finance</span>
          <span className="text-[#f7dcf2]">Plus</span>
        </div>

        {/* 🌟 3. BARRA DE PROGRESSO & MENSAGEM */}
        <div className="flex flex-col items-center gap-3 w-64 pt-2">
          {/* Trilho da Barra de Progresso */}
          <div className="w-full h-1.5 bg-[#233d2c] rounded-full overflow-hidden relative">
            <div className="h-full bg-[#f7dcf2] rounded-full w-1/3 animate-[loadingBar_1.5s_infinite_ease-in-out]" />
          </div>

          {/* Mensagem Exibida */}
          <p className="text-xs font-semibold text-[#f7dcf2]/80 tracking-wide animate-pulse">
            {mensagem}
          </p>
        </div>

      </div>

      {/* 🌟 4. RODAPÉ SUTIL */}
      <div className="absolute bottom-6 text-[10px] font-medium text-gray-400/60 tracking-wider uppercase">
        Gestão Financeira Pessoal
      </div>

      {/* Estilo CSS Inline para a animação da barra de progresso */}
      <style>{`
        @keyframes loadingBar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
    </div>
  );
}