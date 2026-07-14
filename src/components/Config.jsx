import { useState } from 'react';
import { User, Shield, Info, Code, FileText } from 'lucide-react';

export default function Configuracoes({ session, onLogout }) {
  // Estado para controlar qual aba está ativa: 'ajustes' ou 'sobre'
  const [abaAtiva, setAbaAtiva] = useState('ajustes');

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md transition-colors duration-200">
      
      {/* Cabeçalho da Página */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Configurações do Sistema</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie sua conta e conheça mais sobre o FinancePlus.</p>
      </div>

      {/* Navegação por Abas (Tabs) */}
      <div className="flex space-x-4 mb-6 border-b border-gray-100 dark:border-gray-800 pb-2">
        <button
          onClick={() => setAbaAtiva('ajustes')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            abaAtiva === 'ajustes'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <User size={18} />
          Minha Conta
        </button>
        
        <button
          onClick={() => setAbaAtiva('sobre')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            abaAtiva === 'sobre'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          <Info size={18} />
          Sobre o Projeto
        </button>
      </div>

      {/* Conteúdo Dinâmico com base na Aba Ativa */}
      <div className="space-y-6">
        
        {/* ABA: AJUSTES DA CONTA */}
        {abaAtiva === 'ajustes' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Informações de Perfil */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                <Shield size={18} className="text-blue-500" />
                Segurança e Identificação
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium text-gray-400">E-mail conectado:</span> {session?.user?.email || 'usuario@email.com'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium text-gray-400">ID do Usuário:</span> <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">{session?.user?.id || 'id-exemplo'}</code>
                </p>
              </div>
            </div>

            {/* Ações da Conta */}
            <div className="p-4 border border-red-100 dark:border-red-900/30 rounded-xl bg-red-50/30 dark:bg-red-950/10">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Zona de Perigo</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Caso deseje sair da sua sessão atual com segurança no banco de dados.</p>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-lg transition-colors"
              >
                Desconectar da Conta
              </button>
            </div>
          </div>
        )}

        {/* ABA: SOBRE O PROJETO */}
        {abaAtiva === 'sobre' && (
          <div className="space-y-6 animate-fadeIn text-gray-600 dark:text-gray-300">
            
            {/* Bloco Principal de Apresentação */}
            <div className="text-center py-4">
              <h2 className="text-3xl font-black text-blue-600 dark:text-blue-400">FinancePlus</h2>
              <p className="text-sm font-semibold text-gray-400 mt-1">Versão 1.5.0</p>
              <p className="mt-4 max-w-xl mx-auto text-sm leading-relaxed">
                Uma aplicação moderna de controle financeiro desenvolvida para oferecer autonomia, clareza visual e inteligência na gestão de receitas e despesas.
              </p>
            </div>

            {/* Detalhes Técnicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                  <Code size={16} className="text-blue-500" /> 
                  Tecnologias Utilizadas
                </h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-gray-500 dark:text-gray-400">
                  <li>React & Vite (Frontend ágil)</li>
                  <li>Tailwind CSS (Interface responsiva e Dark Mode)</li>
                  <li>Supabase (Banco de dados PostgreSQL & Auth)</li>
                  <li>jsPDF (Impressão inteligente de relatórios)</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                  <FileText size={16} className="text-blue-500" /> 
                  Licenciamento
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Este projeto está protegido legalmente sob a **Licença MIT**. Isso significa que o software é livre para uso comercial, modificação e distribuição, desde que mantidos os direitos autorais do desenvolvedor original.
                </p>
              </div>
            </div>

            {/* Rodapé de Créditos */}
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
              Desenvolvido por daviniccacio &copy; 2026
            </div>

          </div>
        )}

      </div>
    </div>
  );
}