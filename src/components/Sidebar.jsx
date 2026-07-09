import { LayoutDashboard, ReceiptText, LogOut, Wallet } from 'lucide-react';

export default function Sidebar({ abaAtiva, setAbaAtiva, lidarComLogout }) {
  const menus = [
    { id: 'dashboard', nome: 'Resumo / Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'lancamentos', nome: 'Lançamentos', icon: <ReceiptText className="w-4 h-4" /> }
  ];

  return (
    /* CORRIGIDO AQUI: Removido o 'flex' duplicado que conflitava com 'hidden' */
    <aside className="w-64 bg-white border-r border-gray-200/80 h-screen sticky top-0 flex flex-col justify-between p-5 select-none hidden md:flex">
      <div>
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <div className="p-2 bg-blue-500 rounded-xl text-white shadow-xs">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-none">Gestor Financeiro</h1>
            <span className="text-[10px] text-gray-400 font-medium">Controle Interno</span>
          </div>
        </div>

        <nav className="space-y-1">
          {menus.map((menu) => {
            const isActive = abaAtiva === menu.id;
            return (
              <button
                key={menu.id}
                onClick={() => setAbaAtiva(menu.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-xs'
                    : 'text-gray-500 hover:bg-neutral-50 hover:text-gray-900'
                }`}
              >
                {menu.icon}
                {menu.nome}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-gray-150 pt-4">
        <button
          onClick={lidarComLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sair da Conta
        </button>
      </div>
    </aside>
  );
}