import { useState } from 'react';
import { Mail, Lock, ArrowLeft, KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';

/**
 * Componente Unificado de Recuperação de Senha
 * @param {string} modo - Pode ser 'solicitar' (inserir e-mail) ou 'definir' (inserir nova senha)
 * @param {function} aoVoltar - Função executada ao clicar no botão "Voltar para o Login"
 * @param {function} aoSubmeter - Função que conectará a tela com a lógica do Supabase no Passo 2
 */
export default function AuthRecovery({ modo = 'solicitar', aoVoltar, aoSubmeter }) {
  // Estados dos formulários
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  // Estados de controle visual
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Tratamento do envio do formulário
  const lidarComEnvio = async (e) => {
    e.preventDefault();
    setCarregando(true);

    // Encaminha os dados coletados para a função que ligará ao Supabase no Passo 2
    if (modo === 'solicitar') {
      await aoSubmeter({ email }, setCarregando);
    } else {
      await aoSubmeter({ novaSenha, confirmarSenha }, setCarregando);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-200/60 dark:border-zinc-800 shadow-sm space-y-6">
        
        {/* Cabeçalho dinâmico baseado no modo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-2xl">
            {modo === 'solicitar' ? <KeyRound className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">
            {modo === 'solicitar' ? 'Recuperar sua senha' : 'Criar nova senha'}
          </h2>
          <p className="text-xs font-medium text-gray-400 dark:text-zinc-500 max-w-70">
            {modo === 'solicitar' 
              ? 'Informe o seu e-mail cadastrado para receber as instruções de recuperação.' 
              : 'Escolha uma senha forte de no mínimo 6 caracteres para proteger sua conta.'}
          </p>
        </div>

        {/* Formulário Principal */}
        <form onSubmit={lidarComEnvio} className="space-y-4">
          
          {/* MODO 1: INPUT DE E-MAIL */}
          {modo === 'solicitar' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">E-mail de Cadastro</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-gray-400 dark:text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="seu-email@exemplo.com"
                  disabled={carregando}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 disabled:opacity-60 transition-all"
                />
              </div>
            </div>
          )}

          {/* MODO 2: INPUTS DE NOVA SENHA */}
          {modo === 'definir' && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Nova Senha</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-gray-400 dark:text-zinc-500" />
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    disabled={carregando}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 disabled:opacity-60 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 cursor-pointer"
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Confirmar Nova Senha</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-gray-400 dark:text-zinc-500" />
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    disabled={carregando}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 disabled:opacity-60 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {/* Botão de Ação Principal */}
          <button
            type="submit"
            disabled={carregando}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {carregando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processando...
              </>
            ) : (
              modo === 'solicitar' ? 'Enviar link de recuperação' : 'Redefinir minha senha'
            )}
          </button>
        </form>

        {/* Rodapé: Link para retornar ao Login padrão */}
        <div className="border-t border-gray-100 dark:border-zinc-800/80 pt-4 flex justify-center">
          <button
            onClick={aoVoltar}
            disabled={carregando}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-all cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para o login
          </button>
        </div>

      </div>
    </div>
  );
}