// src/components/AuthRecovery.jsx
import { useState, useRef } from 'react';
import { Mail, Lock, ArrowLeft, KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

/**
 * PALETA DE CORES PERSONALIZADA:
 * 1. Evergreen:       #273C2C
 * 2. Dim Grey:        #626868
 * 3. Rosy Granite:    #939196
 * 4. Thistle:         #D3C1D2
 * 5. Lavender Veil:   #FFE2FE
 */

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
      style={{
        backgroundColor: '#1a281e',
        color: '#FFE2FE'
      }}
      className="min-h-screen flex items-center justify-center p-4 font-sans transition-colors duration-500"
    >
      <div 
        ref={cardRef}
        style={{
          backgroundColor: '#161e18',
          borderColor: '#273C2C'
        }}
        className="w-full max-w-md p-8 rounded-3xl border shadow-2xl space-y-6"
      >
        
        {/* Cabeçalho dinâmico */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div 
            style={{
              backgroundColor: 'rgba(211, 193, 210, 0.15)',
              borderColor: '#D3C1D2',
              color: '#D3C1D2'
            }}
            className="p-3.5 rounded-2xl border"
          >
            {modo === 'solicitar' ? <KeyRound className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <h2 style={{ color: '#FFE2FE' }} className="text-xl font-bold tracking-tight">
            {modo === 'solicitar' ? 'Recuperar sua senha' : 'Criar nova senha'}
          </h2>
          <p style={{ color: '#D3C1D2' }} className="text-xs font-medium max-w-xs leading-relaxed">
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
              <label style={{ color: '#D3C1D2' }} className="text-[10px] font-bold uppercase tracking-wider block">
                E-mail de Cadastro
              </label>
              <div className="relative flex items-center">
                <Mail style={{ color: '#939196' }} className="absolute left-3.5 w-4 h-4" />
                <input
                  type="email"
                  required
                  placeholder="seu-email@exemplo.com"
                  disabled={carregando}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    backgroundColor: 'rgba(98, 104, 104, 0.25)',
                    borderColor: '#626868',
                    color: '#FFE2FE'
                  }}
                  className="w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D3C1D2]/40 disabled:opacity-60 transition-all placeholder:text-[#939196]"
                />
              </div>
            </div>
          )}

          {/* MODO 2: INPUTS DE NOVA SENHA */}
          {modo === 'definir' && (
            <>
              <div className="space-y-1">
                <label style={{ color: '#D3C1D2' }} className="text-[10px] font-bold uppercase tracking-wider block">
                  Nova Senha
                </label>
                <div className="relative flex items-center">
                  <Lock style={{ color: '#939196' }} className="absolute left-3.5 w-4 h-4" />
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    disabled={carregando}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    style={{
                      backgroundColor: 'rgba(98, 104, 104, 0.25)',
                      borderColor: '#626868',
                      color: '#FFE2FE'
                    }}
                    className="w-full border rounded-xl pl-10 pr-10 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D3C1D2]/40 disabled:opacity-60 transition-all placeholder:text-[#939196]"
                  />
                  <button
                    ref={eyeBtnRef}
                    type="button"
                    onClick={alternarMostrarSenha}
                    style={{ color: '#D3C1D2' }}
                    className="absolute right-3.5 p-1 hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label style={{ color: '#D3C1D2' }} className="text-[10px] font-bold uppercase tracking-wider block">
                  Confirmar Nova Senha
                </label>
                <div className="relative flex items-center">
                  <Lock style={{ color: '#939196' }} className="absolute left-3.5 w-4 h-4" />
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    disabled={carregando}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    style={{
                      backgroundColor: 'rgba(98, 104, 104, 0.25)',
                      borderColor: '#626868',
                      color: '#FFE2FE'
                    }}
                    className="w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D3C1D2]/40 disabled:opacity-60 transition-all placeholder:text-[#939196]"
                  />
                </div>
              </div>
            </>
          )}

          {/* Botão de Ação Principal */}
          <button
            type="submit"
            disabled={carregando}
            style={{
              backgroundColor: '#D3C1D2',
              color: '#273C2C'
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
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
        <div style={{ borderColor: '#273C2C' }} className="border-t pt-4 flex justify-center">
          <button
            type="button"
            onClick={aoVoltar}
            disabled={carregando}
            style={{ color: '#D3C1D2' }}
            className="flex items-center gap-1.5 text-xs font-bold hover:underline transition-all cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para o login
          </button>
        </div>

      </div>
    </div>
  );
}