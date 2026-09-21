// src/components/AuthRecovery.jsx
import { useState, useRef } from 'react';
import { Mail, Lock, ArrowLeft, KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function AuthRecovery({ modo = 'solicitar', aoVoltar, aoSubmeter }) {
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const eyeBtnRef = useRef(null);

  // 🌟 GSAP: Entrada animada do cartão de recuperação
  useGSAP(() => {
    gsap.fromTo(
      cardRef.current,
      { y: 35, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
    );
  }, { scope: containerRef });

  // Alternância animada para mostrar/ocultar senha
  const alternarMostrarSenha = () => {
    setMostrarSenha((prev) => !prev);

    if (eyeBtnRef.current) {
      gsap.fromTo(
        eyeBtnRef.current,
        { scale: 0.5, rotate: -45, opacity: 0.4 },
        { scale: 1, rotate: 0, opacity: 1, duration: 0.35, ease: 'back.out(2)' }
      );
    }
  };

  const lidarComEnvio = async (e) => {
    e.preventDefault();
    setCarregando(true);

    if (modo === 'solicitar') {
      await aoSubmeter({ email }, setCarregando);
    } else {
      await aoSubmeter({ novaSenha, confirmarSenha }, setCarregando);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen flex items-center justify-center p-4 font-sans transition-colors duration-500 bg-gray-100 dark:bg-[#1a281e] text-gray-900 dark:text-[#FFE2FE]"
    >
      <div 
        ref={cardRef}
        className="w-full max-w-md p-8 rounded-3xl border shadow-2xl space-y-6 bg-white dark:bg-[#161e18] border-gray-200 dark:border-[#273C2C]"
      >
        
        {/* Cabeçalho dinâmico */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3.5 rounded-2xl border bg-purple-50 dark:bg-[#D3C1D2]/15 border-purple-200 dark:border-[#D3C1D2] text-[#273C2C] dark:text-[#D3C1D2]">
            {modo === 'solicitar' ? <KeyRound className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-[#FFE2FE]">
            {modo === 'solicitar' ? 'Recuperar sua senha' : 'Criar nova senha'}
          </h2>
          <p className="text-xs font-medium max-w-xs leading-relaxed text-gray-600 dark:text-[#D3C1D2]">
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
              <label className="text-[10px] font-bold uppercase tracking-wider block text-gray-700 dark:text-[#D3C1D2]">
                E-mail de Cadastro
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-gray-400 dark:text-[#939196]" />
                <input
                  type="email"
                  required
                  placeholder="seu-email@exemplo.com"
                  disabled={carregando}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#273C2C]/30 dark:focus:ring-[#D3C1D2]/40 disabled:opacity-60 transition-all bg-gray-50 dark:bg-[#626868]/25 border-gray-300 dark:border-[#626868] text-gray-900 dark:text-[#FFE2FE] placeholder:text-gray-400 dark:placeholder:text-[#939196]"
                />
              </div>
            </div>
          )}

          {/* MODO 2: INPUTS DE NOVA SENHA */}
          {modo === 'definir' && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider block text-gray-700 dark:text-[#D3C1D2]">
                  Nova Senha
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-gray-400 dark:text-[#939196]" />
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    disabled={carregando}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="w-full border rounded-xl pl-10 pr-10 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#273C2C]/30 dark:focus:ring-[#D3C1D2]/40 disabled:opacity-60 transition-all bg-gray-50 dark:bg-[#626868]/25 border-gray-300 dark:border-[#626868] text-gray-900 dark:text-[#FFE2FE] placeholder:text-gray-400 dark:placeholder:text-[#939196]"
                  />
                  <button
                    ref={eyeBtnRef}
                    type="button"
                    onClick={alternarMostrarSenha}
                    className="absolute right-3.5 p-1 hover:opacity-80 transition-opacity cursor-pointer text-gray-500 dark:text-[#D3C1D2]"
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider block text-gray-700 dark:text-[#D3C1D2]">
                  Confirmar Nova Senha
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-gray-400 dark:text-[#939196]" />
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    disabled={carregando}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#273C2C]/30 dark:focus:ring-[#D3C1D2]/40 disabled:opacity-60 transition-all bg-gray-50 dark:bg-[#626868]/25 border-gray-300 dark:border-[#626868] text-gray-900 dark:text-[#FFE2FE] placeholder:text-gray-400 dark:placeholder:text-[#939196]"
                  />
                </div>
              </div>
            </>
          )}

          {/* Botão de Ação Principal */}
          <button
            type="submit"
            disabled={carregando}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed bg-[#273C2C] text-white dark:bg-[#D3C1D2] dark:text-[#273C2C]"
          >
            {carregando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              modo === 'solicitar' ? 'Enviar link de recuperação' : 'Redefinir minha senha'
            )}
          </button>
        </form>

        {/* Rodapé: Link para retornar ao Login */}
        <div className="border-t pt-4 flex justify-center border-gray-200 dark:border-[#273C2C]">
          <button
            type="button"
            onClick={aoVoltar}
            disabled={carregando}
            className="flex items-center gap-1.5 text-xs font-bold hover:underline transition-all cursor-pointer disabled:opacity-50 text-gray-700 dark:text-[#D3C1D2]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para o login
          </button>
        </div>

      </div>
    </div>
  );
}