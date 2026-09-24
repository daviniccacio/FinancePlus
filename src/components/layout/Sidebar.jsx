// src/components/layout/Sidebar.jsx
import { LayoutDashboard, ReceiptText, LogOut, Sun, Moon, Settings } from 'lucide-react';

export default function Sidebar({ abaAtiva, setAbaAtiva, lidarComLogout, dark, setDark }) {
  const menus = [
    { id: 'dashboard', nome: 'Resumo / Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'lancamentos', nome: 'Lançamentos', icon: <ReceiptText className="w-4 h-4" /> },
    { id: 'configuracoes', nome: 'Configurações', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#161e18] border-r border-gray-200 dark:border-[#273C2C] h-screen sticky top-0 flex flex-col justify-between p-5 select-none md:flex transition-colors duration-200 font-sans">
      <div>
        {/* CABEÇALHO */}
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <div className="p-1 bg-transparent rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              src={dark ? "/kashiologobranco.png" : "/kashiologo.png"} 
              alt="Logo Gestor Financeiro" 
              className="w-12 h-12 object-contain rounded-2xl" 
            />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-none text-gray-900 dark:text-[#FFE2FE]">
              Kashio
            </h1>
            <span className="text-[10px] font-medium text-gray-500 dark:text-[#939196]">
              Gestão Financeira Pessoal
            </span>
          </div>
        </div>

        {/* NAVEGAÇÃO */}
        <nav className="space-y-1">
          {menus.map((menu) => {
            const isActive = abaAtiva === menu.id;
            return (
              <button
                key={menu.id}
                type="button"
                onClick={() => setAbaAtiva(menu.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#273C2C] text-white border-[#273C2C] dark:bg-[#D3C1D2]/15 dark:text-[#FFE2FE] dark:border-[#D3C1D2] shadow-xs'
                    : 'text-gray-600 dark:text-[#939196] border-transparent hover:bg-gray-100 dark:hover:bg-[#273C2C]/40 hover:text-gray-900 dark:hover:text-[#FFE2FE]'
                }`}
              >
                <span>{menu.icon}</span>
                <span>{menu.nome}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* RODAPÉ: MODO CLARO/ESCURO E LOGOUT */}
      <div className="border-t border-gray-200 dark:border-[#273C2C] pt-4 space-y-1">
        <button
          type="button"
          onClick={() => setDark(!dark)}
          className="w-full flex items-center justify-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-[#D3C1D2] bg-gray-100 dark:bg-transparent hover:bg-gray-200 dark:hover:bg-[#273C2C]/40 transition-all cursor-pointer"
        >
          {dark ? (
            <>
              <Sun className="w-4 h-4 text-[#D3C1D2]" />
              <span>Modo Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-[#273C2C]" />
              <span>Modo Escuro</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={lidarComLogout}
          className="w-full flex items-center justify-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-[#273c2c] transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da Conta</span>
        </button>
      </div>
    </aside>
  );
}