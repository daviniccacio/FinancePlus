// src/components/common/LoginScreen.jsx
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Wallet, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import AuthRecovery from './AuthRecovery';

export default function LoginScreen({ viewAuth, setViewAuth, lidarComLogin, lidarComCadastro, lidarComSolicitacaoEmail }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const submeterFormulario = (e) => {
    e.preventDefault();
    if (viewAuth === 'login') {
      lidarComLogin(email, password);
    } else {
      lidarComCadastro(email, password, nome, confirmarSenha);
    }
  };

  if (viewAuth === 'solicitar') {
    return (
      <>
        <Toaster position="bottom-right" />
        <AuthRecovery
          modo="solicitar"
          aoVoltar={() => setViewAuth('login')}
          aoSubmeter={lidarComSolicitacaoEmail}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f2f2f7] dark:bg-zinc-950 flex items-center justify-center p-4 md:p-8 font-sans transition-colors duration-200">
      <Toaster position="bottom-right" />
      
      <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-3xl shadow-lg border border-gray-200/60 dark:border-zinc-800 overflow-hidden grid grid-cols-1 md:grid-cols-2 transition-colors duration-200 my-auto">
        
        {/* Lado Esquerdo - Banner */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-linear-to-br from-blue-600 to-indigo-800 text-white relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/10">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-wider uppercase">Gestor Financeiro</span>
          </div>
          <div className="space-y-3 relative z-10 my-auto">
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Simplifique o controle <br /> do seu dinheiro.
            </h2>
            <p className="text-xs text-blue-100/80 max-w-sm font-medium leading-relaxed">
              Uma plataforma direta e intuitiva para você lançar despesas, acompanhar receitas, gerenciar vencimentos e exportar relatórios sem complicação.
            </p>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="flex flex-col justify-center p-8 md:p-12 bg-white dark:bg-zinc-900 transition-colors duration-200">
          <div className="w-full max-w-sm mx-auto space-y-5">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 tracking-tight">
                {viewAuth === 'login' ? 'Acesse sua conta' : 'Crie sua conta grátis'}
              </h3>
              <p className="text-xs text-gray-400 dark:text-zinc-400 font-medium">
                {viewAuth === 'login' ? 'Insira suas credenciais para gerenciar a aplicação.' : 'Preencha os campos abaixo com uma senha segura.'}
              </p>
            </div>

            <form onSubmit={submeterFormulario} className="space-y-3">
              {/* Campo Nome (Apenas no Cadastro) */}
              {viewAuth === 'cadastro' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Nome Completo</label>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    required
                    className="w-full bg-neutral-50/60 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">E-mail de acesso</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-neutral-50/60 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Senha</label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="w-full bg-neutral-50/60 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-medium text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Campo Confirmação de Senha (Apenas no Cadastro) */}
              {viewAuth === 'cadastro' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Confirmar Senha</label>
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="w-full bg-neutral-50/60 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 flex items-center gap-1 pt-0.5">
                    <ShieldCheck className="w-3 h-3 text-blue-500" />
                    Mínimo 8 caracteres, maiúsculas, números e símbolos (@$!%*?&#).
                  </p>
                </div>
              )}

              {viewAuth === 'login' && (
                <div className="text-right pt-1">
                  <button
                    type="button"
                    onClick={() => { setViewAuth('solicitar'); setEmail(''); setPassword(''); }}
                    className="text-[10px] text-blue-500 hover:text-blue-600 font-bold transition-all cursor-pointer bg-transparent border-none"
                  >
                    Esqueci minha senha
                  </button>
                </div>
              )}

              <button type="submit" className="w-full bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-blue-600 transition-all shadow-sm active:scale-[0.98] mt-2 cursor-pointer">
                {viewAuth === 'login' ? 'Entrar no Sistema' : 'Criar minha Conta'}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { 
                  setViewAuth(viewAuth === 'login' ? 'cadastro' : 'login'); 
                  setEmail(''); 
                  setPassword(''); 
                  setNome('');
                  setConfirmarSenha('');
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors bg-transparent border-none cursor-pointer"
              >
                {viewAuth === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Voltar ao Login'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}