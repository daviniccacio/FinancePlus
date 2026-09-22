// src/components/NotFound.jsx
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';

/**
 * Componente NotFound (Página de Erro 404)
 * 
 * @param {Object} props - Propriedades passadas para o componente.
 * @param {Object|null} props.session - Estado da sessão do utilizador (se está logado ou não).
 */
export default function NotFound({ session }) {
  // Hook do React Router para navegar entre páginas programaticamente
  const navigate = useNavigate();

  // Se existir uma sessão ativa, o destino principal será o Dashboard.
  // Caso contrário, o destino principal será a página de Login.
  const destinoInicio = session ? '/dashboard' : '/';

  return (
    <div className="min-h-screen font-sans bg-[#1b3022] text-white flex flex-col justify-between p-6 selection:bg-[#f7dcf2] selection:text-[#1b3022]">
      
      {/* 🌟 1. CABEÇALHO COM O LOGÓTIPO */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div 
          className="flex items-center gap-2.5 cursor-pointer" 
          onClick={() => navigate(destinoInicio)}
        >
          {/* Caixa do Ícone F+ */}
          <div className="w-9 h-9 rounded-xl bg-[#f7dcf2] flex items-center justify-center text-[#1b3022] font-black text-sm shadow-md">
            F+
          </div>
          <span className="text-lg font-bold tracking-tight text-white">FinancePlus</span>
        </div>
      </header>

      {/* 🌟 2. CARTÃO CENTRAL DE ERRO */}
      <main className="max-w-lg mx-auto w-full my-auto text-center py-12">
        <div className="p-8 md:p-12 rounded-[2.5rem] bg-[#233d2c] border border-[#2f4e39] shadow-2xl backdrop-blur-md space-y-6">
          
          {/* Badge Indicativa de Erro */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1b3022] border border-[#2f4e39] text-[#f7dcf2] text-xs font-bold">
            <AlertCircle className="w-4 h-4 text-[#f7dcf2]" />
            <span>ERRO 404</span>
          </div>

          {/* Código de Erro 404 em Grande Destaque */}
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-[#f7dcf2] leading-none">
            404
          </h1>

          {/* Mensagem de Explicativa */}
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Página não encontrada
            </h2>
            <p className="text-xs md:text-sm text-gray-300 font-medium leading-relaxed">
              A página que está a tentar aceder não existe, foi movida ou o endereço inserido está incorreto.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            
            {/* Botão de Regresso ao Início / Dashboard */}
            <button
              type="button"
              onClick={() => navigate(destinoInicio)}
              className="w-full sm:w-auto px-6 py-3.5 text-xs font-bold rounded-full bg-[#f7dcf2] text-[#1b3022] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <Home className="w-4 h-4" />
              <span>{session ? 'Ir para o Painel' : 'Ir para o Login'}</span>
            </button>

            {/* Botão para Voltar à Página Anterior */}
            <button
              type="button"
              onClick={() => navigate(-1)} // -1 indica para voltar uma página no histórico do navegador
              className="w-full sm:w-auto px-6 py-3.5 text-xs font-bold rounded-full border border-[#2f4e39] bg-[#1b3022]/60 text-white hover:bg-[#1b3022] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar atrás</span>
            </button>

          </div>

        </div>
      </main>

      {/* 🌟 3. RODAPÉ */}
      <footer className="text-center text-xs text-gray-400 font-medium">
        <p>FinancePlus © {new Date().getFullYear()}</p>
      </footer>

    </div>
  );
}